"""Gera as imagens otimizadas em public/img a partir de source-assets/. Uso: npm run images"""
from pathlib import Path
from PIL import Image, ImageFilter
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
A = ROOT / "source-assets" / "assets"
OUT = ROOT / "public" / "img"
OUT.mkdir(parents=True, exist_ok=True)


def save(im, name, width=None, q=82):
    if width and im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    im.save(OUT / name, "WEBP", quality=q, method=6)
    print(name, im.size, (OUT / name).stat().st_size // 1024, "KB")


hero = Image.open(A / "cenas_ilustrativas/01_hero_paisagem_solar.webp").convert("RGB")
save(hero, "hero-1672.webp")
save(hero, "hero-960.webp", 960)
# Fundo da moldura: mesma cena, desfocada e ligeiramente escurecida.
bg = hero.resize((640, 360), Image.LANCZOS).filter(ImageFilter.GaussianBlur(10))
save(Image.blend(bg, Image.new("RGB", bg.size, (24, 30, 20)), 0.25), "hero-blur.webp", q=70)

agua = Image.open(A / "cenas_ilustrativas/02_agua_paisagem.webp").convert("RGB")
save(agua, "agua-1672.webp")
save(agua, "agua-960.webp", 960)

for n in ("15", "16", "17", "34"):
    save(Image.open(A / f"fotos_reais_selecionadas/facebook_{n}.jpg").convert("RGB"), f"foto-{n}.webp", q=86)

pump = Image.open(A / "recorte_existente/bomba_ilustrativa.png").convert("RGBA")
pump = pump.crop(pump.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox())
save(pump, "bomba.webp", 1100, q=86)

# Névoa: duas camadas de ruído fractal (movimento da hero ao estilo da referência).
rng = np.random.default_rng(3)


def fractal(w, h):
    acc = np.zeros((h, w))
    for s, a in [(420, 0.5), (210, 0.25), (105, 0.13), (52, 0.07), (26, 0.05)]:
        g = rng.random((h // s + 2, w // s + 2))
        acc += a * np.asarray(Image.fromarray((g * 255).astype("uint8")).resize((w, h), Image.BICUBIC)) / 255
    return (acc - acc.min()) / (acc.max() - acc.min())


for i, (lo, gain) in enumerate([(0.52, 2.2), (0.58, 2.6)]):
    W, H = 2400, 1000
    n = fractal(W, H)
    y = np.linspace(0, 1, H)[:, None]
    band = np.exp(-((y - (0.72 if i == 0 else 0.45)) ** 2) / 0.05)  # névoa concentrada numa faixa
    a = np.clip((n - lo) * gain, 0, 1) * band
    img = np.zeros((H, W, 4), "uint8")
    img[..., :3] = 246
    img[..., 3] = (a * 235).astype("uint8")
    Image.fromarray(img, "RGBA").filter(ImageFilter.GaussianBlur(6)).save(OUT / f"nevoa-{i + 1}.webp", "WEBP", quality=70)
    print(f"nevoa-{i + 1}.webp")
