"""Keep the audited reading pages accessible without changing literary content."""
from pathlib import Path
from urllib.parse import urlsplit
from hashlib import sha256

from bs4 import BeautifulSoup
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / 'public'
READERS = (
    'books/paresh/forest.html',
    'books/musha_mushi/illustrated.html',
    'books/ketejami_loda/illustrated.html',
)
FONT = '/fonts/baloo-bhaina-2-variable-oriya.woff2'

for route in ('index.html', *READERS):
    path = PUBLIC / route
    original = path.read_text()
    soup = BeautifulSoup(original, 'html.parser')
    main = soup.main
    main['id'] = 'main'
    main['tabindex'] = '-1'
    if route == 'index.html':
        # Safari otherwise drops list semantics from this styled contents list.
        soup.select_one('#issue-articles')['role'] = 'list'
    else:
        skip = soup.select_one('.book-skip')
        if skip is None:
            skip = soup.new_tag('a', href='#main', attrs={'class': 'book-skip', 'lang': 'en'})
            skip.string = 'Skip to reading'
        else:
            skip.extract()
        soup.body.insert(0, skip)
        # Only the site masthead is a banner; the book title is ordinary content.
        for header in soup.select('body > header:not(.book-site-header)'):
            header.name = 'div'
            header['class'] = list(dict.fromkeys(header.get('class', []) + ['book-header']))
        title_block = soup.select_one('body > .book-header')
        title_block.h1['id'] = 'book-title'
        title_block['role'] = 'region'
        title_block['aria-labelledby'] = 'book-title'
        if not soup.select_one('script[src="/book-ui.js"]'):
            soup.body.append(soup.new_tag('script', src='/book-ui.js', defer=''))
        for link in soup.select('link[rel="stylesheet"]'):
            if link['href'] == 'reading.css':
                link['href'] = '/books/paresh/reading.css'

        # Keep the exact existing sprite crop, but allow native image lazy loading.
        # SVG <image> eagerly requests every comic sheet, even far below the fold.
        for svg in soup.select('svg.panel-art'):
            x, y, width, height = map(float, svg.get('viewbox', svg.get('viewBox')).split())
            source = svg.find('image')
            sheet_width, sheet_height = float(source['width']), float(source['height'])
            frame = soup.new_tag('span', attrs={'class': 'panel-art', 'style': f'aspect-ratio:{width:g}/{height:g}'})
            img = soup.new_tag('img', src=source['href'], alt=svg.get('aria-label', ''),
                               width=str(int(sheet_width)), height=str(int(sheet_height)))
            img['style'] = (f'width:{sheet_width / width * 100:.8f}%;'
                            f'height:{sheet_height / height * 100:.8f}%;'
                            f'left:{-x / width * 100:.8f}%;top:{-y / height * 100:.8f}%')
            frame.append(img)
            svg.replace_with(frame)

        for index, img in enumerate(soup.select('img')):
            if not img.get('width') or not img.get('height'):
                src = urlsplit(img['src']).path
                image_path = PUBLIC / src.lstrip('/') if src.startswith('/') else path.parent / src
                with Image.open(image_path) as image:
                    img['width'], img['height'] = map(str, image.size)
            img['decoding'] = 'async'
            # The first two comic panels can both be visible on desktop.
            opening = index == 0 or ('ketejami_loda' in route and index == 1)
            img['loading'] = 'eager' if opening else 'lazy'
            if index == 0:
                img['fetchpriority'] = 'high'
            else:
                img.attrs.pop('fetchpriority', None)
        # Opening art is the mobile LCP candidate. Keep its original JPEG as
        # fallback and generate delivery copies only; PDFs/source art are untouched.
        opening = soup.select_one('img')
        src = urlsplit(opening['src']).path
        image_path = PUBLIC / src.lstrip('/') if src.startswith('/') else path.parent / src
        digest = sha256(image_path.read_bytes()).hexdigest()[:12]
        widths = (1024,) if 'ketejami_loda' in route else (480, 960, int(opening['width']))
        variants = []
        for width in widths:
            output = PUBLIC / 'art/responsive' / f'book-opening-{digest}-{width}.webp'
            output.parent.mkdir(parents=True, exist_ok=True)
            if not output.exists():
                with Image.open(image_path) as image:
                    image = image.convert('RGB')
                    image.thumbnail((width, width * 3), Image.Resampling.LANCZOS)
                    image.save(output, 'WEBP', quality=86, method=6)
            variants.append(f'/{output.relative_to(PUBLIC).as_posix()} {width}w')
        # Sprite panels retain their full sheet resolution and precise crop.
        # Ordinary covers let the browser select a phone-sized or desktop copy.
        for img in soup.select('img'):
            if img['src'] != opening['src']:
                continue
            img['srcset'] = ', '.join(variants)
            img['sizes'] = '1024px' if 'ketejami_loda' in route else '(max-width:768px) calc(100vw - 48px), 720px'
        select = soup.select_one('#parts')
        if select:
            # The preface follows the comic in the actual reading order.
            preface = select.select_one('option[value="preface"]')
            select.append(preface.extract())

    preload = soup.select_one('link[rel="preload"][as="font"]')
    if preload is None:
        preload = soup.new_tag('link', rel='preload', attrs={'as': 'font', 'type': 'font/woff2', 'crossorigin': ''})
        soup.head.append(preload)
    preload['href'] = FONT
    updated = str(soup)
    if updated != original:
        path.write_text(updated)

print('Audited homepage and three book readers: navigation, image delivery and font preload normalized.')
