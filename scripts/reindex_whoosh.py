import json
from pathlib import Path
from whoosh import index
from whoosh.analysis import StemmingAnalyzer
from whoosh.fields import Schema, ID, TEXT, KEYWORD, NUMERIC, STORED

def reindex_whoosh():
    index_dir = Path("data/indexes/whoosh_boletines")
    index_dir.mkdir(parents=True, exist_ok=True)
    
    schema = Schema(
        id=ID(stored=True, unique=True),
        filename=TEXT(stored=True),
        edition_number=KEYWORD(stored=True),
        date=KEYWORD(stored=True),
        year=NUMERIC(stored=True),
        month=NUMERIC(stored=True),
        month_name=KEYWORD(stored=True),
        topics=KEYWORD(stored=True, commas=True),
        title=TEXT(stored=True, analyzer=StemmingAnalyzer()),
        content=TEXT(stored=True, analyzer=StemmingAnalyzer()),
        page_count=NUMERIC(stored=True),
        drive_url=STORED,
        download_url=STORED,
        file_path=STORED,
    )
    
    ix = index.create_in(str(index_dir), schema)
    writer = ix.writer()
    
    cat_file = Path("frontend/data/boletines_drive_catalog.json")
    with open(cat_file, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    boletines = data.get("boletines", [])
    print(f"Indexando {len(boletines)} boletines en Whoosh...")
    
    for b in boletines:
        writer.update_document(
            id=b["id"],
            filename=b.get("filename", ""),
            edition_number=str(b.get("edition_number") or ""),
            date=b.get("edition_date") or "",
            year=b.get("year", 2024),
            month=b.get("month", 1),
            month_name=b.get("month_name", ""),
            topics=",".join(b.get("topics", [])),
            title=b.get("title", ""),
            content=b.get("sumario", "") or b.get("summary", ""),
            page_count=b.get("page_count", 0),
            drive_url=b.get("drive_url", ""),
            download_url=b.get("download_url", ""),
            file_path=b.get("download_url", ""),
        )
        
    writer.commit()
    print(f"[OK] Reindexación completada. Total en Whoosh: {ix.doc_count()}")

if __name__ == "__main__":
    reindex_whoosh()
