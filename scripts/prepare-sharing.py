"""Prepare static crawler-readable previews; reuse artwork without changing editorial text.
Run with Pillow and BeautifulSoup installed after adding or changing pages/artwork.
"""
from pathlib import Path
from bs4 import BeautifulSoup
from PIL import Image, ImageOps
from urllib.parse import urlsplit, unquote
import hashlib, json, re

ROOT=Path(__file__).resolve().parents[1]/'public'
ORIGIN='https://sishu.kabitawithoutborders.org'
SERVICE='https://shalandi-shishu-design-review.aquera-1216.chatgpt.site'
FALLBACK='/art/shishu-durga-cartoon-v5.webp'
OUT=ROOT/'social'; OUT.mkdir(exist_ok=True)
manifest=[]

def preview(src):
    source=ROOT/src.lstrip('/')
    digest=hashlib.sha256(source.read_bytes()+b'share-contain-v1').hexdigest()[:16]
    target=OUT/(digest+'.jpg')
    if not target.exists():
        with Image.open(source) as im:
            im=ImageOps.exif_transpose(im).convert('RGBA')
            im.thumbnail((1160,590),Image.Resampling.LANCZOS)
            canvas=Image.new('RGB',(1200,630),(251,247,234))
            canvas.paste(im,((1200-im.width)//2,(630-im.height)//2),im)
            canvas.save(target,quality=88,optimize=True)
    return '/social/'+target.name

def select_image(soup, path):
    if '/writers/' in str(path):
        candidates=soup.select('main img[src*="portraits/"]')
    elif path.name in ['index.html','current_issue.html']:
        return FALLBACK
    else:
        candidates=soup.select('main img')
    for img in candidates:
        src=img.get('data-delivery-original',img.get('src','')).split('?')[0]
        if src.startswith('/') and (ROOT/src.lstrip('/')).is_file() and Path(src).suffix.lower() in ['.png','.jpg','.jpeg','.webp']:
            return src
    return FALLBACK

for path in sorted(ROOT.rglob('*.html')):
    soup=BeautifulSoup(path.read_text(),'html.parser')
    if not soup.head: continue
    before=soup.body.get_text() if soup.body else ''
    relative='/'+path.relative_to(ROOT).as_posix()
    route=relative.removesuffix('index.html') if relative.endswith('/index.html') else relative
    title=soup.title.get_text(' ',strip=True) if soup.title else 'ଶିଶୁ କିଶୋର'
    # Use an existing excerpt, never fabricate editorial descriptions.
    excerpt=soup.select_one('.ia-prose .subject, .ia-prose p, main > p, main header p')
    description=re.sub(r'\s+',' ',excerpt.get_text(' ',strip=True) if excerpt else title).strip()[:190]
    artwork=select_image(soup,path)
    img=preview(artwork)
    for node in soup.select('meta[property^="og:"], meta[name^="twitter:"], meta[name="description"],link[rel="canonical"]'):node.decompose()
    canonical=soup.new_tag('link',rel='canonical',href=ORIGIN+route);soup.head.append(canonical)
    metadata={'description':description,'og:title':title,'og:description':description,'og:type':'article' if '/article-' in route else 'website','og:url':ORIGIN+route,'og:site_name':'ଶିଶୁ କିଶୋର','og:locale':'or_IN','og:image':ORIGIN+img,'og:image:secure_url':ORIGIN+img,'og:image:type':'image/jpeg','og:image:width':'1200','og:image:height':'630','og:image:alt':title,'twitter:card':'summary_large_image','twitter:title':title,'twitter:description':description,'twitter:image':ORIGIN+img,'twitter:image:alt':title}
    for key,val in metadata.items():
        tag=soup.new_tag('meta',content=val);tag['property' if key.startswith('og:') else 'name']=key;soup.head.append(tag)
    # Keep authenticated services operational, including links with query strings.
    for a in soup.select('a[href]'):
        href=a['href']
        if urlsplit(href).path in ['/submit','/manage','/account','/signin-with-chatgpt','/api/service'] and href.startswith('/'):
            a['href']=SERVICE+href
    assert before==(soup.body.get_text() if soup.body else ''),path
    path.write_text(str(soup))
    manifest.append({'page':relative,'url':ORIGIN+route,'image':img,'source':artwork})
(ROOT.parent/'provenance/social-previews.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(f'{len(manifest)} pages with previews, {len(list(OUT.glob("*.jpg")))} shared artwork images')
