"""Validate the connected character edition without treating plans as artifacts."""
from pathlib import Path
from bs4 import BeautifulSoup, Comment
from urllib.parse import urlsplit, unquote
from collections import Counter
import json,re,hashlib,zipfile
ROOT=Path(__file__).resolve().parents[1];PUB=ROOT/'public';OUT=PUB/'characters'
data=json.loads((ROOT/'data/character-voices-v1.json').read_text())
worlds=[w for w in data['worlds'] if (OUT/(w['id']+'.html')).exists()]
errors=[];refs=0;pages=list(OUT.rglob('*.html'))
for path in pages:
 s=BeautifulSoup(path.read_text(),'html.parser');name=str(path.relative_to(OUT))
 if s.html.get('lang')!='or':errors.append([name,'not Odia default'])
 for id,n in Counter(e['id'] for e in s.select('[id]')).items():
  if n>1:errors.append([name,'duplicate id',id])
 urls=[e.get(a) for e in s.select('[href],[src]') for a in ['href','src'] if e.get(a)]
 urls+=re.findall(r'url\([\'\"]?([^\)\'\"]+)',str(s))
 for v in urls:
  u=urlsplit(v)
  if u.scheme or u.netloc or v.startswith('data:'):continue
  p=PUB/unquote(u.path).lstrip('/') if u.path.startswith('/') else (path.parent/unquote(u.path) if u.path else path)
  p=p.resolve();p=p/'index.html' if p.is_dir() else p;refs+=1
  if not p.exists():errors.append([name,'missing',v]);continue
  if u.fragment and p.suffix=='.html':
   d=s if p==path.resolve() else BeautifulSoup(p.read_text(),'html.parser')
   if not d.find(id=unquote(u.fragment)):errors.append([name,'missing fragment',v])
 for t in s.body.find_all(string=True):
  if isinstance(t,Comment) or t.parent.name in ['script','style']:continue
  if any(e.has_attr('data-or') or e.get('lang')=='en' or 'en' in e.get('class',[]) for e in t.parents):continue
  v=str(t).strip()
  if re.search('[A-Za-z]',v) and v not in ['English','PDF','PNG','ZIP','A4','A5'] and not re.search('[\u0b00-\u0b7f]',v):errors.append([name,'unpaired text',v[:120]])
 if not s.select_one('.voice-journey'):errors.append([name,'missing collection links'])
 if re.search(r'AI[- ](?:assistant|generated)',s.get_text(' ',strip=True),re.I):errors.append([name,'unexpected production attribution'])
full=BeautifulSoup((OUT/'complete-report.html').read_text(),'html.parser')
expected_worlds=6+len(worlds);expected_people=21+sum(len(w['profiles']) for w in worlds)
if len(full.select('article.full-set'))!=expected_worlds:errors.append(['full report','world count'])
if len(full.select('.character,.heritage-profile'))!=expected_people:errors.append(['full report','character count'])
if len(full.select('.guide-character'))!=1:errors.append(['full report','Koeli missing'])
comparison=BeautifulSoup((OUT/'comparison.html').read_text(),'html.parser')
for row in comparison.select('table tr'):
 if len(row.find_all(['th','td'],recursive=False))!=expected_worlds+1:errors.append(['comparison','column count'])
for w in worlds:
 story=BeautifulSoup((OUT/w['id']/'pilot-story/finished-page-v1.html').read_text(),'html.parser')
 if len(story.select('.voice-panel'))!=len(w['story']['panels']):errors.append([w['id'],'story coverage'])
 with zipfile.ZipFile(OUT/'downloads'/(w['id']+'-development-v1.zip')) as z:
  manifest=json.loads(z.read('manifest-sha256.json'))
  for name,digest in manifest.items():
   if hashlib.sha256(z.read(name)).hexdigest()!=digest:errors.append([w['id'],'pack checksum',name])
scripts=json.loads((ROOT/'data/film-scripts-v1.json').read_text())['scripts']
for script in scripts:
 if sum(scene['seconds'] for scene in script['scenes'])!=script['duration']:errors.append([script['id'],'scene timings'])
 page=OUT/'scripts'/(script['id']+'.html')
 if not page.exists():errors.append([script['id'],'missing script page'])
 elif any(line['text']['or'] not in page.read_text() or line['text']['en'].replace('&','&amp;').replace('"','&quot;') not in page.read_text() for scene in script['scenes'] for line in scene['lines']):errors.append([script['id'],'script dialogue coverage'])
# Paired source coverage and the selected storyboard must survive packaging.
focused=[s for s in scripts if s.get('focus')]
counts=Counter((s['world'],s['focus']['id']) for s in focused)
for (world,focus),count in counts.items():
 if count!=3:errors.append([world,focus,'expected three drafts',count])
for script in focused:
 if script['focus']['id'] in ['bird','puppy'] and any(line['speaker']['en'] in ['The bird','The puppy'] for scene in script['scenes'] for line in scene['lines']):errors.append([script['id'],'ordinary animal has dialogue'])
 for key in ['setting','performance','wardrobe','continuity']:
  if not all(script.get(key,{}).get(lang) for lang in ['or','en']):errors.append([script['id'],'missing paired brief',key])
 board=script.get('storyboard')
 if board:
  page=PUB/board['page'].lstrip('/');sheet=PUB/board['sheet'].lstrip('/')
  if not page.exists() or not sheet.exists():errors.append([script['id'],'missing storyboard artifact'])
  else:
   doc=BeautifulSoup(page.read_text(),'html.parser')
   embedded=json.loads(doc.select_one('#storyboard-data').string)
   if embedded['scenes']!=script['scenes'] or embedded['duration']!=script['duration']:errors.append([script['id'],'preview differs from script'])
for world in set(s['world'] for s in focused):
 with zipfile.ZipFile(OUT/'downloads'/(world+'-film-scripts-v1.zip')) as z:
  manifest=json.loads(z.read('manifest-sha256.json'))
  for name,digest in manifest.items():
   if hashlib.sha256(z.read(name)).hexdigest()!=digest:errors.append([world,'film pack checksum',name])
  expected=[s for s in scripts if s['world']==world]
  if json.loads(z.read('scripts-v1.json'))!=expected:errors.append([world,'pack script coverage'])
  for script in expected:
   if script.get('storyboard'):
    b=script['storyboard'];name='storyboards/'+script['id']+'/'+b['file']
    if hashlib.sha256(z.read(name)).digest()!=hashlib.sha256((PUB/b['sheet'].lstrip('/')).read_bytes()).digest():errors.append([script['id'],'pack storyboard differs'])
with zipfile.ZipFile(OUT/'downloads/koeli-development-v1.zip') as z:
 manifest=json.loads(z.read('manifest-sha256.json'))
 for name,digest in manifest.items():
  if hashlib.sha256(z.read(name)).hexdigest()!=digest:errors.append(['koeli','pack checksum',name])
result={'htmlPages':len(pages),'localReferences':refs,'storyWorlds':expected_worlds,'storyCharacters':expected_people,'storytellingGuides':1,'filmScriptDrafts':len(scripts),'errors':errors}
print(json.dumps(result,ensure_ascii=False,indent=2))
raise SystemExit(bool(errors))
