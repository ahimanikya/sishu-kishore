"""Build discoverability from public, canonical HTML; never export backend data."""
from html.parser import HTMLParser
from html import escape, unescape
from pathlib import Path
import json,re
from urllib.parse import urlparse
ROOT=Path('public'); ORIGIN='https://sishu.kabitawithoutborders.org'
class Node:
 def __init__(self,tag='',attrs=()):self.tag=tag;self.attrs=dict(attrs);self.children=[]
 def text(self):
  if self.tag in ('script','style','nav','button','form'):return ''
  value=''.join(c if isinstance(c,str) else c.text() for c in self.children)
  return value+ ('\n\n' if self.tag in ('p','h1','h2','h3','li','br') else '')
 def all(self):
  yield self
  for c in self.children:
   if isinstance(c,Node):yield from c.all()
 def has(self,cls):return cls in self.attrs.get('class','').split()
class Tree(HTMLParser):
 def __init__(self,html):super().__init__(convert_charrefs=True);self.root=Node();self.stack=[self.root];self.feed(html)
 def handle_starttag(self,tag,attrs):
  node=Node(tag,attrs);self.stack[-1].children.append(node)
  if tag not in ('meta','link','img','br','hr','input','source','area','base','embed','wbr'):self.stack.append(node)
 def handle_startendtag(self,tag,attrs):self.handle_starttag(tag,attrs);self.handle_endtag(tag)
 def handle_endtag(self,tag):
  for i in range(len(self.stack)-1,0,-1):
   if self.stack[i].tag==tag:self.stack=self.stack[:i];break
 def handle_data(self,data):self.stack[-1].children.append(data)
def clean(s):return re.sub(r'\s+',' ',s).strip()
def meta(nodes,key):return next((n.attrs.get('content','') for n in nodes if n.tag=='meta' and (n.attrs.get('name')==key or n.attrs.get('property')==key)),'')
def setmeta(html,key,value):
 tag='<meta name="'+key+'" content="'+escape(value,quote=True)+'"/>'
 pattern=r'<meta\b(?=[^>]*\bname=[\"\']'+re.escape(key)+r'[\"\'])[^>]*>'
 return re.sub(pattern,lambda m:tag,html,flags=re.I) if re.search(pattern,html,re.I) else html.replace('</head>',tag+'</head>')
issues=json.loads((ROOT/'edition-reader.json').read_text()); articles={i['href']:{**i,'issue':k,'edition':v['title']} for k,v in issues.items() for i in v['items']}
writer_profiles={w['route']:w for w in json.loads(Path('provenance/writer-research-2026-10-10.json').read_text())['writers']}
books={b['landing']:b for f in (ROOT/'shishu/books').glob('*/book.json') for b in [json.loads(f.read_text())]}
# Remove stale text exports when an approved article is withdrawn.
for stale in (ROOT/'reading-text').glob('*.txt'):
 if stale.stem not in {Path(route).stem for route in articles}:stale.unlink()
