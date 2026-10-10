"""Apply reviewed biographies and portraits without modifying contribution lists."""
from pathlib import Path
from html import escape
import json,re

ROOT=Path('public')
writers=json.loads(Path('provenance/writer-research-2026-10-10.json').read_text())['writers']
index=ROOT/'shishu/writers.html'
directory=index.read_text()
css='<link rel="stylesheet" href="/writer-discovery.css?v=1">'

def meta(text,key,value):
    pattern=r'<meta\b(?=[^>]*(?:name|property)="'+re.escape(key)+r'")[^>]*>'
    attr='property' if key.startswith('og:') else 'name'
    tag=f'<meta {attr}="{key}" content="{escape(value,quote=True)}"/>'
    return re.sub(pattern,lambda _:tag,text) if re.search(pattern,text) else text.replace('</head>',tag+'</head>')

for w in writers:
    path=ROOT/w['route'].lstrip('/')
    text=path.read_text()
    assert (ROOT/w['portrait'].lstrip('/')).exists(),w['portrait']
    portrait=f'<img class="writer-photo writer-illustration" data-portrait-treatment="cartoon-natural" src="{w["portrait"]}" alt="{escape(w["name"])}" width="512" height="512" decoding="async">'
    image_pattern=r'<span class="writer-photo writer-avatar"[^>]*>.*?</span>|<img\b[^>]*class="writer-photo writer-illustration"[^>]*>'
    text=re.sub(image_pattern,lambda _:portrait,text,count=1,flags=re.S)
    text=re.sub(r'<section class="writer-introduction".*?</section>','',text,flags=re.S)
    source_links=''.join(f'<li><a href="{escape(s["url"],quote=True)}" target="_blank" rel="noopener noreferrer">{escape(s["label"])}</a></li>' for s in w['sources'])
    bio=f'<section class="writer-introduction" aria-labelledby="writer-introduction-title"><h2 id="writer-introduction-title">ଲେଖକଙ୍କୁ ଜାଣନ୍ତୁ</h2><p>{escape(w["bio"])}</p><details><summary>ପରିଚୟର ଉତ୍ସ</summary><ul>{source_links}</ul></details></section>'
    text=text.replace('<div class="contribution-heading">',bio+'<div class="contribution-heading">')
    assert text.count('class="writer-introduction"')==1,w['route']
    if css not in text:text=text.replace('</head>',css+'</head>')
    for key in ['description','og:description','twitter:description']:text=meta(text,key,w['bio'])
    social='https://sishu.kabitawithoutborders.org/social/writer-'+w['slug']+'-v1.jpg'
    for key in ['og:image','twitter:image']:text=meta(text,key,social)
    for key in ['og:image:alt','twitter:image:alt']:text=meta(text,key,w['name'])
    path.write_text(text)
    def card(m):
        item=m.group(0)
        if f'href="{w["route"]}"' not in item:return item
        item=re.sub(r' data-(?:biography|aliases)="[^"]*"','',item)
        item=item.replace('<li ',f'<li data-biography="true" data-aliases="{escape(w["searchAliases"],quote=True)}" ',1)
        item=re.sub(image_pattern,lambda _:portrait.replace(' decoding=', ' loading="lazy" decoding='),item,count=1,flags=re.S)
        item=re.sub(r'<span class="writer-role">.*?</span>','',item)
        return item.replace('</strong>','</strong><span class="writer-role">'+escape(w['role'])+'</span>',1)
    directory=re.sub(r'<li\b[^>]*data-writer="[^"]*".*?</li>',card,directory,flags=re.S)

controls='<label class="writer-bio-filter"><input id="writer-biographies" type="checkbox"> ପରିଚୟ ଥିବା ଲେଖକ</label>'
if 'id="writer-biographies"' not in directory:directory=directory.replace('<p id="writer-count"',controls+'<p id="writer-count"')
directory=directory.replace('ଲେଖକଙ୍କ ନାମ ଖୋଜନ୍ତୁ<input','ନାମ ବା ସାହିତ୍ୟିକ ନାମ ଖୋଜନ୍ତୁ<input')
if css not in directory:directory=directory.replace('</head>',css+'</head>')
directory=re.sub(r'/shishu-magazine.js(?:\?[^"\s]*)?', '/shishu-magazine.js?v=writer-discovery-v1', directory)
index.write_text(directory)
print(f'Applied {len(writers)} sourced writer introductions; contribution markup preserved.')
