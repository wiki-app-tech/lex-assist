import json
import sqlite3
from pathlib import Path

def clean_catalog():
    json_path = Path("frontend/data/boletines_drive_catalog.json")
    with open(json_path, "r", encoding="utf-8") as f:
        cat = json.load(f)

    for b in cat["boletines"]:
        ed = b.get("edition_number") or "S/N"
        yr = b.get("year")
        mn = b.get("month_name")
        is_sep = b.get("is_separata")
        prefix = "SEPARATA ESPECIAL \u2014 " if is_sep else ""
        b["title"] = f"{prefix}Bolet\u00edn Oficial N\u00b0 {ed} \u2014 Ushuaia ({mn} {yr})"
        
        s = b["summary"]
        s = s.replace("\ufffd", "\u2014").replace("Edici\u2014n", "Edici\u00f3n").replace("p\u2014ginas", "p\u00e1ginas")
        s = s.replace("N\u2014", "N\u00b0").replace("Econom\u2014a", "Econom\u00eda").replace("P\u2014blicas", "P\u00fablicas")
        s = s.replace("Resoluci\u2014n", "Resoluci\u00f3n").replace("resoluci\u2014n", "resoluci\u00f3n")
        b["summary"] = s

        sm = b["sumario"]
        sm = sm.replace("BOLET\ufffdN", "BOLET\u00cdN").replace("EDICI\ufffdN", "EDICI\u00d3N").replace("S\ufffdNTESIS", "S\u00cdNTESIS")
        sm = sm.replace("Ant\ufffdrtida", "Ant\u00e1rtida").replace("Atl\ufffdntico", "Atl\u00e1ntico")
        sm = sm.replace("p\ufffdginas", "p\u00e1ginas").replace("N\ufffd", "N\u00b0").replace("\ufffd", "\u2014")
        sm = sm.replace("Edici\u2014n", "Edici\u00f3n").replace("edici\u2014n", "edici\u00f3n")
        sm = sm.replace("Econom\u2014a", "Econom\u00eda").replace("P\u2014blicas", "P\u00fablicas")
        b["sumario"] = sm

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(cat, f, ensure_ascii=False, indent=2)

    db_json = Path("frontend/data/boletines_tdf_database.json")
    with open(db_json, "w", encoding="utf-8") as f:
        json.dump(cat, f, ensure_ascii=False, indent=2)

    conn = sqlite3.connect("data/lexassist.db")
    c = conn.cursor()
    for b in cat["boletines"]:
        c.execute("UPDATE boletines_oficiales_tdf SET title = ?, sumario = ? WHERE id = ?", (b["title"], b["sumario"], b["id"]))
    c.execute("INSERT INTO boletines_fts(boletines_fts) VALUES('rebuild')")
    conn.commit()
    conn.close()

    print(f"Limpieza completada exitosamente en {len(cat['boletines'])} boletines.")

if __name__ == "__main__":
    clean_catalog()
