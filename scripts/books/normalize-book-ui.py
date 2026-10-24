"""Apply the shared public book chrome and authentication-only review shells."""
from pathlib import Path
from bs4 import BeautifulSoup
import json,re
R=Path(__file__).resolve().parents[2];P=R/'public'
review_metadata=json.loads((R/'scripts/books/review-metadata.json').read_text())
configs={
 'ketejami_loda':('/shishu/books/ketejami_loda/illustrated.html','/shishu/books/ketejami_loda/kete-jami-loda-illustrated.pdf','/shishu/books/ketejami_loda/proofread.html'),
 'musha_mushi':('/shishu/books/musha_mushi/illustrated.html','/shishu/books/musha_mushi/musha-mushi-illustrated.pdf','/shishu/books/musha_mushi/proofread.html'),
 'forest':('/shishu/books/paresh/forest.html','/shishu/books/paresh/downloads/banaraijar-kahani-illustrated.pdf','/shishu/books/paresh/forest-proofread.html'),
 'frog':('/shishu/books/paresh/frog.html','/shishu/books/paresh/downloads/frog-and-the-mouse-illustrated.pdf','/shishu/books/paresh/frog-proofread.html'),
 'dakuchhi_gaon':('/shishu/books/dakuchhi_gaon/page-1.html',None,None)}
source_pdfs={'forest':'/shishu/books/paresh/assets/forest-original.pdf','frog':'/shishu/books/paresh/assets/frog-original.pdf','ketejami_loda':'/shishu/books/ketejami_loda/kete-jami-loda-original.pdf','musha_mushi':'/shishu/books/musha_mushi/musha-mushi-original.pdf'}
files=list((P/'shishu/books').rglob('*.html'))+list((P/'shishu').glob('e_library-*.html'))
for path in files:
 route='/'+path.relative_to(P).as_posix();s=BeautifulSoup(path.read_text(),'html.parser')
 if not s.body:continue
 if 'proofread' in path.name:continue
 key=next((k for k in configs if k in route),None)
 if '/paresh/' in route:key='frog' if 'frog' in path.name else 'forest' if 'forest' in path.name else None
 cfg=configs.get(key);s.body['class']=list(dict.fromkeys(s.body.get('class',[])+['book-ui']))
 if key in ['forest','musha_mushi']:s.body['class']=list(dict.fromkeys(s.body['class']+['uniform-illustrations']))
 for x in s.select('.book-site-header,.book-view-links,.book-private-footer,.mag-share,.mag-share-menu,.ia-breadcrumb,.draft-note,.book-actions,.original-book-link,.book-resume,a.source-link'):x.decompose()
 for x in s.select('script[src]'):
  if x['src'].split('?')[0] in ['/share.js','/services.js']:x.decompose()
 for x in s.select('a[href]'):
  href=x['href'];text=x.get_text(' ',strip=True)
  if 'proofread' in href or 'proofreading' in href or text in ['ମୂଳ ବହି','ମୂଳ ବହି ପଢ଼ନ୍ତୁ','Compare original pages'] or x.has_attr('download') and x.find_parent('nav'):x.decompose();continue
  if x.find_parent('header') and (text in ['← ବହି','← Books','ବହି','Books'] or 'book-exit' in x.get('class',[]) or 'exit' in x.get('class',[])):x.decompose()
 for x in s.select('.ia-header,.shelf-header'):x.decompose()
 # No duplicate read/download buttons in title blocks; use the shared mode bar.
 if cfg:
  for x in s.select('.book-intro .ia-button,.book-intro .book-download'):x.decompose()
 for x in s.select('.book-explanation'):
  text=x.get_text();text=re.sub(r'\s*·\s*(?:ଲେଖକଙ୍କ\s*)?ପ୍ରୁଫ୍‌.*$','',text);x.string=text
 for x in s.select('.book-note'):x.decompose()
 header=s.new_tag('header',attrs={'class':'book-site-header'});back=s.new_tag('a',href='/shishu/elibrary_main.html',attrs={'class':'book-back book-exit exit','aria-label':'Back'});back.string='←';brand=s.new_tag('a',href='/',attrs={'class':'book-site-brand'});brand.string='ଶିଶୁ କିଶୋର';header.extend([back,brand]);s.body.insert(0,header)
 if cfg and cfg[1]:
  a=s.new_tag('a',href=cfg[1],attrs={'class':'book-quick-download','download':''});a.string='PDF ଡାଉନଲୋଡ୍';header.append(a)
 if key=='forest' and route==cfg[0]:
  controls=s.select_one('#stories').find_parent('nav');controls['class']=['reader-tools'];controls['aria-label']='Reading controls'
  if not s.select_one('#theme'):
   button=s.new_tag('button',id='theme',attrs={'type':'button','aria-pressed':'false'});button.string='ରାତି';controls.append(button)
  for script in s.select('script[src]'):
   if script['src'].split('?')[0] in ['reading.js','/shishu/books/paresh/reading.js']:script['src']='/shishu/books/paresh/reading.js'
 if not s.select_one('link[href="/book-ui.css"]'):s.head.append(s.new_tag('link',rel='stylesheet',href='/book-ui.css'))
 if cfg and cfg[2]:
  # Keep credits, source and private review in one footer.
  foot=s.select_one('body > footer:not(.ia-footer)')
  if not foot:foot=s.new_tag('footer');s.body.append(foot)
  foot['class']=['book-footer','book-private-footer']
  foot.clear()
  p=s.new_tag('p',lang='en');p.string='Original story wording · New illustrations by Ahimanikya';foot.append(p)
  p=s.new_tag('p',lang='en');p.append('Original publication credits are preserved in the ')
  a=s.new_tag('a',href=source_pdfs[key]);a.string='source PDF';p.append(a);p.append('.');foot.append(p)
  a=s.new_tag('a',href=cfg[2]);a.string='ପ୍ରୁଫ୍‌';a['aria-label']='ପ୍ରୁଫ୍‌ · Google sign-in required';foot.append(a)
 path.write_text(str(s))
