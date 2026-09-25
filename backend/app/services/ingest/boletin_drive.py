"""
Módulo de ingesta, extracción y búsqueda de Boletines Oficiales desde Google Drive.

Flujo de procesamiento:
1. Descarga automática de archivos PDF desde carpeta pública de Google Drive mediante `gdown`.
2. Extracción de texto completo y metadatos con `PyMuPDF` (`fitz`).
3. Almacenamiento estructurado en la base de datos PostgreSQL en la tabla `boletines_drive`.
4. Indexación de texto completo y motor de búsqueda por palabras clave con `Whoosh`.

Configuración declarativa: `sources/ar/tdf/boletin-drive.yaml`.
"""

from __future__ import annotations

import asyncio
import logging
import os
import re
from dataclasses import dataclass, field
from datetime import date, datetime
from pathlib import Path
from typing import Any, Iterator

import fitz  # PyMuPDF
import gdown
from whoosh import index
from whoosh.analysis import StemmingAnalyzer
from whoosh.fields import ID, KEYWORD, NUMERIC, STORED, TEXT, Schema
from whoosh.highlight import ContextFragmenter, HtmlFormatter
from whoosh.qparser import MultifieldParser

try:
    import yaml
except ImportError:
    yaml = None  # type: ignore

try:
    from sqlalchemy import Column, Date, DateTime, Integer, JSON, String, Text, create_engine, text
    from sqlalchemy.orm import declarative_base, sessionmaker
    Base = declarative_base()
except ImportError:
    Base = object  # type: ignore

logger = logging.getLogger(__name__)


# -----------------------------------------------------------------------------
# Modelo SQLAlchemy para PostgreSQL
# -----------------------------------------------------------------------------

if Base is not object:
    class BoletinDriveModel(Base):  # type: ignore
        __tablename__ = "boletines_drive"

        id = Column(String(255), primary_key=True)
        filename = Column(String(255), nullable=False)
        edition_number = Column(String(50), nullable=True)
        edition_date = Column(Date, nullable=True)
        title = Column(Text, nullable=True)
        page_count = Column(Integer, default=0)
        file_path = Column(String(500), nullable=True)
        full_text = Column(Text, nullable=False)
        extra_metadata = Column(JSON, nullable=True)
        extracted_at = Column(DateTime, default=datetime.utcnow)


@dataclass
class ExtractedBoletin:
    """Documento extraído de un PDF del Boletín Oficial."""

    id: str
    filename: str
    file_path: str
    edition_number: str | None
    edition_date: date | None
    title: str
    page_count: int
    full_text: str
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class SearchHit:
    """Resultado de búsqueda retornado por Whoosh."""

    id: str
    filename: str
    edition_number: str | None
    date: str | None
    title: str
    score: float
    highlight: str
    file_path: str | None = None


# -----------------------------------------------------------------------------
# Servicio Principal de Ingesta
# -----------------------------------------------------------------------------

