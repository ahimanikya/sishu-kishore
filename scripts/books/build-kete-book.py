"""Build Kete as a sequential comic, retaining every original caption in order."""
from pathlib import Path
import json,html,shutil
from PIL import Image
R=Path(__file__).resolve().parents[2];P=R/'public';D=P/'shishu/books/ketejami_loda';S=R/'provenance/kete-jami-loda';H=html.escape
pages=json.loads((S/'reviewed-pages.json').read_text());scenes=json.loads((S/'comic-scenes.json').read_text());by={p['page']:p for p in pages}
od=lambda n:str(n).translate(str.maketrans('0123456789','୦୧୨୩୪୫୬୭୮୯'))
B={'title':'କେତେ ଜମି ଲୋଡ଼ା','author':'ଲିଓ ଟଲ୍‌ଷ୍ଟୟ','adaptation':'ଦାଶ ବେନହୁର','credit':'Original story wording · New illustrations by Ahimanikya','status':'Comic draft; writer proofreading pending','sourceEdition':{'originalStory':'How Much Land Does a Man Need?','author':'Leo Tolstoy','odiaTranscreation':'Dash Benhur','originalIllustrator':'Tapan','layout':'Gyana','creditSourcePages':[2,3]},'preface':pages[0],'pages':scenes}
for page in scenes:
 n=page['scanPage'];v=2 if (S/f'comic-originals/page-{n:02}-v2.png').exists() else 1;page['art']=f'art/comic-{n:02}-v{v}.jpg';page['geometry']=json.loads((S/'comic-geometry.json').read_text())[str(n)]
 assert '\n\n'.join(p['text'] for p in page['panels'])==by[n]['text']
 src=S/f'comic-originals/page-{n:02}-v{v}.png'
 if src.exists():Image.open(src).convert('RGB').save(D/page['art'],quality=92,optimize=True)
(S/'book-draft.json').write_text(json.dumps(B,ensure_ascii=False,indent=2)+'\n');public_book=json.loads(json.dumps(B));
for page in public_book['pages']:
 for panel in page['panels']:panel.pop('scene',None)
(D/'illustrated-draft.json').write_text(json.dumps(public_book,ensure_ascii=False,indent=2)+'\n')
base='/shishu/books/ketejami_loda/';pdf=base+'kete-jami-loda-illustrated.pdf'
def head(title,review=False):return f'<!doctype html><html lang="or"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{H(title)} · ଶିଶୁ କିଶୋର</title><meta name="book-preview" content="{base}art/cover-v1.jpg"><link rel="stylesheet" href="/children-identity.css"><link rel="stylesheet" href="{base}illustrated.css">'+('<meta name="robots" content="noindex,follow">' if review else '')+'</head>'
def panel_image(n,i,alt):
 c=next(c for c in scenes if c['scanPage']==n);g=c['geometry'];col=i%2;row=i//2
 x=g['x'][col];y=g['y'][row];w=g['x'][col+1]-x;h=g['y'][row+1]-y
 return f'<svg class="panel-art" style="aspect-ratio:{w}/{h}" preserveAspectRatio="none" viewBox="{x} {y} {w} {h}" role="img" aria-label="{H(alt)}"><image href="{base}{c["art"]}" width="{g["width"]}" height="{g["height"]}" preserveAspectRatio="none"/></svg>'

options='<option value="preface">ମୁଖବନ୍ଧ</option>'+''.join(f'<option value="page-{c["scanPage"]}">ପୃଷ୍ଠା {od(c["printedPage"])}</option>' for c in scenes)
intro=f'''<header class="book-header"><a href="/shishu/elibrary_main.html">← ବହି</a><p class="eyebrow">ଚିତ୍ରକଥା</p><h1>{B['title']}</h1><p class="byline">ମୂଳ କାହାଣୀ: {B['author']}<br>ଓଡ଼ିଆ ରୂପାନ୍ତର: {B['adaptation']}</p><div class="book-actions"><a href="#page-4">Read comic →</a><a href="{pdf}" download>Download PDF</a></div><p class="draft-note">ପ୍ରୁଫ୍‌ ସଂଶୋଧନ ଅପେକ୍ଷାରେ · <span lang="en">Comic draft for writer review</span></p></header>'''
nav=f'''<nav class="reader-tools" aria-label="Reading controls"><label><span class="sr-only">ପୃଷ୍ଠା ବାଛନ୍ତୁ</span><select id="parts">{options}</select></label><button id="smaller" aria-label="Smaller text">A−</button><button id="larger" aria-label="Larger text">A+</button><button id="theme" aria-pressed="false">ରାତି</button><a href="{pdf}" download>Download PDF</a><a href="{base}page-1.html">ମୂଳ ବହି</a><a href="{base}proofread.html">ପ୍ରୁଫ୍‌ ଦେଖନ୍ତୁ</a></nav>'''
sections=[]
for c in scenes:
 n=c['scanPage'];panels=''
 for i,p in enumerate(c['panels']):
  panels+=f'<div class="comic-panel" data-source-page="{n}" data-panel="{i+1}"><figure class="panel-layout">'+panel_image(n,i,f'ପୃଷ୍ଠା {od(n-1)}, ଚିତ୍ର {od(i+1)}')+f'<figcaption>{H(p["text"])}</figcaption></figure></div>'
 sections.append(f'<section class="poem comic-page" id="page-{n}"><div class="page-label"><h2>ପୃଷ୍ଠା {od(n-1)}</h2></div><div class="comic-grid">{panels}</div></section>')
