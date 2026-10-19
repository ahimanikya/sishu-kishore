"""Import the completed bilingual story draft and connect its public artifacts.

Editorial preparation only; CI serves the committed public files. Re-run after
rebuilding the local review or regenerating the character collection.
"""
from pathlib import Path
from bs4 import BeautifulSoup
import html
import json
import shutil
import zipfile

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT.parent / 'business-review/sishu-kishore/2026-10-19/boita-small-bundle-v1'
PUBLIC = ROOT / 'public'
ROUTE = '/characters/films/boita-small-bundle/'
OUT = PUBLIC / ROUTE.lstrip('/')
OUT.mkdir(parents=True, exist_ok=True)
PACK = 'boita-small-bundle-storyboard-v1.zip'

def pair(odia, english, tag='span'):
    return f'<{tag} lang="or" class="or">{html.escape(odia)}</{tag}><{tag} lang="en" class="en">{html.escape(english)}</{tag}>'

def translated(odia, english, tag='span'):
    return f'<{tag} data-or="{html.escape(odia, quote=True)}" data-en="{html.escape(english, quote=True)}">{html.escape(odia)}</{tag}>'

files = ['screenplay-or-v1.txt', 'screenplay-en-v1.txt', 'screenplay-v1.json', 'shot-list-v1.csv', 'timed-shot-list-v1.json', 'references/cast-natural-v2.png', 'assets/baloo-bhaina-2.ttf', 'assets/OFL-Baloo-Bhaina-2.txt']
files += [f'assets/storyboard-sheet-{i}-v1.png' for i in range(1, 5)]
for rel in files:
    (OUT / rel).parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(SOURCE / rel, OUT / rel)

