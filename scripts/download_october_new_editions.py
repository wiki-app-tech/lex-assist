import os
import sys
import time
from pathlib import Path
import gdown

OCTOBER_DIR = Path("data/boletines_drive/2026/10 - Octubre")
OCTOBER_DIR.mkdir(parents=True, exist_ok=True)

NEW_EDITIONS = [
    {"name": "B.O. 6184.pdf", "id": "1q8uhsIrWGP2Vk_zzyqmkLURUPhTYi7cl"},
    {"name": "B.O. 6185.pdf", "id": "1VtSgVr3W1sbfaHrESnmR2Ul1DGBDQX64"},
    {"name": "B.O. 6186.pdf", "id": "1BOaGbEWKpbG7qJemmq3nRKdkBeRv3OBm"},
    {"name": "B.O. 6187.pdf", "id": "1geqqwp_IMZSt1hYmxB86eabcHaePyxhn"},
    {"name": "B.O. 6188.pdf", "id": "1R4lMeNs0STmp44hfxXwsC-9wDt7AAwMO"},
    {"name": "B.O. 6189.pdf", "id": "10czSgf0ydDD2WPnuQIrv0WYQX40EL4R1"},
    {"name": "B.O. 6190.pdf", "id": "17mJZJ1jS4DlEToDoKPEINQkaJxcZfpSx"},
    {"name": "B.O. 6191.pdf", "id": "1Eh1cE42TjiRJMIgLQQX-iQR-Zy4tgY9p"},
]

def download_all():
    print(f"=== DESCARGANDO EDICIONES NUEVAS DE OCTUBRE 2026 ===")
    for item in NEW_EDITIONS:
        fname = item["name"]
        fid = item["id"]
        dest = OCTOBER_DIR / fname

        if dest.exists() and dest.stat().st_size > 10000:
            print(f"[YA EXISTE] {fname} ({dest.stat().st_size / (1024*1024):.2f} MB)")
            continue

        print(f"\n[DESCARGANDO] {fname} (ID: {fid}) ...")
        t0 = time.time()
        try:
            gdown.download(id=fid, output=str(dest), quiet=False)
            elapsed = time.time() - t0
            size_mb = dest.stat().st_size / (1024 * 1024) if dest.exists() else 0
            print(f"[OK] {fname} completado en {elapsed:.1f}s ({size_mb:.2f} MB)")
        except Exception as e:
            print(f"[ERROR] Error al descargar {fname}: {e}")

if __name__ == "__main__":
    download_all()
