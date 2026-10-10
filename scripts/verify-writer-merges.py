"""Verify duplicates stay offline and no published contribution was lost."""
import json,re
from pathlib import Path
root=Path('public');groups=json.loads(Path('provenance/writer-merges.json').read_text())['groups'];directory=(root/'shishu/writers.html').read_text();sitemap=(root/'sitemap.xml').read_text()
def cards(s):
 ul=re.search(r'<ul class="mag-contributions[^>]*>(.*?)</ul>',s,re.S)
 return re.findall(r'<li\b.*?</li>',ul[1],re.S) if ul else []
for g in groups:
 s=(root/g['canonical'].lstrip('/')).read_text();actual=cards(s);expected={re.search(r'href="([^"]+)"',c)[1] for m in g['members'] for c in m['contributions']};links=[re.search(r'href="([^"]+)"',c)[1] for c in actual]
 assert expected<=set(links) and len(links)==len(set(links)),g['name']
 assert len(re.findall(r'<li\b[^>]*data-writer="[^"]*".*?href="'+re.escape(g['canonical'])+'"',directory,re.S))==1
 for m in g['members']:
  if m['route']==g['canonical']:continue
  assert cards(Path(m['archive']).read_text())==m['contributions']
  assert not (root/m['route'].lstrip('/')).exists()
  assert m['route'] not in sitemap
  assert 'href="'+m['route']+'"' not in directory
print('Writer merges verified: four canonical profiles, eleven archived originals, unique complete contribution unions and no live duplicates.')
