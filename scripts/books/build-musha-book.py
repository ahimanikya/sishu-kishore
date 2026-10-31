"""Build the complete illustrated draft and source-comparison workspace.
Run prepare-musha-text.py first. Writer edits are imported explicitly, never auto-published.
"""
from pathlib import Path
import json,html,shutil,re
from PIL import Image
from bs4 import BeautifulSoup
R=Path(__file__).resolve().parents[2]; P=R/'public'; D=P/'books/musha_mushi'; S=R/'provenance/musha-mushi'
H=html.escape
pages=json.loads((S/'reviewed-pages.json').read_text())
starts=[5,8,10,13,15,18,22,24,26,28,30,32,34,38,40,43,46,48]
chapters=[]
for i,start in enumerate(starts):
 end=starts[i+1]-1 if i+1<len(starts) else 50
 selected=[dict(p) for p in pages if start<=p['page']<=end and p['text']]
 title=selected[0]['text'].splitlines()[0]
 selected[0]['text']='\n'.join(selected[0]['text'].splitlines()[1:])
 chapters.append({'id':i+1,'title':title,'startPage':start,'endPage':end,'art':f'art/poem-{i+1:02}-v1.jpg','pages':selected})
book={'title':'ମୂଷା ଓ ମୁଷୀ','author':'ପରେଶ କୁମାର ପଟ୍ଟନାୟକ','credit':'Original story wording · New illustrations by Ahimanikya','status':'Illustrated draft; writer proofreading pending','sourceEdition':{'year':2022,'publisher':'Lekhalekhi','originalIllustrator':'Baladev Maharatha','isbn':'978-81-955751-5-2'},'reviewNote':'Text compared against the original scans by Codex. Best readings of faded words are flagged. User authorized best guesses on 24 October 2026; writer review remains pending.','chapters':chapters}
(S/'book-draft.json').write_text(json.dumps(book,ensure_ascii=False,indent=2)+'\n')
(D/'illustrated-draft.json').write_text(json.dumps(book,ensure_ascii=False,indent=2)+'\n')
for f in json.loads((S/'generated-files.json').read_text()):
 dest=S/f'art-originals/poem-{f["n"]:02}-v1.png'
 if not dest.exists():shutil.copyfile(f['path'],dest)
 im=Image.open(dest).convert('RGB');im.save(D/f'art/poem-{f["n"]:02}-v1.jpg',quality=91,optimize=True)
base='/books/musha_mushi/'
head=lambda title,review=False:f'''<!doctype html><html lang="or"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{H(title)} · ଶିଶୁ କିଶୋର</title><link rel="stylesheet" href="/children-identity.css"><link rel="stylesheet" href="{base}illustrated.css">{'<meta name="robots" content="noindex,follow">' if review else ''}</head>'''
options=''.join(f'<option value="poem-{c["id"]}">{c["id"]}. {H(c["title"])}</option>' for c in chapters)
sections=[]
for c in chapters:
 verse=''
 for p in c['pages']:
  verse+=f'<div class="source-passage" data-source-page="{p["page"]}"><p class="verse">{H(p["text"])}</p></div>'
 sections.append(f'<section class="poem" id="poem-{c["id"]}"><p class="poem-number">{c["id"]:02} / 18</p><h2>{H(c["title"])}</h2><img class="story-art" src="{base}{c["art"]}" alt="{H(c["title"])} — ନୂଆ ଚିତ୍ର" width="1536" height="1024" loading="lazy">{verse}</section>')
intro=f'''<header class="book-header"><a href="/elibrary_main.html">← ବହି</a><p class="eyebrow">ଶିଶୁକବିତା ସଂକଳନ</p><h1>{book['title']}</h1><p class="byline">{book['author']}</p><img class="cover-art" src="{base}art/poem-01-v1.jpg" width="1536" height="1024" alt="ନଈକୂଳରେ ମୂଷା ଓ ମୂଷୀ"><p class="draft-note">ଲେଖକଙ୍କ ପ୍ରୁଫ୍‌ ସଂଶୋଧନ ଅପେକ୍ଷାରେ · <span lang="en">Illustrated draft for writer review</span></p></header>'''
nav=f'''<nav class="reader-tools" aria-label="Reading controls"><label><span class="sr-only">କବିତା ବାଛନ୍ତୁ</span><select id="poems">{options}</select></label><button id="smaller" aria-label="Smaller text">A−</button><button id="larger" aria-label="Larger text">A+</button><button id="theme" aria-pressed="false">ରାତି</button><a href="{base}musha-mushi-illustrated.pdf" download>PDF ↓</a><a href="{base}page-1.html">ମୂଳ ବହି</a><a href="{base}proofread.html">ପ୍ରୁଫ୍‌ ଦେଖନ୍ତୁ</a></nav>'''
footer=f'''<footer class="book-footer"><p lang="en">{book['credit']}</p><p>ମୂଳ ସଂସ୍କରଣ: ଲେଖାଲେଖି, ୨୦୨୨ · ମୂଳ ଚିତ୍ର: ବଳଦେବ ମହାରଥା</p><p lang="en">Original scans and printed credits are preserved.</p><a href="{base}page-2.html">ମୂଳ ପ୍ରକାଶନ ତଥ୍ୟ</a> · <a href="/elibrary_main.html">ବହିକୁ ଫେରନ୍ତୁ</a></footer>'''
(D/'illustrated.html').write_text(head(book['title'])+'<body>'+intro+nav+'<main>'+''.join(sections)+'</main>'+footer+f'<script src="{base}illustrated.js"></script></body></html>')
# Use the illustrated edition in the global book selector; its original remains linked inside.
catalog=P/'reader-catalog.json';data=json.loads(catalog.read_text())
for group in data:
 for item in group.get('items',[]):
  if item.get('book')=='musha_mushi':
   item['href']=base+'illustrated.html';item.pop('book',None);item.pop('total',None)
catalog.write_text(json.dumps(data,ensure_ascii=False)+'\n')
print(f'Built {len(chapters)} poems, {sum(len(c["pages"]) for c in chapters)} source text pages, 50 original scans preserved.')

# Keep reader and download entry points consistent after regeneration.
import runpy
runpy.run_path(str(R/'scripts/books/publish-musha-entrypoints.py'))

runpy.run_path(str(R/'scripts/books/normalize-book-ui.py'))
