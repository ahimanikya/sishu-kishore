"""Apply evidence-reviewed writer merges, preserving source cards in the offline archive."""
import json,re
from html import escape
from pathlib import Path
ROOT=Path('public');ORIGIN='https://sishu.kabitawithoutborders.org'
manifest=json.loads(Path('provenance/writer-merges.json').read_text());groups=manifest['groups']
redirects={m['route']:g['canonical'] for g in groups for m in g['members'] if m['route']!=g['canonical']}
index=ROOT/'shishu/writers.html';directory=index.read_text()
for g in groups:
 cards={}
 # Include newly published contributions already on the canonical profile.
 path=ROOT/g['canonical'].lstrip('/');html=path.read_text()
 current=re.search(r'<ul class="mag-contributions[^>]*>(.*?)</ul>',html,re.S)
 for card in [c for m in g['members'] for c in m['contributions']]+re.findall(r'<li\b.*?</li>',current[1],re.S):
  href=re.search(r'href="([^"]+)"',card)[1];cards[href]=card
 html=re.sub(r'(<ul class="mag-contributions[^>]*>).*?</ul>',lambda m:m[1]+''.join(cards.values())+'</ul>',html,flags=re.S)
 count=str(len(cards)).translate(str.maketrans('0123456789','୦୧୨୩୪୫୬୭୮୯'))
 html=re.sub(r'(<div class="contribution-heading">.*?<span>).*?</span>',lambda m:m[1]+count+' ଲେଖା</span>',html,flags=re.S);path.write_text(html)
 def card_update(m):
  s=m[0];route=re.search(r'href="([^"]+)"',s)[1]
  if route in redirects:return ''
  if route==g['canonical']:s=re.sub(r'<small>.*?</small>',f'<small>{count} ଲେଖା</small>',s,flags=re.S)
  return s
 directory=re.sub(r'<li\b[^>]*data-writer="[^"]*".*?</li>',card_update,directory,flags=re.S)
index.write_text(directory)
# Original profiles are archived in provenance and are not published or redirected.
for old in list(redirects)+[x['route'] for x in manifest.get('archivedLegacyAliases',[])]:
 (ROOT/old.lstrip('/')).unlink(missing_ok=True)
# Internal links point directly to the canonical profile; byline text stays untouched.
for p in ROOT.rglob('*.html'):
 s=p.read_text();updated=s
 for old,new in redirects.items():updated=updated.replace('href="'+old+'"','href="'+new+'"')
 if updated!=s:p.write_text(updated)
print(f'Merged {len(redirects)} duplicate entries into {len(groups)} canonical writer profiles.')

# Editor choices also contain old spellings and earlier legacy redirect entries.
choices=ROOT/'editorial/choices.json';data=json.loads(choices.read_text())
removed=set(redirects)|{x['route'] for x in manifest.get('archivedLegacyAliases',[])}
data['writers']={name:route for name,route in data['writers'].items() if route not in removed}
for group in groups:data['writers'][group['name']]=group['canonical']
choices.write_text(json.dumps(data,ensure_ascii=False)+'\n')
