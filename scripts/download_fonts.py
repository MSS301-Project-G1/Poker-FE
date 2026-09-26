"""Cache the Sora, Outfit and Material Symbols font CSS/files used by Stitch."""

from hashlib import sha256
from pathlib import Path
from urllib.request import Request, urlopen
import re

ROOT = Path(__file__).resolve().parents[1]
URL = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&family=Outfit:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap"
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36"}
DEST = ROOT / "public" / "fonts"
DEST.mkdir(exist_ok=True)

css = urlopen(Request(URL, headers=HEADERS), timeout=25).read().decode("utf-8")
for url in set(re.findall(r"https://fonts\.gstatic\.com/[^)]+", css)):
    name = sha256(url.encode()).hexdigest()[:16] + ".woff2"
    (DEST / name).write_bytes(urlopen(Request(url, headers=HEADERS), timeout=25).read())
    css = css.replace(url, "/fonts/" + name)
    print(name)

(ROOT / "src" / "fonts.css").write_text(css, encoding="utf-8")
