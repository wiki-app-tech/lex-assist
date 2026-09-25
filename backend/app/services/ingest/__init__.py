"""Ingest services for Lex-Assist."""
from backend.app.services.ingest.boletin_tdf import (
    BoletinTDFScraper,
    BoletinEdition,
    NormaDocument,
)

__all__ = ["BoletinTDFScraper", "BoletinEdition", "NormaDocument"]
