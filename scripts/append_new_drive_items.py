import json
from pathlib import Path

NEW_OCTOBER_ITEMS = [
    {
        "ed": "6183",
        "id": "1N77EJ4fZEF06GY1_vv0zefmFBJx6OosP",
    },
    {
        "ed": "6184",
        "id": "1q8uhsIrWGP2Vk_zzyqmkLURUPhTYi7cl",
    },
    {
        "ed": "6185",
        "id": "1VtSgVr3W1sbfaHrESnmR2Ul1DGBDQX64",
    },
    {
        "ed": "6186",
        "id": "1BOaGbEWKpbG7qJemmq3nRKdkBeRv3OBm",
    },
    {
        "ed": "6187",
        "id": "1geqqwp_IMZSt1hYmxB86eabcHaePyxhn",
    },
    {
        "ed": "6188",
        "id": "1R4lMeNs0STmp44hfxXwsC-9wDt7AAwMO",
    },
    {
        "ed": "6189",
        "id": "10czSgf0ydDD2WPnuQIrv0WYQX40EL4R1",
    },
    {
        "ed": "6190",
        "id": "17mJZJ1jS4DlEToDoKPEINQkaJxcZfpSx",
    },
    {
        "ed": "6191",
        "id": "1Eh1cE42TjiRJMIgLQQX-iQR-Zy4tgY9p",
    },
]

def update_drive_all_items():
    p = Path("data/drive_all_items.json")
    with open(p, "r", encoding="utf-8") as f:
        data = json.load(f)

    existing_eds = {str(item.get("edition_number")) for item in data if item.get("year") == 2026}
    added = 0
    for it in NEW_OCTOBER_ITEMS:
        ed = it["ed"]
        fid = it["id"]
        if ed not in existing_eds:
            data.append({
                "path": f"2026/10 - Octubre/B.O. {ed}.pdf",
                "filename": f"B.O. {ed}.pdf",
                "drive_id": fid,
                "drive_url": f"https://drive.google.com/file/d/{fid}/view",
                "download_url": f"https://drive.google.com/uc?export=download&id={fid}",
                "year": 2026,
                "month": 10,
                "month_name": "Octubre",
                "edition_number": ed,
                "is_pdf": True,
                "is_separata": False
            })
            existing_eds.add(ed)
            added += 1

    with open(p, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"[OK] data/drive_all_items.json: {added} new items added (Total: {len(data)})")

def update_drive_2026_items():
    p = Path("data/drive_2026_items.json")
    if not p.exists():
        return
    with open(p, "r", encoding="utf-8") as f:
        data = json.load(f)

    existing_names = {item.get("name") for item in data}
    added = 0
    for it in NEW_OCTOBER_ITEMS:
        ed = it["ed"]
        fid = it["id"]
        fname = f"B.O. {ed}.pdf"
        if fname not in existing_names:
            data.append({
                "id": fid,
                "path": f"10 - Octubre\\{fname}",
                "name": fname
            })
            existing_names.add(fname)
            added += 1

    with open(p, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"[OK] data/drive_2026_items.json: {added} new items added (Total: {len(data)})")

if __name__ == "__main__":
    update_drive_all_items()
    update_drive_2026_items()
