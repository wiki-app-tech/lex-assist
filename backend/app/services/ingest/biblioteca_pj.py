"""
Módulo de ingesta y scraping para la Biblioteca del Poder Judicial de Tierra del Fuego, AeIAS.

El sistema de la biblioteca corre sobre KOHA (v19.05).
Este módulo gestiona la extracción tanto por API REST (cuando esté disponible/autorizada)
como mediante scraping estructurado del catálogo OPAC (HTML, export MARCXML/Dublin Core y RSS).

Configuración declarativa: `sources/ar/tdf/biblioteca-pj.yaml`.
"""

from __future__ import annotations

import asyncio
import logging
import re
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, urlencode, urljoin, urlparse

import httpx
from bs4 import BeautifulSoup

try:
    import yaml
except ImportError:
    yaml = None  # type: ignore

logger = logging.getLogger(__name__)


@dataclass
class BibliotecaDocument:
    """Representa un registro bibliográfico o documental extraído del catálogo."""

    id: str  # Habitualmente el biblionumber de Koha
    title: str
    author: str | None = None
    year: int | None = None
    doc_type: str = "bibliografia"  # libro, articulo, sentencia, jurisprudencia, documento
    url: str | None = None
    biblionumber: str | None = None
    publisher: str | None = None
    isbn_issn: str | None = None
    subjects: list[str] = field(default_factory=list)
    call_number: str | None = None  # Signatura topográfica
    availability: str | None = None  # Disponibilidad física en sedes
    source_id: str = "ar-tdf-biblioteca-pj"
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class BibliotecaSearchResult:
    """Resultado paginado de una búsqueda en el catálogo."""

    query: str
    total_results: int
    offset: int
    count: int
    documents: list[BibliotecaDocument] = field(default_factory=list)


