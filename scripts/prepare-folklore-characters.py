"""Extend the committed character collection with two original folklore-inspired casts.

Editorial preparation, not a CI dependency. Run after prepare-characters.py and
before prepare-sharing.py --scope characters. Sources and revisions stay intact.
"""
from pathlib import Path
import argparse, copy, html, json, shutil
from bs4 import BeautifulSoup
from PIL import Image

REPO = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--workspace', type=Path, default=REPO.parent)
args = parser.parse_args()
ROOT = args.workspace / 'business-review/sishu-kishore/2026-10-17/folklore-character-development'
DEST = REPO / 'public/characters'
data = json.loads((ROOT / 'worlds-v1.json').read_text())
e = html.escape

def frag(s): return BeautifulSoup(s, 'html.parser')
def read(name): return BeautifulSoup((DEST / name).read_text(), 'html.parser')
def save(name, s): (DEST / name).write_text(str(s))
def add(parent, s): parent.append(frag(s))
def button(url, label, download=False):
    return f'<a class="button secondary" href="{e(url)}"' + (' download' if download else '') + f'>{e(label)}</a>'
def section(sid, title, body):
    return f'<section class="report-section" id="{sid}"><header class="section-heading"><h2>{e(title)}</h2></header>{body}</section>'
def notes(items, cls='notes'):
    return f'<dl class="{cls}">' + ''.join(f'<div><dt>{e(k)}</dt><dd>{e(v)}</dd></div>' for k, v in items) + '</dl>'
def url(d, rel): return '/characters/' + d['folder'] + '/' + rel
def fig(d, rel, label):
    src=url(d,rel)
    with Image.open(ROOT/d['folder']/rel) as im: width,height=im.size
    return f'<figure><a href="{src}" target="_blank" rel="noopener"><img src="{src}" alt="{e(label)}" width="{width}" height="{height}" loading="lazy" decoding="async"></a><figcaption>{e(label)} <span>Open full image ↗</span></figcaption></figure>'
def pack(d): return '/characters/downloads/' + d['id'] + '-development-v1.zip'
def story_actions(d):
    return '<div class="actions">' + button(url(d,'pilot-story/finished-page-v1.html'),'Read in Odia / English') + button(url(d,'pilot-story/finished-odia-v1.png'),'Odia page · PNG',True) + button(url(d,'pilot-story/finished-english-v1.png'),'English page · PNG',True) + '</div>'

for d in data:
    shutil.copytree(ROOT/d['folder'],DEST/d['folder'],dirs_exist_ok=True)
    for suffix in ['-development-v1.zip','-artifact-index-v1.json']:
        shutil.copy2(ROOT/'output'/(d['id']+suffix),DEST/'downloads'/(d['id']+suffix))
(DEST/'support').mkdir(exist_ok=True)
for name in ['baloo-bhaina-2.ttf','OFL-Baloo-Bhaina-2.txt']:
    shutil.copy2(ROOT/'support'/name,DEST/'support'/name)
shutil.copy2(ROOT/'source-notes-v1.txt',DEST/'downloads/folklore-source-notes-v1.txt')
shutil.copy2(ROOT/'worlds-v1.json',DEST/'downloads/folklore-worlds-v1.json')

