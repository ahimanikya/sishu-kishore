"""Apply one digital issue layout; preserve source artwork, writing and issue order."""
from pathlib import Path
from bs4 import BeautifulSoup
import copy,json
P=Path('public')
catalog=json.loads((P/'edition-reader.json').read_text())
def parse(p):return BeautifulSoup(p.read_text(),'html.parser')
def save(p,s):p.write_text(str(s))
def page(route):return P/(route.lstrip('/')+('index.html' if route.endswith('/') else ''))
current_route=parse(P/'current_issue.html').body['data-reading-issue']
def cover(s,image,title):
 f=s.new_tag('figure');f['class']=['storybook-cover','magazine-cover']
 caption=s.new_tag('figcaption');caption['class']=['mag-cover-heading']
 brand=s.new_tag('strong',lang='or');brand.string='ଶିଶୁ କିଶୋର';caption.append(brand)
 subtitle=s.new_tag('span');subtitle.string='ମାସିକ ଶିଶୁ ପତ୍ରିକା';caption.append(subtitle);f.append(caption)
 im=copy.copy(image);im['class']=['storybook-cover-art'];im['loading']='eager';im['fetchpriority']='high';im['decoding']='async';im['sizes']='(max-width: 600px) 220px, 280px';f.append(im)
 date=s.new_tag('p');date['class']=['mag-cover-date'];date.string=title;f.append(date)
 return f
artwork={};profiles={}
for route,edition in catalog.items():
 s=parse(page(route));artwork[route]=copy.copy(s.select_one('.mag-edition-opening img'))
 for item in edition['items']:
  if item['href'] not in profiles:
   a=parse(page(item['href'])).select_one('.ia-byline a[href*="/writers/"]')
   profiles[item['href']]=a.get('href') if a else None
for route,edition in catalog.items():
 for p in [page(route)]+([P/'current_issue.html'] if route==current_route else []):
  s=parse(p);s.body['class']=list(dict.fromkeys(s.body.get('class',[])+['magazine-issue']))
  head=s.select_one('.mag-edition-opening');head['class']=['ia-page-head','mag-edition-opening']
  for old in head.select(':scope > figure, :scope > .mag-cover-link'):old.decompose()
  link=s.new_tag('a',href='#reader');link['class']=['mag-cover-link'];link['data-quiet-reader']='';link['aria-label']='ପତ୍ରିକା ପଢ଼ନ୍ତୁ — '+edition['title'];link.append(cover(s,artwork[route],edition['title']));head.append(link)
  actions=head.select_one('.mag-edition-actions')
  actions.select_one('[data-quiet-reader]').string='ପତ୍ରିକା ପଢ଼ନ୍ତୁ →'
  actions.select_one('[data-quiet-reader]').attrs.pop('aria-label',None)
  for a in actions.select('a'):a.attrs.pop('title',None)
  for card in s.select('.ia-contents .ia-article-card'):
   a=card.select_one('a[href]');href=a['href'];byline=card.select_one('small')
   if byline:
    byline.extract();byline['class']=byline.get('class') or ['mag-card-byline']
    if not byline.select_one('a') and profiles.get(href):
     credit=s.new_tag('a',href=profiles[href]);credit.extend(list(byline.contents));byline.append(credit)
    card.append(byline)
   oldread=card.select_one('.ia-card-read')
   if oldread:oldread.decompose()
   read=s.new_tag('a',href=href);read['class']=['ia-card-read'];read['aria-label']='ପଢ଼ନ୍ତୁ — '+card.select_one('.ia-card-title').get_text()
   read.append('ପଢ଼ନ୍ତୁ ');arrow=s.new_tag('b');arrow['aria-hidden']='true';arrow.string='→';read.append(arrow);card.append(read)
   for im in card.select('img'):im['loading']='lazy';im.attrs.pop('fetchpriority',None)
  save(p,s)
# Use the identical November cover on the compact homepage.
p=P/'index.html';s=parse(p);old=s.select_one('.ia-issue-intro .storybook-cover')
old.replace_with(cover(s,artwork[current_route],catalog[current_route]['title']))
primary=s.select_one('.mag-edition-actions .ia-button');primary.string='ପତ୍ରିକା ପଢ଼ନ୍ତୁ →';primary.attrs.pop('aria-label',None)
save(p,s)
# Archive previews now show the same cover readers encounter inside each issue.
p=P/'old_issues.html';s=parse(p)
for a in s.select('a.issue-preview'):
 route=a.get('href')
 if route not in catalog:continue
 old=a.select_one('figure.magazine-cover') or a.select_one('img')
 if old:
  f=cover(s,artwork[route],catalog[route]['title'])
  im=f.img;im['loading']='lazy';im.attrs.pop('fetchpriority',None);im['sizes']='(max-width: 600px) 180px, 210px'
  old.replace_with(f)
save(p,s)
# Article entry points also render the same composed cover in the shared reader.
for p in P.rglob('*.html'):
 text=p.read_text()
 if ('data-reading-issue=' in text or p in [P/'index.html',P/'old_issues.html']) and '/issue-layout.css' not in text:
  p.write_text(text.replace('</head>','<link href="/issue-layout.css" rel="stylesheet"/></head>'))
print(f'Unified {len(catalog)} public issues, homepage and archive covers; preserved article sequences.')