urls=[]; records=[]; article_count=0
for path in sorted(ROOT.rglob('*.html')):
 html=path.read_text();tree=Tree(html);nodes=list(tree.root.all());route='/'+path.relative_to(ROOT).as_posix();actual=route[:-10] if route.endswith('index.html') else route
 canonical=next((n.attrs.get('href','') for n in nodes if n.tag=='link' and n.attrs.get('rel')=='canonical'),ORIGIN+actual)
 redirect=any(n.tag=='meta' and n.attrs.get('http-equiv','').lower()=='refresh' for n in nodes)
 private=route.startswith('/editorial/') or '/books/' in route and '/page-' in route or route in ('/404.html','/unavailable.html')
 indexable=not redirect and not private and canonical==ORIGIN+actual and actual.startswith('/shishu/')
 html=re.sub(r'<script\b[^>]*id="search-structured-data"[^>]*>.*?</script>','',html,flags=re.S)
 html=re.sub(r'<link\b[^>]*data-search-discovery="true"[^>]*>','',html)
 if not indexable:
  html=setmeta(html,'robots','noindex, follow');path.write_text(html);continue
 title=clean(next((n.text() for n in nodes if n.tag=='h1'),next((n.text() for n in nodes if n.tag=='title'),'')))
 image=meta(nodes,'og:image');body=next((n for n in nodes if n.has('ia-prose')),None)
 if body is None:
  subject=next((n for n in nodes if n.has('subject')),None)
  body=next((n for n in nodes if subject in n.children),None) if subject else None
 text=body.text().strip() if body else ''
 description=clean(meta(nodes,'description'))
 if not description or description==title:description=(clean(text)[:180] if text else title+' · ଶିଶୁ କିଶୋର')
 html=setmeta(html,'description',description);html=setmeta(html,'robots','index, follow, max-image-preview:large')
 web={'@type':'WebPage','@id':canonical+'#page','url':canonical,'name':title,'description':description,'inLanguage':'or','isPartOf':{'@id':ORIGIN+'/shishu/#website'}}
 if image:web['primaryImageOfPage']={'@type':'ImageObject','url':image}
 graph=[{'@type':'WebSite','@id':ORIGIN+'/shishu/#website','url':ORIGIN+'/shishu/','name':'ଶିଶୁ କିଶୋର','alternateName':'Sishu Kishore','inLanguage':'or'},web]
 if route in articles:
  item=articles[route];title=item['title'];assert text.strip(),route
  article={'@type':'Article','@id':canonical+'#article','headline':title,'inLanguage':'or','url':canonical,'mainEntityOfPage':{'@id':canonical+'#page'},'image':image,'isPartOf':{'@type':'PublicationIssue','name':item['edition'],'url':ORIGIN+item['issue']},'isAccessibleForFree':True}
  if item.get('byline'):article['author']={'@type':'Person','name':item['byline']}
  graph.append(article)
  texturl='/reading-text/'+path.stem+'.txt';dest=ROOT/texturl.lstrip('/');dest.parent.mkdir(exist_ok=True)
  dest.write_text(title+'\n'+item.get('byline','')+'\n'+item['edition']+'\nCanonical: '+canonical+'\n\n'+text+'\n')
  html=html.replace('</head>','<link data-search-discovery="true" rel="alternate" type="text/plain" href="'+texturl+'" title="Article text"/></head>')
  records.append({'type':'Article','title':title,'author':item.get('byline',''),'edition':item['edition'],'editionUrl':ORIGIN+item['issue'],'url':canonical,'textUrl':ORIGIN+texturl,'image':image,'language':'or'});article_count+=1
 elif route in issues:
  graph.append({'@type':'PublicationIssue','@id':canonical+'#issue','name':issues[route]['title'],'url':canonical,'inLanguage':'or','isPartOf':{'@type':'Periodical','name':'ଶିଶୁ କିଶୋର','url':ORIGIN+'/shishu/'},'hasPart':[{'@type':'Article','headline':i['title'],'url':ORIGIN+i['href']} for i in issues[route]['items']]})
 elif route in writer_profiles:
  writer=writer_profiles[route]
  web['@type']='ProfilePage'
  web['mainEntity']={'@id':canonical+'#writer'}
  graph.append({'@type':'Person','@id':canonical+'#writer','name':writer['name'],'url':canonical,'description':writer['bio'],**({'image':ORIGIN+writer['portrait']} if writer.get('portrait') else {})})
 elif route in books:
  book=books[route];graph.append({'@type':'Book','name':book['title'],'url':canonical,'inLanguage':'or','image':image,'numberOfPages':book['total']})
 breadcrumbs=[n for n in nodes if n.has('ia-breadcrumb')]
 if breadcrumbs:
  links=[n for n in breadcrumbs[0].all() if n.tag=='a' and n.attrs.get('href','').startswith('/shishu/')]
  items=[{'@type':'ListItem','position':i+1,'name':clean(n.text()),'item':ORIGIN+n.attrs['href']} for i,n in enumerate(links)]
  items.append({'@type':'ListItem','position':len(items)+1,'name':title,'item':canonical});graph.append({'@type':'BreadcrumbList','itemListElement':items})
 html=html.replace('</head>','<script id="search-structured-data" type="application/ld+json">'+json.dumps({'@context':'https://schema.org','@graph':graph},ensure_ascii=False).replace('<','\\u003c')+'</script></head>')
 path.write_text(html);urls.append((canonical,image))
assert article_count==len(articles),(article_count,len(articles))
(ROOT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'+''.join('<url><loc>'+escape(u)+'</loc>'+('<image:image><image:loc>'+escape(im)+'</image:loc></image:image>' if im else '')+'</url>\n' for u,im in urls)+'</urlset>\n')
(ROOT/'robots.txt').write_text('''# Public reading is open to search and AI retrieval crawlers.
# Editorial screens carry noindex; actual private data is protected by Firebase rules.
User-agent: *
Allow: /

Sitemap: https://sishu.kabitawithoutborders.org/sitemap.xml
''')
(ROOT/'content-index.json').write_text(json.dumps({'name':'Sishu Kishore','inLanguage':'or','home':ORIGIN+'/shishu/','articles':records},ensure_ascii=False))
(ROOT/'llms.txt').write_text('''# Sishu Kishore — ଶିଶୁ କିଶୋର

> An Odia monthly children's magazine with issue collections, stories, poems, writers and ebooks.

Public articles are complete static HTML and can be read without login. The canonical article URL is the citation destination; its text/plain alternate contains the same published writing. Author names and edition relationships are in the article catalogue. Original printed book scans are preserved; unreviewed OCR is not represented as verified book text.

## Start here
- [Current issue](https://sishu.kabitawithoutborders.org/shishu/current_issue.html)
- [Past issues](https://sishu.kabitawithoutborders.org/shishu/old_issues.html)
- [Writers](https://sishu.kabitawithoutborders.org/shishu/writers.html)
- [Article catalogue](https://sishu.kabitawithoutborders.org/content-index.json): titles, writers, issue relationships, canonical URLs, text URLs and images.
- [Issue and book catalogue](https://sishu.kabitawithoutborders.org/reader-catalog.json)
- [Sitemap](https://sishu.kabitawithoutborders.org/sitemap.xml)

## Editorial context
Public author bylines belong to the original writing. Drafts, private submissions, email addresses and moderation records are not part of this public catalogue. No new publication dates or author biographies have been inferred.
''')
print(f'Search discovery: {len(urls)} canonical pages; {article_count} article text alternatives; {len(issues)} editions; {len(books)} books.')