def trail(d):
    stages=[
      ('Pencil concept','The first digital pencil study explores silhouettes, relative scale, expressions and the relationship between the cast members.',fig(d,'assets/pencil-concept-v1.png','First pencil concept · v1')),
      ('Colour direction',d['palette'],fig(d,'assets/colour-concept-v1.png','Selected colour concept · v1')),
      ('Character model sheets','Views, expressions and actions give each recurring character a consistent reference. '+('Benu uses corrected v2; Madhab uses v1.' if d['id']=='batare-katha' else 'Tara, Dinu and Kanu each use their selected v1 sheet.'), '<div class="model-strip">'+''.join(fig(d,'model-sheets/'+c['model'],c['name']+' · selected model') for c in d['characters'])+'</div>'),
      ('Script and rough storyboard','The Odia script and English companion were compared panel by panel before the rough was developed into finished art.',button(url(d,'pilot-story/panel-script-bilingual-v1.txt'),'Read the paired script')+fig(d,'pilot-story/assets/rough-storyboard-v1.png','Six-panel pencil storyboard · v1')),
      ('Finished colour artwork','The saved colour sheet retains the six story beats. Dialogue stays separate so the two languages can be edited and read comfortably.',fig(d,'pilot-story/assets/finished-art-v1.png','Finished colour artwork · v1')),
      ('Lettered digital pages','Odia leads the reader; English is available with one button. Separate page images preserve each language. These are digital reading proofs; printer conversion and physical samples remain deferred.',fig(d,'pilot-story/finished-odia-v1.png','Odia lettered story · v1')+story_actions(d))]
    body='<ol class="design-timeline">'+''.join(f'<li><div class="step-number">{i:02}</div><div class="step-content"><h3>{e(t)}</h3><p>{e(n)}</p>{v}</div></li>' for i,(t,n,v) in enumerate(stages,1))+'</ol>'
    body+='<div class="revision-note"><h3>What changed along the way</h3><p>'+e(d['revision'])+'</p></div>'
    mb=(ROOT/'output'/(d['id']+'-development-v1.zip')).stat().st_size/1024/1024
    body+=f'<div class="artifact-box"><h3>Open the working files</h3><p>37 indexed files · {mb:.1f} MB. Concepts, selected and earlier model versions, exact artwork prompts, scripts, storyboards, finished art, editable readers, lettered page images, review copy and font license. The pack opens offline.</p><div class="actions">'+button(pack(d),'Download development pack',True)+button('/characters/downloads/'+d['id']+'-artifact-index-v1.json','View file index')+'</div></div>'
    return body

pilots={
 'batare-katha':('A borrowed book has lost its last page. Madhab begins to invent an answer, then admits he does not remember. Two listeners imagine different endings, and Benu records them honestly as their own versions. The unanswered question becomes a reason to return to the person who lent the book.',
    [('Benu and Madhab','Benu’s speed meets Madhab’s dramatic pauses. Each can expose a gap in the other’s explanation without losing affection.'),('The audience matters','The listening children supply the two possible endings. They participate in the discovery; the adult does not own every answer.'),('A small continuing promise','The duo will ask the lender for the original ending. A later episode can return to that visit without claiming the imagined endings are the book’s text.')],
    [('The sign that points both ways','A journey produces two confident readings of a sign; the pair ask people who use the route.'),('The story with one sound missing','Benu remembers a strange sound from a story, while Madhab remembers everything except that detail.'),('Whose turn to tell?','Benu prepares to tell a short story and discovers how difficult it is to answer an interruption kindly.')]),
 'chhota-karigara':('Tara’s toy cart bounces on a flat board. Smoothing the wheel’s edge does not help. A slow test reveals an off-centre axle hole. The children mark a new wheel, Dinu makes the hole, and the repaired cart carries two blocks. Their next test will add one block at a time.',
    [('Tara and Kanu','An attractive idea and a practical test have equal value. Tara can revise a design; Kanu can describe what fails without dismissing the whole project.'),('Dinu and the children','Dinu offers a slower test, waits while they find the problem, and handles the tool when a new hole is needed.'),('Failure is visible','The old wheel is set aside, the axle is temporarily bare, and a replacement is fitted. The story does not make a hole move by magic.')],
    [('The bridge that bends','A small model bridge holds an empty cup, then changes shape when water is added.'),('A handle for two hands','A useful carrying handle proves awkward for someone smaller; the group revises who the object is designed for.'),('The pattern that does not meet','A repeating border looks right until its last unit. Kanu’s counting helps Tara adjust the spacing.')])}

