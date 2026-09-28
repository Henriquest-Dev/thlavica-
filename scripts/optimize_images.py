"""Gera versões WebP otimizadas a partir de source-assets/ para public/img/.

Uso: pip install pillow && npm run images
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "source-assets"
OUT = ROOT / "public" / "img"


def save(im: Image.Image, dest: Path, width: int, quality: int = 80) -> None:
    im = im.copy()
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, "WEBP", quality=quality, method=6)
    print(dest.relative_to(ROOT), im.size)


for f in sorted((SRC / "originais").glob("*.jpg")):
    im = Image.open(f).convert("RGB")
    for w in (414, 240):
        save(im, OUT / "anuncios" / f"{f.stem}-{w}.webp", w)

pump = Image.open(SRC / "recortes" / "bomba_pressurizadora_ilustrativa.png").convert("RGBA")
for w in (1200, 720):
    save(pump, OUT / "produto" / f"bomba-ilustrativa-{w}.webp", w, quality=84)
