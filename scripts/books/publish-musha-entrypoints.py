"""Keep Musha's public entry points aligned with the forest book shelf card."""
from pathlib import Path
from bs4 import BeautifulSoup
R=Path(__file__).resolve().parents[2];P=R/'public';base='/shishu/books/musha_mushi/'
reader=base+'illustrated.html';pdf=base+'musha-mushi-illustrated.pdf';cover=base+'art/poem-01-v1.jpg'
p=P/'shishu/elibrary_main.html';s=BeautifulSoup(p.read_text(),'html.parser')
card=next(c for c in s.select('.library-book') if 'ମୂଷା ଓ ମୁଷୀ' in c.get_text())
card.clear()
fragment=BeautifulSoup(f'<a href="{reader}"><img src="{cover}" width="1536" height="1024" loading="lazy" alt="ମୂଷା ଓ ମୁଷୀ"><h2>ମୂଷା ଓ ମୁଷୀ</h2></a><p>ପରେଶ କୁମାର ପଟ୍ଟନାୟକ</p><a href="{reader}">Read book →</a><p><a href="{pdf}" download>Download PDF</a></p>','html.parser')
for el in list(fragment.contents):card.append(el)
p.write_text(str(s))
p=P/'shishu/e_library-musha_mushi-html.html';s=BeautifulSoup(p.read_text(),'html.parser');intro=s.select_one('.book-intro');box=intro.select_one('div');a=box.select_one('.ia-button');a.string='Read book →';a['href']=reader
box.select_one('p').string='ପରେଶ କୁମାର ପଟ୍ଟନାୟକ'
image=intro.select_one('img');image['src']=cover;image['width']='1536';image['height']='1024'
if not box.select_one('.book-download'):
 dl=s.new_tag('a',href=pdf,download='');dl['class']='ia-button book-download';dl.string='Download PDF';a.insert_after(dl)
p.write_text(str(s))
p=P/'shishu/books/musha_mushi/illustrated.html';s=BeautifulSoup(p.read_text(),'html.parser')
s.select_one('.reader-tools a[download]').string='Download PDF'
h=s.select_one('.book-header')
if not h.select_one('.book-actions'):
 actions=BeautifulSoup(f'<div class="book-actions"><a href="#poem-1">Read book →</a><a href="{pdf}" download>Download PDF</a></div>','html.parser').div
 h.select_one('.cover-art').insert_before(actions)
p.write_text(str(s))
print('Updated bookshelf, book landing and reader with visible Read book / Download PDF links.')
