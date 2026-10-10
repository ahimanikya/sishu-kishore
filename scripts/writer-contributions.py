"""Restyle existing writer contributions without changing byline membership or order."""
from pathlib import Path
from html import escape, unescape
import re

ROOT = Path('public')
CSS = '<link rel="stylesheet" href="/writer-contributions.css?v=1">'
pages = entries = 0
for page in sorted((ROOT / 'shishu/writers').glob('*.html')):
    source = page.read_text()
    match = re.search(r'<ul class="mag-contributions[^\"]*"[^>]*>(.*?)</ul>', source, re.S)
    if not match:
        continue
    cards = []
    for item in re.findall(r'<li\b[^>]*>(.*?)</li>', match[1], re.S):
        article = re.search(r'<a\b[^>]*href="([^"]+)"[^>]*>(.*?)</a>', item, re.S)
        date = re.search(r'<small\b[^>]*>(.*?)</small>', item, re.S)
        if not article or not date:
            raise ValueError(f'Unrecognized contribution in {page}')
        href, title = article.groups()
        title = re.sub(r'<span class="contribution-arrow".*?</span>', '', title, flags=re.S)
        label = re.sub(r'<[^>]+>', '', date[1])
        article_file = ROOT / unescape(href).lstrip('/')
        article_html = article_file.read_text()
        context = re.search(r'<nav\b[^>]*class="mag-article-context"[^>]*>(.*?)</nav>', article_html, re.S)
        issue = re.search(r'href="([^"]+)"', context[1]) if context else None
        edition = f'<a class="contribution-edition" href="{issue[1]}">{label}</a>' if issue else label
        cards.append(f'<li><a class="contribution-title" href="{href}">{title}<span class="contribution-arrow" aria-hidden="true">→</span></a><small>{edition}</small></li>')
    heading = f'<div class="contribution-heading"><h2 id="writer-contributions">ପ୍ରକାଶିତ ଲେଖା</h2><span>{str(len(cards)).translate(str.maketrans("0123456789", "୦୧୨୩୪୫୬୭୮୯"))} ଲେଖା</span></div>'
    source = re.sub(r'<div class="contribution-heading">.*?</div>', '', source, flags=re.S)
    source = re.sub(r'<ul class="mag-contributions[^\"]*"[^>]*>.*?</ul>', lambda _: heading + '<ul class="mag-contributions contribution-cards" aria-labelledby="writer-contributions">' + ''.join(cards) + '</ul>', source, flags=re.S)
    # Match the list on repeat runs even when it has its accessible label.
    if CSS not in source:
        source = source.replace('</head>', CSS + '</head>')
    page.write_text(source)
    pages += 1
    entries += len(cards)
print(f'Writer cards: {entries} contributions across {pages} profiles.')
