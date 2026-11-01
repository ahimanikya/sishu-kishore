"""Apply explicit editorial withdrawals, with private first-write preservation.

Run before discovery/build and after any writer-profile merge. Historical review
copies are deliberately excluded. This is a publication filter, not file erasure.
"""
from pathlib import Path
from urllib.parse import urlsplit
import argparse
import json
import shutil
from bs4 import BeautifulSoup, NavigableString

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = 'https://shishukishora.com'


def route(value):
    if not isinstance(value, str):
        return None
    parsed = urlsplit(value)
    if parsed.netloc and parsed.netloc != 'shishukishora.com':
        return None
    return parsed.path


def filter_json(value, withdrawn):
    """Only delete records whose own URL identifies a withdrawn article."""
    if isinstance(value, list):
        return [filter_json(v, withdrawn) for v in value
                if not (isinstance(v, dict) and any(route(v.get(k)) in withdrawn for k in ('href', 'url', 'loc')))]
    if isinstance(value, dict):
        return {k: filter_json(v, withdrawn) for k, v in value.items()
                if not (isinstance(v, str) and route(v) in withdrawn)}
    return value


def apply(root, check=False):
    public = root / 'public'
    manifest = json.loads((root / 'provenance/approved-withdrawals.json').read_text())
    withdrawn = {item['route'] for item in manifest['withdrawals']}
    archive = root / manifest['private_archive']
    errors = []
    changed = []

    def preserve(path):
        destination = archive / path.relative_to(root)
        if not destination.exists():
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(path, destination)

    def write(path, text):
        if text != path.read_text():
            if check:
                errors.append(str(path.relative_to(root)))
            else:
                preserve(path)
                path.write_text(text)
                changed.append(str(path.relative_to(root)))

    catalog_path = public / 'edition-reader.json'
    catalog = json.loads(catalog_path.read_text())
    neighbors = {}
    for edition in catalog.values():
        items = edition.get('items', [])
        for i, item in enumerate(items):
            if item['href'] not in withdrawn:
                continue
            previous = next((x['href'] for x in reversed(items[:i]) if x['href'] not in withdrawn), None)
            following = next((x['href'] for x in items[i+1:] if x['href'] not in withdrawn), None)
            neighbors[item['href']] = (previous, following)

    for item in manifest['withdrawals']:
        path = public / item['route'].lstrip('/')
        if path.exists():
            if check:
                errors.append('Withdrawn page remains: ' + item['route'])
            else:
                preserve(path)
                path.unlink()
                changed.append(str(path.relative_to(root)))

    for path in public.rglob('*.html'):
        if path.is_relative_to(public / 'review'):
            continue
        original = path.read_text()
        own_route = '/' + path.relative_to(public).as_posix()
        excerpt = next((x for x in manifest['excerpt_removals'] if x['route'] == own_route), None)
        aggregate = own_route == '/editions/2026-11/all-writing.html'
        if not any(x in original for x in withdrawn) and not excerpt and not aggregate:
            continue
        soup = BeautifulSoup(original, 'html.parser')
        dirty = False
        if excerpt:
            prose = soup.select_one('.ia-prose')
            marker = next((x for x in prose.descendants if isinstance(x, NavigableString) and excerpt['start_text'] in x), None) if prose else None
            if marker:
                # This source has both poems in one paragraph. Remove precisely
                # the suffix from the title, preserving every preceding node.
                suffix = list(marker.next_siblings)
                prefix = str(marker).split(excerpt['start_text'], 1)[0]
                for node in suffix:
                    node.extract()
                marker.replace_with(prefix)
                # Also handle later sibling blocks inside the prose container.
                # marker has been replaced, so locate paragraph by prefix source.
                paragraph = prose.find('p', class_='subject')
                if paragraph:
                    for node in list(paragraph.next_siblings):
                        node.extract()
                dirty = True
        withdrawn_ids = {Path(x).stem for x in withdrawn if x.startswith('/editions/2026-11/')}
        if aggregate:
            for block in list(soup.select('article[id]')):
                if block['id'] in withdrawn_ids:
                    block.decompose()
                    dirty = True
        for anchor in list(soup.select('a[href]')):
            if anchor.attrs is None:
                continue
            href = route(anchor.get('href'))
            if aggregate and anchor.get('href', '').startswith('#') and anchor['href'][1:] in withdrawn_ids:
                (anchor.find_parent('li') or anchor).decompose()
                dirty = True
                continue
            if href not in withdrawn:
                continue
            li = anchor.find_parent('li')
            if li:
                li.decompose()
            else:
                nav = anchor.find_parent('nav')
                is_sequence = nav and any(x in nav.get('class', []) for x in ('mag-web-reading', 'ia-article-navigation', 'article-navigation'))
                previous, following = neighbors.get(href, (None, None))
                label = anchor.get_text(' ', strip=True)
                replacement = previous if ('ପୂର୍ବ' in label or '←' in label) else following
                is_issue_start = anchor.find_parent(class_='mag-edition-actions') is not None
                if (is_sequence or is_issue_start) and replacement:
                    anchor['href'] = replacement
                else:
                    anchor.decompose()
            dirty = True
        # Structured data may embed a stale article URL; retain other metadata.
        for script in soup.select('script[type="application/ld+json"]'):
            try:
                data = json.loads(script.string or script.get_text())
            except ValueError:
                continue
            filtered = filter_json(data, withdrawn)
            if data != filtered:
                script.string = json.dumps(filtered, ensure_ascii=False)
                dirty = True
        if dirty:
            contributions = soup.select_one('ul.mag-contributions')
            if contributions:
                count = len(contributions.find_all('li', recursive=False))
                heading = soup.select_one('.contribution-heading > span')
                if heading:
                    heading.string = str(count).translate(str.maketrans('0123456789', '୦୧୨୩୪୫୬୭୮୯')) + ' ଲେଖା'
            write(path, str(soup))

    # Update root catalogues and search data, without touching private review
    # catalogues or unrelated embedded content such as literary manuscript text.
    for path in public.glob('*.json'):
        data = json.loads(path.read_text())
        filtered = filter_json(data, withdrawn)
        if data != filtered:
            write(path, json.dumps(filtered, ensure_ascii=False, separators=(',', ':')) + '\n')

    # Writer directory totals must match the remaining contribution cards.
    directory_path = public / 'writers.html'
    if directory_path.exists():
        soup = BeautifulSoup(directory_path.read_text(), 'html.parser')
        dirty = False
        for card in soup.select('li[data-writer]'):
            a = card.select_one('a[href]')
            target = public / a['href'].lstrip('/') if a else None
            if not target or not target.is_file():
                continue
            writer = BeautifulSoup(target.read_text(), 'html.parser')
            contributions = writer.select_one('ul.mag-contributions')
            small = card.select_one('small')
            if contributions and small:
                count = str(len(contributions.find_all('li', recursive=False))).translate(str.maketrans('0123456789', '୦୧୨୩୪୫୬୭୮୯')) + ' ଲେଖା'
                if small.get_text() != count:
                    small.string = count
                    dirty = True
        if dirty:
            write(directory_path, str(soup))
    if check:
        if errors:
            raise SystemExit('Approved withdrawals not applied:\n' + '\n'.join(errors))
        print(f'Approved withdrawals verified: {len(withdrawn)} pages absent, excerpt/listings filtered; review copies preserved.')
    else:
        print(f'Approved withdrawals applied: {len(changed)} files changed; originals preserved under {manifest["private_archive"]}.')
    return changed


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    parser.add_argument('--root', type=Path, default=ROOT)
    args = parser.parse_args()
    apply(args.root.resolve(), args.check)