new_pages={}
template=read('koraput.html')
for d in data:
    s=copy.deepcopy(template); s.main.clear()
    s.title.string=d['name']+' · Five Odisha Character Worlds'
    for node in s.select('meta[property^="og:"], meta[name^="twitter:"], link[rel="canonical"]'): node.decompose()
    s.select_one('meta[name="description"]')['content']=d['summary']
    s.select_one('meta[name="character-preview"]')['content']=url(d,'assets/colour-concept-v1.png')
    hero=f'<div class="set-hero {d["colour"]}"><div class="set-hero-copy"><p class="eyebrow">{d["number"]} / Original cast · Digital first edition</p><h1>{e(d["name"])}</h1><p class="hero-line" lang="or">{d["odia"]}</p><p>{e(d["summary"])}</p><div class="actions">'+button(url(d,'pilot-story/finished-page-v1.html'),'Read the first story')+'<a class="text-link" href="#characters">Meet the cast ↓</a></div></div>'+f'<img src="{url(d,"assets/colour-concept-v1.png")}" alt="{e(d["names"])} in the selected colour concept" width="1536" height="1024" fetchpriority="high"></div>'
    add(s.main,hero+f'<div class="stats"><div><strong>{len(d["characters"])}</strong><span>character model sheets</span></div><div><strong>6</strong><span>finished story panels</span></div><div><strong>2</strong><span>reading languages</span></div></div>')
    menu=[('overview','The world & its sources'),('characters','Meet the cast'),('relationships','How they work together'),('stories','The first story'),('design','Visual direction & language'),('development','The complete design path'),('possibilities','More story possibilities'),('next','Completed work & open decisions')]
    layout=frag('<div class="report-layout"><aside class="contents"><p class="eyebrow">In this set</p><nav aria-label="On this page">'+''.join(f'<a href="#{i}">{e(t)}</a>' for i,t in menu)+'</nav><p>Updated 17 October 2026</p></aside><div class="report-body"></div></div>')
    body=layout.select_one('.report-body')
    add(body,section('overview','The world & its sources',f'<p class="intro">{e(d["theme"])}</p>'+notes([('Setting',d['setting']),('Family and friendship',d['relationship']),('Relationship to tradition',d['source']),('Audience','Working audience: ages 7–11, with adult read-aloud appeal. The cast ages and names remain editable development choices.')])+'<p><a href="sources.html#folklore-sources">Read the tradition references and development notes →</a></p>'))
    profiles=''
    for i,c in enumerate(d['characters'],1):
        f=c['fields']
        fields=[('Wants',f['Wants']),('Strength',f['Strength']),('Flaw & vulnerability',f['Flaw']+' '+f['Vulnerability']),('Growth',f['Growth']),('Humour & habit',f['Humour']+' '+f['Habit']),('Voice',f['Voice']),('Design direction',f['Visual proposal']),('Writing & drawing notes',f['Avoid'])]
        profiles+=f'<article class="character folklore-character" id="character-{i}"><div class="character-art">'+fig(d,'model-sheets/'+c['model'],c['name']+' · '+c['model'].removesuffix('.png'))+f'</div><div class="character-copy"><p class="eyebrow">{e(c["role"])} · Age {c["age"]}</p><h3>{e(c["name"])} <span lang="or">{c["odia"]}</span></h3><p>{e(f["Role"])}</p>'+notes(fields,'profile-notes')+'</div></article>'
    add(body,section('characters','Meet the cast',profiles))
    summary,relations,ideas=pilots[d['id']]
    add(body,section('relationships','How they work together',notes(relations)))
    add(body,section('stories',d['pilot'],f'<p>{e(summary)}</p><div class="process-triptych">'+fig(d,'pilot-story/assets/rough-storyboard-v1.png','Rough story staging')+fig(d,'pilot-story/assets/finished-art-v1.png','Finished story artwork')+fig(d,'pilot-story/finished-odia-v1.png','Odia reading page')+'</div>'+story_actions(d)))
    add(body,section('design','Visual direction & language',notes([('Palette',d['palette']),('Drawing approach','Simple expressive cartoons, warm skin tones, readable silhouettes and restrained background detail. The cast concept establishes relative scale; individual model-sheet panels are not a shared scale chart.'),('Language','Odia leads the script and reader. English carries the same actions and humour naturally. Named speakers and separate editable lettering keep both versions readable.'),('Review status','Fifteen paired title, caption and dialogue entries per pilot have been compared in assistant review. Independent fluent Odia review remains pending; the current language does not claim dialect authentication.')])+'<div class="actions">'+button(url(d,'language-review/index.html'),'Open paired language review')+button(url(d,'pilot-story/panel-script-bilingual-v1.txt'),'Open editable script')+'</div>'))
    add(body,section('development','From pencil concept to lettered page',trail(d)))
    add(body,section('possibilities','More story possibilities','<p class="callout">Editorial proposals for future episodes. These are not completed scripts or illustrations.</p>'+notes(ideas)))
    add(body,section('next','Completed work & open decisions',notes([('Complete for this digital edition','Character briefs, pencil and colour cast concepts, selected model sheets, a six-panel bilingual pilot, rough and finished art, lettered page images, a review copy and a self-contained development archive.'),('Working identities','Names, ages and occupations remain editable. The contemporary characters and pilot plots are original project development inspired by broad traditional themes.'),('Independent review','A fluent Odia reader can use the paired review copy to suggest precise changes. No external editorial or cultural approval is claimed.'),('Later production','Printer specifications and physical samples remain deferred. Merchandise for these two new casts has not been developed; the archive contains story and character material.')])) )
    add(body,'<div class="next-world"><p class="eyebrow">All five character worlds</p><a href="index.html#worlds">Return to the collection →</a></div>')
    s.main.append(layout); save(d['id']+'.html',s); new_pages[d['id']]=s

