"""One-time promotion of the user-approved November issue, preserving the review copy."""
from pathlib import Path
from bs4 import BeautifulSoup
import json,re,shutil,copy,hashlib
R=Path(__file__).resolve().parents[1];P=R/'public';ORIGIN='https://shishukishora.com'
review='/shishu/review/2026-11/';nov='/shishu/editions/2026-11/';october='/shishu/editions/2026-10/';current='/shishu/current_issue.html'
od=lambda x:str(x).translate(str.maketrans('0123456789','୦୧୨୩୪୫୬୭୮୯'))
def read(route):return BeautifulSoup((P/route.lstrip('/')).read_text(),'html.parser')
def write(route,s):
 p=P/route.lstrip('/');p.parent.mkdir(parents=True,exist_ok=True);p.write_text(str(s))
def canonical(s,route):
 s.select_one('link[rel=canonical]')['href']=ORIGIN+route
 for x in s.select('#search-structured-data,link[data-search-discovery],meta[property^="og:"],meta[name^="twitter:"]'):x.decompose()
 for x in s.select('meta[name=robots]'):x['content']='index, follow, max-image-preview:large'
 for attr in ['data-edition-catalog','data-reader-catalog']:
  s.body.attrs.pop(attr,None)
if (P/nov.lstrip('/')).exists():raise SystemExit('November already promoted; refusing to overwrite published material.')
# Preserve October before replacing the current-issue entry point.
old=read(current);canonical(old,october);old.body['data-reading-issue']=october;write(october+'index.html',old)
editions=json.loads((P/'edition-reader.json').read_text());oct_data=editions.pop(current)
for item in oct_data['items']:
 s=read(item['href']);s.body['data-reading-issue']=october
 for a in s.select('a[href]'):
  if not a.find_parent(class_='ia-header') and a['href'].split('#')[0]==current:a['href']=a['href'].replace(current,october)
 write(item['href'],s)
# Publish the reviewed art/pages at stable public URLs, keeping private sources outside public/.
shutil.copytree(P/review.lstrip('/'),P/nov.lstrip('/'))
profile_map={nov+'writers/shekhar-kumar-swain.html':'/shishu/writers/shekhar-kumar-swain.html',nov+'writers/manindra-mohanty.html':'/shishu/writers/manindra-mohanty.html'}
for f in (P/nov.lstrip('/')).rglob('*.html'):
 text=f.read_text().replace(review,nov)
 for before,after in profile_map.items():text=text.replace(before,after)
 s=BeautifulSoup(text,'html.parser');route='/'+str(f.relative_to(P));route=route.removesuffix('index.html') if route.endswith('/index.html') else route
 canonical(s,route);s.body['data-reading-issue']=nov
 for note in s.select('.nov-review-note'):note.string='Article illustrations are AI-generated.'
 write(route+'index.html' if route.endswith('/') else route,s)
for before,after in profile_map.items():
 s=read(before);canonical(s,after);write(after,s);(P/before.lstrip('/')).unlink()
# Public pages use the shared catalogues; do not retain stale issue-local catalogues.
for name in ['edition-reader.json','reader-catalog.json']:(P/nov.lstrip('/')/name).unlink()
nov_s=read(nov+'index.html');canonical(nov_s,nov);write(current,nov_s)
nov_data=json.loads((P/review.lstrip('/')/'edition-reader.json').read_text())[review]
nov_data=json.loads(json.dumps(nov_data).replace(review,nov))
editions={nov:nov_data,october:oct_data,**editions};(P/'edition-reader.json').write_text(json.dumps(editions,ensure_ascii=False,separators=(',',':'))+'\n')
cat=json.loads((P/'reader-catalog.json').read_text());cat[0]['items'][0]['href']=october+'#reader';cat[0]['items'].insert(0,{'title':nov_data['title'],'href':nov+'#reader'});(P/'reader-catalog.json').write_text(json.dumps(cat,ensure_ascii=False,separators=(',',':'))+'\n')
# October becomes the newest archived issue, using its existing source illustration.
s=read('/shishu/old_issues.html');first=s.select_one('#year-2026 .mag-issue-list');a=s.new_tag('a',href=october);a['class']=['issue-preview','issue-preview-illustrated'];im=copy.copy(old.select_one('.storybook-cover-art'));im['loading']='eager';im['fetchpriority']='high';a.append(im);a.append(BeautifulSoup('<span><strong>ଅକ୍ଟୋବର: ୨୦୨୬</strong><small>ତୃତୀୟ ବର୍ଷ, ଦଶମ ସଂଖ୍ୟା</small></span><b aria-hidden="true">→</b><span class="issue-preview-action">ସୂଚୀପତ୍ର ଦେଖନ୍ତୁ →</span>','html.parser'));first.insert(0,a);write('/shishu/old_issues.html',s)
# Homepage retains its compact, shuffled full-contents layout.
h=read('/index.html');h.body['class'].append('november-edition');intro=h.select_one('.ia-issue-intro');intro.h1.string=nov_data['title'];intro.select_one('.ia-eyebrow').string='ତୃତୀୟ ବର୍ଷ, ଏକାଦଶ ସଂଖ୍ୟା'
intro.select_one('a[href="/shishu/article-790.html"]')['href']=nov+'article-01.html';intro.select_one('.storybook-cover').replace_with(copy.copy(nov_s.select_one('.storybook-cover')))
for x in h.select('meta[name="edition-preview"]'):x.decompose()
h.head.append(h.new_tag('meta',attrs={'name':'edition-preview','content':nov+'assets/cover-v1.webp'}))
for href in [nov+'edition.css','/author-birthdays.css']:
 if not h.select_one('link[href="'+href+'"]'):h.head.append(h.new_tag('link',rel='stylesheet',href=href))
