"""Block publication of unreviewed ebook text, missing scans or broken page order."""
import json
from pathlib import Path
root=Path('public')
approved=json.loads(Path('provenance/ebook-review/approved-text.json').read_text())
count=verified=0
for path in sorted((root/'shishu/books').glob('*/book.json')):
 book=json.loads(path.read_text());assert len(book['pages'])==book['total'],path
 for number,page in enumerate(book['pages'],1):
  assert page['page']==number,(path,number)
  assert (root/page['src'].lstrip('/')).is_file(),(path,page['src'])
  assert page['width']>0 and page['height']>0,(path,number)
  leaf=path.parent/f'page-{number}.html';assert leaf.is_file(),leaf
  text=page.get('text');key=f"{book['slug']}:{number}"
  if text:
   assert text==approved.get(key),(key,'Text must match the source-compared record')
   verified+=1
  elif key in approved:raise AssertionError((key,'Approved text missing'))
  count+=1
print(f'Ebooks verified: {count} ordered source pages; {verified} source-compared transcriptions; {count-verified} scans retained pending review.')
