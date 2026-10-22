"""Rebuild the children's gallery from preserved source credits and approved display captions. Requires Pillow."""
from pathlib import Path
from html import escape
from PIL import Image,ImageOps
import re,json,hashlib,sys
root=Path(__file__).resolve().parents[1];public=root/'public';out=root/'provenance/children-art';p=out/'artworks.json';data=json.loads(p.read_text());items=data['artworks']
home_issue=data['homepage_issue']
edition=json.loads((public/'edition-reader.json').read_text())[home_issue['edition_route']]
if edition['title']!=home_issue['edition_title']:
 raise SystemExit("Current edition changed: update artworks.json homepage_issue before rebuilding its art preview.")
def issue_number(artwork):return int(re.search(r'\d+',artwork['issue'])[0])
home_items=[(i,a) for i,a in enumerate(items) if issue_number(a)==home_issue['number']]
od=lambda s:str(s).translate(str.maketrans('0123456789','୦୧୨୩୪୫୬୭୮୯'))
esc=escape
home=(public/'index.html').read_text();home=re.sub(r'<section class="art-home".*?</section>','',home,flags=re.S);head=home.split('<head>',1)[1].split('</head>',1)[0].replace('<link rel="stylesheet" href="/children-art.css?v=1">','')
head=re.sub(r'<script\b[^>]*>.*?</script>','',head,flags=re.S)
head=re.sub(r'<meta\b[^>]*>|<link\b[^>]*rel="canonical"[^>]*>|<title>.*?</title>','',head,flags=re.S)
header=re.search(r'<header class="ia-header".*?</header>',home,re.S)[0];footer=re.search(r'<footer.*?</footer>',home,re.S)[0]
url='https://shishukishora.com/shishu/activity_children.html';title='ପିଲାଙ୍କ ଚିତ୍ର';description='ପିଲାଙ୍କ ଚିତ୍ର - ପିଲାଙ୍କ ତୂଳୀରୁ'
home_only='--home-only' in sys.argv
# Social preview uses the existing contain-preview convention; original drawing stays untouched.
source=public/items[0]['local'].lstrip('/');digest=hashlib.sha256(source.read_bytes()+b'share-contain-v1').hexdigest()[:16];social='/social/'+digest+'.jpg';target=public/social.lstrip('/')
if not target.exists():
 with Image.open(source) as im:
  im=ImageOps.exif_transpose(im).convert('RGBA');im.thumbnail((1160,590),Image.Resampling.LANCZOS);canvas=Image.new('RGB',(1200,630),(251,247,234));canvas.paste(im,((1200-im.width)//2,(630-im.height)//2),im);canvas.save(target,quality=88,optimize=True)
meta=f'<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{title} · ଶିଶୁ କିଶୋର</title><meta name="description" content="{description}"><link rel="canonical" href="{url}"><meta property="og:title" content="{title}"><meta property="og:description" content="{description}"><meta property="og:type" content="website"><meta property="og:url" content="{url}"><meta property="og:image" content="https://shishukishora.com{social}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="https://shishukishora.com{social}">'
intro='<header class="art-intro"><p class="art-eyebrow">ଶିଶୁ କିଶୋର · ପିଲାଙ୍କ ପୃଷ୍ଠା</p><h1>ପିଲାଙ୍କ ଚିତ୍ର</h1><p>ପିଲାଙ୍କ ତୂଳୀରୁ</p></header>'
groups={}
for i,a in enumerate(items):groups.setdefault(re.search(r'\d+',a['issue'])[0],[]).append((i,a))
nav='<nav class="art-issue-jumps" aria-label="ସଂଖ୍ୟା ବାଛନ୍ତୁ">'+''.join(f'<a href="#art-issue-{n}">ସଂଖ୍ୟା {od(n)}</a>' for n in groups)+'</nav>'
def card(i,a,mini=False):
 image=f'<span class="art-mat"><img src="{a["local"]}" width="{a["width"]}" height="{a["height"]}" alt="{esc(a["display_caption"])}" loading="lazy" decoding="async"></span>'
 frame=f'<a class="art-frame tone-{i%4}" href="{a["local"]}" aria-label="{esc(a["display_caption"]+" — "+a["name"])}">{image}</a>'
 label=esc(a['display_caption'])
 if mini:label=f'<a href="{a["local"]}">{label}</a>'
 caption=f'<figcaption><h3>{label}</h3><p class="art-credit">{esc(a["name"])}</p>'
 if not mini:caption+=f'<p class="art-school">{esc(a["caption"])}</p><p class="art-source-issue">{esc(a["issue"])}</p>'
 return f'<figure class="art-card">{frame}{caption}</figcaption></figure>'
sections=''.join(f'<section class="art-edition" aria-labelledby="art-issue-{n}"><h2 id="art-issue-{n}">ସଂଖ୍ୟା {od(n)}</h2><div class="art-grid">'+''.join(card(i,a) for i,a in group)+'</div></section>' for n,group in groups.items())
html=f'<!doctype html><html lang="or"><head>{meta}{head}<link rel="stylesheet" href="/children-art.css?v=1"></head><body class="shishu ia-site"><a class="ia-skip" href="#main">ସିଧା ଚିତ୍ରକୁ ଯାଆନ୍ତୁ</a>{header}<main id="main" class="ia-main art-gallery"><nav class="ia-breadcrumb"><a href="/">← ମୂଳ ପୃଷ୍ଠା</a></nav>{intro}{nav}{sections}</main>{footer}<script defer src="/kid-ux.js?v=1"></script><script defer src="/share.js?v=release-v2"></script></body></html>'
if not home_only:(public/'shishu/activity_children.html').write_text(html)
# Home shows every drawing from the current issue; the gallery retains all issues.
preview=f'<section class="art-home" id="home-art" data-issue-number="{home_issue["number"]}" aria-labelledby="art-home-title"><div class="art-home-heading"><div><p class="art-eyebrow">ଚଳିତ ସଂଖ୍ୟା · ପିଲାଙ୍କ ତୂଳୀରୁ</p><h2 id="art-home-title">ପିଲାଙ୍କ ଚିତ୍ର</h2></div><a class="art-gallery-link" href="/shishu/activity_children.html">ଚିତ୍ରଶାଳା →</a></div><div class="art-grid">'+''.join(card(i,a,True) for i,a in home_items)+'</div></section>'
home=home.replace('<section class="mag-editor-link">',preview+'<section class="mag-editor-link">')
if '/children-art.css' not in home:home=home.replace('</head>','<link rel="stylesheet" href="/children-art.css?v=1"></head>')
# Keep the two contribution sections together, ahead of the browsing shortcuts.
shortcuts=re.search(r'<nav\b[^>]*class="mag-shortcuts".*?</nav>',home,re.S)
if shortcuts:
 home=home.replace(shortcuts[0],'').replace('<section class="mag-editor-link">',shortcuts[0]+'<section class="mag-editor-link">')
home=re.sub(r'(<a href="#home-art">).*?(</a>)',lambda m:m[1]+f'ପିଲାଙ୍କ ଚିତ୍ର · {od(len(home_items))} ↓'+m[2],home)
(public/'index.html').write_text(home)
if home_only:
 print(f'Updated homepage: {len(home_items)} current-issue drawings (issue {home_issue["number"]}) and their credits; full gallery unchanged.')
 sys.exit(0)
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
print(f'Built gallery: {len(items)} original drawings, {len(groups)} issue groups, {len(home_items)} current-issue home drawings and footer links.')