listing=h.select_one('#issue-articles');listing.clear()
for li in nov_s.select('#edition-contents .ia-article-card'):listing.append(copy.copy(li))
h.select_one('.mag-home-jumps a[href="#home-articles"]').string='ସବୁ ଲେଖା · ୨୮ ↓';h.select_one('.mag-home-jumps a[href="#home-art"]').string='ପିଲାଙ୍କ ଚିତ୍ର · ୩ ↓'
h.select_one('.mag-editor-link').insert_before(copy.copy(nov_s.select_one('#birthdays')))
write('/index.html',h)
# Add new original drawings to the durable gallery source; home selects November only.
p=R/'provenance/children-art/artworks.json';art=json.loads(p.read_text());art['homepage_issue']={'number':35,'edition_title':nov_data['title'],'edition_route':nov}
new=[]
for f in nov_s.select('#children-art figure'):
 im=f.img;local=im['src'];new.append({'source':'User-supplied November 2026 manuscript / drawing','name':f.strong.get_text(),'caption':f.figcaption.p.get_text('\n'),'issue':'( ସଂଖ୍ୟା - 35 ରେ ପ୍ରକାଶିତ )','local':local,'width':int(im['width']),'height':int(im['height']),'sha256':hashlib.sha256((P/local.lstrip('/')).read_bytes()).hexdigest(),'display_caption':im['alt'],'caption_provenance':'Existing reviewed November description; original credit preserved.'})
art['artworks']=new+art['artworks'];p.write_text(json.dumps(art,ensure_ascii=False,indent=2)+'\n')
# Link contributions to their now-public edition, with no changes to names or literary text.
links=json.loads((R/'provenance/november-2026-author-links.json').read_text())['articles'];directory=read('/shishu/writers.html')
for file in (P/'shishu/writers').glob('*.html'):
 text=file.read_text();text=re.sub(r'<a\b[^>]*class="contribution-edition"[^>]*>',lambda m:m[0].replace(current,october),text);file.write_text(text)
# Historical merged contribution cards otherwise reintroduce mutable current-issue links.
# merge-writers.py remaps historical edition links when rendering; source evidence stays intact.
for a,item in zip(links,nov_data['items']):
 profile=a['profile'].replace(review,nov);profile=profile_map.get(profile,profile);f=P/profile.lstrip('/');s=BeautifulSoup(f.read_text(),'html.parser');ul=s.select_one('.mag-contributions')
 if not ul:
  heading=BeautifulSoup('<div class="contribution-heading"><h2 id="writer-contributions">ପ୍ରକାଶିତ ଲେଖା</h2><span></span></div><ul class="mag-contributions contribution-cards" aria-labelledby="writer-contributions"></ul>','html.parser');s.main.append(heading);ul=s.select_one('.mag-contributions')
 li=s.new_tag('li');title=s.new_tag('a',href=item['href']);title['class']=['contribution-title'];title.string=item['title'];li.append(title);small=s.new_tag('small');ed=s.new_tag('a',href=nov);ed['class']=['contribution-edition'];ed.string=nov_data['title'];small.append(ed);li.append(small);ul.insert(0,li)
 count=len(ul.select(':scope>li'));s.select_one('.contribution-heading span').string=od(count)+' ଲେଖା'
 text=str(s).replace('<ul aria-labelledby="writer-contributions" class="mag-contributions contribution-cards">','<ul class="mag-contributions contribution-cards" aria-labelledby="writer-contributions">');f.write_text(text)
 card=directory.select_one('.mag-writers a[href="'+profile+'"]')
 if card and card.small:card.small.string=od(count)+' ଲେଖା'
for route in profile_map.values():
 s=read(route);li=directory.new_tag('li');li['data-writer']=s.h1.get_text();a=directory.new_tag('a',href=route);a['class']=['writer-card'];strong=directory.new_tag('strong');strong.string=s.h1.get_text();a.append(strong);li.append(a);directory.select_one('.mag-writers').append(li)
directory.select_one('#birthdays').replace_with(copy.copy(nov_s.select_one('#birthdays')));write('/shishu/writers.html',directory)
receipt={'issue':'2026-11','status':'published','authorization':'User requested publish on 2026-10-31 after reviewing illustrations, birthday cards and 3D cover; supersedes the earlier unlisted-only restriction.','route':nov,'current_entry':current,'previous_issue':october,'preserved_review':review,'articles':28,'drawings':3,'birthdays':5,'private_sources':'Not included in public delivery','body_sha256':json.loads((R/'provenance/november-2026-unlisted.json').read_text())['body_sha256']}
(R/'provenance/november-2026-publication.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print('Promoted November; preserved October and all review URLs.')
