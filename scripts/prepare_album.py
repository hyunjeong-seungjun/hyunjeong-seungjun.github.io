"""Generate mobile WebP derivatives from locally selected album photos."""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'private-source/python-deps'))
from PIL import Image, ImageOps
from pillow_heif import register_heif_opener

register_heif_opener()
source = ROOT / 'assets/images/album'
output = ROOT / 'assets/images/optimized/album'
output.mkdir(parents=True, exist_ok=True)
photos = sorted((p for p in source.iterdir() if p.is_file() and p.suffix.lower() in {'.jpg', '.jpeg', '.png', '.heic'}), key=lambda p: p.name.lower())
assert photos, 'No album photos found'
figures = []
for number, photo in enumerate(photos, 1):
    with Image.open(photo) as original:
        picture = ImageOps.exif_transpose(original).convert('RGB')
        picture.thumbnail((1400, 1400), Image.Resampling.LANCZOS)
        # A fresh pixel-only image ensures source metadata is not carried over.
        clean = Image.new('RGB', picture.size)
        clean.paste(picture)
        name = re.sub(r'[^a-z0-9_-]+', '-', photo.stem.lower()).strip('-') + '.webp'
        clean.save(output / name, 'WEBP', quality=82, method=6)
        width, height = clean.size
        css = 'gallery-photo gallery-photo-wide' if width > height else 'gallery-photo'
        figures.append(f'        <figure class="{css}"><img src="assets/images/optimized/album/{name}" width="{width}" height="{height}" loading="lazy" decoding="async" alt="승준과 현정의 웨딩 사진 {number}"></figure>')
        with Image.open(output / name) as check:
            assert check.size == (width, height)
            assert not check.getexif() and not check.info.get('xmp')
page = ROOT / 'index.html'
html = page.read_text(encoding='utf-8')
html, count = re.subn(r'(<div class="gallery-grid"[^>]*>).*?(\n      </div>)', lambda m: m[1] + '\n' + '\n'.join(figures) + m[2], html, count=1, flags=re.S)
assert count == 1
page.write_text(html, encoding='utf-8')
print(f'Converted and verified {len(photos)} photos; {sum(p.stat().st_size for p in output.glob("*.webp")) / 1024 / 1024:.2f} MB')
