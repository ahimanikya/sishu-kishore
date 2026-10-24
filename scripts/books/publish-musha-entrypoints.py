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
p=P/'shishu/e_library-musha_mushi-html.html';s=BeautifulSoup(p.read_text(),'html.parser');intro=s.select_one('.book-intro');box=intro.select_one('div')
box.select_one('p').string='ପରେଶ କୁମାର ପଟ୍ଟନାୟକ'
image=intro.select_one('img');image['src']=cover;image['width']='1536';image['height']='1024'
p.write_text(str(s))

import runpy
runpy.run_path(str(R/'scripts/books/normalize-book-ui.py'))