raw = (SOURCE / 'index.html').read_text()
raw = raw.replace('<html lang="en"><meta', '<html lang="or"><head><meta').replace('</style><body', '</style></head><body')
raw = raw.replace('boita-small-bundle-review-v1.zip', PACK)
raw = raw.replace('data-language="both"', 'data-language="or"')
raw = raw.replace('data-lang="or" aria-pressed="false"', 'data-lang="or" aria-pressed="true"').replace('data-lang="both" aria-pressed="true"', 'data-lang="both" aria-pressed="false"')
raw = raw.replace("f.setAttribute('aria-label',`Shot ${s.id}: ${s.action.en}`)", "f.setAttribute('aria-label',document.body.dataset.language==='or'?`ଦୃଶ୍ୟ ${s.id}: ${s.action.or}`:`Shot ${s.id}: ${s.action.en}`)")
start = raw.index("document.querySelectorAll('[data-lang]').forEach")
end = raw.index("document.getElementById('print')", start)
raw = raw[:start] + '''
function applyLanguage(lang, updateUrl=false){
  if(!['or','en','both'].includes(lang))lang='or';
  document.body.dataset.language=lang;
  document.documentElement.lang=lang==='en'?'en':'or';
  document.querySelectorAll('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===lang)));
  document.querySelectorAll('[data-aria-or]').forEach(n=>n.setAttribute('aria-label',n.dataset[lang==='en'?'ariaEn':'ariaOr']));
  document.querySelectorAll('[data-alt-or]').forEach(n=>n.alt=n.dataset[lang==='en'?'altEn':'altOr']);
  try{if(lang!=='both')localStorage.setItem('character-language',lang);}catch{}
  if(updateUrl){const u=new URL(location.href);u.searchParams.set('lang',lang);history.replaceState(null,'',u);}
  show(current);
}
document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>applyLanguage(b.dataset.lang,true)));
let storedLanguage;try{storedLanguage=localStorage.getItem('character-language');}catch{}
applyLanguage(new URLSearchParams(location.search).get('lang')||storedLanguage||'or');
document.addEventListener('click',e=>{
  const a=e.target.closest('a[href]');if(!a||a.hasAttribute('download')||a.getAttribute('href').startsWith('#'))return;
  const u=new URL(a.href,location.href);
  if(u.origin===location.origin&&u.pathname.includes('/characters/')&&/(?:\\.html|\\/)$/.test(u.pathname)){
    u.searchParams.set('lang',document.body.dataset.language==='en'?'en':'or');a.href=u.href;
  }
});
''' + raw[end:]
soup = BeautifulSoup(raw, 'html.parser')
# Only the original sound study is eligible for this import. Voiced recordings
# require their own reviewed release; never discover or publish them by glob.
study = SOURCE / 'animatic-v1'
movie = 'small-bundle-bilingual-sound-study-v1.mp4'
if (study / movie).exists():
    (OUT / 'animatic').mkdir(exist_ok=True)
    for rel in [movie, 'poster-review-v1.png', 'recording-pack-v1.zip']:
        shutil.copyfile(study / rel, OUT / 'animatic' / rel)
    section = '<section class="downloads" id="animatic"><h2>' + pair('ଚଳଚ୍ଚିତ୍ରର ଗତି ଓ ଶବ୍ଦ ନମୁନା', 'Picture edit & sound study') + '</h2>'
    section += pair('୨:୩୪ ମିନିଟ୍‌ର ପେନ୍‌ସିଲ୍ ଦୃଶ୍ୟ, ଦୁଇ ଭାଷାର ସଂଳାପ ଲେଖା ଓ ହାଲୁକା ପାଣି–କପଡ଼ା ଶବ୍ଦ। ଏଥିରେ କଥା କହୁଥିବା କଣ୍ଠ ଏଯାଏଁ ନାହିଁ। କଣ୍ଠ ରେକର୍ଡ ପରେ ସମୟ ସଜଡ଼ାଯିବ।', 'A 2:34 pencil edit with Odia and English dialogue captions and quiet water and cloth sounds. Spoken voices are still pending. Timing will be revised around the recordings.', 'p')
    section += f'<video controls playsinline preload="metadata" width="1280" height="1100" poster="animatic/poster-review-v1.png" style="display:block;width:100%;height:auto;background:#f7f3e9"><source src="animatic/{movie}" type="video/mp4"/></video><nav class="toolbar"><a href="animatic/{movie}" download>' + pair('ଭିଡିଓ ଡାଉନଲୋଡ୍', 'Download picture edit') + '</a><a href="animatic/recording-pack-v1.zip" download>' + pair('ଚାରି ଚରିତ୍ରର ରେକର୍ଡିଂ ପାଠ୍ୟ', 'Four-character recording pack') + '</a></nav></section>'
    soup.select_one('#viewer').insert_before(BeautifulSoup(section, 'html.parser'))
    link = '<a href="#animatic">' + pair('ଭିଡିଓ ନମୁନା ଦେଖନ୍ତୁ', 'Watch the picture edit') + '</a>'
    soup.select_one('main > nav').insert(0, BeautifulSoup(link, 'html.parser'))
soup.head.append(soup.new_tag('meta', attrs={'name': 'character-preview', 'content': ROUTE + 'assets/storyboard-sheet-1-v1.png'}))
soup.head.append(soup.new_tag('link', rel='icon', href='/characters/assets/favicon.svg', type='image/svg+xml'))
nav = '<nav class="toolbar collection-nav">'
for href, odia, english in [('/characters/index.html', '← ଚରିତ୍ରଙ୍କ ଜଗତ', '← Character worlds'), ('/characters/boita-sadhaba.html', 'ବୋଇତର ସାଥୀ', 'The Boita Crew'), ('/characters/story-lab.html', 'ଗପ ଓ ଚଳଚ୍ଚିତ୍ର', 'Scripts & films')]:
    nav += f'<a href="{href}">{pair(odia, english)}</a>'
