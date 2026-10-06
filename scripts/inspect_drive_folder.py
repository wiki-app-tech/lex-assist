import httpx
import re
import json

url = "https://drive.google.com/drive/folders/1i-jIuX-OE0-vu54vz-xfaVzGDR0_sVhD"
r = httpx.get(url, follow_redirects=True, headers={"User-Agent": "Mozilla/5.0"})
print("Status code:", r.status_code)
html = r.text

# Look for embedded JSON state
data_matches = re.findall(r'window\[\'_DRIVE_data\'\]\s*=\s*(\{.*?\});', html, re.DOTALL)
print("Found _DRIVE_data:", len(data_matches))

# Look for drive items or folder names
items = re.findall(r'\[\"([a-zA-Z0-9_-]{25,})\",\[\"([^\"]+)\"', html)
print("Found candidate items:", len(items))
for it in items[:25]:
    print(" -", it)

# Look for B.O. names
bo_names = re.findall(r'(B\.?O\.?\s*\d+[^\"\'<>]{0,40})', html)
print("\nB.O. occurrences:", len(bo_names))
for name in set(bo_names)[:20]:
    print(" *", name)
