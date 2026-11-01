"""Apply the approved Story Garden layout without rewriting any poem text."""
from pathlib import Path
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parents[2]
path=ROOT/'public/books/musha_mushi/illustrated.html'
s=BeautifulSoup(path.read_text(),'html.parser')
s.body['class']=list(dict.fromkeys(s.body.get('class',[])+['story-garden']))
poems=s.select('section.poem')
assert len(poems)==18
before=[(p['id'],p.h2.get_text(),[x.get_text() for x in p.select('.verse')]) for p in poems]
for art in s.select('.book-header .cover-art'):art.decompose()
for index,p in enumerate(poems):
 if not p.select_one('.garden-picture'):
  art=p.select_one('.story-art'); picture=s.new_tag('div',attrs={'class':'garden-picture'});art.extract();picture.append(art)
  text=s.new_tag('div',attrs={'class':'garden-text'})
  for child in list(p.contents):text.append(child.extract())
  p.append(picture);p.append(text)
 art=p.select_one('.story-art');art['loading']='eager' if index==0 else 'lazy'
 if index==0:art['fetchpriority']='high'
 art['sizes']='(max-width:800px) calc(100vw - 40px), 560px'
 p.h2['tabindex']='-1'
nav=s.select_one('.reader-tools');nav['aria-label']='ପଢ଼ିବାର ସୁବିଧା'
for id,label,value in [('smaller','ଛୋଟ ଅକ୍ଷର','ଅ−'),('larger','ବଡ଼ ଅକ୍ଷର','ଅ+')]:
 b=s.find(id=id);b['aria-label']=label;b['type']='button';b.string=value
for id,label in [('garden-previous','← ପୂର୍ବ କବିତା'),('garden-next','ପର କବିତା →'),('garden-focus','କେବଳ ପଢ଼ା'),('garden-paper','ସାଦା ପୃଷ୍ଠା')]:
 if not s.find(id=id):
  b=s.new_tag('button',id=id,type='button');b.string=label;b['hidden']=''
  if id in ('garden-focus','garden-paper'):b['aria-pressed']='false'
  nav.append(b)
for id,label in [('garden-previous','← ପୂର୍ବ'),('garden-next','ପର →')]:
 b=s.find(id=id);b['aria-label']='ପୂର୍ବ କବିତା' if id=='garden-previous' else 'ପର କବିତା';b.string=label
if not nav.select_one('.garden-settings'):
 settings=s.new_tag('details',attrs={'class':'garden-settings'})
 summary=s.new_tag('summary');summary.string='ସୁବିଧା';settings.append(summary)
 panel=s.new_tag('div',attrs={'class':'garden-settings-panel'})
 for id in ('smaller','larger','theme','garden-paper'):panel.append(s.find(id=id).extract())
 settings.append(panel);nav.append(settings)
if not s.select_one('.garden-contents'):
 details=s.new_tag('details',attrs={'class':'garden-contents'});summary=s.new_tag('summary');summary.string='କବିତାର ବାଟ · ୧୮ଟି କବିତା';details.append(summary)
 links=s.new_tag('nav',attrs={'aria-label':'ସମସ୍ତ କବିତା'})
 for index,p in enumerate(poems,1):
  a=s.new_tag('a',href='#'+p['id']);a.string=str(index).translate(str.maketrans('0123456789','୦୧୨୩୪୫୬୭୮୯'))+'. '+p.h2.get_text();links.append(a)
 details.append(links);nav.insert_after(details)
for n in s.select('.book-skip'):n.string='ପଢ଼ିବାକୁ ଯାଆନ୍ତୁ';n['lang']='or'
assert before==[(p['id'],p.h2.get_text(),[x.get_text() for x in p.select('.verse')]) for p in poems]
path.write_text(str(s))
print('Story Garden applied: 18 unchanged poems, 18 illustrations, full contents and original access links.')
