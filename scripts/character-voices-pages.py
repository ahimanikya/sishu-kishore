"""Additional pages built by prepare-character-voices.py with its paired-text helpers."""
import hashlib, zipfile, re

REVIEW=pair('ସ୍ୱାଧୀନ ଦକ୍ଷ ଓଡ଼ିଆ ଓ ସାଂସ୍କୃତିକ ଯାଞ୍ଚ ବାକି। ଏହା ଡିଜିଟାଲ୍ ପାଠ୍ୟ ଓ ଚିତ୍ରର ପ୍ରଥମ ସଂସ୍କରଣ।','Independent fluent Odia and cultural review remain pending. This is a first digital text and artwork edition.')
stages=[('pencil-cast-v1.png',pair('ପେନ୍‌ସିଲ୍ ଚରିତ୍ର ଅଧ୍ୟୟନ','Pencil character study')),('colour-cast-v1.png',pair('ରଙ୍ଗୀନ ଚରିତ୍ର ଅଧ୍ୟୟନ','Colour character study')),('pencil-storyboard-v1.png',pair('ଛଅ ଦୃଶ୍ୟର ଖସଡ଼ା','Six-panel pencil storyboard')),('finished-art-v1.png',pair('ରଙ୍ଗୀନ ଗଳ୍ପଚିତ୍ର','Finished colour story art'))]
available=[]
for w in DATA['worlds']:
    wid=w['id'];src=ARCHIVE/wid
    if not (src/'finished-art-v1.png').exists():continue
    available.append(w)
    dest=OUT/wid/'assets';dest.mkdir(parents=True,exist_ok=True)
    for f in src.iterdir():
        if f.is_file():shutil.copy2(f,dest/f.name)
    story=w['story'];preview=f'/characters/{wid}/assets/colour-cast-v1.png'
    storyurl=f'/characters/{wid}/pilot-story/finished-page-v1.html'
    body='<header>'+bi(w['kind'],'p','class="eyebrow"')+bi(w['name'],'h1')+bi(w['subtitle'],'p','class="voice-deck"')+bi(w['intro'])+link(storyurl,'ପ୍ରଥମ ଗପ ପଢ଼ନ୍ତୁ →','Read the first story →','button')+'</header>'
    body+=image(preview,w['name']['or'],w['name']['en'])+bi(w['boundary'],'p','class="voice-boundary"')
    body+='<section>'+bi(pair('ସ୍ଥାନ ଓ ସମୟ','Place and time'),'h2')+bi(w['setting'])+'</section><section id="cast">'+bi(pair('ଚରିତ୍ରମାନେ','The characters'),'h2')+'<div class="voice-sections">'
    for i,p in enumerate(w['profiles']):
        body+=f'<article id="character-{i+1}">'+bi(p['name'],'h3')+bi(p['role'],'p','class="eyebrow"')+''.join(bi(d['title'],'h4')+bi(d['text']) for d in p['details'])+'</article>'
    body+='</div></section><section>'+bi(pair('ସମ୍ପର୍କରୁ ଗପ','Stories through relationships'),'h2')+bi(w['relationship'])+bi(w['visual'])+'</section>'
    if w.get('legend'):body+='<section>'+bi(pair('ବଡ଼ ଲୋକକଥାର ପ୍ରସଙ୍ଗ','The wider legend'),'h2')+bi(w['legend'])+'</section>'
    body+='<section id="story">'+bi(story['title'],'h2')+bi(story['note'])+link(storyurl,'ଓଡ଼ିଆ ବା ଇଂରାଜୀରେ ପଢ଼ନ୍ତୁ →','Read in Odia or English →','button')+'</section>'
    body+='<section id="development">'+bi(pair('ଖସଡ଼ାରୁ ପଢ଼ିବା ପୃଷ୍ଠା','From first study to reading page'),'h2')
    for filename,label in stages:
        if (dest/filename).exists():body+=image(f'/characters/{wid}/assets/{filename}',label['or'],label['en'])
    body+=link(storyurl,'୫. ପଢ଼ିବା ପୃଷ୍ଠା','5. Reading page')+'</section>'
    body+='<section>'+bi(pair('ପୋଷାକ ଓ ଚଳଚ୍ଚିତ୍ର ପ୍ରସ୍ତୁତି','Wardrobe and film preparation'),'h2')+link('/characters/regional-dress.html#period','ପୋଷାକର ଅଧ୍ୟୟନ','Clothing references')+' · '+link('/characters/story-lab.html#'+wid,'ପାଠ୍ୟରୁ ଚଳଚ୍ଚିତ୍ର','From scripts to films')+'</section>'
    body+=source_list(w['sources'])+bi(REVIEW)
    body+=link(f'/characters/downloads/{wid}-development-v1.zip','ସମସ୍ତ ସୃଜନ ଫାଇଲ୍ · ZIP','Development files · ZIP','button secondary')
    shell(wid,w['name'],body,preview)
    # Real text stays separate from the artwork for language access and later subtitles.
    body='<header>'+link('/characters/'+wid+'.html','← ଚରିତ୍ରଙ୍କ ପାଖକୁ','← Back to the characters')+bi(story['title'],'h1')+bi(story['note'])+'</header>'
    body+='<aside class="voice-refrain">'+link('/characters/koeli.html','କୋଇଲି କହେ','Koeli says')+bi(story['koeli'])+'</aside><div class="voice-panels">'
    for i,p in enumerate(story['panels']):
        # CSS crops the six-cell source without altering the preserved illustration.
        x=(i%2)*100;y=(i//2)*50
        body+=f'<article class="voice-panel" id="panel-{i+1}"><div class="panel-window" role="img" aria-label="{esc(p["alt"]["or"])}" data-aria-label-or="{esc(p["alt"]["or"])}" data-aria-label-en="{esc(p["alt"]["en"])}" style="background-image:url(/characters/{wid}/assets/finished-art-v1.png);background-position:{x}% {y}%"></div><div class="panel-dialogue">'+bi(pair('ଦୃଶ୍ୟ '+str(i+1),'Scene '+str(i+1)),'h2')
        if p.get('caption'):body+=bi(p['caption'],'p','class="caption"')
        for line in p['lines']:
            body+='<p>'+bi(pair(line['speaker'],line['speakerEn']),'strong')+'<br>'+bi(pair(line['or'],line['en']),'span')+'</p>'
        body+='</div></article>'
    body+='</div><section>'+bi(w['boundary'])+bi(REVIEW)+link(f'/characters/{wid}/assets/world-v1.json','ଦ୍ୱିଭାଷୀ ପାଠ୍ୟ · JSON','Bilingual script · JSON')+' · '+link('/characters/'+wid+'.html#development','ଚିତ୍ରର ଯାତ୍ରା','Design stages')+'</section>'
    shell(wid+'/pilot-story/finished-page-v1',story['title'],body,preview)
    review='<header>'+bi(pair('ଭାଷା ଯାଞ୍ଚ · '+story['title']['or'],'Language review · '+story['title']['en']),'h1')+bi(REVIEW)+'</header>'
    for i,p in enumerate(story['panels']):
        review+=bi(pair('ଦୃଶ୍ୟ '+str(i+1),'Scene '+str(i+1)),'h2')+'<div class="voice-sections">'
        for lang in ['or','en']:
            review+=f'<article lang="{lang}" class="{lang}"><h3>{"ଓଡ଼ିଆ" if lang=="or" else "English"}</h3>'
            if p.get('caption'):review+='<p>'+esc(p['caption'][lang])+'</p>'
            for line in p['lines']:review+='<p><strong>'+esc(line['speaker'] if lang=='or' else line['speakerEn'])+'</strong> — '+esc(line[lang])+'</p>'
            review+='</article>'
        review+='</div>'
    shell(wid+'/language-review/index',pair('ଭାଷା ଯାଞ୍ଚ','Language review'),review,preview)
    # A portable source pack preserves the selected work and exact prompts.
    zip_path=OUT/'downloads'/f'{wid}-development-v1.zip'
    manifest={f.name:hashlib.sha256(f.read_bytes()).hexdigest() for f in sorted(src.iterdir()) if f.is_file()}
    with zipfile.ZipFile(zip_path,'w',compression=zipfile.ZIP_DEFLATED) as z:
        for f in sorted(src.iterdir()):
            if f.is_file():z.write(f,f.name)
        z.writestr('manifest-sha256.json',json.dumps(manifest,indent=2))
        z.writestr('READ-ME.txt','Concept and creative direction: Ahimanikya Satapathy\n\n'+w['boundary']['en']+'\n\n'+REVIEW['en']+'\nThe source image is text-free. Dialogue lives in world-v1.json; six panels read left to right, top to bottom.\n')

r=json.loads((ROOT/'data/regional-dress-v1.json').read_text())
body='<header>'+bi(pair('ମଣିଷ ଆଗେ। ପୋଷାକ ତାଙ୍କ ଜୀବନର ଅଂଶ।','People first. Clothing belongs to their lives.'),'p','class="eyebrow"')+bi(r['title'],'h1')+bi(r['intro'])+'</header><section><div class="voice-sections">'
for p in r['principles']:body+='<article>'+bi(p)+'</article>'
body+='</div></section><nav class="wardrobe-contents">'+''.join(link('#'+region['id'],region['name']['or'],region['name']['en'])+' · ' for region in r['regions'])+link('#reba-study','ରେବାଙ୍କ ନୂଆ ଅଧ୍ୟୟନ','Reba’s new study')+'</nav>'
for region in r['regions']:
    body+='<section id="'+region['id']+'">'+bi(region['name'],'h2')+bi(region['observed'])+bi(region['direction'])
    for sid in region['sourceIds']:
        source=next(s for s in r['sources'] if s['id']==sid)
        body+=link(source['url'],source['title']['or'],source['title']['en'])+'<br>'
    body+='</section>'
study=r.get('study')
if study:
    study_dir=OUT/'regional-dress/assets';study_dir.mkdir(parents=True,exist_ok=True)
    for f in (ARCHIVE/'regional-dress').iterdir():
        if f.is_file():shutil.copy2(f,study_dir/f.name)
    study_section='<section id="reba-study">'+bi(study['title'],'h2')+image('/characters/regional-dress/assets/'+study['image'],study['caption']['or'],study['caption']['en'])+bi(study['note'])+link('https://artsandculture.google.com/asset/no-63-kotapad-drape-orissa-india/VAGXmouK4H2jeg','ପିନ୍ଧଣିର ସୂତ୍ର · Border&Fall','Drape reference · Border&Fall')+'</section>'
    body+=study_section
    for filename in ['koraput.html','design-path.html']:
        p=OUT/filename;s=BeautifulSoup(p.read_text(),'html.parser')
        for old in s.select('#reba-study'):old.decompose()
        s.main.append(BeautifulSoup(study_section,'html.parser'));p.write_text(str(s).rstrip()+'\n')
body+=image('/characters/assets/koraput-natural-v2.png','ପୂର୍ବ ଅଧ୍ୟୟନ: ବ୍ୟାଗ୍ ମରାମତି। ଚରିତ୍ରର ମୁହଁ ଓ କାମ ନୂଆ ପୋଷାକ ଅଧ୍ୟୟନରେ ରହିଛି।','Earlier study: repairing a bag. The character’s face and action continue in the new wardrobe study.')
body+=source_list(r['sources'])+bi(pair('ଏହି ଅଧ୍ୟୟନ ଏକ ଆରମ୍ଭ। ପ୍ରତି ଚରିତ୍ରର ପୋଷାକକୁ ମଡେଲ୍ ଚିତ୍ରରେ ଯାଞ୍ଚ କରିବା ବାକି।','This is an initial reference study. Character-by-character wardrobe checks on the model sheets remain to be completed.'))
shell('regional-dress',r['title'],body,'/characters/assets/koraput-natural-v2.png')

film_path=ROOT/'data/film-scripts-v1.json'
film_data=json.loads(film_path.read_text()) if film_path.exists() else {'scripts':[]}
runpy.run_path(str(ROOT/'scripts/character-film-pages.py'),init_globals=globals())

production=json.loads((ROOT/'data/character-production-v1.json').read_text())
body='<header>'+bi(pair('କାମର ପରବର୍ତ୍ତୀ ଧାପ','The next stages of the work'),'p','class="eyebrow"')+bi(production['title'],'h1')+bi(production['intro'])+'</header><section class="voice-refrain">'+bi(pair('ପ୍ରତି ପାଠ୍ୟ ପାଇଁ ଏହି କ୍ରମ','The cycle for each script'),'h2')+'<ol class="production-loop">'
for step in production['loop']:body+='<li>'+bi(step)+'</li>'
body+='</ol></section>'+bi(production['filmStatus'],'p','class="voice-boundary"')
target=sum(w.get('scriptTarget',0) for w in production['worlds'])
written_count=len(film_data['scripts']);board_count=sum(bool(s.get('storyboard')) for s in film_data['scripts'])
body+=bi(pair(f'ପାଠ୍ୟର ଖସଡ଼ା: {written_count} / {target}। ସମୟଧରା ଦୃଶ୍ୟନମୁନା: {board_count}। ସମ୍ପୂର୍ଣ୍ଣ ଚଳଚ୍ଚିତ୍ର: 0।',f'Script drafts: {written_count} of {target}. Timed storyboards: {board_count}. Completed films: 0.'),'p','class="production-count"')
body+='<section>'+link('/characters/regional-dress.html','ପ୍ରଥମେ ପୋଷାକ ଓ ଅଞ୍ଚଳର ଅଧ୍ୟୟନ →','Start with the clothing and regional references →')+'</section>'
for entry in production['worlds']:
    wid=entry['id'];ready=next((w for w in available if w['id']==wid),None)
    body+='<section id="'+wid+'">'+bi(entry['name'],'h2')+bi(entry['characters'],'p','class="eyebrow"')
    body+=bi(entry['status'])
    if (OUT/(wid+'.html')).exists():body+=link('/characters/'+wid+'.html','ଚରିତ୍ର ପରିଚୟ','Character profiles')+' · '
    if entry.get('wardrobe'):body+=link('/characters/regional-dress.html#'+entry['wardrobe'],'ପୋଷାକର ଦିଗ','Wardrobe direction')+' · '
    reader=f'/characters/{wid}/pilot-story/finished-page-v1.html' if ready else entry.get('reader')
    if reader:body+=link(reader,'ପ୍ରଥମ ଗପ','First story')
    if ready:body+='<p>'+link(f'/characters/{wid}/language-review/index.html','ଦୁଇ ଭାଷାର ପାଠ୍ୟ ଯାଞ୍ଚ','Review the paired dialogue')+'</p>'
    written=[script for script in film_data['scripts'] if script['world']==wid]
    if written:
        body+=bi(pair('ଚଳଚ୍ଚିତ୍ର ପାଠ୍ୟର ଖସଡ଼ା','Film-script drafts'),'h3')
        focused={}
        for script in written:
            key=script.get('focus',{}).get('id','all');focused.setdefault(key,[]).append(script)
        body+='<div class="voice-sections">'
        for key,items in focused.items():
            body+='<article>'
            if key!='all':body+=bi(items[0]['focus']['name'],'h4')
            body+='<ul>'
            for script in items:
                body+='<li>'+link('/characters/scripts/'+script['id']+'.html',script['title']['or'],script['title']['en'])
                if script.get('storyboard'):body+='<br>'+link(script['storyboard']['page'],'ସମୟଧରା ଦୃଶ୍ୟ →','Timed storyboard →')
                body+='</li>'
            body+='</ul></article>'
        body+='</div>'
        pack=OUT/'downloads'/(wid+'-film-scripts-v1.zip')
        if pack.exists():body+=link('/characters/downloads/'+pack.name,'ଏହି ଦଳର ସମସ୍ତ ପାଠ୍ୟ · ZIP','All scripts for this cast · ZIP','button secondary')
    body+='</section>'
shell('story-lab',production['title'],body,'/characters/koeli/assets/colour-study-v1.png')

# Keep the collection connected at every published milestone.
for filename in ['index.html','design-path.html','complete-report.html','sources.html']:
    p=OUT/filename;s=BeautifulSoup(p.read_text(),'html.parser')
    for el in s.select('#heritage-voices-addition'):el.decompose()
    extra='<section class="report-section voices-addition" id="heritage-voices-addition">'+bi(pair('ଗପ ଆଗକୁ ବଢ଼ୁଛି','The stories continue'),'h2')+'<div class="voice-sections">'
    for w in available:
        extra+='<article>'+bi(w['name'],'h3')+bi(w['intro'])+link('/characters/'+w['id']+'.html','ଚରିତ୍ର, ଗପ ଓ ସୃଜନ ଫାଇଲ୍ →','Characters, story and development files →')+'</article>'
    extra+='</div><p>'+link('/characters/regional-dress.html','ପୋଷାକ ଓ ଅଞ୍ଚଳ','Clothing and place')+' · '+link('/characters/story-lab.html','ପାଠ୍ୟରୁ ଚଳଚ୍ଚିତ୍ର','Scripts to films')+'</p></section>'
    s.main.append(BeautifulSoup(extra,'html.parser'));p.write_text(str(s).rstrip()+'\n')

# The full report carries the same profiles as the individual pages.
p=OUT/'complete-report.html';s=BeautifulSoup(p.read_text(),'html.parser')
for old in s.select('[data-voice-full]'):old.decompose()
for w in available:
    main=BeautifulSoup((OUT/(w['id']+'.html')).read_text(),'html.parser').main
    article=s.new_tag('article',attrs={'class':'full-set heritage-voice-set','data-voice-full':w['id']})
    for node in list(main.contents):article.append(node)
    for node in article.select('[id]'):node['id']=w['id']+'-'+node['id']
    for node in article.select('[id*="-character-"]'):node['class']=['heritage-profile']
    for node in article.select('h1'):node.name='h2'
    s.main.append(article)
guide=BeautifulSoup((OUT/'koeli.html').read_text(),'html.parser').main
article=s.new_tag('article',attrs={'class':'guide-character','data-voice-full':'koeli'})
for node in list(guide.contents):article.append(node)
for node in article.select('[id]'):node['id']='koeli-'+node['id']
for node in article.select('h1'):node.name='h2'
s.main.append(article);p.write_text(str(s).rstrip()+'\n')

p=OUT/'comparison.html';s=BeautifulSoup(p.read_text(),'html.parser')
for node in s.select('[data-voice-comparison]'):node.decompose()
for w in available:
    th=s.new_tag('th',scope='col',attrs={'data-voice-comparison':w['id']});th.append(BeautifulSoup(bi(w['name'],'span'),'html.parser'));s.select_one('thead tr').append(th)
    values=[w['kind'],pair('ପରିବାର ଓ କାରିଗରଙ୍କ ସମ୍ପର୍କ','Family and craftspeople') if w['id']=='dharmapada' else pair('ପ୍ରଶ୍ନକାରୀ ଓ କଥକ','Questioner and storyteller'),w['subtitle'],w['setting'],w['story']['title'],pair('ଡିଜିଟାଲ୍ ଚରିତ୍ର ଓ ଗଳ୍ପ ଅଧ୍ୟୟନ','Digital character and story studies'),pair('ଭାଷା ଓ ପୋଷାକ ଯାଞ୍ଚ; ପରବର୍ତ୍ତୀ ପାଠ୍ୟ','Language and wardrobe review; further scripts')]
    for row,v in zip(s.select('tbody tr'),values):
        td=s.new_tag('td',attrs={'data-voice-comparison':w['id']});td.append(BeautifulSoup(bi(v,'span'),'html.parser'));row.append(td)
s.main.append(BeautifulSoup('<p data-voice-comparison="guide">'+link('/characters/koeli.html','କୋଇଲି ସଂଗ୍ରହର ଗପ ସାଥୀ। ତାହା ଅଲଗା ନବମ ଗଳ୍ପଜଗତ ନୁହେଁ।','Koeli is the collection’s storytelling companion, separate from the story-world count.')+'</p>','html.parser'))
p.write_text(str(s).rstrip()+'\n')

koeli_pack=OUT/'downloads/koeli-development-v1.zip'
with zipfile.ZipFile(koeli_pack,'w',compression=zipfile.ZIP_DEFLATED) as z:
    files=[f for f in (ARCHIVE/'koeli').iterdir() if f.is_file()]
    for f in files:z.write(f,f.name)
    z.writestr('character-v1.json',json.dumps(DATA['koeli'],ensure_ascii=False,indent=2))
    for script in film_data['scripts']:
        if script['world']=='koeli':
            z.write(OUT/'downloads'/(script['id']+'-script-v1.txt'),'scripts/'+script['id']+'-v1.txt')
            z.writestr('scripts/'+script['id']+'-v1.json',json.dumps(script,ensure_ascii=False,indent=2))
            if script.get('storyboard'):
                board=script['storyboard'];src=ARCHIVE/board['archive'];prefix='storyboards/'+script['id']+'/'
                z.write(src/board['file'],prefix+board['file'])
                for name in board.get('draftFiles',[]):z.write(src/name,prefix+'earlier-drafts/'+name)
                for f in sorted(src.glob('storyboard-prompt-v*.txt')):z.write(f,prefix+f.name)
                for name in board.get('productionFiles',[]):z.write(src/name,prefix+'preparation/'+name)
    z.writestr('manifest-sha256.json',json.dumps({name:hashlib.sha256(z.read(name)).hexdigest() for name in z.namelist()},indent=2))

world_nav=[('gudul-gudli','ଗୁଡ଼ୁଲ୍–ଗୁଡ଼ଲି','Gudul–Gudli'),('nilu-chaiti','ନୀଳୁ–ଚଇତି','Nilu–Chaiti'),('koraput','କୋରାପୁଟ','Koraput'),('batare-katha','ବାଟରେ କଥା','Batare Katha'),('chhota-karigara','ଛୋଟ କାରିଗର','Young Makers'),('boita-sadhaba','ବୋଇତର ସାଥୀ','The Boita Crew')]+[(w['id'],w['name']['or'],w['name']['en']) for w in available]
nav=link('/characters/index.html','ପରିଚୟ','Overview')+'<details class="world-menu"><summary>'+bi(pair('ଚରିତ୍ରଦଳ','Worlds'),'span')+'</summary><div>'+''.join(link('/characters/'+wid+'.html',o,e) for wid,o,e in world_nav)+'</div></details>'+link('/characters/koeli.html','କୋଇଲି','Koeli')+link('/characters/story-lab.html','ଗପ ଓ ଚଳଚ୍ଚିତ୍ର','Scripts & films')+link('/characters/design-path.html','ଚିତ୍ରର ଯାତ୍ରା','Design path')
for p in OUT.rglob('*.html'):
    s=BeautifulSoup(p.read_text(),'html.parser')
    n=s.select_one('.site-header nav')
    if n:n.clear();n.append(BeautifulSoup(nav,'html.parser'))
    if not s.select_one('link[href="/characters/assets/voices.css"]'):
        s.head.append(s.new_tag('link',rel='stylesheet',href='/characters/assets/voices.css'))
    if s.select_one('.brand-mark'):s.select_one('.brand-mark').string=str(6+len(available))
    for old in s.select('.voice-journey'):old.decompose()
    journey='<aside class="voice-journey">'+link('/characters/index.html','ଚରିତ୍ରଙ୍କ ଜଗତ','Character worlds')+' · '+link('/characters/regional-dress.html','ପୋଷାକ ଓ ଅଞ୍ଚଳ','Clothing and place')+' · '+link('/characters/story-lab.html','ଗପରୁ ଚଳଚ୍ଚିତ୍ର','Stories to films')+'</aside>'
    if s.main:s.main.append(BeautifulSoup(journey,'html.parser'))
    elif s.body:s.body.append(BeautifulSoup(journey,'html.parser'))
    if p.name=='koeli.html':
        for old in s.select('[data-koeli-download]'):old.decompose()
        item=BeautifulSoup(link('/characters/downloads/koeli-development-v1.zip','କୋଇଲିର ସୃଜନ ଫାଇଲ୍ · ZIP','Koeli development files · ZIP'),'html.parser').a;item['data-koeli-download']='';s.main.append(item)
        item=BeautifulSoup('<p data-koeli-download="">'+link('/characters/story-lab.html#koeli','କୋଇଲିର ତିନିଟି ଚଳଚ୍ଚିତ୍ର ପାଠ୍ୟ →','Koeli’s three film-script drafts →')+'</p>','html.parser');s.main.append(item)
    # Only collection counts change: six-panel story references remain intact.
    count=6+len(available);english={6:'Six',7:'Seven',8:'Eight'}[count];odia={6:'ଛଅଟି',7:'ସାତଟି',8:'ଆଠଟି'}[count]
    total=22+sum(len(w['profiles']) for w in available)
    output=str(s)
    for old in ['Six','Seven','Eight']:
        for tail in [' Odisha Character Worlds',' worlds.',' distinct directions.']:
            output=output.replace(old+tail,english+tail)
        for tail in [' Odisha-connected character sets',' sets']:
            output=output.replace(old.lower()+tail,english.lower()+tail)
    for old in ['ଛଅଟି','ସାତଟି','ଆଠଟି']:
        for tail in [' ଜଗତ',' ଚରିତ୍ର',' ଦଳ',' ସ୍ୱତନ୍ତ୍ର']:
            output=output.replace(old+tail,odia+tail)
    output=re.sub(r'(?:21|22|24|27) characters\.',str(total)+' characters.',output)
    digits=str(total).translate(str.maketrans('0123456789','୦୧୨୩୪୫୬୭୮୯'))
    output=re.sub(r'(?:୨୧|୨୨|୨୪|୨୭)ଟି ଚରିତ୍ର।',digits+'ଟି ଚରିତ୍ର।',output)
    p.write_text(output.rstrip()+'\n')
