"""Build the progressively published heritage voices collection from paired text."""
from pathlib import Path
from bs4 import BeautifulSoup
from html import escape as esc
import json, shutil, runpy

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public/characters'
ARCHIVE=ROOT.parent/'business-review/sishu-kishore/2026-10-17/heritage-voices-v1'
DATA=json.loads((ROOT/'data/character-voices-v1.json').read_text())
def bi(v,tag='p',attrs=''):
    return f'<{tag} data-en="{esc(v["en"],quote=True)}" data-or="{esc(v["or"],quote=True)}" {attrs}>{esc(v["or"])}</{tag}>'
def pair(o,e):return {'or':o,'en':e}
def link(url,o,e,cls='text-link'):return '<a class="'+cls+'" href="'+url+'">'+bi(pair(o,e),'span')+'</a>'
def image(src,o,e):
    return '<figure class="voice-art"><a href="'+src+'"><img src="'+src+'" alt="'+esc(o)+'" data-alt-or="'+esc(o)+'" data-alt-en="'+esc(e)+'" loading="lazy"></a>'+bi(pair(o,e),'figcaption')+'</figure>'
def shell(name,title,body,preview):
    s=BeautifulSoup((OUT/'index.html').read_text(),'html.parser')
    s.main.clear();s.main['class']=['voice-page'];s.main.append(BeautifulSoup(body,'html.parser'))
    for el in s.select('.site-header nav a[aria-current]'):del el['aria-current']
    s.title['data-en']=title['en'];s.title['data-or']=title['or'];s.title.string=title['or']
    s.select_one('meta[name=character-preview]')['content']=preview
    url='https://sishu.kabitawithoutborders.org/characters/'+name+'.html'
    for el in s.select('link[rel=canonical]'):el['href']=url
    for el in s.select('meta[property="og:url"]'):el['content']=url
    for el in s.select('meta[property="og:title"],meta[name="twitter:title"]'):el['content']=title['or']
    for el in s.select('meta[name=description],meta[property="og:description"],meta[name="twitter:description"]'):el['content']=s.main.get_text(' ',strip=True)[:240]
    if not s.select_one('link[href="/characters/assets/voices.css"]'):
        el=s.new_tag('link',rel='stylesheet',href='/characters/assets/voices.css');s.head.append(el)
    # Nested story readers must keep the collection shell's links rooted.
    for a in s.select('.site-header a[href],.site-footer a[href]'):
        href=a['href']
        if not href.startswith(('/', '#', 'https:', 'http:')):a['href']='/characters/'+href
    dest=OUT/(name+'.html');dest.parent.mkdir(parents=True,exist_ok=True)
    dest.write_text(str(s).rstrip()+'\n')
def source_list(sources):
    return '<section id="sources">'+bi(pair('ଉତ୍ସ ଓ ନୂଆ ବ୍ୟାଖ୍ୟା','Sources and interpretation'),'h2')+''.join('<p>'+link(x['url'],x['title']['or'],x['title']['en'])+'</p>'+bi(x['note']) for x in sources)+'</section>'