# Remove only our generated blocks so repeating this editorial step is safe.
for name in ['index.html','comparison.html','design-path.html','sources.html','complete-report.html']:
    s=read(name)
    for node in s.select('[data-folklore]'): node.decompose()
    save(name,s)

home=read('index.html')
home.select_one('.home-hero h1').clear(); add(home.select_one('.home-hero h1'),'Five worlds.<br>A place for <em>every story.</em>')
home.select_one('.home-hero .intro').string='Meet five Odisha-connected character sets: their personalities, relationships, stories and the things they could become.'
home.select_one('.home-hero .button').string='Explore the five sets ↓'
home.select_one('.hero-index strong').clear(); add(home.select_one('.hero-index strong'),'17 characters.<br>Five distinct directions.')
for d in data:
    anchor='travellers' if d['folder']=='travelling-duo' else 'makers'
    card=f'<article class="world-card {d["colour"]}" id="{anchor}" data-folklore><a class="world-image" href="{d["id"]}.html"><img src="{url(d,"assets/colour-concept-v1.png")}" alt="{e(d["names"])}" width="1536" height="1024" loading="lazy"></a><div class="world-copy"><p class="eyebrow">{d["number"]} / {e(d["theme"])}</p><h2><a href="{d["id"]}.html">{e(d["name"])}</a></h2><p>{e(d["summary"])}</p><div class="card-meta"><span>{e(d["basis"])}</span><span>{e(d["pilot"])} · Odia & English pilot</span></div>'+button(d['id']+'.html','Explore this world ↗')+'</div></article>'
    add(home.select_one('.worlds'),card)
    add(home.select_one('#downloads'),'<div class="download-grid folklore-download" data-folklore>'+button(pack(d),d['name']+' · Development ZIP',True)+'</div>')
add(home.select_one('.portfolio-note:not(.design-feature) > div'),'<p data-folklore>Stories Along the Way adds a questioning nephew and a storytelling uncle. The Young Makers adds a maker, a tester and an artisan mentor. Both have original contemporary casts and completed bilingual pilots, with their traditional inspirations documented.</p>')
home.select_one('#downloads .section-heading p:last-child').string='The full reading view includes all five worlds. The original 14-page PDF and Word files cover the earlier three-world overview.'
for a in home.select('#downloads a[download]'):
    if a['href'].endswith('.pdf'): a.string='Earlier three-world overview · PDF'
    if a['href'].endswith('.docx'): a.string='Earlier three-world overview · Word'
save('index.html',home)

comp=read('comparison.html')
values=[
 ['Original travelling cast inspired by a question-and-story tradition','Original workshop cast inspired by youthful craft in the Dharmapada legend'],
 ['Nephew and storytelling uncle; both learn','Maker, tester and artisan uncle'],
 ['Questions, uncertainty, listening and shared stories','Making, testing and revising through visible cause and effect'],
 [data[0]['setting'],data[1]['setting']],
 ['One bilingual six-panel pilot','One bilingual six-panel pilot'],
 ['Character and story archive; no merchandise yet','Character and story archive; no merchandise yet'],
 ['Independent Odia feedback; working names','Independent Odia feedback; working names']]
