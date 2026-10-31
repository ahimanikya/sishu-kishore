"""Keep reviewed story art on cards and reading pages; retain source images."""
from pathlib import Path
import json
import re

root = Path('public')
records = json.loads(Path('provenance/reviewed-illustrations-2026-11.json').read_text())['records']
replacements = {r['previous']: r['replacement'] for r in records}
changed = 0
for page in root.rglob('*.html'):
    source = page.read_text()
    if not any(old in source for old in replacements):
        continue
    def image(match):
        tag = match.group()
        src = re.search(r'\bsrc=["\']([^"\']+)["\']', tag)
        if not src or src[1] not in replacements:
            return tag
        tag = tag[:src.start(1)] + replacements[src[1]] + tag[src.end(1):]
        # Old dimensions/srcsets must not distort or reload the rejected variant.
        tag = re.sub(r'\s(?:width|height|srcset|sizes)=["\'][^"\']*["\']', '', tag)
        return tag.replace('<img', '<img width="1200" height="800"', 1)
    updated = re.sub(r'<img\b[^>]*>', image, source)
    if updated != source:
        page.write_text(updated)
        changed += 1
manifest = Path('provenance/social-previews.json')
previews = json.loads(manifest.read_text())
by_article = {r['article']: r for r in records}
for item in previews:
    if item['page'] in by_article:
        record = by_article[item['page']]
        item['image'] = record['share_image']
        item['source'] = record['replacement']
manifest.write_text(json.dumps(previews, ensure_ascii=False, indent=2) + '\n')
print(f'Reviewed illustrations: {len(records)} story corrections; updated {changed} pages; originals preserved.')
for record in records:
    page = root / record['article'].lstrip('/')
    source = page.read_text()
    def preview(match):
        tag = match.group()
        if re.search(r'(?:property|name)=["\'](?:og:image(?::secure_url)?|twitter:image)["\']', tag):
            return re.sub(r'content=["\'][^"\']*["\']',
                          'content="https://shishukishora.com' + record['share_image'] + '"', tag)
        return tag
    updated = re.sub(r'<meta\b[^>]*>', preview, source)
    if updated != source:
        page.write_text(updated)