nav += '</nav>'
soup.header.insert(0, BeautifulSoup(nav, 'html.parser'))
path = '<section class="downloads" id="story-path"><h2>' + pair('ଗପଟି କିପରି ଗଢ଼ିଉଠିଲା', 'How the story grew') + '</h2>'
path += pair('ପ୍ରଥମେ ମାଳତୀର ଦୁଇଟି ଛୋଟ ଗପ—କାମରେ ଭାଗ ନେବା ଓ ବାପାଙ୍କ ସହ ଆଉ ଟିକେ ବସିବା। ଏହି ଦୁଇ ଇଚ୍ଛାରୁ ପୂରା ଗପ, ତା’ପରେ ଷୋହଳଟି ପେନ୍‌ସିଲ୍ ଦୃଶ୍ୟ।', 'Two earlier studies explored Malati wanting a real task and wanting more time with her father. Those wishes became this complete story, followed by sixteen pencil frames.', 'p')
path += '<nav class="toolbar">'
for href, odia, english in [('/characters/scripts/malati-small-parcel.html', 'ମୋ ଛୋଟ ପୁଟୁଳି · ପ୍ରଥମ ଗପ', 'My Small Parcel · earlier study'), ('/characters/scripts/malati-stay-a-moment.html', 'ଆଉ ଟିକେ ବସ · ପ୍ରଥମ ଗପ', 'Sit a Little Longer · earlier study'), ('references/cast-natural-v2.png', 'ଚରିତ୍ରଙ୍କ ରଙ୍ଗୀନ ନମୁନା', 'Established cast reference'), ('/characters/design-path.html#boita-sadhaba', 'ବୋଇତ ଦଳର ପୂରା ସୃଜନଯାତ୍ରା', 'Boita design history')]:
    path += f'<a href="{href}">{pair(odia, english)}</a>'
path += '</nav>' + pair('ପରବର୍ତ୍ତୀ ଧାପ: ସଂଳାପ ରେକର୍ଡ କରି ଦୃଶ୍ୟର ସମୟ ସଜାଡ଼ିବା, ତା’ପରେ ଅଭିନୟ ଓ ଚଳନ।', 'Next: record dialogue, adjust the storyboard timing, then develop the acting and animation.', 'p') + '</section>'
soup.select_one('#downloads').insert_before(BeautifulSoup(path, 'html.parser'))
extra = '<a href="shot-list-v1.csv" download>' + pair('ଦୃଶ୍ୟ ଓ ସମୟ ତାଲିକା', 'Shot and timing list') + '</a>'
soup.select_one('#downloads nav').append(BeautifulSoup(extra, 'html.parser'))
labels = {'.languages': ('ପଢ଼ିବା ଭାଷା', 'Reading language'), '.collection-nav': ('ଚରିତ୍ର ସଂଗ୍ରହ', 'Character collection'), 'main > nav': ('ଗପର ବିଭାଗ', 'Story navigation'), '#viewer': ('ଦୃଶ୍ୟଖସଡ଼ା ପଢ଼ନ୍ତୁ', 'Storyboard reader'), '#previous': ('ପୂର୍ବ ଦୃଶ୍ୟ', 'Previous shot'), '#next': ('ପର ଦୃଶ୍ୟ', 'Next shot'), '.strip': ('ଦୃଶ୍ୟ ବାଛନ୍ତୁ', 'Choose a shot')}
for selector, (odia, english) in labels.items():
    node = soup.select_one(selector)
    node['aria-label'] = node['data-aria-or'] = odia
    node['data-aria-en'] = english
for node in soup.select('[data-shot]'):
    n = node['data-shot']
    node['aria-label'] = node['data-aria-or'] = f'ଦୃଶ୍ୟ {n}'
    node['data-aria-en'] = f'Shot {n}'
for i, node in enumerate(soup.select('.sheet-link'), 1):
    node['aria-label'] = node['data-aria-or'] = f'ପେନ୍‌ସିଲ୍ ଦୃଶ୍ୟପଟ {i} ଖୋଲନ୍ତୁ'
    node['data-aria-en'] = f'Open pencil sheet {i}'
    img = node.img
    img['alt'] = img['data-alt-or'] = f'ପେନ୍‌ସିଲ୍ ଦୃଶ୍ୟଖସଡ଼ା, ଦୃଶ୍ୟ {4*i-3} ରୁ {4*i}'
    img['data-alt-en'] = f'Pencil storyboard, shots {4*i-3} to {4*i}'
