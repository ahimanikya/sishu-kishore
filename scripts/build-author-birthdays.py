"""Render verified author attributes and fixed edition-month birthday lists."""
from pathlib import Path
from bs4 import BeautifulSoup
import json,re,calendar,copy
ROOT=Path(__file__).resolve().parents[1];P=ROOT/'public'
records=json.loads((ROOT/'data/author-birthdays.json').read_text())['authors']
MONTHS=['','ଜାନୁଆରୀ','ଫେବୃଆରୀ','ମାର୍ଚ୍ଚ','ଏପ୍ରିଲ','ମେ','ଜୁନ','ଜୁଲାଇ','ଅଗଷ୍ଟ','ସେପ୍ଟେମ୍ବର','ଅକ୍ଟୋବର','ନଭେମ୍ବର','ଡିସେମ୍ବର']
DIGITS=str.maketrans('0123456789','୦୧୨୩୪୫୬୭୮୯')
def parse(p):return BeautifulSoup(p.read_text(),'html.parser')
def write(p,s):
 text=str(s)
 if text!=p.read_text():p.write_text(text)
def css(s):
 if not s.select_one('link[href^="/author-birthdays.css"]'):s.head.append(s.new_tag('link',rel='stylesheet',href='/author-birthdays.css'))
entries=[]
for route,b in records.items():
 if not re.fullmatch(r'/writers/[A-Za-z0-9_-]+\.html',route):raise ValueError('Noncanonical birthday identity')
 if b is None or not b['approved']:
  p=P/route.lstrip('/');s=parse(p);old=s.select_one('.writer-birthday[data-generated-birthday]')
  if old:old.decompose();write(p,s)
  continue
 y=b['year'] or 2000
 if not 1<=b['month']<=12 or not 1<=b['day']<=calendar.monthrange(y,b['month'])[1]:raise ValueError('Invalid birthday')
 if b is None or not b['approved']:continue
 p=P/route.lstrip('/');s=parse(p);name=s.h1.get_text(' ',strip=True);entries.append((route,name,b))
 old=s.select_one('.writer-birthday')
 para=s.new_tag('p',attrs={'class':'writer-birthday','data-generated-birthday':'author-record-v1','data-birthday-month':str(b['month']),'data-birthday-day':str(b['day'])})
 if b['year'] is not None:para['data-birthday-year']=str(b['year'])
 text=f"ଜନ୍ମଦିନ: {str(b['day']).translate(DIGITS)} {MONTHS[b['month']]}"
 if b['year'] is not None:text+=f" {str(b['year']).translate(DIGITS)}"
 para.string=text
 if old:old.replace_with(para)
 else:s.h1.insert_after(para)
 css(s);write(p,s)
entries.sort(key=lambda e:(e[2]['month'],e[2]['day'],e[1],e[0]))
def section(s,month=None):
 chosen=[e for e in entries if month is None or e[2]['month']==month]
 if not chosen:return None
 sec=s.new_tag('section',id='birthdays',attrs={'class':'writer-birthdays','data-generated-birthdays':'author-records-v1'})
 if month:sec['data-edition-month']=str(month)
 header=s.new_tag('header');flower=s.new_tag('span',attrs={'class':'birthday-flower','aria-hidden':'true'});flower.string='✿';heading=s.new_tag('h2');heading.string=(MONTHS[month]+' ମାସର ଜନ୍ମଦିନ') if month else 'ଲେଖକଙ୍କ ଜନ୍ମଦିନ';header.extend([flower,heading]);sec.append(header);ul=s.new_tag('ul')
 for route,name,b in chosen:
  li=s.new_tag('li',attrs={'data-birthday-month':str(b['month'])});a=s.new_tag('a',href=route);date=s.new_tag('span',attrs={'class':'birthday-date'});date.append(str(b['day']).translate(DIGITS));small=s.new_tag('small');small.string=MONTHS[b['month']];date.append(small);detail=s.new_tag('span');strong=s.new_tag('strong');strong.string=name;hint=s.new_tag('span',attrs={'class':'birthday-read'});hint.string='ଲେଖକ ପରିଚୟ →';detail.extend([strong,hint]);a.extend([date,detail]);li.append(a);ul.append(li)
 sec.append(ul);return sec
def apply(p,month=None,directory=False):
 s=parse(p);old=s.select_one('#birthdays');new=section(s,month)
 if old:
  if new:old.replace_with(new)
  else:old.decompose()
 elif new:
  anchor=s.select_one('.mag-editor-link') if p.name=='index.html' and p.parent==P else None
  if anchor:anchor.insert_before(new)
  else:s.select_one('main').append(new)
 # Edition lists must never be driven by today's month.
 for script in s.select('script[src^="/author-birthdays.mjs"]'):script.decompose()
 if directory:s.body.append(s.new_tag('script',type='module',src='/author-birthdays.mjs'))
 if new:css(s)
 write(p,s)
catalog=json.loads((P/'edition-reader.json').read_text())
for route in catalog:
 match=re.fullmatch(r'/editions/(\d{4})-(\d{2})/',route)
 if match:apply(P/route.lstrip('/')/'index.html',int(match[2]))
current=parse(P/'current_issue.html').body['data-reading-issue'];match=re.fullmatch(r'/editions/(\d{4})-(\d{2})/',current)
if match:
 for p in [P/'current_issue.html',P/'index.html']:apply(p,int(match[2]))
apply(P/'writers.html',directory=True)
print(f'Author birthdays: {len(entries)} verified attributes; edition lists use issue month; directory uses current month.')
