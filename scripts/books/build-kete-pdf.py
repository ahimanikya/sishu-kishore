"""A caption-led comic PDF; original panel order, embedded Odia text and art."""
from pathlib import Path
import json,re,unicodedata,os
from functools import lru_cache
from fpdf import FPDF
from fpdf.enums import XPos,YPos,MethodReturnValue
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from pypdf import PdfReader
R=Path(__file__).resolve().parents[2];S=R/'provenance/kete-jami-loda';D=R/'public/books/ketejami_loda';B=json.loads((S/'book-draft.json').read_text())
fonts=S/'pdf-fonts';fonts.mkdir(exist_ok=True)
for weight in [400,600]:
 p=fonts/f'BalooBhaina2-{weight}.ttf'
 if not p.exists():
  f=TTFont(R/'public/fonts/baloo-bhaina-2.ttf')
  if 'fvar' in f:f=instantiateVariableFont(f,{'wght':weight},inplace=False)
  f.save(p)
class Book(FPDF):
 def footer(self):
  if self.page_no()==1:return
  self.set_y(-11);self.set_font('Baloo','',9);self.set_text_color(95,102,85);self.cell(0,5,str(self.page_no()),align='C')
pdf=Book(format='A4');pdf.set_margins(14,14,14);pdf.set_auto_page_break(False,16)
pdf.add_font('Baloo','',str(fonts/'BalooBhaina2-400.ttf'));pdf.add_font('Baloo','B',str(fonts/'BalooBhaina2-600.ttf'))
pdf.set_title('Kete Jami Loda - Comic edition');pdf.set_author('Leo Tolstoy; Odia transcreation by Dash Benhur');pdf.set_creator('Sishu Kishore')
def font(size=13,bold=False,odia=True):
 pdf.set_font('Baloo','B' if bold else '',size);pdf.set_text_color(39,48,37);pdf.set_text_shaping(True,script='orya' if odia else 'latn',language='or' if odia else 'en')
def lines(s,w,size=13,odia=True):
 font(size,odia=odia)
 return pdf.multi_cell(w,6,s,dry_run=True,output=MethodReturnValue.LINES,new_x=XPos.LMARGIN,new_y=YPos.NEXT)
def drawtext(s,x,y,w,size=13,bold=False,odia=True,lh=6,align='L'):
 font(size,bold,odia);wrapped=pdf.multi_cell(w,lh,s,dry_run=True,output=MethodReturnValue.LINES,new_x=XPos.LMARGIN,new_y=YPos.NEXT)
 for line in wrapped:
  assert y+lh<=281,('text overflow',pdf.page_no(),y,line)
  pdf.set_xy(x,y);logical=('\ufeff'+line+'\n').encode('utf-16-be').hex();pdf._out('/Span << /ActualText <'+logical+'> >> BDC')
  pdf.multi_cell(w,lh,line,align=align,new_x=XPos.LMARGIN,new_y=YPos.NEXT);pdf._out('EMC');y+=lh
 return y
# PDF clipping displays one cell from the unmodified art sheet.
def panelart(path,i,x,y,size,height=None):
 n=int(path.stem.split('-')[1]);g=next(p['geometry'] for p in B['pages'] if p['scanPage']==n);col=i%2;row=i//2
 left=g['x'][col];top=g['y'][row];w=g['x'][col+1]-left;h=g['y'][row+1]-top
 height=size if height is None else height
 with pdf.rect_clip(x,y,size,height):pdf.image(str(path),x=x-left*size/w,y=y-top*height/h,w=g['width']*size/w,h=g['height']*height/h)
 pdf.set_draw_color(44,49,40);pdf.set_line_width(.35);pdf.rect(x,y,size,height)
pdf.add_page();drawtext(B['title'],14,20,pdf.epw,29,True,lh=15,align='C');drawtext('ମୂଳ କାହାଣୀ: '+B['author'],14,42,pdf.epw,16,lh=9,align='C');drawtext('ଓଡ଼ିଆ ରୂପାନ୍ତର: '+B['adaptation'],14,53,pdf.epw,16,lh=9,align='C')
panelart(D/'art/comic-04-v1.jpg',3,44,78,122)
drawtext('ଚିତ୍ରକଥା',14,213,pdf.epw,21,True,lh=10,align='C');drawtext(B['credit'],14,233,pdf.epw,11,odia=False,align='C');drawtext('Comic draft · Writer proofreading pending',14,246,pdf.epw,11,odia=False,align='C')
pdf.add_page();y=drawtext('About this edition',14,18,pdf.epw,20,True,odia=False,lh=11)+6
for s in ['Original story: How Much Land Does a Man Need?','Author: Leo Tolstoy','Odia transcreation: Dash Benhur','Original illustrations: Tapan · Original layout: Gyana',B['credit'],'This comic preserves the Odia captions and their original panel order. Printed line wraps have been joined. All 25 original scans and printed credits remain available online. Text has been compared with the source; writer proofreading is still pending.','Read, download and proofread at shishukishora.com.']:
 y=drawtext(s,14,y,pdf.epw,12,odia=False,lh=7)+5
