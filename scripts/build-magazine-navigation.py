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
favicon_block = (
    '<!-- sishu-favicon:start -->'
    '<link rel="icon" href="/favicon.ico?v=symbol-v1" type="image/x-icon" sizes="16x16 32x32 48x48"/>'
    '<link rel="icon" href="/media/favicon-32-v1.png" type="image/png" sizes="32x32"/>'
    '<link rel="icon" href="/media/favicon-192-v1.png" type="image/png" sizes="192x192"/>'
    '<link rel="apple-touch-icon" href="/media/apple-touch-icon-v1.png" sizes="180x180"/>'
    '<!-- sishu-favicon:end -->'
)
favicon_pattern = re.compile(r'<!-- sishu-favicon:start -->.*?<!-- sishu-favicon:end -->', re.S)


def favicon_head(match):
    # Replace only our own generated metadata; leave reading content and access tags intact.
    return match[1] + favicon_pattern.sub('', match[2]) + favicon_block + match[3]


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
    after = re.sub(r'(<head\b[^>]*>)(.*?)(</head\s*>)', favicon_head, after, count=1, flags=re.S | re.I)
    # Keep artwork disclosure central, without removing editorial review status.
    after = after.replace('Editorial approval pending · Article illustrations are AI-generated.', 'Editorial approval pending')
    after = re.sub(r'<p\b[^>]*class="nov-review-note"[^>]*>Article illustrations are AI-generated\.</p>', '', after)
    def credits_link(match):
        if 'href="/our-brand/"' in match[0]:
            return match[0]
        content = re.sub(r'<a\b[^>]*href="/credits/"[^>]*>.*?</a>', '', match[2], flags=re.S)
        return match[1] + content + '<a href="/our-brand/">ଆମ ପରିଚୟ</a>' + match[3]
    after = re.sub(r'(<nav aria-label="Footer">)(.*?)(</nav>)', credits_link, after, flags=re.S)
    # Short footer labels keep all destinations readable in a compact desktop row.
    def compact_footer(match):
        content = match[0]
        for href, label in (('/whoweare.html', 'ଆମ ଦଳ'), ('/news.html', 'ଖବର'), ('/activity_children.html', 'ଚିତ୍ରଶାଳା')):
            content = re.sub(r'(<a\b[^>]*href="' + re.escape(href) + r'"[^>]*>).*?(</a>)', lambda link: link[1] + label + link[2], content, flags=re.S)
        return content
    after = re.sub(r'<footer\b.*?</footer>', compact_footer, after, flags=re.S)
    # Editor applications are direct-entry tools, not public magazine navigation.
    if path not in (pages / 'editorial/studio.html', pages / 'editorial/manage.html'):
        after = re.sub(r'<a\b[^>]*href="/editorial/(?:studio|manage)\.html(?:[?#][^\"]*)?"[^>]*>.*?</a>', '', after, flags=re.S)
    if after != before:
        path.write_text(after)
        changed += 1

print(f'Magazine navigation: updated {changed} pages; Home and current edition have separate destinations.')
