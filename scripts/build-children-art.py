"""Rebuild the children's gallery from preserved source credits and approved display captions. Requires Pillow."""
from pathlib import Path
from html import escape
from PIL import Image,ImageOps
import re,json,hashlib
root=Path(__file__).resolve().parents[1];public=root/'public';out=root/'provenance/children-art';p=out/'artworks.json';data=json.loads(p.read_text());items=data['artworks']
od=lambda s:str(s).translate(str.maketrans('0123456789','୦୧୨୩୪୫୬୭୮୯'))
esc=escape
home=(public/'shishu/index.html').read_text();home=re.sub(r'<section class="art-home".*?</section>','',home,flags=re.S);home=home.replace('<link rel="stylesheet" href="/children-art.css?v=1">','');head=home.split('<head>',1)[1].split('</head>',1)[0]
head=re.sub(r'<script\b[^>]*>.*?</script>','',head,flags=re.S)
head=re.sub(r'<meta\b[^>]*>|<link\b[^>]*rel="canonical"[^>]*>|<title>.*?</title>','',head,flags=re.S)
header=re.search(r'<header class="ia-header".*?</header>',home,re.S)[0];footer=re.search(r'<footer.*?</footer>',home,re.S)[0]
url='https://sishu.kabitawithoutborders.org/shishu/activity_children.html';title='ପିଲାଙ୍କ ଚିତ୍ର';description='ପିଲାଙ୍କ ଚିତ୍ର - ପିଲାଙ୍କ ତୂଳୀରୁ'
# Social preview uses the existing contain-preview convention; original drawing stays untouched.
source=public/items[0]['local'].lstrip('/');digest=hashlib.sha256(source.read_bytes()+b'share-contain-v1').hexdigest()[:16];social='/social/'+digest+'.jpg';target=public/social.lstrip('/')
if not target.exists():
 with Image.open(source) as im:
  im=ImageOps.exif_transpose(im).convert('RGBA');im.thumbnail((1160,590),Image.Resampling.LANCZOS);canvas=Image.new('RGB',(1200,630),(251,247,234));canvas.paste(im,((1200-im.width)//2,(630-im.height)//2),im);canvas.save(target,quality=88,optimize=True)
meta=f'<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{title} · ଶିଶୁ କିଶୋର</title><meta name="description" content="{description}"><link rel="canonical" href="{url}"><meta property="og:title" content="{title}"><meta property="og:description" content="{description}"><meta property="og:type" content="website"><meta property="og:url" content="{url}"><meta property="og:image" content="https://sishu.kabitawithoutborders.org{social}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="https://sishu.kabitawithoutborders.org{social}">'
intro='<header class="art-intro"><p class="art-eyebrow">ଶିଶୁ କିଶୋର · ପିଲାଙ୍କ ପୃଷ୍ଠା</p><h1>ପିଲାଙ୍କ ଚିତ୍ର</h1><p>ପିଲାଙ୍କ ତୂଳୀରୁ</p></header>'
groups={}
for i,a in enumerate(items):groups.setdefault(re.search(r'\d+',a['issue'])[0],[]).append((i,a))
nav='<nav class="art-issue-jumps" aria-label="ସଂଖ୍ୟା ବାଛନ୍ତୁ">'+''.join(f'<a href="#art-issue-{n}">ସଂଖ୍ୟା {od(n)}</a>' for n in groups)+'</nav>'
def card(i,a,mini=False):
 image=f'<span class="art-mat"><img src="{a["local"]}" width="{a["width"]}" height="{a["height"]}" alt="{esc(a["display_caption"])}" loading="lazy" decoding="async"></span>'
 frame=f'<a class="art-frame tone-{i%4}" href="{a["local"]}" aria-label="{esc(a["display_caption"]+" — "+a["name"])}">{image}</a>'
 caption=f'<figcaption><h3>{esc(a["display_caption"])}</h3><p class="art-credit">{esc(a["name"])}</p>'
 if not mini:caption+=f'<p class="art-school">{esc(a["caption"])}</p><p class="art-source-issue">{esc(a["issue"])}</p>'
 return f'<figure class="art-card">{frame}{caption}</figcaption></figure>'
sections=''.join(f'<section class="art-edition" aria-labelledby="art-issue-{n}"><h2 id="art-issue-{n}">ସଂଖ୍ୟା {od(n)}</h2><div class="art-grid">'+''.join(card(i,a) for i,a in group)+'</div></section>' for n,group in groups.items())
html=f'<!doctype html><html lang="or"><head>{meta}{head}<link rel="stylesheet" href="/children-art.css?v=1"></head><body class="shishu ia-site"><a class="ia-skip" href="#main">ସିଧା ଚିତ୍ରକୁ ଯାଆନ୍ତୁ</a>{header}<main id="main" class="ia-main art-gallery"><nav class="ia-breadcrumb"><a href="/shishu/">← ମୂଳ ପୃଷ୍ଠା</a></nav>{intro}{nav}{sections}</main>{footer}<script defer src="/kid-ux.js?v=1"></script><script defer src="/share.js?v=release-v2"></script></body></html>'
(public/'shishu/activity_children.html').write_text(html)
# A compact home preview makes the gallery easy to find without expanding the primary navigation.
preview='<section class="art-home" aria-labelledby="art-home-title"><div class="art-home-heading"><div><p class="art-eyebrow">ପିଲାଙ୍କ ତୂଳୀରୁ</p><h2 id="art-home-title">ପିଲାଙ୍କ ଚିତ୍ର</h2></div><a class="art-gallery-link" href="/shishu/activity_children.html">ସବୁ ଚିତ୍ର ଦେଖନ୍ତୁ →</a></div><div class="art-grid">'+''.join(card(i,a,True) for i,a in enumerate(items[:3]))+'</div></section>'
home=home.replace('<section class="mag-editor-link">',preview+'<section class="mag-editor-link">').replace('</head>','<link rel="stylesheet" href="/children-art.css?v=1"></head>');(public/'shishu/index.html').write_text(home)
for path in (public/'shishu').rglob('*.html'):
 s=path.read_text()
 def add(m):
  f=m[0]
  if '/shishu/activity_children.html' not in f:f=f.replace('</nav>','<a href="/shishu/activity_children.html">ପିଲାଙ୍କ ଚିତ୍ର</a></nav>',1)
  return f
 n=re.sub(r'<footer\b.*?</footer>',add,s,flags=re.S)
 if n!=s:path.write_text(n)
manifest=public.parent/'provenance/social-previews.json';entries=json.loads(manifest.read_text())
for entry in entries:
 if entry['page']=='/shishu/activity_children.html':entry.update(source=items[0]['local'],image=social,url=url)
manifest.write_text(json.dumps(entries,ensure_ascii=False,indent=2)+'\n')
print('Built gallery: 20 original drawings, 5 issue groups, home preview and footer links.')
