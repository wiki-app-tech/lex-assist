"""
Módulo de scraping e ingesta para el Boletín Oficial de Tierra del Fuego, AeIAS.

Lee la configuración declarativa desde `sources/ar/tdf/boletin-oficial.yaml`,
realiza las solicitudes HTTP respetando el rate limit configurado, y procesa el HTML
con BeautifulSoup para extraer ediciones y normativas (decretos, resoluciones, leyes, licitaciones).
"""

from __future__ import annotations

import asyncio
import logging
import re
import time
from dataclasses import dataclass, field
from datetime import date, datetime
from pathlib import Path
from typing import Any
from urllib.parse import urljoin

import httpx
from bs4 import BeautifulSoup

try:
    import yaml
except ImportError:
    yaml = None  # type: ignore

logger = logging.getLogger(__name__)


@dataclass
class NormaDocument:
    """Representa un acto administrativo, norma o edicto extraído."""

    id: str
    title: str
    category: str  # decretos, resoluciones, leyes, licitaciones
    date: date | None = None
    number: str | None = None
    organism: str | None = None
    url: str | None = None
    pdf_url: str | None = None
    content_snippet: str | None = None
    source_id: str = "ar-tdf-boletin-oficial"
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class BoletinEdition:
    """Representa una edición diaria del Boletín Oficial."""

    id: str
    date: date
    edition_number: str | None = None
    url: str | None = None
    pdf_url: str | None = None
    documents: list[NormaDocument] = field(default_factory=list)