table=comp.select_one('table')
for d in data: add(table.thead.tr,f'<th scope="col" data-folklore>{e(d["name"])}</th>')
for tr,row in zip(table.tbody.select('tr'),values):
    for value in row: add(tr,f'<td data-folklore>{e(value)}</td>')
for d in data: add(comp.select_one('#fit dl'),f'<div data-folklore><dt>{e(d["name"])}</dt><dd>{e(d["theme"])}. The finished pilot and preserved design trail offer a concrete basis for discussing a continuing series.</dd></div>')
for p in comp.select('p'):
    if p.get_text().startswith('Use the prepared review copies for Nilu'): p.string='Use the prepared review copies for Nilu–Chaiti, Koraput and both new casts. Apply exact feedback across scripts, lettering and exported pages. Assistant review is recorded; independent review remains open.'
save('comparison.html',comp)

design=read('design-path.html')
for d in data:
    add(design.select_one('.trail-nav'),f'<a href="#{d["id"]}" data-folklore>{e(d["name"])} ↓</a>')
    block=frag(section(d['id'],d['name']+' · design path',trail(d)));block.section['data-folklore']='';design.main.append(block)
for p in design.select('.design-intro > p'):
    if 'No separate hand-drawn' in p.get_text(): p.string='The archive records the actual saved stages. Stories Along the Way and The Young Makers include digital pencil concepts, colour concepts, model sheets, pencil storyboards and lettered digital pages. Earlier casts retain their own documented paths. No physical pencil originals are claimed. Printer-specific preparation and physical samples remain deferred.'
save('design-path.html',design)

sources=read('sources.html')
for p in sources.select('p'):
    t=p.get_text()
    if t.startswith('All reproduced illustrations'): p.string='The first three sets retain their previously developed artwork. The two new casts add concepts, model sheets and bilingual pilot illustrations completed on 17 October 2026. Exact artwork prompts and earlier revisions are preserved in the downloadable packs. Independent language review, final naming and physical production remain open.'
    elif t.startswith('The online report expands'): p.string='This edition covers five sets with character references, performance and continuity notes, relationships, story development and proposed future directions. The original PDF and Word downloads remain the shorter three-world overview. The full reading view contains all five sets and supports browser printing.'
    elif t.startswith('All illustrations reproduce'): p.clear();add(p,'Illustrations are served from the project’s saved artwork. Odia typography uses Baloo Bhaina 2 under the <a href="/characters/support/OFL-Baloo-Bhaina-2.txt">Open Font License</a>. Original image files, versioned revisions and editable lettering remain available.')
refs='<p>The two new casts borrow broad storytelling or craft themes; their identities, relationships, contemporary settings and pilot scripts are original project development.</p>'+notes([('Stories Along the Way',data[0]['source']),('The Young Makers',data[1]['source'])])
refs+='<ul><li><a href="https://api.repository.cam.ac.uk/server/api/core/bitstreams/8920e957-babc-45d4-9981-6b8bbe821a5b/content#page=143">Kailash Pattanaik, “Abolkara: The Odyssey of a Disobedient Hero”, Lokaratna V &amp; VI (2013), pp. 143–145</a> — the questioning travelling companion and later literary versions.</li><li><a href="https://www.blackeaglebooks.org/product/abolakara-kahani/">Black Eagle Books: Abolakara Kahani, Abhay Charan Mohanty</a> — the collection and master–companion story frame.</li><li><a href="https://magazines.odisha.gov.in/orissareview/2015/Dec/engpdf/9-12.pdf">Odisha Review, December 2015, Konark account</a> — Dharmapada as a legendary young craftsman; a legend is not a verified biography.</li><li><a href="https://magazines.odisha.gov.in/orissareview/2021/Sept-Oct/engpdf/entire_book.pdf">Odisha Review, September–October 2021</a> — Dharama/Dharmapada naming and the legendary tradition.</li></ul><p><a href="/characters/downloads/folklore-source-notes-v1.txt">Read the full source notes and scope</a> · <a href="/characters/downloads/folklore-worlds-v1.json">Open the editable character records</a></p>'
block=frag(section('folklore-sources','Abolakara & Dharmapada: the traditional references',refs));block.section['data-folklore']='';sources.main.append(block);save('sources.html',sources)

