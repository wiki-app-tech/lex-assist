"""Ingest services for Lex-Assist."""
from backend.app.services.ingest.boletin_tdf import (
    BoletinTDFScraper,
    BoletinEdition,
    NormaDocument,
)
from backend.app.services.ingest.biblioteca_pj import (
    BibliotecaPJIngest,
    BibliotecaDocument,
    BibliotecaSearchResult,
)
from backend.app.services.ingest.boletin_drive import (
    BoletinDriveService,
    ExtractedBoletin,
    SearchHit,
)

__all__ = [
    "BoletinTDFScraper",
    "BoletinEdition",
    "NormaDocument",
    "BibliotecaPJIngest",
    "BibliotecaDocument",
    "BibliotecaSearchResult",
    "BoletinDriveService",
    "ExtractedBoletin",
    "SearchHit",
]

