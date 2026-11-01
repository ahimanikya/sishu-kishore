"""Keep magazine Home and the current edition as distinct static navigation links."""
from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
pages = root / 'public'
nav_pattern = re.compile(r'(<nav aria-label="Main navigation">)(.*?)(</nav>)', re.S)
home_pattern = re.compile(r'<a\b[^>]*href="/"[^>]*>.*?</a>', re.S)
edition_pattern = re.compile(r'<a\b[^>]*href="/current_issue\.html"[^>]*>.*?</a>', re.S)
# Only the shared navigation brand changes; covers and book artwork retain their identity.
brand_pattern = re.compile(r'(<a\b[^>]*class="ia-brand"[^>]*>).*?(</a>)', re.S)
brand_image = (
    '<span class="mag-brand-logo"><img alt="ଶିଶୁ କିଶୋର" decoding="async" '
    'height="362" loading="eager" src="/media/sishu-kishore-horizontal-logo-v1.webp" '
    'width="1086"/></span>'
)
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
            f'<a{home_current} data-kid-icon="home" href="/">ମୂଳ ପୃଷ୍ଠା</a>'
            f'<a{edition_current} data-kid-icon="book" href="/current_issue.html">ଚଳିତ ସଂଖ୍ୟା</a>'
        )
        content = edition_pattern.sub('', content)
        content = home_pattern.sub(lambda _: links, content, count=1)
        return match[1] + content + match[3]

    after = nav_pattern.sub(navigation, before)
    after = brand_pattern.sub(lambda match: match[1] + brand_image + match[2], after)
    # Keep artwork disclosure central, without removing editorial review status.
    after = after.replace('Editorial approval pending · Article illustrations are AI-generated.', 'Editorial approval pending')
    after = re.sub(r'<p\b[^>]*class="nov-review-note"[^>]*>Article illustrations are AI-generated\.</p>', '', after)
    def credits_link(match):
        if 'href="/credits/"' in match[0]:
            return match[0]
        return match[1] + match[2] + '<a href="/credits/">ଶ୍ରେୟ ଓ ଚିତ୍ରକଳା</a>' + match[3]
    after = re.sub(r'(<nav aria-label="Footer">)(.*?)(</nav>)', credits_link, after, flags=re.S)
    if after != before:
        path.write_text(after)
        changed += 1

print(f'Magazine navigation: updated {changed} pages; Home and current edition have separate destinations.')