class BoletinTDFScraper:
    """
    Scraper asíncrono para el Boletín Oficial de Tierra del Fuego.
    
    Gestiona rate limiting estricto, reintentos con backoff exponencial,
    y parseo semántico de categorías normativas.
    """

    DEFAULT_CONFIG_PATH = Path("sources/ar/tdf/boletin-oficial.yaml")

    def __init__(
        self,
        config_path: Path | str | None = None,
        custom_client: httpx.AsyncClient | None = None,
    ) -> None:
        self.config_path = Path(config_path) if config_path else self._resolve_config_path()
        self.config = self._load_yaml_config(self.config_path)

        # Configuración extraída del YAML
        self.source_id: str = self.config.get("id", "ar-tdf-boletin-oficial")
        self.base_url: str = self.config.get("base_url", "https://boletinoficial.tierradelfuego.gob.ar")
        self.fallback_url: str = self.config.get("fallback_url", "https://decoley.tierradelfuego.gob.ar")

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

        # Categorías y selectores
        self.categories: list[dict[str, Any]] = self.config.get("categories", [])
        self.selectors: dict[str, str] = self.config.get("selectors", {})

        # Control interno de rate limit
        self._last_request_time: float = 0.0
        self._lock = asyncio.Lock()
        self._external_client = custom_client

    def _resolve_config_path(self) -> Path:
        """Encuentra la ruta al archivo YAML buscando desde el directorio actual o raíz."""
        current = Path.cwd()
        candidate = current / self.DEFAULT_CONFIG_PATH
        if candidate.exists():
            return candidate

        # Buscar en jerarquía de padres (útil cuando se ejecuta desde backend/ o tests/)
        for parent in [current, *current.parents]:
            alt = parent / self.DEFAULT_CONFIG_PATH
            if alt.exists():
                return alt

        return self.DEFAULT_CONFIG_PATH

    @staticmethod
    def _load_yaml_config(path: Path) -> dict[str, Any]:
        """Carga el archivo YAML de configuración."""
        if not path.exists():
            logger.warning("No se encontró el archivo de config en %s. Usando valores por defecto.", path)
            return {}

        with open(path, "r", encoding="utf-8") as f:
            if yaml:
                data = yaml.safe_load(f)
                return data or {}
            else:
                logger.warning("PyYAML no está disponible. Parseando configuración básica.")
                return {}

    async def _enforce_rate_limit(self) -> None:
        """Garantiza el espaciado mínimo entre peticiones para no saturar los servidores oficiales."""
        async with self._lock:
            now = time.monotonic()
            elapsed = now - self._last_request_time
            if elapsed < self.delay_seconds:
                wait_time = self.delay_seconds - elapsed
                logger.debug("Rate limit: esperando %.2f segundos antes de la siguiente petición.", wait_time)
                await asyncio.sleep(wait_time)
            self._last_request_time = time.monotonic()

    async def _get_client(self) -> httpx.AsyncClient:
        """Retorna el cliente HTTP asíncrono configurado."""
        if self._external_client:
            return self._external_client
        return httpx.AsyncClient(
            headers=self.headers,
            timeout=httpx.Timeout(self.timeout_seconds),
            follow_redirects=True,
        )

    async def fetch_html(self, url: str) -> str:
        """
        Descarga el HTML de una URL respetando el rate limit y aplicando reintentos exponenciales.
        """
        client = await self._get_client()
        should_close = self._external_client is None

        attempt = 0
        backoff = self.delay_seconds

        try:
            while attempt < self.max_retries:
                attempt += 1
                await self._enforce_rate_limit()

                try:
                    logger.info("GET %s (intento %d/%d)", url, attempt, self.max_retries)
                    response = await client.get(url)

                    # Si el servidor responde 429 Too Many Requests o 5xx, reintentamos con backoff
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
                    return response.text

                except (httpx.RequestError, httpx.HTTPStatusError) as exc:
                    logger.warning("Error en petición a %s: %s", url, exc)
                    if attempt >= self.max_retries:
                        raise
                    await asyncio.sleep(backoff)
                    backoff *= self.retry_backoff

            raise RuntimeError(f"Se excedió el número máximo de reintentos ({self.max_retries}) para {url}")
        finally:
            if should_close:
                await client.aclose()

    async def download_pdf(self, pdf_url: str) -> bytes:
        """Descarga el contenido binario de un archivo PDF oficial."""
        client = await self._get_client()
        should_close = self._external_client is None

        try:
            await self._enforce_rate_limit()
            logger.info("Descargando PDF: %s", pdf_url)
            response = await client.get(pdf_url)
            response.raise_for_status()
            return response.content
        finally:
            if should_close:
                await client.aclose()

    def parse_editions_list(self, html: str, base_url: str | None = None) -> list[BoletinEdition]:
        """
        Extrae la lista de ediciones del Boletín Oficial a partir del HTML del índice o portal.
        """
        target_base = base_url or self.base_url
        soup = BeautifulSoup(html, "html.parser")
        editions: list[BoletinEdition] = []

        selector = self.selectors.get("edition_list", "table.boletines tbody tr, .item-edicion, article")
        items = soup.select(selector)

        # Fallback si no encuentra items por selector estricto: busca enlaces directos a boletines/PDFs
        if not items:
            items = soup.find_all(["tr", "div", "li"], class_=re.compile(r"boletin|edicion|publicacion", re.I))

        for idx, item in enumerate(items):
            try:
                # 1. Extraer enlace al PDF o página de detalle
                link_elem = item.find("a", href=True)
                if not link_elem:
                    continue

                href = link_elem["href"]
                abs_url = urljoin(target_base, href)

                # 2. Extraer texto para fecha y número
                item_text = item.get_text(separator=" ", strip=True)

                # Buscar fecha en formato DD/MM/AAAA o AAAA-MM-DD
                date_match = re.search(r"(\d{1,2})[/-](\d{1,2})[/-](\d{4})", item_text)
                edition_date: date | None = None
                if date_match:
                    d, m, y = map(int, date_match.groups())
                    try:
                        edition_date = date(y, m, d)
                    except ValueError:
                        edition_date = None

                if not edition_date:
                    edition_date = date.today()

                # Buscar número de edición (ej. "N° 5420" o "Edición 1234")
                num_match = re.search(r"(?:N[°o]|Edici[oó]n|Nro\.?)\s*(\d+)", item_text, re.I)
                edition_num = num_match.group(1) if num_match else f"ed-{idx+1}"

                edition_id = f"tdf-bo-{edition_date.strftime('%Y%m%d')}-{edition_num}"
                pdf_link = abs_url if abs_url.lower().endswith(".pdf") else None

                editions.append(
                    BoletinEdition(
                        id=edition_id,
                        date=edition_date,
                        edition_number=edition_num,
                        url=abs_url,
                        pdf_url=pdf_link,
                    )
                )
            except Exception as e:
                logger.warning("Error parseando item de edición: %s", e)
                continue

        logger.info("Se encontraron %d ediciones en la página.", len(editions))
        return editions

    def parse_documents_from_html(
        self, html: str, edition_info: BoletinEdition | None = None
    ) -> list[NormaDocument]:
        """
        Extrae y clasifica los documentos normativos de una edición en categorías:
        - decretos
        - resoluciones
        - leyes
        - licitaciones
        """
        soup = BeautifulSoup(html, "html.parser")
        documents: list[NormaDocument] = []

        # Mapa de categorías reconocidas y palabras clave
        category_map = {
            cat["id"]: [kw.lower() for kw in cat.get("keywords", [cat["id"]])]
            for cat in self.categories
        }

        # Buscar bloques de documentos o párrafos significativos
        section_selector = self.selectors.get("document_section", "section, div.norma, div.articulo")
        containers = soup.select(section_selector)
        if not containers:
            containers = soup.find_all(["article", "div", "p"], class_=re.compile(r"norma|seccion|item", re.I))

        for idx, elem in enumerate(containers):
            text = elem.get_text(separator=" ", strip=True)
            if len(text) < 20:
                continue

            # Determinar categoría por palabras clave
            matched_category = self._classify_text(text, category_map)
            if not matched_category:
                continue

            # Buscar número de norma (ej. Decreto N° 124/2026, Ley N° 1050)
            norma_num_match = re.search(
                rf"{matched_category}[:\s]+(?:N[°o]\s*)?(\d+(?:/\d{{2,4}})?)",
                text,
                re.IGNORECASE,
            )
            norma_number = norma_num_match.group(1) if norma_num_match else None

            # Enlace asociado si existe
            link = elem.find("a", href=True)
            doc_url = urljoin(self.base_url, link["href"]) if link else None
            pdf_url = doc_url if (doc_url and doc_url.lower().endswith(".pdf")) else None

            doc_id = (
                f"tdf-{matched_category}-{norma_number.replace('/', '-')}"
                if norma_number
                else f"tdf-{matched_category}-{idx+1}"
            )

            # Extraer título o primera línea
            first_line = text.split("\n")[0][:150]

            documents.append(
                NormaDocument(
                    id=doc_id,
                    title=first_line,
                    category=matched_category,
                    date=edition_info.date if edition_info else date.today(),
                    number=norma_number,
                    url=doc_url,
                    pdf_url=pdf_url or (edition_info.pdf_url if edition_info else None),
                    content_snippet=text[:500],
                    source_id=self.source_id,
                    metadata={
                        "edition_number": edition_info.edition_number if edition_info else None,
                        "raw_length": len(text),
                    },
                )
            )

        logger.info("Se extrajeron y clasificaron %d normas.", len(documents))
        return documents

    def _classify_text(self, text: str, category_map: dict[str, list[str]]) -> str | None:
        """Clasifica un texto normativo según las palabras clave de categorías."""
        text_lower = text.lower()
        for cat_id, keywords in category_map.items():
            for kw in keywords:
                if kw in text_lower:
                    return cat_id
        return None

    async def scrape_latest(self) -> tuple[list[BoletinEdition], list[NormaDocument]]:
        """
        Ejecuta el ciclo de ingesta para la última edición disponible.
        1. Consulta el portal del Boletín Oficial.
        2. Extrae ediciones recientes.
        3. Procesa los documentos asociados a la edición más reciente.
        """
        logger.info("Iniciando scraping de la última edición desde %s", self.base_url)
        try:
            html = await self.fetch_html(self.base_url)
        except Exception as e:
            logger.warning("Fallo al acceder a base_url (%s): %s. Intentando con fallback_url...", self.base_url, e)
            html = await self.fetch_html(self.fallback_url)

        editions = self.parse_editions_list(html)
        all_documents: list[NormaDocument] = []

        if editions:
            latest_edition = editions[0]
            logger.info("Última edición detectada: %s (%s)", latest_edition.id, latest_edition.date)

            # Si la edición tiene página propia de detalle, la consultamos
            if latest_edition.url and not latest_edition.url.lower().endswith(".pdf"):
                try:
                    edition_html = await self.fetch_html(latest_edition.url)
                    latest_edition.documents = self.parse_documents_from_html(edition_html, latest_edition)
                except Exception as e:
                    logger.error("Error al obtener detalle de edición %s: %s", latest_edition.url, e)
            else:
                # O parseamos desde el HTML general de la portada
                latest_edition.documents = self.parse_documents_from_html(html, latest_edition)

            all_documents.extend(latest_edition.documents)

        return editions, all_documents


async def main() -> None:
    """Función de prueba CLI para ejecutar el scraper."""
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
    scraper = BoletinTDFScraper()
    print(f"--- Iniciando Scraper {scraper.source_id} ---")
    print(f"Base URL: {scraper.base_url}")
    print(f"Rate limit delay: {scraper.delay_seconds}s")
    print(f"Categorías configuradas: {[c['id'] for c in scraper.categories]}")

    try:
        editions, docs = await scraper.scrape_latest()
        print(f"\nEdiciones encontradas: {len(editions)}")
        for ed in editions[:3]:
            print(f" - [{ed.date}] Edición {ed.edition_number}: {ed.url}")

        print(f"\nDocumentos encontrados: {len(docs)}")
        for doc in docs[:5]:
            print(f" - [{doc.category.upper()}] {doc.title} (PDF: {doc.pdf_url})")

    except Exception as exc:
        print(f"Aviso durante ejecución: {exc}")


if __name__ == "__main__":
    asyncio.run(main())
