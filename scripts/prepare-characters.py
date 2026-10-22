"""Publish the existing report and its real development artifacts.

Inputs are the sibling local project archives. This is an editorial preparation
step; the normal site build serves the committed public/characters directory.
Run before prepare-sharing.py. No illustration is redrawn by this script.
"""
from pathlib import Path
import argparse, copy, hashlib, html, json, shutil, zipfile
from bs4 import BeautifulSoup
from PIL import Image

REPO = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--workspace', type=Path, default=REPO.parent)
args = parser.parse_args()
ARCHIVE = args.workspace / 'business-review/sishu-kishore'
SOURCE = args.workspace / 'sites/three-odia-character-worlds/dist'
DEST = REPO / 'public/characters'
A = ARCHIVE / '2026-10-12/character-studio'
B = ARCHIVE / '2026-10-15/original-merchandise'
C = ARCHIVE / '2026-10-15/koraput-cast'
shutil.copytree(SOURCE, DEST, dirs_exist_ok=True)
e = html.escape
manifest = []

def fragment(markup):
    return BeautifulSoup(markup, 'html.parser')

def web_image(source, name):
    target = DEST / 'assets' / (name + '.webp')
    with Image.open(source) as im:
        im.thumbnail((1600, 2400))
        if not target.exists() or target.stat().st_mtime < source.stat().st_mtime:
            im.save(target, 'WEBP', quality=91, method=6)
        width, height = im.size
    manifest.append({'file': str(target.relative_to(DEST)),
                     'source': str(source.relative_to(ARCHIVE)),
                     'source_sha256': hashlib.sha256(source.read_bytes()).hexdigest(),
                     'width': width, 'height': height})
    return 'assets/' + target.name

def copy_download(source, name):
    shutil.copy2(source, DEST / 'downloads' / name)
    return 'downloads/' + name

def fig(src, caption):
    return f'<figure><a href="{e(src)}" target="_blank" rel="noopener" aria-label="Open {e(caption)} at full size"><img src="{e(src)}" alt="{e(caption)}" loading="lazy" decoding="async"></a><figcaption>{e(caption)} <span>Open full image ↗</span></figcaption></figure>'

def button(url, label, download=False):
    return f'<a class="button secondary" href="{e(url)}"'+(' download' if download else '')+f'>{e(label)}</a>'

def section(sid, title, content):
    return f'<section class="report-section" id="{sid}"><header class="section-heading"><p class="eyebrow">The working archive</p><h2>{title}</h2></header>{content}</section>'