k=DATA['koeli']
if (ARCHIVE/'koeli/colour-study-v1.png').exists():
    dest=OUT/'koeli/assets';dest.mkdir(parents=True,exist_ok=True)
    for f in (ARCHIVE/'koeli').glob('*'):
        if f.is_file():shutil.copy2(f,dest/f.name)
    body='<header>'+bi(k['role'],'p','class="eyebrow"')+bi(k['name'],'h1')+bi(k['subtitle'],'p','class="voice-deck"')+bi(k['intro'])+'</header>'
    body+=image('/characters/koeli/assets/colour-study-v1.png','କୋଇଲିର ତିନି ଭଙ୍ଗୀ: ଗାଏ, ଶୁଣେ, ଗପ କହିବାକୁ ଆଗେଇଆସେ।','Koeli sings, listens and leans forward to begin a tale.')
    body+='<div class="voice-sections">'+''.join('<section>'+bi(x['title'],'h2')+bi(x['text'])+'</section>' for x in k['sections'])+'</div>'
    body+='<section class="voice-refrain">'+bi(pair('କୋଇଲିର ଛୋଟ ଡାକ','Koeli’s little refrain'),'h2')+bi(k['refrain'],'p')+'</section>'
    body+='<section>'+bi(pair('ପ୍ରଥମ ପରିଚୟ','A first introduction'),'h2')+'<div class="voice-three">'+''.join('<article>'+bi(x['title'],'h3')+bi(x['line'])+'</article>' for x in k['opening'])+'</div></section>'
    body+='<section id="development">'+bi(pair('ଖସଡ଼ାରୁ ରଙ୍ଗୀନ ରୂପ','From first study to colour'),'h2')+image('/characters/koeli/assets/pencil-study-v1.png','ପ୍ରଥମ ପେନ୍‌ସିଲ୍ ଅଧ୍ୟୟନ','First pencil study')+bi(pair('ପ୍ରଥମ ଖସଡ଼ାରେ ଦେହ, ଲାଞ୍ଜ ଓ ଡାଳ ଧରିବାର ଭଙ୍ଗୀ ଖୋଜାଗଲା। ରଙ୍ଗୀନ ରୂପରେ ପରର ଖୁଟିନାଟି କମାଇ ମୁଣ୍ଡ ଓ ଚାଲିଚଳଣର ଭାବକୁ ଗୁରୁତ୍ୱ ଦିଆଗଲା।','The first study explored the body, tail and grip. The colour version simplifies feather detail and gives attention to the head and posture.'))+'</section>'
    body+=source_list(k['sources'])+bi(pair('ଏହା ପ୍ରଥମ ଡିଜିଟାଲ୍ ଚରିତ୍ର ଅଧ୍ୟୟନ। ସ୍ୱାଧୀନ ଦକ୍ଷ ଓଡ଼ିଆ ଓ ସାଂସ୍କୃତିକ ଯାଞ୍ଚ ବାକି।','This is a first digital character study. Independent fluent Odia and cultural review remain pending.'))
    shell('koeli',pair('କୋଇଲି · ଗୀତ ଓ ଗପର ସାଥୀ','Koeli · A companion for songs and stories'),body,'/characters/koeli/assets/colour-study-v1.png')
    index=BeautifulSoup((OUT/'index.html').read_text(),'html.parser')
    for n in index.select('#koeli-introduction'):n.decompose()
    feature='<section id="koeli-introduction" class="koeli-feature"><div>'+bi(pair('ଗପର ଡାକ','A call to stories'),'p','class="eyebrow"')+bi(k['name'],'h2')+bi(k['intro'])+link('koeli.html','କୋଇଲିକୁ ଭେଟନ୍ତୁ →','Meet Koeli →')+'</div>'+image('/characters/koeli/assets/colour-study-v1.png','ଗାଇବା, ଶୁଣିବା ଓ ଗପ କହିବା ଭଙ୍ଗୀରେ କୋଇଲି।','Koeli singing, listening and beginning a story.')+'</section>'
    target=index.select_one('#creative-process')
    if target:target.insert_before(BeautifulSoup(feature,'html.parser'))
    else:index.main.append(BeautifulSoup(feature,'html.parser'))
    (OUT/'index.html').write_text(str(index).rstrip()+'\n')
    for path in OUT.rglob('*.html'):
        s=BeautifulSoup(path.read_text(),'html.parser')
        nav=s.select_one('.site-header nav')
        if nav and not nav.select_one('[data-koeli-nav]'):
            node=BeautifulSoup(link('/characters/koeli.html','କୋଇଲି','Koeli'),'html.parser').a;node['data-koeli-nav']='';nav.append(node)
        if not s.select_one('link[href="/characters/assets/voices.css"]'):
            node=s.new_tag('link',rel='stylesheet',href='/characters/assets/voices.css');s.head.append(node)
        path.write_text(str(s).rstrip()+'\n')
runpy.run_path(str(ROOT/'scripts/character-voices-pages.py'),init_globals=globals())
runpy.run_path(str(ROOT/'scripts/apply-character-credit.py'),run_name='__main__')
print('Prepared available heritage voices.')
