import os
import re
import json
import gdown
from pathlib import Path

def download_missing():
    items = json.load(open('data/drive_2026_items.json', encoding='utf-8'))
    target_base = Path('data/boletines_drive/2026')
    
    # We want 6176, 6177, 6178, 6180, 6181, 6182 and any other missing
    for it in items:
        name = it['name']
        m = re.search(r'(?:B\.?O\.?|SEPARATA\s+B\.?O\.?)\s*(\d+)', name, re.IGNORECASE)
        if not m:
            continue
        num = int(m.group(1))
        
        # Only download if from September or October, especially >= 6176
        if num < 6176:
            continue
            
        rel_path = it['path']
        dest_path = target_base / rel_path
        dest_path.parent.mkdir(parents=True, exist_ok=True)
        
        if dest_path.exists() and dest_path.stat().st_size > 1000:
            print(f"[EXISTS] {dest_path}")
            continue
            
        print(f"[DOWNLOADING] {name} (ID: {it['id']}) -> {dest_path}")
        try:
            gdown.download(id=it['id'], output=str(dest_path), quiet=False)
            print(f"[OK] {dest_path} ({dest_path.stat().st_size} bytes)")
        except Exception as e:
            print(f"[ERROR] Failed {name}: {e}")

if __name__ == '__main__':
    download_missing()