class BoletinDriveService:
    """
    Servicio integral para la ingesta de boletines desde Google Drive,
    procesamiento de texto con PyMuPDF, persistencia en Postgres e indexación con Whoosh.
    """

    DEFAULT_CONFIG_PATH = Path("sources/ar/tdf/boletin-drive.yaml")

    def __init__(self, config_path: Path | str | None = None) -> None:
        self.config_path = Path(config_path) if config_path else self._resolve_config_path()
        self.config = self._load_yaml_config(self.config_path)

        # Configuración de URLs y directorios
        self.folder_url: str = self.config.get(
            "folder_url",
            "https://drive.google.com/drive/folders/12GrKybtm4cWyS6Ib_DnbwKAQ6JvQHCU6",
        )
        self.folder_id: str = self.config.get("folder_id", "12GrKybtm4cWyS6Ib_DnbwKAQ6JvQHCU6")

        storage_cfg = self.config.get("storage", {})
        self.download_dir = Path(storage_cfg.get("download_dir", "data/boletines_drive"))
        self.index_dir = Path(storage_cfg.get("whoosh_index_dir", "data/indexes/whoosh_boletines"))

        # Base de datos
        db_cfg = self.config.get("database", {})
        self.table_name = db_cfg.get("table_name", "boletines_drive")
        self.db_url = os.getenv(
            "DATABASE_URL",
            "postgresql+asyncpg://lexassist:lexassist@localhost:5432/lexassist",
        )

        # Configuración del esquema de Whoosh
        self.whoosh_schema = Schema(
            id=ID(stored=True, unique=True),
            filename=TEXT(stored=True),
            edition_number=KEYWORD(stored=True),
            date=KEYWORD(stored=True),
            title=TEXT(stored=True, analyzer=StemmingAnalyzer()),
            content=TEXT(stored=True, analyzer=StemmingAnalyzer()),
            page_count=NUMERIC(stored=True),
            file_path=STORED,
        )

    def _resolve_config_path(self) -> Path:
        """Encuentra la ruta al archivo YAML buscando en el directorio actual y jerarquía."""
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
        """Carga la configuración YAML declarativa."""
        if not path.exists():
            logger.warning("No se encontró el archivo de config en %s. Usando defaults.", path)
            return {}

        with open(path, "r", encoding="utf-8") as f:
            if yaml:
                data = yaml.safe_load(f)
                return data or {}
            return {}

    # =========================================================================
    # 1. Descarga desde Google Drive con gdown
    # =========================================================================

    def download_drive_folder(self, output_dir: Path | str | None = None) -> list[Path]:
        """
        Descarga recursivamente todos los archivos de la carpeta pública de Google Drive
        al directorio local especificado. Retorna la lista de rutas a los PDFs descargados.
        """
        target_dir = Path(output_dir) if output_dir else self.download_dir
        target_dir.mkdir(parents=True, exist_ok=True)

        logger.info("Iniciando descarga desde Google Drive: %s -> %s", self.folder_url, target_dir)
        try:
            gdown.download_folder(
                url=self.folder_url,
                output=str(target_dir),
                quiet=False,
                use_cookies=False,
                remaining_ok=True,
            )
        except Exception as exc:
            logger.error("Error durante la descarga con gdown: %s", exc)

        # Buscar todos los archivos PDF descargados recursivamente
        pdf_files = list(target_dir.rglob("*.pdf"))
        logger.info("Descarga completada. Se encontraron %d archivos PDF.", len(pdf_files))
        return pdf_files

    # =========================================================================
    # 2. Extracción de texto con PyMuPDF (fitz)
    # =========================================================================

    def extract_pdf_data(self, pdf_path: Path | str) -> ExtractedBoletin:
        """
        Abre el archivo PDF con PyMuPDF (`fitz`), extrae el texto completo página a página,
        e identifica el número de edición y fecha oficial mediante expresiones regulares.
        """
        path = Path(pdf_path)
        logger.info("Extrayendo texto de: %s", path.name)

        doc = fitz.open(str(path))
        page_count = len(doc)
        text_parts: list[str] = []

        for page_idx in range(page_count):
            page = doc[page_idx]
            text = page.get_text()
            if text:
                text_parts.append(text)

        full_text = "\n\n".join(text_parts)
        first_pages = full_text[:4000]

        # Extraer número de edición (del nombre de archivo o del texto inicial)
        edition_number = None
        match_fn = re.search(r'(?i)(?:b\.?o\.?|boletin)\s*(\d+)', path.name)
        if match_fn:
            edition_number = match_fn.group(1)
        else:
            match_txt = re.search(r'(?i)(?:bolet[íi]n\s+oficial.*?n[°ºo\.]*|b\.?\s*o\.?\s*n[°ºo\.]*)\s*(\d+)', first_pages)
            if match_txt:
                edition_number = match_txt.group(1)

        # Extraer fecha de edición
        edition_date = None
        match_date = re.search(
            r'(?i)(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)\s+de\s+(\d{4})',
            first_pages,
        )
        if match_date:
            day = int(match_date.group(1))
            month_str = match_date.group(2).lower()
            year = int(match_date.group(3))
            months = {
                "enero": 1, "febrero": 2, "marzo": 3, "abril": 4, "mayo": 5, "junio": 6,
                "julio": 7, "agosto": 8, "septiembre": 9, "setiembre": 9, "octubre": 10,
                "noviembre": 11, "diciembre": 12,
            }
            month = months.get(month_str, 1)
            try:
                edition_date = date(year, month, day)
            except ValueError:
                edition_date = None

        doc_id = f"boletin-drive-{edition_number or path.stem}"
        date_str = edition_date.strftime("%d/%m/%Y") if edition_date else "Fecha desconocida"
        num_str = f"N° {edition_number}" if edition_number else path.stem
        title = f"Boletín Oficial de Tierra del Fuego {num_str} ({date_str})"

        return ExtractedBoletin(
            id=doc_id,
            filename=path.name,
            file_path=str(path),
            edition_number=edition_number,
            edition_date=edition_date,
            title=title,
            page_count=page_count,
            full_text=full_text,
            metadata={
                "pdf_metadata": doc.metadata,
                "file_size_bytes": path.stat().st_size if path.exists() else 0,
            },
        )

    # =========================================================================
    # 3. Almacenamiento en PostgreSQL (tabla boletines_drive)
    # =========================================================================

    def save_to_database(self, documents: list[ExtractedBoletin]) -> int:
        """
        Inserta o actualiza los documentos extraídos en la tabla `boletines_drive`.
        Utiliza SQLAlchemy conectándose a PostgreSQL (con fallback a SQLite en dev).
        """
        if not documents:
            return 0

        # Normalizar URL de conexión para sincronía (psycopg o sqlite)
        db_url = self.db_url
        if "+asyncpg" in db_url:
            db_url = db_url.replace("+asyncpg", "")

        saved_count = 0
        try:
            engine = create_engine(db_url)
            # Verificar si conecta a PostgreSQL
            with engine.connect() as conn:
                logger.info("Conectado a PostgreSQL exitosamente.")
                # Crear tabla si no existe
                conn.execute(text(f"""
                    CREATE TABLE IF NOT EXISTS {self.table_name} (
                        id VARCHAR(255) PRIMARY KEY,
                        filename VARCHAR(255) NOT NULL,
                        edition_number VARCHAR(50),
                        edition_date DATE,
                        title TEXT,
                        page_count INTEGER DEFAULT 0,
                        file_path VARCHAR(500),
                        full_text TEXT NOT NULL,
                        metadata JSONB,
                        extracted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                """))
                conn.commit()

                # Guardar documentos
                for doc in documents:
                    conn.execute(
                        text(f"""
                            INSERT INTO {self.table_name} 
                            (id, filename, edition_number, edition_date, title, page_count, file_path, full_text, extracted_at)
                            VALUES (:id, :filename, :ed_num, :ed_date, :title, :pages, :path, :text, :extracted_at)
                            ON CONFLICT (id) DO UPDATE SET
                                full_text = EXCLUDED.full_text,
                                page_count = EXCLUDED.page_count,
                                file_path = EXCLUDED.file_path,
                                title = EXCLUDED.title,
                                extracted_at = EXCLUDED.extracted_at;
                        """),
                        {
                            "id": doc.id,
                            "filename": doc.filename,
                            "ed_num": doc.edition_number,
                            "ed_date": doc.edition_date,
                            "title": doc.title,
                            "pages": doc.page_count,
                            "path": doc.file_path,
                            "text": doc.full_text,
                            "extracted_at": datetime.utcnow(),
                        }
                    )
                    saved_count += 1
                conn.commit()

        except Exception as exc:
            logger.warning("No fue posible conectar a PostgreSQL (%s). Utilizando almacenamiento SQLite local de contingencia.", exc)
            fallback_db = Path("data/lexassist.db")
            fallback_db.parent.mkdir(parents=True, exist_ok=True)
            engine = create_engine(f"sqlite:///{fallback_db}")

            with engine.connect() as conn:
                conn.execute(text(f"""
                    CREATE TABLE IF NOT EXISTS {self.table_name} (
                        id TEXT PRIMARY KEY,
                        filename TEXT NOT NULL,
                        edition_number TEXT,
                        edition_date TEXT,
                        title TEXT,
                        page_count INTEGER,
                        file_path TEXT,
                        full_text TEXT NOT NULL,
                        extracted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                """))
                conn.commit()

                for doc in documents:
                    conn.execute(
                        text(f"""
                            INSERT OR REPLACE INTO {self.table_name}
                            (id, filename, edition_number, edition_date, title, page_count, file_path, full_text, extracted_at)
                            VALUES (:id, :filename, :ed_num, :ed_date, :title, :pages, :path, :text, :extracted_at);
                        """),
                        {
                            "id": doc.id,
                            "filename": doc.filename,
                            "ed_num": doc.edition_number,
                            "ed_date": doc.edition_date.isoformat() if doc.edition_date else None,
                            "title": doc.title,
                            "pages": doc.page_count,
                            "path": doc.file_path,
                            "text": doc.full_text,
                            "extracted_at": datetime.utcnow().isoformat(),
                        }
                    )
                    saved_count += 1
                conn.commit()

        logger.info("Guardados %d documentos en la tabla '%s'.", saved_count, self.table_name)
        return saved_count

    # =========================================================================
    # 4. Indexación y Búsqueda por Palabras Clave con Whoosh
    # =========================================================================

    def get_or_create_index(self) -> index.Index:
        """Abre el índice de Whoosh existente o crea uno nuevo en la ruta configurada."""
        self.index_dir.mkdir(parents=True, exist_ok=True)
        if index.exists_in(str(self.index_dir)):
            return index.open_dir(str(self.index_dir))
        return index.create_in(str(self.index_dir), self.whoosh_schema)

    def index_documents(self, documents: list[ExtractedBoletin]) -> int:
        """
        Indexa los documentos en Whoosh para búsquedas rápidas por palabras clave y operadores.
        """
        ix = self.get_or_create_index()
        writer = ix.writer()
        count = 0

        for doc in documents:
            date_str = doc.edition_date.isoformat() if doc.edition_date else ""
            writer.update_document(
                id=doc.id,
                filename=doc.filename,
                edition_number=doc.edition_number or "",
                date=date_str,
                title=doc.title,
                content=doc.full_text,
                page_count=doc.page_count,
                file_path=doc.file_path,
            )
            count += 1

        writer.commit()
        logger.info("Indexados %d documentos en Whoosh.", count)
        return count

    def search(self, query_string: str, limit: int = 10) -> list[SearchHit]:
        """
        Realiza una búsqueda por palabras clave sobre los boletines indexados.
        Retorna fragmentos de texto resaltados (`highlights`) y metadatos relevantes.
        """
        if not index.exists_in(str(self.index_dir)):
            logger.warning("El índice de Whoosh no existe aún en %s.", self.index_dir)
            return []

        ix = index.open_dir(str(self.index_dir))
        hits: list[SearchHit] = []

        with ix.searcher() as searcher:
            parser = MultifieldParser(["title", "content"], schema=ix.schema)
            query = parser.parse(query_string)
            results = searcher.search(query, limit=limit)

            # Configurador de resaltado de fragmentos coincidentes
            results.formatter = HtmlFormatter(tagname="mark")
            results.fragmenter = ContextFragmenter(maxchars=250, surround=50)

            for hit in results:
                highlight = hit.highlights("content") or hit["title"]
                hits.append(
                    SearchHit(
                        id=hit["id"],
                        filename=hit["filename"],
                        edition_number=hit.get("edition_number"),
                        date=hit.get("date"),
                        title=hit["title"],
                        score=hit.score,
                        highlight=highlight,
                        file_path=hit.get("file_path"),
                    )
                )

        return hits

    # =========================================================================
    # Pipeline Completo de Ingesta
    # =========================================================================

    def run_pipeline(
        self,
        download: bool = True,
        save_db: bool = True,
        create_index: bool = True,
    ) -> dict[str, Any]:
        """
        Ejecuta el ciclo de vida completo:
        1. Descarga desde Google Drive.
        2. Extracción de texto con PyMuPDF.
        3. Almacenamiento en base de datos.
        4. Indexación en Whoosh.
        """
        pdf_files: list[Path] = []
        if download:
            pdf_files = self.download_drive_folder()
        else:
            pdf_files = list(self.download_dir.rglob("*.pdf"))

        if not pdf_files:
            logger.warning("No se encontraron archivos PDF para procesar en %s.", self.download_dir)
            return {"downloaded": 0, "processed": 0, "indexed": 0}

        extracted_docs: list[ExtractedBoletin] = []
        for pdf_path in pdf_files:
            try:
                doc = self.extract_pdf_data(pdf_path)
                extracted_docs.append(doc)
            except Exception as err:
                logger.error("Error extrayendo %s: %s", pdf_path.name, err)

        db_count = 0
        if save_db:
            db_count = self.save_to_database(extracted_docs)

        indexed_count = 0
        if create_index:
            indexed_count = self.index_documents(extracted_docs)

        return {
            "pdf_count": len(pdf_files),
            "processed": len(extracted_docs),
            "saved_in_db": db_count,
            "indexed_in_whoosh": indexed_count,
        }


# -----------------------------------------------------------------------------
# Punto de entrada para ejecución manual o CLI
# -----------------------------------------------------------------------------

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Ingesta de Boletines Oficiales desde Google Drive")
    parser.add_argument("--download", action="store_true", help="Descargar archivos desde Google Drive")
    parser.add_argument("--process", action="store_true", help="Procesar PDFs locales y guardar en DB")
    parser.add_argument("--index", action="store_true", help="Indexar documentos en Whoosh")
    parser.add_argument("--search", type="str", help="Ejecutar búsqueda por palabra clave en Whoosh")

    args = parser.parse_args()
    logging.basicConfig(level=logging.INFO)

    service = BoletinDriveService()

    if args.search:
        results = service.search(args.search)
        print(f"\nResultados para '{args.search}': {len(results)}")
        for r in results:
            print(f"- {r.title} (Score: {r.score:.2f})")
            print(f"  Snippet: {r.highlight}\n")
    else:
        # Por defecto corre el pipeline
        stats = service.run_pipeline(
            download=args.download or not any(vars(args).values()),
            save_db=args.process or not any(vars(args).values()),
            create_index=args.index or not any(vars(args).values()),
        )
        print("Pipeline finalizado con éxito:", stats)
