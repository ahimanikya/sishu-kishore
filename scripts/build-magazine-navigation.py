"""Keep magazine Home and the current edition as distinct static navigation links."""
from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
pages = root / 'public/shishu'
nav_pattern = re.compile(r'(<nav aria-label="Main navigation">)(.*?)(</nav>)', re.S)
home_pattern = re.compile(r'<a\b[^>]*href="/shishu/"[^>]*>.*?</a>', re.S)
edition_pattern = re.compile(r'<a\b[^>]*href="/shishu/current_issue\.html"[^>]*>.*?</a>', re.S)
changed = 0

for path in pages.rglob('*.html'):
    before = path.read_text()

    def navigation(match):
        content = match[2]
        if not home_pattern.search(content):
            return match[0]
        home_current = ' aria-current="page"' if path == pages / 'index.html' else ''
        edition_current = ' aria-current="page"' if path == pages / 'current_issue.html' else ''
        links = (
            f'<a{home_current} data-kid-icon="home" href="/shishu/">ମୂଳ ପୃଷ୍ଠା</a>'
            f'<a{edition_current} data-kid-icon="book" href="/shishu/current_issue.html">ଚଳିତ ସଂଖ୍ୟା</a>'
        )
        content = edition_pattern.sub('', content)
        content = home_pattern.sub(lambda _: links, content, count=1)
        return match[1] + content + match[3]

    after = nav_pattern.sub(navigation, before)
    if after != before:
        path.write_text(after)
        changed += 1

print(f'Magazine navigation: updated {changed} pages; Home and current edition have separate destinations.')