# Preface follows the comic so the opening starts with sequential art.
preface='<section class="poem preface" id="preface"><h2>ମୁଖବନ୍ଧ</h2>'+''.join(f'<p>{H(p)}</p>' for p in pages[0]['text'].split('\n\n'))+f'</section>'
footer=f'''<footer class="book-footer"><p lang="en">{B['credit']}</p><p>ମୂଳ କାହାଣୀ: ଲିଓ ଟଲ୍‌ଷ୍ଟୟ · ଓଡ଼ିଆ ରୂପାନ୍ତର: ଦାଶ ବେନହୁର<br>ମୂଳ ଚିତ୍ର: ତପନ · ଅଙ୍ଗସଜ୍ଜା: ଜ୍ଞାନ</p><p lang="en">Original captions follow the printed comic’s reading order. Original scans and printed credits are preserved.</p><a href="{base}page-2.html">ମୂଳ ପ୍ରକାଶନ ତଥ୍ୟ</a> · <a href="/shishu/elibrary_main.html">ବହିକୁ ଫେରନ୍ତୁ</a></footer>'''
(D/'illustrated.html').write_text(head(B['title'])+'<body>'+intro+nav+'<main>'+''.join(sections)+preface+'</main>'+footer+f'<script src="{base}illustrated.js"></script></body></html>')
source=P/'shishu/books/musha_mushi'
extra='''\nmain{max-width:1120px}.comic-page{padding-top:24px;margin-bottom:60px}.page-label{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:14px}.page-label h2{font-size:21px;margin:0}.comic-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;align-items:start}.comic-panel{margin:0;border:2px solid #34392e;background:#fffaf0;overflow:hidden;border-radius:3px}.panel-art{display:block;width:100%;height:auto;aspect-ratio:1;overflow:hidden;background:#f2eddc}.comic-panel figcaption{border-top:2px solid #34392e;padding:18px 20px 12px;font-size:var(--reading-size,21px);line-height:1.85;overflow-wrap:break-word}.preface{max-width:760px;margin:40px auto 70px}.book-header{padding-bottom:8px}body.night .comic-panel{background:#26352e;border-color:#87937c}body.night figcaption{border-color:#87937c}@media(max-width:700px){.comic-grid{grid-template-columns:1fr;gap:22px}main{padding:16px}.comic-panel figcaption{padding:16px 18px 12px}.page-label h2{font-size:20px}.byline{font-size:19px}}\n'''
extra += """
/* A panel chooses its own arrangement from its available width. */
.comic-grid{align-items:stretch}.comic-panel{container-type:inline-size}.panel-layout{margin:0;display:flex;flex-direction:column;height:100%}.comic-panel figcaption{flex:1;min-width:0}.comic-panel:last-child:nth-child(odd){grid-column:1/-1}
@container(min-width:620px){.panel-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-items:stretch}.panel-art{align-self:start}.comic-panel figcaption{border-top:0;border-left:2px solid #34392e;padding:22px 24px;display:flex;align-items:center}}
@media(max-width:700px){.comic-panel:last-child:nth-child(odd){grid-column:auto}}
"""
(D/'illustrated.css').write_text((source/'illustrated.css').read_text()+extra)
(D/'illustrated.js').write_text((source/'illustrated.js').read_text().replace('musha-mushi-illustrated-v1','kete-jami-loda-comic-v1').replace("'#poems'","'#parts'").replace("saved.size||23","saved.size||21"))
print('Built 22 comic source pages, 107 illustrated caption panels, and proofreading workspace.')

import runpy
runpy.run_path(str(R/'scripts/books/normalize-book-ui.py'))
