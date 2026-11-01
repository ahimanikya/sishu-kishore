"""Preserve the selected issue when entering the reviewed shared article."""
from pathlib import Path
from urllib.parse import urlsplit, quote
from bs4 import BeautifulSoup
import json

root = Path('public')
target = '/article_details-90e919ace4.html'
catalog = json.loads((root / 'edition-reader.json').read_text())
contexts = {route: data for route, data in catalog.items()
            if any(item['href'] == target for item in data['items'])}
for path in root.rglob('*.html'):
    if path.is_relative_to(root / 'review'):
        continue
    original = path.read_text()
    if target not in original:
        continue
    soup = BeautifulSoup(original, 'html.parser')
    issue = soup.body.get('data-reading-issue') if soup.body else None
    own = '/' + path.relative_to(root).as_posix()
    if own != target and issue not in contexts:
        continue
    if own == target:
        data = soup.select_one('#shared-article-context')
        if not data:
            data = soup.new_tag('script', id='shared-article-context', type='application/json')
            soup.head.append(data)
        data.string = json.dumps(contexts, ensure_ascii=False).replace('<', '\\u003c')
        script = soup.select_one('script[src="/shared-article-context.js"]')
        if script:
            script.extract()
        else:
            script = soup.new_tag('script', src='/shared-article-context.js', defer='')
        # Read context before either tool captures the default issue.
        first_reader = soup.select_one('script[src^="/article-tools.js"],script[src^="/edition-reader.js"]')
        if first_reader:
            first_reader.insert_before(script)
        else:
            soup.head.append(script)
    elif issue in contexts:
        for anchor in soup.select('a[href]'):
            if urlsplit(anchor['href']).path == target:
                fragment = urlsplit(anchor['href']).fragment
                anchor['href'] = target + '?issue=' + quote(issue, safe='') + ('#' + fragment if fragment else '')
    updated = str(soup)
    if updated != original:
        path.write_text(updated)
print('Shared article entries retain their August/October issue context.')