full=read('complete-report.html')
full.select_one('.print-title h1').clear();add(full.select_one('.print-title h1'),'Five Odisha<br>Character Worlds')
full.select_one('.print-title .caption').string='This full reading view contains all five worlds. The downloadable PDF and Word overview covers the earlier three sets.'
for d in data:
    page=new_pages[d['id']]
    article=frag(f'<article class="full-set {d["colour"]}" data-folklore id="full-{d["id"]}"><header><p class="eyebrow">{d["number"]} / Original cast</p><h1>{e(d["name"])}</h1>'+fig(d,'assets/colour-concept-v1.png',d['names'])+'</header></article>').article
    for sec in page.select('.report-body > .report-section'):
        node=copy.deepcopy(sec)
        for el in [node,*node.select('[id]')]:
            if el.get('id'): el['id']=d['id']+'-'+el['id']
        for a in node.select('a[href^="#"]'): a['href']='#'+d['id']+'-'+a['href'][1:]
        article.append(node)
    full.select_one('#comparison').insert_before(article)
# Reuse the complete current comparison and source sections in the print view.
for sid,source in [('comparison',comp),('sources',sources)]:
    dest=full.select_one('#'+sid);dest.clear()
    for child in list(source.main.children): dest.append(copy.deepcopy(child))
save('complete-report.html',full)

# Shared shell and current-edition wording. Preserve old archive filenames.
for path in DEST.glob('*.html'):
    s=read(path.name)
    for text in list(s.find_all(string=True)):
        if text.parent.name not in ['script','style']:
            updated=str(text).replace('Three Odisha','Five Odisha').replace('Return to the three sets','Return to the five sets').replace('Compare the three sets','Compare the five sets').replace('Expanded report / 15 October 2026','Expanded report / 17 October 2026').replace('Reference / 15 October 2026','Reference / 17 October 2026').replace('16 October 2026','17 October 2026')
            if updated!=str(text): text.replace_with(updated)
    s.select_one('.brand-mark').string='5'
    nav=s.select_one('.site-header nav')
    for a in nav.select('[data-folklore]'): a.decompose()
    before=nav.find('a',href='comparison.html')
    for d in data: before.insert_before(frag(f'<a href="{d["id"]}.html" data-folklore>{e(d["short"])}</a>'))
    for a in nav.select('a'):
        a.attrs.pop('aria-current',None)
        if a.get('href')==path.name: a['aria-current']='page'
    if not s.select_one('link[href="/characters/assets/folklore.css"]'): add(s.head,'<link rel="stylesheet" href="/characters/assets/folklore.css">')
    save(path.name,s)
(DEST/'assets/folklore.css').write_text('''/* Two original casts, October 2026. */
.site-header{flex-wrap:wrap;gap:14px}.site-header nav{flex-wrap:wrap;gap:10px 22px}.folklore-character{grid-template-columns:1fr}.folklore-character .character-art{position:static}.folklore-character .character-art figure{max-width:none}.folklore-character .character-art img{max-height:none;width:100%}.folklore-character .profile-notes{display:grid;grid-template-columns:1fr 1fr;gap:8px 28px}.folklore-character h3 span{font:24px Baloo,var(--sans);display:block;margin-top:12px}.folklore-download{margin-top:14px}.report-section{scroll-margin-top:155px}.contents{top:160px}
@media(max-width:700px){.site-header{position:static}.folklore-character .profile-notes{grid-template-columns:1fr}.report-section{scroll-margin-top:20px}html{scroll-padding-top:20px}}
@media print{.folklore-character .character-art{float:none;width:100%;margin:0}.folklore-character .character-art img{max-height:120mm}.folklore-character .profile-notes{display:block}}
''')
print('Prepared two casts, two readers, 5-world collection, comparison, design trails, sources and full report.')
for d in data:
    for path in (DEST/d['folder']).rglob('*.html'):
        s=BeautifulSoup(path.read_text(),'html.parser')
        for tag in s.select('meta[name="description"],meta[name="character-preview"]'): tag.decompose()
        add(s.head,f'<meta name="description" content="{e(d["pilot"])}: an original story in Odia and English. {e(d["names"])}."><meta name="character-preview" content="{url(d,"pilot-story/assets/finished-art-v1.png")}">')
        path.write_text(str(s))
