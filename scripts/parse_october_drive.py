import httpx
import re
import json

url = "https://drive.google.com/drive/folders/1EeNy3W0yKZzX9c1hXfwBKZDvLEIVJAdk"
r = httpx.get(url, follow_redirects=True, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
text = r.text

print(f"Downloaded folder HTML: {len(text)} chars")

with open("data/folder_october_dump.html", "w", encoding="utf-8") as f:
    f.write(text)

# Let's inspect the structure around B.O. 6182.pdf which we already know has ID: 1y7GxBV2TllP82j5F0YwNGMuM5axaZbiO
pos_known = text.find("6182.pdf")
print("Pos of 6182.pdf:", pos_known)
if pos_known != -1:
    print("Context around 6182:")
    print(repr(text[pos_known-300:pos_known+300]))

# Extract all files with their names and IDs
with open("data/folder_october_dump.html", "r", encoding="utf-8") as f:
    text = f.read()

# Pattern for Google Drive list items
items = re.findall(r'aria-label="([^"]+)"[^>]*ssk=[\'"][0-9]+:[a-zA-Z0-9]+:([a-zA-Z0-9_-]{33})', text)
print(f"Total aria-label matches: {len(items)}")
results = []
for label, fid in items:
    clean_name = label.replace(" PDF Shared", "").replace(" PDF", "").strip()
    print(f"Name: {clean_name} | ID: {fid}")
    results.append({"name": clean_name, "id": fid})

with open("data/october_2026_found.json", "w", encoding="utf-8") as out:
    json.dump(results, out, ensure_ascii=False, indent=2)