data = [
    {'id':'gudul-gudli', 'name':'Gudul–Gudli', 'root':A,
     'story':'Room for One More', 'script':A/'story-pilot/room-for-one-more-v1.txt',
     'concept':A/'assets/gudul-head-construction-v1.png',
     'concept_label':'Early head and expression study · v1',
     'concept_note':'An early colour study explores face construction, a listening tilt and a smile. Its blue top is an earlier wardrobe direction; the selected presentation uses red. No separate hand-drawn pencil original is recorded for this example.',
     'models':[A/'assets'/n for n in ['gudul-finished-v2.png','gudli-finished-v2.png','parrot-finished-v1.png','elin-finished-v1.png']],
     'gallery':[(A/'assets'/n, label) for n,label in [
         ('gudul-acting-western-v2.png','Gudul · acting study v2; earlier blue wardrobe'),
         ('gudli-acting-western-v2.png','Gudli · gestures and expressions, study v2'),
         ('parrot-acting-v1.png','Parrot · perching, movement and expression, v1'),
         ('elin-acting-v2.png','Elin · poses and reactions, v2')]],
     'rough':A/'story-pilot/assets/storyboard-v4.png', 'rough_version':'Colour storyboard · v4',
     'rough_note':'The six-panel board follows the blocked approach, Gudli’s recognition, the open space and the parrot’s tail. A separate staging study tested the two movement problems before they were integrated.',
     'final':A/'story-pilot/assets/finished-art-v2.png', 'final_version':'Selected finished art · v2',
     'final_note':'The selected colour art keeps the six story beats and leaves lettering separate. Compare the children’s expressions, Elin’s position and the tail’s move into shelter.',
     'letter':A/'story-collection/pdf-edition/qa/page-03.png',
     'letter_label':'Lettered collection proof · page 3 of 10',
     'proof':'downloads/gudul-gudli-three-stories-v1.pdf', 'proof_label':'10-page story collection · PDF',
     'proof_note':'The collection brings all three short stories into a linked reading edition. Its first story spans pages 3–5. This is a digital reading proof.',
     'model_note':'Selected files: Gudul v2, Gudli v2, parrot v1 and Elin v1. Keep source-established details and newly proposed behaviour distinguishable.',
     'revision':'The development record moves from a staging study of waiting, making room and sheltering the tail to storyboard v4 and finished art v2. Earlier acting sheets retain alternative clothing and are shown as history.',
     'extras':[A/'story-pilot/assets/staging-v2.png'],
     'credit':'Underlying characters: Snigdha Nayak’s Gudul–Gudli serial. The pilot script and these development illustrations are new project explorations, outside the serial chronology.'},
    {'id':'nilu-chaiti', 'name':'Nilu–Chaiti', 'root':B,
     'story':'Room for One More', 'script':B/'story-01-room-for-one-more/story-script-v1.txt',
     'concept':B/'assets/cast-concept-v1.png', 'concept_label':'Original cast concept · v1',
     'concept_note':'The new cast establishes the listener, experimenter, ordinary brown bird and russet puppy. Nilu–Chaiti are working names. The later model sheets make the identities repeatable.',
     'models':[B/'assets'/n for n in ['listener-model-v2.png','experimenter-model-v2.png','bird-model-v2.png','puppy-model-v2.png']],
     'gallery':[(B/'assets'/n, label) for n,label in [
         ('listener-bookmark-v1.png','Nilu · standalone bookmark illustration, v1'),
         ('experimenter-bookmark-v1.png','Chaiti · standalone bookmark illustration, v1'),
         ('bird-merch-v1.png','Bird · small product illustration, v1'),
         ('puppy-merch-v1.png','Puppy · small product illustration, v1')]],
     'rough':B/'story-01-room-for-one-more/assets/rough-storyboard-v1.png', 'rough_version':'Pencil-style storyboard · v1',
     'rough_note':'Six pencil-style frames test the wet paws, movement of the mat, the bird’s stool and the foot-as-pillow ending. This is a digital drawing treatment, not a scan of a hand-drawn original.',
     'final':B/'story-01-room-for-one-more/assets/finished-art-v2.png', 'final_version':'Corrected colour art · v2',
     'final_note':'The first colour version moved the stool to the other side in the ending. Version 2 keeps the bird and stool on the left in panels 5 and 6, preserving the puppy’s chin on Nilu’s sandal.',
     'letter':B/'story-01-room-for-one-more/qa/pdf/story-1.png',
     'letter_label':'Bilingual lettered story · digital A4 proof, v1',
     'proof':copy_download(B/'story-01-room-for-one-more/output/pdf/room-for-one-more-bilingual-v1.pdf','nilu-chaiti-room-for-one-more-proof-v1.pdf'),
     'proof_label':'Bilingual story proof · PDF',
     'proof_note':'The six panels are arranged with editable Odia and English captions, then exported to a one-page PDF. The colour sheet is 1254 × 1254 px; the prior layout review records about 164 ppi for panel art at A4. It is not a 300 ppi production master.',
     'model_note':'All four selected model sheets are version 2. Their views, expressions and action poses fix recurring features before story and merchandise artwork is developed.',
     'revision':'Pencil-style rough v1 → initial colour v1 → corrected colour v2 → bilingual page v1. The original colour file is included in the archive so the stool correction can be compared directly.',
     'extras':[B/'story-01-room-for-one-more/assets/finished-art-v1.png',B/'output/pdf/merchandise-a4-proof-v1.pdf',B/'output/pdf/adventure-book-a5-v2.pdf'],
     'credit':'Original-world cast development using the project’s retained general story premise, newly staged artwork and dialogue. Development illustrations; working names.'},
    {'id':'koraput', 'name':'The Koraput cast', 'root':C,
     'story':'The Path After Rain', 'script':C/'pilot-story/panel-script-bilingual-v1.txt',
     'concept':C/'assets/cast-concept-v2.png', 'concept_label':'Fictional family ensemble · v2',
     'concept_note':'The ensemble places the cousins, their aunt and a free-living squirrel near a fictional Koraput village. It establishes the group’s relative scale and colour direction. The saved early stages are colour concepts; no separate pencil original is recorded.',
     'models':[C/'model-sheets'/n for n in ['kusum-model-v1.png','mandar-model-v1.png','reba-model-v2.png','chiku-model-v1.png']],
     'gallery':[(C/'merchandise/assets/bookmark-reading-v1.png','Kusum and Mandar · reading illustration for the bookmark, v1'),(C/'merchandise/assets/chiku-sticker-v1.png','Chiku · sticker illustration, v1')],
     'rough':C/'pilot-story/assets/rough-storyboard-v2.png', 'rough_version':'Colour storyboard · v2',
     'rough_note':'The board establishes the market errand, familiar rock, fallen branch and Chiku’s movement. It provides the composition to refine rather than a separate pencil-and-ink pass.',
     'final':C/'pilot-story/assets/finished-art-v1.png', 'final_version':'Finished pilot art · v1',
     'final_note':'The final edit clarifies panels 5 and 6: the open left fork curves around the rock, and the family follows it while Chiku remains at the branch. The first four story beats and script wording are retained.',
     'letter':C/'pilot-story/finished-odia-v1.png', 'letter_label':'Odia lettered pilot · v1',
     'proof':'downloads/koraput-pilot-odia-v1.png', 'proof_label':'Odia lettered page · PNG',
     'proof_note':'The finished pilot has separate Odia and English lettering, with captions and named speakers. The PNGs are flat digital page exports. The merchandise PDF separately checks the bookmark and sticker at their proposed sizes.',
     'model_note':'Selected sheets: Kusum v1, Mandar v1, Reba v2 and Chiku v1. Reba’s corrected sheet clarifies the bag; the sari pallu remains left and the work bag right.',
     'revision':'Family concept v2 → four model sheets, including Reba’s correction → storyboard v2 → clearer route in finished art v1 → separate Odia and English page exports. Earlier Reba and storyboard files are preserved in the archive.',
     'extras':[C/'model-sheets/reba-model-v1.png',C/'pilot-story/assets/rough-storyboard-v1.png',C/'pilot-story/finished-english-v1.png',C/'merchandise/koraput-size-proof-v1.pdf'],
     'credit':'Original fictional family and development illustrations. Koraput is the regional frame; no named community or dialect authenticity is claimed.'}
]

