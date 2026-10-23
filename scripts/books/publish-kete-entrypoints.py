"""Expose the comic reader and PDF, preserving all original scan routes."""
from pathlib import Path
from bs4 import BeautifulSoup
import json
R=Path(__file__).resolve().parents[2];P=R/'public';base='/shishu/books/ketejami_loda/';reader=base+'illustrated.html';pdf=base+'kete-jami-loda-illustrated.pdf';cover=base+'art/cover-v1.jpg';title='କେତେ ଜମି ଲୋଡ଼ା'
p=P/'shishu/elibrary_main.html';s=BeautifulSoup(p.read_text(),'html.parser');card=next(c for c in s.select('.library-book') if 'କେତେ ଜମି' in c.get_text());card.clear()
f=BeautifulSoup(f'<a href="{reader}"><img src="{cover}" width="1536" height="1024" loading="lazy" alt="{title}"><h2>{title}</h2></a><p>ଲିଓ ଟଲ୍‌ଷ୍ଟୟ · ଓଡ଼ିଆ ରୂପାନ୍ତର: ଦାଶ ବେନହୁର</p><a href="{reader}">Read comic →</a><p><a href="{pdf}" download>Download PDF</a></p>','html.parser')
for el in list(f.contents):card.append(el)
p.write_text(str(s))
p=P/'shishu/e_library-ketejami_loda-html.html';s=BeautifulSoup(p.read_text(),'html.parser');intro=s.select_one('.book-intro');box=intro.select_one('div');box.select_one('h1').string=title;box.select_one('p').string='ମୂଳ କାହାଣୀ: ଲିଓ ଟଲ୍‌ଷ୍ଟୟ · ଓଡ଼ିଆ ରୂପାନ୍ତର: ଦାଶ ବେନହୁର';a=box.select_one('.ia-button');a.string='Read comic →';a['href']=reader
img=intro.select_one('img');img['src']=cover;img['width']='1536';img['height']='1024'
if not box.select_one('.book-download'):
 dl=s.new_tag('a',href=pdf,download='');dl['class']='ia-button book-download';dl.string='Download PDF';a.insert_after(dl)
if not box.select_one('.original-book-link'):
 old=s.new_tag('a',href=base+'page-1.html');old['class']='original-book-link';old.string='ମୂଳ ବହି ପଢ଼ନ୍ତୁ';box.select_one('.book-download').insert_after(old)
box.select_one('.book-explanation').string='ଚିତ୍ରକଥା · ୧୦୭ଟି ଚିତ୍ର ସହ ମୂଳ କଥା · PDF · ପ୍ରୁଫ୍‌ ସଂଶୋଧନ ଅପେକ୍ଷାରେ'
box.select_one('.book-note p').string='Read the complete comic with new sequential illustrations and original Odia captions, or download the PDF. The text is ready for writer proofreading. All 25 original scans remain available.'
p.write_text(str(s))
p=P/'reader-catalog.json';data=json.loads(p.read_text())
for group in data:
 for item in group.get('items',[]):
  if item.get('book')=='ketejami_loda' or 'ketejami_loda' in item.get('href',''):
   item['href']=reader;item.pop('book',None);item.pop('total',None)
p.write_text(json.dumps(data,ensure_ascii=False)+'\n');print('Updated comic shelf card, landing and reader catalog.')