(OUT / 'index.html').write_text(str(soup))

# The public pack is self-contained. Production logs and private voice files are
# deliberately outside this curated artifact; their original archive is retained.
readme = '''ଛୋଟ ପୁଟୁଳି · The Small Bundle
ପରିକଳ୍ପନା ଓ ସୃଜନ ନିର୍ଦ୍ଦେଶନା: ଅହିମାନିକ୍ୟ ଶତପଥୀ
Concept and creative direction: Ahimanikya Satapathy

index.html ଖୋଲି ଓଡ଼ିଆ, ଇଂରାଜୀ ବା ଉଭୟ ଭାଷାରେ ପଢ଼ନ୍ତୁ।
ଚାରିଟି ଚିତ୍ରପଟରେ ମୋଟ ଷୋହଳଟି ଦୃଶ୍ୟ। ପ୍ରଥମେ ଉପର ବାମ, ଉପର ଡାହାଣ,
ତା’ପରେ ତଳ ବାମ ଓ ତଳ ଡାହାଣ ଦୃଶ୍ୟ ପଢ଼ନ୍ତୁ। ସମୟ ୨:୩୪ ଆନୁମାନିକ।
ଏହା ପ୍ରଥମ ଖସଡ଼ା; କଣ୍ଠ ରେକର୍ଡ ଓ ଶେଷ ଚଳଚ୍ଚିତ୍ର ଅପେକ୍ଷିତ।

Open index.html in a browser. Choose Odia, English or both. Each pencil sheet
contains four shots: top left, top right, bottom left, bottom right.
Includes the two screenplays, bilingual source, timing list, all four pencil
sheets, established cast reference and the included font licence.
Planned duration: 2:34. First draft with silent still-frame playback.
Dialogue recording and animation are the next stages.
An original fictional episode set against Odisha's maritime heritage.
No specific historical date, port, route or authenticated costume is claimed.
'''
offline = BeautifulSoup(str(soup), 'html.parser')
offline.select_one('.collection-nav').decompose()
if study_section := offline.select_one('#animatic'):
    study_section.decompose()
for link in offline.select('a[href="#animatic"]'):
    link.decompose()
for link in list(offline.select('a[href]')):
    if link['href'] == PACK:
        link.decompose()
    elif link['href'].startswith('/'):
        link['href'] = 'https://sishu.kabitawithoutborders.org' + link['href']
for link in offline.select('link[href^="/"]'):
    link.decompose()
with zipfile.ZipFile(OUT / PACK, 'w', zipfile.ZIP_DEFLATED) as archive:
    archive.writestr('index.html', str(offline))
    archive.writestr('README.txt', readme)
    for rel in files:
        archive.write(OUT / rel, rel)

