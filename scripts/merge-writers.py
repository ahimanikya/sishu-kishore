"""Apply evidence-reviewed writer merges, preserving source cards in the offline archive."""
import json,re
from html import escape
from pathlib import Path
ROOT=Path('public');ORIGIN='https://shishukishora.com'
manifest=json.loads(Path('provenance/writer-merges.json').read_text().replace('/shishu/', '/'));groups=manifest['groups']
redirects={m['route']:g['canonical'] for g in groups for m in g['members'] if m['route']!=g['canonical']}
withdrawal_manifest=Path('provenance/approved-withdrawals.json')
withdrawn={x['route'] for x in json.loads(withdrawal_manifest.read_text())['withdrawals']} if withdrawal_manifest.exists() else set()
index=ROOT/'writers.html';directory=index.read_text()
for g in groups:
 cards={}
 # Include newly published contributions already on the canonical profile.
 path=ROOT/g['canonical'].lstrip('/');html=path.read_text()
 current=re.search(r'<ul\b(?=[^>]*class="mag-contributions)[^>]*>(.*?)</ul>',html,re.S)
 for card in [c for m in g['members'] for c in m['contributions']]+re.findall(r'<li\b.*?</li>',current[1],re.S):
  href=re.search(r'href="([^"]+)"',card)[1]
  if href in withdrawn:continue
  publication=Path('provenance/november-2026-publication.json')
  if publication.exists():card=card.replace('/current_issue.html',json.loads(publication.read_text())['previous_issue'])
  cards[href]=card
 html=re.sub(r'(<ul\b(?=[^>]*class="mag-contributions)[^>]*>).*?</ul>',lambda m:m[1]+''.join(cards.values())+'</ul>',html,flags=re.S)
 count=str(len(cards)).translate(str.maketrans('0123456789','୦୧୨୩୪୫୬୭୮୯'))
 html=re.sub(r'(<div class="contribution-heading">.*?<span>).*?</span>',lambda m:m[1]+count+' ଲେଖା</span>',html,flags=re.S);path.write_text(html)
 def card_update(m):
  s=m[0];route=re.search(r'href="([^"]+)"',s)[1]
  if route in redirects:return ''
  if route==g['canonical']:s=re.sub(r'<small>.*?</small>',f'<small>{count} ଲେଖା</small>',s,flags=re.S)
  return s
 directory=re.sub(r'<li\b[^>]*data-writer="[^"]*".*?</li>',card_update,directory,flags=re.S)
index.write_text(directory)
# Historical merges remain withdrawn; new explicitly approved aliases can forward.
forwarding={m['route']:g for g in groups if g.get('preserveAliasRoutes') for m in g['members'] if m['route']!=g['canonical']}
for old in list(redirects)+[x['route'] for x in manifest.get('archivedLegacyAliases',[])]:
 alias=ROOT/old.lstrip('/')
 if old in forwarding:
  group=forwarding[old];target=escape(group['canonical'],quote=True);name=escape(group['name'])
  member=next(m for m in group['members'] if m['route']==old)
  original=Path(member['archive']).read_text()
  sharing=''.join(tag for tag in re.findall(r'<meta\b[^>]*>',original) if re.search(r'(?:property|name)="(?:og:|twitter:)',tag))
  alias.write_text(f'''<!doctype html><html lang="or"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,follow"><meta http-equiv="refresh" content="0;url={target}"><link rel="canonical" href="{ORIGIN}{target}"><link rel="stylesheet" href="/children-identity.css"><title>{name} · ଲେଖକ ପରିଚୟ</title>{sharing}</head><body><main><h1>{name}</h1><p>ଲେଖକଙ୍କ ପରିଚୟ ଓ ସମସ୍ତ ଲେଖା ଏକାଠି ରହିଛି। <a href="{target}">ଲେଖକ ପରିଚୟ ପଢ଼ନ୍ତୁ →</a></p></main></body></html>''')
 else:
  alias.unlink(missing_ok=True)
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
