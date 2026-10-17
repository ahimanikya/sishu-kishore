"""Publish rendered motion studies separately from completed narrative films."""
import hashlib
import zipfile

motion_data=json.loads((ROOT/'data/character-motion-v1.json').read_text())
for study in motion_data['studies']:
    source=ARCHIVE/study['archive']
    folder='/characters/films/'+study['script']+'/motion-v1/'
    dest=ROOT/'public'/folder.lstrip('/')
    dest.mkdir(parents=True,exist_ok=True)
    for name in [study['video'],*study['captions'].values()]:shutil.copy2(source/name,dest/name)
    shutil.copy2(source/study['poster'],dest/'poster.png')
    video=folder+study['video'];poster=folder+'poster.png'
    pack='/characters/downloads/'+study['id']+'.zip'
    with zipfile.ZipFile(ROOT/'public'/pack.lstrip('/'),'w',compression=zipfile.ZIP_DEFLATED) as z:
        for name in study['packFiles']:z.write(source/name,name)
        z.writestr('manifest-sha256.json',json.dumps({name:hashlib.sha256(z.read(name)).hexdigest() for name in z.namelist()},indent=2))
    body='<header>'+bi(pair('ଚଳନ ଓ ଧ୍ୱନି · ପ୍ରଥମ ପରୀକ୍ଷା','Movement and sound · First study'),'p','class="eyebrow"')+bi(study['title'],'h1')+bi(study['intro'])+'</header>'
    body+=bi(study['boundary'],'p','class="voice-boundary"')
    body+='<section id="motion-preview"><video class="motion-video" controls playsinline preload="metadata" width="1536" height="1024" poster="'+poster+'" aria-describedby="motion-description">'
    body+='<source src="'+video+'" type="video/mp4">'
    for lang,label in [('or','ଓଡ଼ିଆ'),('en','English')]:
        body+='<track kind="captions" srclang="'+lang+'" label="'+label+'" src="'+folder+study['captions'][lang]+'"'+(' default' if lang=='or' else '')+'>'
    body+=link(video,'ଭିଡିଓ ଖୋଲନ୍ତୁ','Open the video')+'</video>'+bi(study['description'],'p','id="motion-description"')
    body+=bi(study.get('playerNote',pair('ନିଜେ ଚଳାନ୍ତୁ। ଛୋଟ ଟପ୍ ଶବ୍ଦ ଅଛି; ସଂଳାପ ନାହିଁ। CCରେ ଦୁଇ ଭାଷାର ଶବ୍ଦ ବର୍ଣ୍ଣନା ଅଛି।','Press play to watch. There are quiet tapping sounds and no dialogue. CC offers sound descriptions in both languages.')),'p','class="caption"')
    body+='<p>'+link(video,'ଭିଡିଓ ଡାଉନଲୋଡ୍ · MP4','Download the video · MP4','button secondary')+' '+link(pack,'ଚିତ୍ର, ଧ୍ୱନି ଓ ଚଳନ ଫାଇଲ୍ · ZIP','Artwork, sound and motion files · ZIP','button secondary')+'</p></section>'
    body+='<section>'+bi(pair('ଚିତ୍ରରୁ ଚଳନ','From drawings to movement'),'h2')+bi(study['development'])+'<p>'+link('/characters/films/'+study['script']+'/index.html','ପୂର୍ବ ଚାରି ଦୃଶ୍ୟର ଖସଡ଼ା','Earlier four-frame storyboard')+' · '+link('/characters/scripts/'+study['script']+'.html','ପୂରା ଦ୍ୱିଭାଷୀ ପାଠ୍ୟ','Full bilingual script')+'</p></section>'
    if study.get('wardrobe'):
        body+='<section>'+bi(pair('ପୋଷାକ ଓ ଦୈନନ୍ଦିନ ଜୀବନ','Clothes and daily life'),'h2')+bi(study['wardrobe'])+'<p>'+link(study['wardrobeLink'],'ପୋଷାକର ଅଞ୍ଚଳୀୟ ସୂତ୍ର','Regional clothing references')+' · '+link(study['profile'],'ଚରିତ୍ର ଅଧ୍ୟୟନ','Character study')+'</p></section>'
    body+='<section>'+bi(pair('ପରବର୍ତ୍ତୀ କାମ','Next work'),'h2')+bi(study['remaining'])+bi(REVIEW)+'</section><script defer src="/characters/assets/motion-player.js"></script>'
    body+=journey
    shell(study['page'].removeprefix('/characters/').removesuffix('.html'),study['title'],body,poster)

    # Keep the new rendered artifact reachable through every existing path.
    targets=['index.html','design-path.html','complete-report.html','story-lab.html',study['world']+'.html','scripts/'+study['script']+'.html','films/'+study['script']+'/index.html']
    if study.get('wardrobeLink'):targets.append('regional-dress.html')
    for filename in targets:
        page=OUT/filename;s=BeautifulSoup(page.read_text(),'html.parser')
        for old in s.select('#'+study['id']):old.decompose()
        feature='<section class="report-section voices-addition motion-milestone" id="'+study['id']+'">'+bi(study.get('featureTitle',pair('ପ୍ରଥମ ଚଳନର ନମୁନା','First motion study')),'h2')
        watch=study.get('watchLabel',pair('କୋଇଲିର ଚଳନ ଦେଖନ୍ତୁ · ୮ ସେକେଣ୍ଡ →','Watch Koeli move · 8 seconds →'))
        feature+=bi(study['intro'])+bi(study['boundary'])+'<p>'+link(study['page'],watch['or'],watch['en'],'button')+'</p></section>'
        s.main.append(BeautifulSoup(feature,'html.parser'));page.write_text(str(s).rstrip()+'\n')
