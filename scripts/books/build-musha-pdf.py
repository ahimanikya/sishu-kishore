from pathlib import Path
import json,re,unicodedata
from fpdf import FPDF
from fpdf.enums import XPos,YPos,MethodReturnValue
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from pypdf import PdfReader
R=Path(__file__).resolve().parents[2];S=R/'provenance/musha-mushi';D=R/'public/shishu/books/musha_mushi';B=json.loads((S/'book-draft.json').read_text())
fonts=S/'pdf-fonts';fonts.mkdir(exist_ok=True)
for weight in [400,600]:
 p=fonts/f'BalooBhaina2-{weight}.ttf'
 if not p.exists():
  font=TTFont(R/'public/characters/assets/baloo-bhaina-2.ttf')
  if 'fvar' in font:font=instantiateVariableFont(font,{'wght':weight},inplace=False)
  font.save(p)
class Book(FPDF):
 def footer(self):
  if self.page_no()==1:return
  self.set_y(-12);self.set_font('Baloo','',9);self.set_text_color(111,119,105);self.cell(0,5,str(self.page_no()),align='C')
pdf=Book(format='A5');pdf.set_margins(16,17,16);pdf.set_auto_page_break(True,18)
pdf.add_font('Baloo','',str(fonts/'BalooBhaina2-400.ttf'));pdf.add_font('Baloo','B',str(fonts/'BalooBhaina2-600.ttf'))
pdf.set_title('Musha O Mushi - Illustrated draft');pdf.set_author('Paresh Kumar Patnaik');pdf.set_creator('Sishu Kishore')
written=[];layout=[]
def font(size=14,bold=False,odia=True):
 pdf.set_font('Baloo','B' if bold else '',size);pdf.set_text_color(41,58,48);pdf.set_text_shaping(True,script='orya' if odia else 'latn',language='or' if odia else 'en')
def text(s,size=14,bold=False,align='L',odia=True,leading=None):
 font(size,bold,odia);lh=leading or size*.352778*1.6
 lines=pdf.multi_cell(0,lh,s,align=align,dry_run=True,output=MethodReturnValue.LINES,new_x=XPos.LMARGIN,new_y=YPos.NEXT)
 for line in lines:
  if pdf.get_y()+lh>pdf.page_break_trigger:pdf.add_page();font(size,bold,odia)
  logical=('\ufeff'+line+'\n').encode('utf-16-be').hex();pdf._out('/Span << /ActualText <'+logical+'> >> BDC')
  pdf.multi_cell(0,lh,line,align=align,new_x=XPos.LMARGIN,new_y=YPos.NEXT);pdf._out('EMC')
def art(rel):
 h=pdf.epw*2/3
 if pdf.get_y()+h+8>pdf.page_break_trigger:pdf.add_page()
 pdf.image(str(D/rel),x=pdf.l_margin,y=pdf.get_y(),w=pdf.epw);pdf.set_y(pdf.get_y()+h+8)
pdf.add_page();pdf.set_y(25);text(B['title'],25,True,align='C');text(B['author'],16,align='C');pdf.ln(8);art('art/poem-01-v1.jpg');text('ଶିଶୁକବିତା ସଂକଳନ',15,align='C');pdf.ln(4);text('ILLUSTRATED DRAFT',10,align='C',odia=False);text('Writer proofreading pending',10,align='C',odia=False)
pdf.add_page();text('About this edition',18,True,odia=False);pdf.ln(4)
text('Original story wording · New illustrations by Ahimanikya',11,odia=False)
text('All 18 poems are included. The text was compared with the original scans. Faded words use provisional readings, as requested, and are flagged on the online proofreading page. Writer proofreading is still pending.',11,odia=False)
pdf.ln(3);text('New illustrations were made with AI assistance under Ahimanikya’s direction.',10,odia=False);pdf.ln(4)
for s in ['Original edition: Musa O Musi (Children’s Poems)','Author: Paresh Kumar Patnaik','Publisher: Lekhalekhi, Bhubaneswar','First edition: 2022','Original illustrations: Baladev Maharatha','ISBN: 978-81-955751-5-2','Original cover and all scanned pages remain available online.']:
 text(s,10,odia=False)
pdf.ln(6);text('shishukishora.com',10,odia=False)
pdf.add_page();text('ସୂଚୀପତ୍ର',22,True);pdf.ln(5);links=[pdf.add_link() for _ in B['chapters']]
for c,link in zip(B['chapters'],links):
 y=pdf.get_y();text(f'{c["id"]}. '+c['title'],12,leading=7);pdf.link(16,y,pdf.epw,pdf.get_y()-y,link)
for c,link in zip(B['chapters'],links):
 pdf.add_page();pdf.set_link(link,page=pdf.page_no());pdf.start_section(c['title']);layout.append({'poem':c['id'],'page':pdf.page_no()});text(c['title'],19,True);pdf.ln(3);art(c['art'])
 for p in c['pages']:
  for line in p['text'].splitlines():
   written.append(line);text(line,13,leading=7.25)
  pdf.ln(4)
out=D/'musha-mushi-illustrated.pdf';pdf.output(str(out))
reader=PdfReader(out);actual=[]
for page in reader.pages:
 actual.extend(bytes.fromhex(v.decode()).decode('utf-16-be').lstrip('\ufeff') for v in re.findall(rb'/ActualText <([0-9a-f]+)>',page.get_contents().get_data()))
norm=lambda s:re.sub(r'\s+','',unicodedata.normalize('NFKC',s))
logical=norm(''.join(actual));missing=[s for s in written if norm(s) not in logical];assert not missing,missing
report={'pages':len(reader.pages),'poems':18,'verseLines':len(written),'allDraftLinesPresentInActualText':True,'font':'Baloo Bhaina 2, embedded, HarfBuzz Odia shaping','writerProofread':False,'chapterPages':layout,'bytes':out.stat().st_size}
(S/'pdf-build-report.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
