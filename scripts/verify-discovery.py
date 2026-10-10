from pathlib import Path
import json,re,xml.etree.ElementTree as ET
from urllib.parse import urlparse
root=Path('public'); origin='https://sishu.kabitawithoutborders.org'
ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
urls=[e.text for e in ET.parse(root/'sitemap.xml').findall('.//s:loc',ns)]
assert len(urls)==len(set(urls))
for url in urls:
 assert url.startswith(origin+'/shishu/') and '/editorial/' not in url and '/page-' not in url
 route=urlparse(url).path;file=root/(route.lstrip('/')+('index.html' if route.endswith('/') else ''));html=file.read_text()
 assert 'noindex' not in re.search(r'<meta name="robots"[^>]+>',html)[0]
 data=json.loads(re.search(r'<script id="search-structured-data" type="application/ld\+json">(.*?)</script>',html,re.S)[1]);assert data['@context']=='https://schema.org'
 assert data['@graph'][1]['url']==url
index=json.loads((root/'content-index.json').read_text())
editions=json.loads((root/'edition-reader.json').read_text())
assert len(index['articles'])==len({item['href'] for edition in editions.values() for item in edition['items']})
for item in index['articles']:
 assert item['url'] in urls
 text=(root/urlparse(item['textUrl']).path.lstrip('/')).read_text()
 assert item['title'] in text and item['url'] in text and len(text.split('\n\n',1)[1].strip())>0
assert 'Sitemap: '+origin+'/sitemap.xml' in (root/'robots.txt').read_text()
for file in (root/'editorial').glob('*.html'):assert 'noindex, follow' in file.read_text()
print(f'Discovery verified: {len(urls)} sitemap URLs, schemas, article text, private-screen exclusions.')