pdf.add_page();y=drawtext('ମୁଖବନ୍ଧ',14,18,pdf.epw,22,True,lh=12)+6
for para in B['preface']['text'].split('\n\n'):y=drawtext(para,14,y,pdf.epw,15,lh=8)+7
written=[B['preface']['text']];layout=[];lh=5.6
pages=B['pages']
if os.getenv('KETE_PREVIEW'):pages=pages[:1]
for page in pages:
 panels=page['panels'];g=page['geometry'];gap=5;available=248
 def ratio(i):return (g['x'][i%2+1]-g['x'][i%2])/(g['y'][i//2+1]-g['y'][i//2])
 @lru_cache(None)
 def textheight(i,w):return len(lines(panels[i]['text'],w,12))*lh
 @lru_cache(None)
 def option(i,w,h):
  choices=[];aspect=ratio(i)
  # Both arrangements preserve the art's full native aspect ratio.
  art_h=w/aspect
  if h-art_h-8>=textheight(i,round(w-6,3)):choices.append((w*art_h,'bottom',w,art_h))
  art_w=h*aspect;tw=w-art_w-8
  if h>=55 and tw>=42 and h-8>=textheight(i,round(tw,3)):choices.append((art_w*h,'right',art_w,h))
  return max(choices,default=None)
 @lru_cache(None)
 def pack(start,remaining):
  if start==len(panels):return (0,[]) if remaining==0 else None
  best=None
  for count in range(1,min(3,len(panels)-start)+1):
   w=(pdf.epw-gap*(count-1))/count;last=start+count==len(panels)
   for h in ([remaining] if last else range(38,remaining-37-gap)):
    opts=[option(i,w,h) for i in range(start,start+count)]
    if not all(opts):continue
    tail=(0,[]) if last else pack(start+count,remaining-h-gap)
    if tail is None:continue
    score=sum(o[0]**0.5 for o in opts)+tail[0]
    if best is None or score>best[0]:best=(score,[(start,count,w,h,opts)]+tail[1])
  return best
 result=pack(0,available);assert result,('No readable layout',page['scanPage'])
 pdf.add_page();pdf.start_section('ମୂଳ ପୃଷ୍ଠା '+str(page['printedPage']));drawtext('ମୂଳ ପୃଷ୍ଠା '+str(page['printedPage']),14,14,pdf.epw,12,lh=7);y=25
 for start,count,w,h,opts in result[1]:
  for j,(area,position,iw,ih) in enumerate(opts):
   i=start+j;p=panels[i];x=14+j*(w+gap)
   pdf.set_draw_color(44,49,40);pdf.set_fill_color(255,250,237);pdf.rect(x,y,w,h,style='DF')
   panelart(D/page['art'],i,x,y,iw,ih)
   if position=='right':
    tx=x+iw+4;tw=w-iw-8;ty=y+(h-textheight(i,round(tw,3)))/2
   else:tx=x+3;ty=y+ih+4;tw=w-6
   end=drawtext(p['text'],tx,ty,tw,12,lh=lh);assert end<=y+h-.1,(page['scanPage'],i,end,y+h)
   written.append(p['text']);layout.append({'scanPage':page['scanPage'],'panel':i+1,'pdfPage':pdf.page_no(),'x':x,'y':y,'width':w,'height':h,'textPosition':position,'imageWidth':iw,'imageHeight':ih})
  y+=h+gap
 assert abs(y-gap-273)<.01

out=S/'preview.pdf' if os.getenv('KETE_PREVIEW') else D/'kete-jami-loda-illustrated.pdf';pdf.output(str(out))
reader=PdfReader(out);actual=[]
for page in reader.pages:actual.extend(bytes.fromhex(v.decode()).decode('utf-16-be').lstrip('\ufeff') for v in re.findall(rb'/ActualText <([0-9a-f]+)>',page.get_contents().get_data()))
norm=lambda s:re.sub(r'\s+','',unicodedata.normalize('NFKC',s))
logical=norm(''.join(actual));assert all(norm(t) in logical for t in written),'Missing captions'
report={'pages':len(reader.pages),'panels':len(layout),'allCaptionsPresentInActualText':True,'font':'Baloo Bhaina 2; embedded; HarfBuzz Odia shaping','writerProofread':False,'layout':layout,'bytes':out.stat().st_size}
(S/('pdf-preview-report.json' if os.getenv('KETE_PREVIEW') else 'pdf-build-report.json')).write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({k:v for k,v in report.items() if k!='layout'}))
