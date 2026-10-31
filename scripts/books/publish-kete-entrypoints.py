"""Expose the comic reader and PDF, preserving all original scan routes."""
from pathlib import Path
from bs4 import BeautifulSoup
import json
R=Path(__file__).resolve().parents[2];P=R/'public';base='/books/ketejami_loda/';reader=base+'illustrated.html';pdf=base+'kete-jami-loda-illustrated.pdf';cover=base+'art/cover-v1.jpg';title='କେତେ ଜମି ଲୋଡ଼ା'
p=P/'elibrary_main.html';s=BeautifulSoup(p.read_text(),'html.parser');card=next(c for c in s.select('.library-book') if 'କେତେ ଜମି' in c.get_text());card.clear()
f=BeautifulSoup(f'<a href="{reader}"><img src="{cover}" width="1536" height="1024" loading="lazy" alt="{title}"><h2>{title}</h2></a><p>ଲିଓ ଟଲ୍‌ଷ୍ଟୟ · ଓଡ଼ିଆ ରୂପାନ୍ତର: ଦାଶ ବେନହୁର</p><a href="{reader}">Read comic →</a><p><a href="{pdf}" download>Download PDF</a></p>','html.parser')
for el in list(f.contents):card.append(el)
p.write_text(str(s))
p=P/'e_library-ketejami_loda-html.html';s=BeautifulSoup(p.read_text(),'html.parser');intro=s.select_one('.book-intro');box=intro.select_one('div');box.select_one('h1').string=title;box.select_one('p').string='ମୂଳ କାହାଣୀ: ଲିଓ ଟଲ୍‌ଷ୍ଟୟ · ଓଡ଼ିଆ ରୂପାନ୍ତର: ଦାଶ ବେନହୁର'
img=intro.select_one('img');img['src']=cover;img['width']='1536';img['height']='1024'
box.select_one('.book-explanation').string='ଚିତ୍ରକଥା · ୧୦୭ଟି ଚିତ୍ର ସହ ମୂଳ କଥା · PDF'
p.write_text(str(s))
p=P/'reader-catalog.json';data=json.loads(p.read_text())
for group in data:
 for item in group.get('items',[]):
  if item.get('book')=='ketejami_loda' or 'ketejami_loda' in item.get('href',''):
   item['href']=reader;item.pop('book',None);item.pop('total',None)
p.write_text(json.dumps(data,ensure_ascii=False)+'\n');print('Updated comic shelf card, landing and reader catalog.')

import runpy
runpy.run_path(str(R/'scripts/books/normalize-book-ui.py'))
