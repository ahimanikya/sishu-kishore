"""Verify duplicates stay offline and no published contribution was lost."""
import json,re
from pathlib import Path
root=Path('public');groups=json.loads(Path('provenance/writer-merges.json').read_text().replace('/shishu/', '/'))['groups'];directory=(root/'writers.html').read_text();sitemap=(root/'sitemap.xml').read_text()
withdrawal_manifest=Path('provenance/approved-withdrawals.json')
withdrawn={x['route'] for x in json.loads(withdrawal_manifest.read_text())['withdrawals']} if withdrawal_manifest.exists() else set()
def cards(s):
 ul=re.search(r'<ul\b(?=[^>]*class="mag-contributions)[^>]*>(.*?)</ul>',s,re.S)
 return re.findall(r'<li\b.*?</li>',ul[1],re.S) if ul else []
for g in groups:
 s=(root/g['canonical'].lstrip('/')).read_text();actual=cards(s);expected={re.search(r'href="([^"]+)"',c)[1] for m in g['members'] for c in m['contributions']};links=[re.search(r'href="([^"]+)"',c)[1] for c in actual]
 expected-=withdrawn
 assert not (set(links)&withdrawn),g['name']
 assert expected<=set(links) and len(links)==len(set(links)),g['name']
 assert len(re.findall(r'<li\b[^>]*data-writer="[^"]*".*?href="'+re.escape(g['canonical'])+'"',directory,re.S))==1
 for m in g['members']:
  if m['route']==g['canonical']:continue
  assert cards(Path(m['archive']).read_text().replace('/shishu/', '/'))==m['contributions']
  alias=root/m['route'].lstrip('/')
  if g.get('preserveAliasRoutes'):
   forwarding=alias.read_text()
   assert 'noindex' in forwarding and 'http-equiv="refresh"' in forwarding
   assert 'url='+g['canonical'] in forwarding and 'href="'+g['canonical']+'"' in forwarding
   assert not cards(forwarding)
  else:
   assert not alias.exists()
  assert m['route'] not in sitemap
  assert 'href="'+m['route']+'"' not in directory
print(f'Writer merges verified: {len(groups)} canonical profiles, {sum(len(g["members"])-1 for g in groups)} archived originals, complete contribution unions and no live duplicates.')