# Static hosts deliver only the sign-in shell, never proofreading text or controls.
for key in ['ketejami_loda','musha_mushi','forest','frog']:
 data={'title':{'ketejami_loda':'କେତେ ଜମି ଲୋଡ଼ା','musha_mushi':'ମୂଷା ଓ ମୁଷୀ','forest':'ବଣରାଇଜର କାହାଣୀ','frog':'The Frog & the Mouse'}[key],'reader':configs[key][0]};route=configs[key][2];path=P/route.lstrip('/')
 path.write_text(f'''<!doctype html><html lang="or"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>{data['title']} · ପ୍ରୁଫ୍‌</title>{review_metadata.get(key, "")}<link rel="stylesheet" href="/children-identity.css"><link rel="stylesheet" href="/book-ui.css"></head><body class="book-ui review-page" data-review-book="{key}"><header class="book-site-header"><a class="book-back" href="{data['reader']}" aria-label="Return to reading">←</a><a class="book-site-brand" href="/">ଶିଶୁ କିଶୋର</a></header><main id="book-review-app" class="review-app"><h1>{data['title']}</h1><p role="status">Loading sign-in…</p><noscript>Enable JavaScript to sign in with Google.</noscript></main><script type="module" src="/editorial/book-review.js"></script></body></html>''')
for name in ['shishu/books/ketejami_loda/proofread-pages.json','shishu/books/musha_mushi/proofread-pages.json','shishu/books/paresh/forest-proofread.json','shishu/books/paresh/banaraijar-kahani-odia-proofreading.txt','shishu/books/ketejami_loda/proofread.js','shishu/books/musha_mushi/proofread.js']:
 (P/name).unlink(missing_ok=True)
print(f'Unified {len(files)} book pages; review content requires Google sign-in.')

# Keep regenerated books aligned with the focused accessibility/delivery audit.
import runpy
runpy.run_path(str(R/'scripts/books/improve-reader-delivery.py'))
