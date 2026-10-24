"""Check public book navigation and prevent static review payload leaks."""
from pathlib import Path
from html.parser import HTMLParser
R=Path(__file__).resolve().parents[1];P=R/'public'
class Page(HTMLParser):
 def __init__(self):super().__init__();self.footer=0;self.anchors=[];self.anchor=None;self.header=False;self.review_script=False;self.review_id=False;self.editable=False;self.share=False
 def handle_starttag(self,tag,attrs):
  a=dict(attrs);classes=a.get('class','').split()
  if tag=='footer':self.footer+=1
  if 'book-site-header' in classes:self.header=True
  if 'data-review-book' in a:self.review_id=True
  if tag=='textarea' or 'contenteditable' in a or a.get('id') in ['scan','transcription']:self.editable=True
  if tag=='script' and a.get('src','').split('?')[0]=='/editorial/book-review.js':self.review_script=True
  if 'mag-share-menu' in classes or tag=='script' and a.get('src','').startswith('/share.js'):self.share=True
  if tag=='a':self.anchor={'href':a.get('href',''),'footer':self.footer>0,'text':''};self.anchors.append(self.anchor)
 def handle_endtag(self,tag):
  if tag=='footer':self.footer=max(0,self.footer-1)
  if tag=='a':self.anchor=None
 def handle_data(self,text):
  if self.anchor is not None:self.anchor['text']+=text
for route in ['shishu/books/ketejami_loda/proofread.html','shishu/books/musha_mushi/proofread.html','shishu/books/paresh/forest-proofread.html']:
 s=Page();s.feed((P/route).read_text());assert not s.editable and s.review_script and s.review_id,route
for name in ['shishu/books/ketejami_loda/proofread-pages.json','shishu/books/musha_mushi/proofread-pages.json','shishu/books/paresh/forest-proofread.json','shishu/books/paresh/banaraijar-kahani-odia-proofreading.txt']:
 assert not (P/name).exists(),name
count=0
for p in (P/'shishu/books').rglob('*.html'):
 s=Page();s.feed(p.read_text());count+=1;assert s.header and not s.share,str(p)
 for a in s.anchors:
  assert 'proofread' not in a['href'] or a['footer'],str(p)
  assert a['text'].strip() not in ['ମୂଳ ବହି','← ବହି','← Books'],str(p)
print(f'Book UI verified: {count} pages; review links footer-only; static review payloads absent.')