class BibliotecaPJIngest:
    """
    Servicio de ingesta para la Biblioteca del Poder Judicial de Tierra del Fuego.
    
    Implementa un enfoque híbrido:
    1. Verificación e ingesta vía API REST de Koha (/api/v1/).
    2. Fallback robusto a scraping del OPAC (/cgi-bin/koha/opac-search.pl y opac-detail.pl)
       y servicios estándar de biblioteca (unAPI, MARCXML, Dublin Core y RSS).
    """

    DEFAULT_CONFIG_PATH = Path("sources/ar/tdf/biblioteca-pj.yaml")

    def __init__(
        self,
        config_path: Path | str | None = None,
        custom_client: httpx.AsyncClient | None = None,
    ) -> None:
        self.config_path = Path(config_path) if config_path else self._resolve_config_path()
        self.config = self._load_yaml_config(self.config_path)

        # Configuración general
        self.source_id: str = self.config.get("id", "ar-tdf-biblioteca-pj")
        self.base_url: str = self.config.get("base_url", "https://biblioteca.justierradelfuego.gov.ar")
        self.koha_version: str = self.config.get("koha_version", "19.0504000")

        # Rate limiting
        rate_cfg = self.config.get("rate_limit", {})
        self.delay_seconds: float = float(rate_cfg.get("delay_seconds", 1.5))
        self.max_retries: int = int(rate_cfg.get("max_retries", 3))
        self.retry_backoff: float = float(rate_cfg.get("retry_backoff", 2.0))
        self.timeout_seconds: float = float(rate_cfg.get("timeout_seconds", 30.0))

        # Cliente HTTP & Headers
        client_cfg = self.config.get("client", {})
        self.user_agent: str = client_cfg.get(
            "user_agent",
            "lex-assist-bot/0.1 (+https://github.com/wiki-app-tech/lex-assist)",
        )
        self.headers: dict[str, str] = {
            "User-Agent": self.user_agent,
            **client_cfg.get("headers", {}),
        }

        # Selectores CSS y Mapeos
        self.selectors: dict[str, str] = self.config.get("selectors", {})
        self.doc_type_mapping: dict[str, str] = self.config.get("document_types", {
            "BK": "libro",
            "LIB": "libro",
            "REV": "articulo",
            "ART": "articulo",
            "JUR": "jurisprudencia",
            "SENT": "sentencia",
            "DOC": "documento",
        })

        # Configuración de Endpoints
        endpoints_cfg = self.config.get("endpoints", {})
        self.search_path: str = endpoints_cfg.get("search", "/cgi-bin/koha/opac-search.pl")
        self.detail_path: str = endpoints_cfg.get("detail", "/cgi-bin/koha/opac-detail.pl")
        self.export_path: str = endpoints_cfg.get("export", "/cgi-bin/koha/opac-export.pl")
        self.unapi_path: str = endpoints_cfg.get("unapi", "/cgi-bin/koha/unapi")

        # Estado de API
        api_cfg = self.config.get("api", {})
        self.api_enabled: bool = bool(api_cfg.get("enabled", False))
        self.api_base_path: str = api_cfg.get("base_path", "/api/v1")
        self._api_verified: bool | None = None

        # Control de concurrencia y rate limit interno
        self._last_request_time: float = 0.0
        self._lock = asyncio.Lock()
        self._external_client = custom_client

    def _resolve_config_path(self) -> Path:
        """Ubica el archivo YAML de configuración buscando en el directorio de trabajo y padres."""
        current = Path.cwd()
        candidate = current / self.DEFAULT_CONFIG_PATH
        if candidate.exists():
            return candidate

        for parent in [current, *current.parents]:
            alt = parent / self.DEFAULT_CONFIG_PATH
            if alt.exists():
                return alt

        return self.DEFAULT_CONFIG_PATH

    @staticmethod
    def _load_yaml_config(path: Path) -> dict[str, Any]:
        """Carga la configuración declarativa YAML."""
        if not path.exists():
            logger.warning("No se encontró el archivo de config en %s. Usando defaults.", path)
            return {}

        with open(path, "r", encoding="utf-8") as f:
            if yaml:
                data = yaml.safe_load(f)
                return data or {}
            else:
                logger.warning("PyYAML no está disponible. Retornando configuración vacía.")
                return {}

    async def _enforce_rate_limit(self) -> None:
        """Garantiza intervalo mínimo entre llamadas para proteger el servidor de la biblioteca."""
        async with self._lock:
            now = time.monotonic()
            elapsed = now - self._last_request_time
            if elapsed < self.delay_seconds:
                wait_time = self.delay_seconds - elapsed
                logger.debug("Rate limit: esperando %.2fs antes de la petición.", wait_time)
                await asyncio.sleep(wait_time)
            self._last_request_time = time.monotonic()

    async def _get_client(self) -> httpx.AsyncClient:
        """Retorna o crea el cliente HTTP asíncrono."""
        if self._external_client:
            return self._external_client
        return httpx.AsyncClient(
            headers=self.headers,
            timeout=httpx.Timeout(self.timeout_seconds),
            follow_redirects=True,
            verify=False,  # Algunos certificados de la administración pública provincial suelen requerirlo
        )

    async def _request(self, method: str, url: str, **kwargs: Any) -> httpx.Response:
        """Realiza una petición HTTP con rate limit y política de reintentos."""
        client = await self._get_client()
        should_close = self._external_client is None

        attempt = 0
        backoff = self.delay_seconds

        try:
            while attempt < self.max_retries:
                attempt += 1
                await self._enforce_rate_limit()

                try:
                    logger.info("%s %s (intento %d/%d)", method, url, attempt, self.max_retries)
                    response = await client.request(method, url, **kwargs)

                    if response.status_code == 429 or response.status_code >= 500:
                        logger.warning(
                            "Servidor respondió %d en %s. Reintentando en %.1fs...",
                            response.status_code,
                            url,
                            backoff,
                        )
                        await asyncio.sleep(backoff)
                        backoff *= self.retry_backoff
                        continue

                    response.raise_for_status()
                    return response

                except (httpx.RequestError, httpx.HTTPStatusError) as exc:
                    logger.warning("Fallo en petición a %s: %s", url, exc)
                    if attempt >= self.max_retries:
                        raise
                    await asyncio.sleep(backoff)
                    backoff *= self.retry_backoff

            raise RuntimeError(f"Límite de reintentos excedido ({self.max_retries}) para {url}")
        finally:
            if should_close:
                await client.aclose()

    # =========================================================================
    # Lógica de API REST (Koha /api/v1/)
    # =========================================================================

    async def check_api_availability(self) -> bool:
        """
        Verifica si la API REST de Koha expone endpoints públicos para consultar registros bibliográficos.
        
        En Koha 19.05 /api/v1/ responde con el esquema OpenAPI (Swagger 2.0),
        pero los endpoints /biblios públicos devuelven 404 Not Found y los privados 401.
        """
        if self._api_verified is not None:
            return self._api_verified

        test_endpoints = [
            f"{self.base_url}{self.api_base_path}/public/biblios",
            f"{self.base_url}{self.api_base_path}/biblios",
        ]

        for endpoint in test_endpoints:
            try:
                client = await self._get_client()
                should_close = self._external_client is None
                try:
                    res = await client.get(endpoint, timeout=5.0)
                    if res.status_code in (200, 206):
                        logger.info("API REST de Koha disponible en %s", endpoint)
                        self._api_verified = True
                        return True
                    else:
                        logger.debug("Endpoint API %s respondió %d", endpoint, res.status_code)
                finally:
                    if should_close:
                        await client.aclose()
            except Exception as e:
                logger.debug("Error verificando API en %s: %s", endpoint, e)

        logger.info("API REST pública de Koha no disponible o restringida. Se utilizará scraping OPAC.")
        self._api_verified = False
        return False

    async def search_api(self, query: str, limit: int = 20) -> list[BibliotecaDocument]:
        """
        Intenta buscar documentos a través de la API REST de Koha.
        Si la API no está disponible, levanta NotImplementedError para que se aplique fallback a scraping.
        """
        is_available = await self.check_api_availability()
        if not is_available:
            raise NotImplementedError("La API REST de Koha no está disponible para búsquedas públicas en este servidor.")

        # Si en el futuro se habilita la API en Koha 20+ o con credenciales:
        endpoint = f"{self.base_url}{self.api_base_path}/biblios"
        params = {"q": query, "_per_page": limit}
        res = await self._request("GET", endpoint, params=params)
        data = res.json()

        documents: list[BibliotecaDocument] = []
        for item in data if isinstance(data, list) else data.get("items", []):
            biblio_id = str(item.get("biblio_id", ""))
            doc = BibliotecaDocument(
                id=biblio_id,
                title=item.get("title", "Sin título"),
                author=item.get("author"),
                year=item.get("publication_year"),
                doc_type="bibliografia",
                url=f"{self.base_url}{self.detail_path}?biblionumber={biblio_id}",
                biblionumber=biblio_id,
                metadata=item,
            )
            documents.append(doc)
        return documents

    # =========================================================================
    # Lógica de Scraping OPAC (HTML, unAPI, Export & RSS)
    # =========================================================================

    async def search_opac(
        self,
        query: str = "derecho",
        offset: int = 0,
        count: int = 20,
        sort_by: str = "pubdate_dsc",
    ) -> BibliotecaSearchResult:
        """
        Ejecuta una búsqueda en el catálogo OPAC de Koha y parsea la lista de resultados.
        
        Args:
            query: Término de búsqueda (ej: 'derecho administrativo', 'ccl=yr,st-numeric=2023').
            offset: Desplazamiento inicial de paginación (0, 20, 40...).
            count: Cantidad de resultados por página.
            sort_by: Ordenamiento ('pubdate_dsc', 'acqdate_dsc', 'title_az').
        """
        search_url = f"{self.base_url}{self.search_path}"
        params = {
            "q": query,
            "offset": offset,
            "count": count,
            "sort_by": sort_by,
        }

        response = await self._request("GET", search_url, params=params)
        return self.parse_opac_search_results(response.text, query=query, offset=offset, count=count)

    def parse_opac_search_results(
        self,
        html: str,
        query: str = "",
        offset: int = 0,
        count: int = 20,
    ) -> BibliotecaSearchResult:
        """
        Parsea el HTML del listado de resultados de Koha OPAC extrayendo metadatos normalizados.
        """
        soup = BeautifulSoup(html, "html.parser")
        documents: list[BibliotecaDocument] = []

        # 1. Total de resultados
        total_results = 0
        total_elem = soup.select_one(self.selectors.get("total_results", "#numresults, .searchresults span strong"))
        if total_elem:
            match = re.search(r"(\d[\d\.,]*)", total_elem.get_text())
            if match:
                total_results = int(match.group(1).replace(".", "").replace(",", ""))

        # 2. Contenedores de cada registro (celdas td.bibliocol o filas)
        item_selector = self.selectors.get("item_content", "td.bibliocol")
        item_elements = soup.select(item_selector)
        if not item_elements:
            item_elements = soup.select(self.selectors.get("item_row", "table#searchresults tr"))

        for item in item_elements:
            # En caso de iterar sobre <tr> descartar cabeceras sin bibliocol
            bibliocol = item if item.name == "td" and "bibliocol" in item.get("class", []) else item.select_one("td.bibliocol")
            if not bibliocol and item.name != "td":
                continue
            target = bibliocol or item

            doc = self._parse_single_opac_item(target)
            if doc:
                documents.append(doc)

        return BibliotecaSearchResult(
            query=query,
            total_results=total_results or len(documents),
            offset=offset,
            count=count,
            documents=documents,
        )

    def _parse_single_opac_item(self, item: BeautifulSoup) -> BibliotecaDocument | None:
        """Extrae la información de una celda/elemento de resultado bibliográfico."""
        # 1. Título y Enlace al registro
        title_sel = self.selectors.get("title", "a.title")
        title_link = item.select_one(title_sel)
        if not title_link:
            title_link = item.select_one("a[href*='opac-detail.pl?biblionumber=']")

        if not title_link:
            return None

        raw_title = title_link.get_text(separator=" ", strip=True)
        # Limpieza de statement de responsabilidad y barras separadoras al final
        clean_title = re.sub(r"\s*/\s*$", "", raw_title).strip()

        href = title_link.get("href", "")
        abs_url = urljoin(self.base_url, href)

        # 2. Biblionumber (ID único de Koha)
        biblionumber = None
        match_bib = re.search(r"biblionumber=(\d+)", href)
        if match_bib:
            biblionumber = match_bib.group(1)

        # 3. Metadatos COinS / OpenURL (etiqueta <span class="Z3988">)
        # Provee información semántica estructurada provista por Koha de forma nativa
        coins_elem = item.select_one(self.selectors.get("coins_metadata", "span.Z3988"))
        coins_data: dict[str, str] = {}
        if coins_elem and coins_elem.get("title"):
            coins_query = coins_elem["title"].replace("&amp;", "&")
            parsed_coins = parse_qs(coins_query)
            coins_data = {k: v[0] for k, v in parsed_coins.items() if v}

        # 4. Autor
        author = None
        author_sel = self.selectors.get("author", "span.author, p .author")
        author_elem = item.select_one(author_sel)
        if author_elem:
            author = author_elem.get_text(strip=True).rstrip(".").strip()
        elif "rft.au" in coins_data:
            author = coins_data["rft.au"].strip()

        # 5. Año y Editorial
        year = None
        publisher = None
        pub_sel = self.selectors.get("year_publisher", "span.publisher, .results_summary.publisher")
        pub_elem = item.select_one(pub_sel)
        if pub_elem:
            pub_text = pub_elem.get_text(separator=" ", strip=True)
            # Remover etiqueta "Editor:" o "Publicación:"
            pub_text = re.sub(r"^(?:Editor|Publicación):\s*", "", pub_text, flags=re.I)
            publisher = pub_text.strip()
            # Extraer año (4 dígitos 19xx o 20xx)
            match_year = re.search(r"\b(19\d{2}|20\d{2})\b", pub_text)
            if match_year:
                year = int(match_year.group(1))

        if not year and "rft.date" in coins_data:
            match_year = re.search(r"\b(19\d{2}|20\d{2})\b", coins_data["rft.date"])
            if match_year:
                year = int(match_year.group(1))

        if not publisher and "rft.pub" in coins_data:
            publisher = coins_data["rft.pub"].strip()

        # 6. Tipo de documento
        doc_type = self._determine_doc_type(item, coins_data)

        # 7. Disponibilidad y Signatura topográfica
        availability = None
        call_number = None
        avail_elem = item.select_one(self.selectors.get("availability", ".results_summary.availability"))
        if avail_elem:
            availability = avail_elem.get_text(separator=" ", strip=True)
            call_match = re.search(r"Signatura topográfica:\s*([^\s\]]+(?:\s+[^\s\]]+)*)", availability)
            if call_match:
                call_number = call_match.group(1).strip()

        doc_id = biblionumber or href
        return BibliotecaDocument(
            id=doc_id,
            title=clean_title,
            author=author,
            year=year,
            doc_type=doc_type,
            url=abs_url,
            biblionumber=biblionumber,
            publisher=publisher,
            call_number=call_number,
            availability=availability,
            metadata={"coins": coins_data} if coins_data else {},
        )

    def _determine_doc_type(self, item: BeautifulSoup, coins_data: dict[str, str]) -> str:
        """Determina el tipo documental normalizado (libro, articulo, sentencia, etc.)."""
        # Prioridad 1: Clases en contenedor de portadas (ej. itemtype_LIB, itemtype_BK, itemtype_REV)
        cover_div = item.select_one("[class*='itemtype_']")
        if cover_div:
            for cls in cover_div.get("class", []):
                if cls.startswith("itemtype_"):
                    code = cls.replace("itemtype_", "").upper()
                    if code in self.doc_type_mapping:
                        return self.doc_type_mapping[code]

        # Prioridad 2: Texto o imagen en .results_material_type
        type_elem = item.select_one(self.selectors.get("document_type", ".results_summary.type .results_material_type"))
        if type_elem:
            text = type_elem.get_text(strip=True).lower()
            if "libro" in text or "bk" in text or "texto" in text:
                return "libro"
            if "artículo" in text or "articulo" in text or "revista" in text:
                return "articulo"
            if "sentencia" in text or "fallo" in text or "resolución" in text:
                return "sentencia"
            if "jurisprudencia" in text:
                return "jurisprudencia"

        # Prioridad 3: COinS rft.genre
        genre = coins_data.get("rft.genre", "").lower()
        if "book" in genre:
            return "libro"
        if "article" in genre:
            return "articulo"

        return self.doc_type_mapping.get("DEFAULT", "bibliografia")

    async def fetch_record_detail(self, biblionumber: str | int) -> BibliotecaDocument | None:
        """
        Descarga la página de vista normal de un registro en opac-detail.pl
        y extrae metadatos enriquecidos (materias/temas, ISBN, signatura, tabla de contenidos).
        """
        detail_url = f"{self.base_url}{self.detail_path}"
        params = {"biblionumber": str(biblionumber)}

        response = await self._request("GET", detail_url, params=params)
        soup = BeautifulSoup(response.text, "html.parser")

        # Título
        title_elem = soup.select_one(self.selectors.get("detail_title", "h1.title"))
        if not title_elem:
            return None
        title = title_elem.get_text(separator=" ", strip=True)
        title = re.sub(r"\s*/\s*$", "", title).strip()

        # Autor
        author = None
        author_elem = soup.select_one(self.selectors.get("detail_author", "h5.author a, .record h5.author"))
        if author_elem:
            author = author_elem.get_text(strip=True).rstrip(".").strip()

        # Materias / Temas
        subjects: list[str] = []
        subject_elems = soup.select(self.selectors.get("detail_subjects", ".results_summary.subjects a"))
        for s in subject_elems:
            sub_text = s.get_text(strip=True)
            if sub_text and sub_text not in subjects:
                subjects.append(sub_text)

        # Editorial y Año
        publisher = None
        year = None
        pub_elem = soup.select_one(self.selectors.get("detail_publisher", ".results_summary.publisher"))
        if pub_elem:
            pub_text = pub_elem.get_text(separator=" ", strip=True)
            publisher = re.sub(r"^(?:Editor|Publicación):\s*", "", pub_text, flags=re.I).strip()
            match_year = re.search(r"\b(19\d{2}|20\d{2})\b", pub_text)
            if match_year:
                year = int(match_year.group(1))

        # Signatura y Disponibilidad
        call_number = None
        call_elem = soup.select_one(self.selectors.get("detail_call_number", ".results_summary.availability .CallNumber"))
        if call_elem:
            call_number = call_elem.get_text(strip=True)

        full_url = f"{detail_url}?biblionumber={biblionumber}"

        return BibliotecaDocument(
            id=str(biblionumber),
            title=title,
            author=author,
            year=year,
            doc_type="bibliografia",
            url=full_url,
            biblionumber=str(biblionumber),
            publisher=publisher,
            subjects=subjects,
            call_number=call_number,
        )

    # =========================================================================
    # Exportaciones estructuradas nativas de Koha (unAPI & MARCXML)
    # =========================================================================

    async def fetch_marcxml(self, biblionumber: str | int) -> str:
        """
        Obtiene el registro bibliográfico completo en formato MARCXML (estándar MARC21)
        utilizando el servicio unAPI de Koha o el endpoint opac-export.
        """
        # Método 1: unAPI
        unapi_url = f"{self.base_url}{self.unapi_path}"
        params = {"id": f"koha:biblionumber:{biblionumber}", "format": "marcxml"}
        try:
            res = await self._request("GET", unapi_url, params=params)
            return res.text
        except Exception:
            # Fallback a opac-export
            export_url = f"{self.base_url}{self.export_path}"
            export_params = {"op": "export", "bib": str(biblionumber), "format": "marcxml"}
            res = await self._request("GET", export_url, params=export_params)
            return res.text

    async def fetch_dublin_core(self, biblionumber: str | int) -> str:
        """Obtiene los metadatos en formato Dublin Core XML."""
        export_url = f"{self.base_url}{self.export_path}"
        params = {"op": "export", "bib": str(biblionumber), "format": "dc"}
        res = await self._request("GET", export_url, params=params)
        return res.text

    # =========================================================================
    # Fachada principal de Ingesta
    # =========================================================================

    async def search(self, query: str = "derecho", limit: int = 20) -> list[BibliotecaDocument]:
        """
        Punto de entrada unificado para búsqueda e ingesta.
        Intenta API REST primero; si no está disponible, delega al scraper OPAC.
        """
        try:
            return await self.search_api(query=query, limit=limit)
        except (NotImplementedError, httpx.HTTPError) as err:
            logger.debug("Búsqueda por API no disponible (%s). Utilizando scraper OPAC.", err)
            result = await self.search_opac(query=query, count=limit)
            return result.documents