def make_pack(d):
    # Keep source filenames and subdirectories so every version remains identifiable.
    sources = [d['script'],d['concept'],*d['models'],*[s for s,_ in d['gallery']],d['rough'],d['final'],d['letter'],*d['extras']]
    proof = DEST/d['proof']
    entries = []
    pack = DEST/'downloads'/f"{d['id']}-development-artifacts-v1.zip"
    with zipfile.ZipFile(pack,'w',zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        for source in dict.fromkeys(sources):
            name = 'source-files/'+source.relative_to(d['root']).as_posix()
            z.write(source,name)
            item={'file':name,'source':source.relative_to(ARCHIVE).as_posix(),'bytes':source.stat().st_size,'sha256':hashlib.sha256(source.read_bytes()).hexdigest()}
            if source.suffix.lower() in ['.png','.jpg','.webp']:
                with Image.open(source) as im: item['dimensions_px']=list(im.size)
            entries.append(item)
        z.write(proof,'reading-proof/'+proof.name)
        entries.append({'file':'reading-proof/'+proof.name,'bytes':proof.stat().st_size,'sha256':hashlib.sha256(proof.read_bytes()).hexdigest()})
        readme=f"{d['name']} — development artifacts\nAssembled 16 October 2026\n\n{d['credit']}\n\nExample story: {d['story']}\n\nDESIGN PATH\n{d['concept_note']}\n{d['model_note']}\n{d['rough_note']}\n{d['final_note']}\n{d['proof_note']}\n\nREVISION RECORD\n{d['revision']}\n\nSTATUS\nThese are selected archived source files and digital proofs, not a complete production archive or printer-approved masters. Independent fluent Odia review is pending. Printer specifications, prepress conversion and physical samples were deferred. No new pencil drawings have been created to imply an earlier stage.\n\nThe file index lists source versions, dimensions read from the actual images and SHA-256 hashes. Preserved drawings may include earlier alternatives; use the selected model versions listed above for continuity.\n"
        z.writestr('READ-ME.txt',readme)
        z.writestr('file-index.json',json.dumps(entries,ensure_ascii=False,indent=2)+'\n')
    copy_download(d['script'],d['id']+'-pilot-script-v1.txt')
    index = DEST/'downloads'/f"{d['id']}-artifact-index-v1.json"
    index.write_text(json.dumps({'cast':d['name'],'assembled':'2026-10-16','files':entries},ensure_ascii=False,indent=2)+'\n')
    return 'downloads/'+pack.name, len(entries), pack.stat().st_size/1024/1024

for d in data:
    d['pack'],d['count'],d['mb']=make_pack(d)
    d['concept_web']=web_image(d['concept'],d['id']+'-early-study')
    d['rough_web']=web_image(d['rough'],d['id']+'-storyboard')
    d['final_web']=web_image(d['final'],d['id']+'-finished-art')
    d['letter_web']=web_image(d['letter'],d['id']+'-lettered-proof')
    d['gallery_web']=[(web_image(src,d['id']+f'-gallery-{i}'),label) for i,(src,label) in enumerate(d['gallery'],1)]

def gallery(d):
    lead='<p>More ways to see the cast: gestures, expressions and illustrations developed for different uses. Earlier studies are labelled where their clothing differs from the selected reference.</p>'
    return section('art-gallery','The cast in pictures',lead+'<div class="art-grid">'+''.join(fig(src,label) for src,label in d['gallery_web'])+'</div>')

def trail(d, prefix=''):
    # This is the actual saved sequence, not a newly invented traditional pipeline.
    steps=[
      ('01','Brief & story',f'The example is <em>{e(d["story"])}</em>. The paired script records panel actions and the dialogue that the illustrations need to carry.',button('downloads/'+d['id']+'-pilot-script-v1.txt','Read the bilingual script')),
      ('02','Early visual direction',e(d['concept_note']),fig(d['concept_web'],d['concept_label'])),
      ('03','Selected character models',e(d['model_note']),'<div class="model-strip">'+''.join(fig(f"assets/{d['id']}-character-{i}.webp",p.stem) for i,p in enumerate(d['models'],1))+'</div>'),
      ('04','Rough storyboard',e(d['rough_note']),fig(d['rough_web'],d['rough_version'])),
      ('05','Finished colour art',e(d['final_note']),fig(d['final_web'],d['final_version'])),
      ('06','Lettering & digital proof',e(d['proof_note']),fig(d['letter_web'],d['letter_label'])+'<div class="actions">'+button(d['proof'],d['proof_label'])+(button('downloads/koraput-pilot-english-v1.png','English lettered page · PNG') if d['id']=='koraput' else '')+'</div>'),
      ('07','Printer conversion & physical sample','<strong>Deferred.</strong> Once the printer’s specifications are available, check final size, image resolution, bleed, safe margins, colour profile, PDF standard, paper and finishing. A physical sample will establish colour, legibility, trimming and feel. That stage has not yet been completed.','')]
    body=f'<p class="intro">{e(d["story"])} · From the saved studies to the current digital proof.</p><p>{e(d["credit"])}</p>'
    body+='<ol class="design-timeline">'
    for number,title,note,visual in steps:
        body+=f'<li><div class="step-number">{number}</div><div class="step-content"><h3>{title}</h3><p>{note}</p>{visual}</div></li>'
    body+='</ol><div class="revision-note"><h3>What changed along the way</h3><p>'+e(d['revision'])+'</p></div>'
    body+=f'<div class="artifact-box"><h3>Keep the evidence</h3><p>{d["count"]} indexed files · {d["mb"]:.1f} MB ZIP. Original selected images, the script, revision examples, proof files and a readable guide. The index records filenames, dimensions and checksums.</p><div class="actions">'+button(d['pack'],'Download development artifacts',True)+button('downloads/'+d['id']+'-artifact-index-v1.json','View file index')+'</div></div>'
    return section(prefix+d['id'],d['name']+' · design path',body)

template=BeautifulSoup((DEST/'koraput.html').read_text(),'html.parser')
design_page=copy.deepcopy(template)
design_page.title.string='From study to print · Three Odisha Character Worlds'
design_page.main.clear()
design_page.main['class']='document-page design-page'
design_page.main.append(fragment('<header class="design-intro"><p class="eyebrow">Design history & downloadable artifacts</p><h1>From first study<br>to the printed page.</h1><p class="intro">Follow the decisions, compare the artwork and open the files behind each character world.</p><p>The archive records illustration studies, storyboards, separate lettering and digital proofs. Nilu–Chaiti includes a pencil-style rough; the other examples begin with colour studies. No separate hand-drawn pencil originals are recorded for these examples. Printer-specific preparation and physical samples remain deferred.</p><nav class="trail-nav" aria-label="Choose a design path">'+''.join(f'<a href="#{d["id"]}">{d["name"]} ↓</a>' for d in data)+'</nav></header>'))
for d in data: design_page.main.append(fragment(trail(d)))
(DEST/'design-path.html').write_text(str(design_page))

for d in data:
    path=DEST/(d['id']+'.html')
    soup=BeautifulSoup(path.read_text(),'html.parser')
    soup.select_one('#characters').insert_after(fragment(gallery(d)))
    summary='<p>'+e(d['revision'])+'</p><div class="process-triptych">'+fig(d['rough_web'],d['rough_version'])+fig(d['final_web'],d['final_version'])+fig(d['letter_web'],d['letter_label'])+'</div><p>The complete trail includes the concept, selected models, bilingual script, revision notes and downloadable source files. The current endpoint is a digital proof.</p><div class="actions">'+button('design-path.html#'+d['id'],'Follow the full design path')+button(d['pack'],f'Download artifacts · {d["mb"]:.1f} MB',True)+'</div>'
    soup.select_one('#design').insert_after(fragment(section('development','From rough study to digital proof',summary)))
    nav=soup.select_one('.contents nav')
    nav.find('a',href='#characters').insert_after(fragment('<a href="#art-gallery">Character gallery</a>'))
    nav.find('a',href='#design').insert_after(fragment('<a href="#development">Design path & artifacts</a>'))
    path.write_text(str(soup))

full=BeautifulSoup((DEST/'complete-report.html').read_text(),'html.parser')
for article,d in zip(full.select('.full-set'),data):
    g=fragment(gallery(d));g.section['id']=d['id']+'-art-gallery'
    article.append(g)
    article.append(fragment(trail(d,'development-')))
(DEST/'complete-report.html').write_text(str(full))

home=BeautifulSoup((DEST/'index.html').read_text(),'html.parser')
home.select_one('.worlds').insert_after(fragment('<section class="portfolio-note design-feature"><p class="eyebrow">See how the artwork developed</p><div><h2>The story behind<br>the finished page.</h2><p>Early studies. Character models. Storyboards. Colour. Lettering. Proofs.</p><a class="button" href="design-path.html">Explore the design paths ↗</a></div><div class="feature-images">'+fig(data[1]['rough_web'],'Nilu–Chaiti · pencil-style rough')+fig(data[1]['letter_web'],'The bilingual digital proof')+'</div></section>'))
home.select_one('#downloads').append(fragment('<h3 class="artifact-heading">Development archives</h3><p>One pack for each world, with versioned artwork, scripts and proof files.</p><div class="download-grid">'+''.join(button(d['pack'],f'{d["name"]} · {d["mb"]:.1f} MB ZIP',True) for d in data)+'</div>'))
(DEST/'index.html').write_text(str(home))

for path in DEST.glob('*.html'):
    soup=BeautifulSoup(path.read_text(),'html.parser')
    for node in soup.select('[data-copy]'): node.decompose()
    for node in soup.select('meta[name="robots"]'): node.decompose()
    nav=soup.select_one('.site-header nav')
    nav.append(fragment('<a href="design-path.html"'+(' aria-current="page"' if path.stem=='design-path' else '')+'>Design path</a>'))
    if path.stem=='design-path':
        for a in nav.select('a[aria-current]'):
            if a.get('href')!='design-path.html': del a['aria-current']
    footer=soup.select_one('.site-footer')
    footer.p.clear()
    footer.p.append('Expanded report & development archive · 16 October 2026')
    footer.p.append(soup.new_tag('br'))
    footer.p.append('Development artwork. Working identities and digital proofs.')
    footer.nav.append(fragment('<a href="design-path.html">Design path & artifacts</a><a href="/">Visit Sishu Kishore ↗</a>'))
    hero_actions=soup.select_one('.set-hero .actions')
    if hero_actions:
        hero_actions.append(fragment('<a class="text-link" href="#development">Artwork → proof</a>'))
    for date in soup.select('.hero-index > span, .contents > p:last-child'):
        if '15 October 2026' in date.get_text():
            date.clear()
            date.append('Updated 16 October 2026')
    # Root-relative assets work consistently at /characters and its subpages.
    for node in soup.select('[src], [href], [data-or], [data-en], [data-download-or], [data-download-en]'):
        for attr in ['src','href','data-or','data-en','data-download-or','data-download-en']:
            val=node.get(attr,'')
            if val.startswith(('assets/','downloads/')): node[attr]='/characters/'+val
    for img in soup.select('img[src]'):
        src=img['src']
        if src.startswith('/characters/'):
            with Image.open(REPO/'public'/src.lstrip('/')) as im:
                img['width'],img['height']=map(str,im.size)
    # The sharing builder uses this local, full-composition artwork.
    image={'index':'nilu-ensemble.webp','gudul-gudli':'gudul-ensemble.webp','nilu-chaiti':'nilu-ensemble.webp','koraput':'koraput-ensemble.webp','design-path':'nilu-chaiti-storyboard.webp','comparison':'koraput-ensemble.webp','sources':'gudul-ensemble.webp','complete-report':'nilu-ensemble.webp'}[path.stem]
    soup.head.append(soup.new_tag('meta',attrs={'name':'character-preview','content':'/characters/assets/'+image}))
    # Apply the requested public wording to text imported from the earlier report.
    path.write_text(str(soup).replace('AI-generated ', ''))

js=DEST/'assets/app.js'
js.write_text('\n'.join(line for line in js.read_text().splitlines() if '[data-copy]' not in line)+'\n')
css=DEST/'assets/style.css'
css.write_text(css.read_text()+'''
/* Development archive: retain whole illustrations and clear version labels. */
img{height:auto}.art-grid{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-top:30px}.art-grid figure{background:#fffdf8;border:1px solid var(--line);padding:18px}.art-grid img{width:100%;height:340px;object-fit:contain}.art-grid figcaption{margin-top:15px}.art-grid figcaption span,.design-timeline figcaption span{display:block;color:var(--forest)}
.process-triptych{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;margin:30px 0}.process-triptych img{width:100%;height:260px;object-fit:contain;background:#fff}.process-triptych figcaption{margin-top:12px;font-size:12px}.process-triptych figcaption span{display:block}
.design-intro{max-width:900px}.trail-nav{display:flex;flex-wrap:wrap;gap:15px 30px;border-block:1px solid var(--line);padding:20px 0;margin:35px 0 50px}.trail-nav a{font-size:14px;font-weight:bold}.design-timeline{list-style:none;margin:45px 0;padding:0}.design-timeline>li{display:grid;grid-template-columns:55px minmax(0,1fr);gap:25px;padding:0 0 50px;margin-top:35px;border-bottom:1px solid var(--line)}.step-number{font:32px var(--serif);color:var(--rust)}.step-content h3{margin:0 0 18px}.step-content>p{max-width:760px;margin-bottom:25px}.step-content>figure{max-width:650px;margin:25px 0}.step-content figure img{width:100%;max-height:800px;object-fit:contain;background:#fff}.step-content figcaption{margin-top:12px}.model-strip{display:grid;grid-template-columns:1fr 1fr;gap:30px}.model-strip figure img{max-height:380px}.revision-note{padding:25px;background:#f0eee1}.revision-note h3,.artifact-box h3{margin:0 0 18px}.artifact-box{background:#e8eddf;padding:30px;margin-top:30px}.artifact-box .actions{margin-top:20px}.artifact-heading{margin:40px 0 15px}.artifact-heading+p{margin-bottom:20px}.feature-images{display:grid;grid-template-columns:1fr 1fr;gap:18px}.feature-images img{height:300px;width:100%;object-fit:contain}.feature-images figcaption{margin-top:10px}.design-feature>div>p{margin:22px 0}.design-feature .button{margin-top:12px}
.report-section{scroll-margin-top:0}
@media(max-width:700px){.art-grid{grid-template-columns:1fr;gap:22px}.art-grid img{height:auto;max-height:520px}.process-triptych{grid-template-columns:1fr}.process-triptych img{height:auto;max-height:550px}.design-timeline>li{grid-template-columns:32px minmax(0,1fr);gap:14px}.step-number{font-size:24px}.step-content h3{font-size:27px}.model-strip{grid-template-columns:1fr}.artifact-box{padding:22px}.feature-images img{height:230px}.site-header nav{max-width:100%}}
@media(max-width:700px){html{scroll-padding-top:160px}.site-header nav{flex-wrap:wrap;overflow:visible;gap:8px 20px}}
@media print{.art-grid,.process-triptych{grid-template-columns:1fr 1fr}.art-grid figure,.process-triptych figure,.design-timeline figure{break-inside:avoid}.design-timeline>li{display:block}.step-number{font-size:15pt;margin-bottom:10px}.step-content>figure{max-width:130mm}.step-content figure img{max-height:170mm}.model-strip figure img{max-height:95mm}.trail-nav{display:none}.artifact-box{break-inside:avoid}.process-triptych img{height:80mm}}
''')
(REPO/'provenance/characters-assets.json').write_text(json.dumps({'prepared':'2026-10-16','origin':'https://shishukishora.com/characters/','source_report':'sites/three-odia-character-worlds/dist','assets':manifest},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'pages':len(list(DEST.glob('*.html'))),'added_images':len(manifest),'packs':[{ 'cast':d['id'],'files':d['count'],'megabytes':round(d['mb'],1)} for d in data]},indent=2))