css = '.small-bundle-feature{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:28px;align-items:center}.small-bundle-feature img{display:block;width:100%;height:auto;border:1px solid #d8d1c1}.small-bundle-feature .actions{display:flex;flex-wrap:wrap;gap:12px}.small-bundle-feature h2{margin-top:8px}.small-bundle-feature .draft-note{font-size:.9em}@media(max-width:700px){.small-bundle-feature{grid-template-columns:1fr}}'
(PUBLIC / 'characters/assets/small-bundle.css').write_text(css + '\n')
feature = f'<section class="report-section small-bundle-feature" id="boita-small-bundle"><div><p class="eyebrow">{translated("ନୂଆ ଗପ · ୧୯ ଅକ୍ଟୋବର ୨୦୨୬", "New story · 19 October 2026")}</p>{translated("ଛୋଟ ପୁଟୁଳି", "The Small Bundle", "h2")}{translated("ବାପାଙ୍କ ଯାତ୍ରା ଆଗରୁ ମାଳତୀ ଛୋଟ ପୁଟୁଳିଟି ଲୁଚାଇ ଆଉ ଟିକେ ସମୟ ପାଇବାକୁ ଚାହେଁ। ତା’ର ମନକଥା କହିବାର ଏକ ପୂରା ଗପ।", "Before her father sails, Malati holds back a small parcel to gain a little more time with him. A complete story about finding the words for what she wants.", "p")}<p class="draft-note">{translated("ଓଡ଼ିଆ ଓ ଇଂରାଜୀ · ୧୬ଟି ପେନ୍‌ସିଲ୍ ଦୃଶ୍ୟ · ଆନୁମାନିକ ୨:୩୪। ପ୍ରଥମ ଖସଡ଼ା; କଣ୍ଠ ରେକର୍ଡ ହୋଇନି।", "Odia & English · 16 pencil frames · planned 2:34. First draft; voices not yet recorded.")}</p><div class="actions"><a class="button" href="{ROUTE}">{translated("ଗପ ଓ ଦୃଶ୍ୟ ଦେଖନ୍ତୁ", "Read the story & storyboard")}</a><a class="text-link" href="{ROUTE}{PACK}" download>{translated("ସବୁ ଫାଇଲ୍ ଡାଉନଲୋଡ୍", "Download story pack")}</a></div></div><a href="{ROUTE}"><img src="{ROUTE}assets/storyboard-sheet-1-v1.png" width="1536" height="1024" loading="lazy" alt="ମାଳତୀର ଛୋଟ ପୁଟୁଳି — ପ୍ରଥମ ଚାରିଟି ପେନ୍‌ସିଲ୍ ଦୃଶ୍ୟ" data-alt-or="ମାଳତୀର ଛୋଟ ପୁଟୁଳି — ପ୍ରଥମ ଚାରିଟି ପେନ୍‌ସିଲ୍ ଦୃଶ୍ୟ" data-alt-en="Malati’s small bundle — the first four pencil frames"/></a></section>'
for name in ['index.html', 'boita-sadhaba.html', 'story-lab.html', 'design-path.html']:
    file = PUBLIC / 'characters' / name
    page = BeautifulSoup(file.read_text(), 'html.parser')
    if old := page.select_one('#boita-small-bundle'):
        old.decompose()
    if not page.select_one('link[href="/characters/assets/small-bundle.css"]'):
        page.head.append(page.new_tag('link', rel='stylesheet', href='/characters/assets/small-bundle.css'))
    node = BeautifulSoup(feature, 'html.parser')
    if name == 'boita-sadhaba.html':
        page.select_one('main > .actions').insert_after(node)
    elif name == 'design-path.html':
        page.select_one('#boita-sadhaba').insert_after(node)
    else:
        next(x for x in page.main.children if x.name).insert_after(node)
    # Preserve the earlier inventory explicitly rather than count a new full
    # episode as one of the earlier 69 short character studies.
    if name == 'story-lab.html':
        for p in page.select('main > p[data-en]'):
            if 'production-count' in p.get('class', []):
                p['data-en'] = '69 earlier character-study scripts, plus The Small Bundle complete episode. The new pencil storyboard has 16 shots; voices and final animation are next.'
                p['data-or'] = 'ପୂର୍ବର ୬୯ଟି ଚରିତ୍ର ଅଧ୍ୟୟନ ସହ ଏବେ ‘ଛୋଟ ପୁଟୁଳି’ର ପୂରା ଚିତ୍ରନାଟ୍ୟ। ନୂଆ ପେନ୍‌ସିଲ୍ ଦୃଶ୍ୟଖସଡ଼ାରେ ୧୬ଟି ଦୃଶ୍ୟ; ପରେ କଣ୍ଠ ଓ ଶେଷ ଚଳଚ୍ଚିତ୍ର।'
                p.string = p['data-or']
    file.write_text(str(page))
print('Published-artifact files prepared; four collection pages linked.')
