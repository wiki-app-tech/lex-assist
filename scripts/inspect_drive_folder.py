import httpx
import re
import json

url = "https://drive.google.com/drive/folders/1EeNy3W0yKZzX9c1hXfwBKZDvLEIVJAdk"
r = httpx.get(url, follow_redirects=True, headers={"User-Agent": "Mozilla/5.0"})
print("Status code:", r.status_code)
html = r.text

# Look for embedded JSON state
data_matches = re.findall(r'window\[\'_DRIVE_data\'\]\s*=\s*(\{.*?\});', html, re.DOTALL)
print("Found _DRIVE_data:", len(data_matches))

with open("data/folder_dump.html", "r", encoding="utf-8") as f:
    dump_html = f.read()

for term in ["6179.pdf", "6180.pdf", "6181.pdf", "6182.pdf"]:
    idx = dump_html.find(term)
    print(f"Term {term} at {idx}")
    if idx != -1:
        print("Context:\n", repr(dump_html[max(0, idx - 200):min(len(dump_html), idx + 200)]))






