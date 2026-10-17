"""Connect playable animated first cuts to scripts, character models and design records."""
import hashlib,zipfile
for cut in json.loads((ROOT/'data/character-film-cuts-v1.json').read_text())['cuts']:
    source=ARCHIVE/cut['archive']
    folder='/characters/films/'+cut['script']+'/'+Path(cut['page']).stem+'/'
    dest=ROOT/'public'/folder.lstrip('/');dest.mkdir(parents=True,exist_ok=True)
    for name in [cut['video'],cut['storyboard'],*cut['captions'].values()]:shutil.copy2(source/name,dest/name)
    shutil.copy2(source/cut['poster'],dest/'poster.png')
    video=folder+cut['video'];poster=folder+'poster.png'
    pack='/characters/downloads/'+cut['id']+'.zip'
    with zipfile.ZipFile(ROOT/'public'/pack.lstrip('/'),'w',compression=zipfile.ZIP_DEFLATED) as z:
        for name in cut['packFiles']:z.write(source/name,name)
        z.writestr('manifest-sha256.json',json.dumps({name:hashlib.sha256(z.read(name)).hexdigest() for name in z.namelist()},indent=2))
    body='<header>'+bi(cut.get('eyebrow',pair('ସଂଳାପ ବିନା ଛୋଟ ଗପ','A short wordless story')),'p','class="eyebrow"')+bi(cut['title'],'h1')+bi(cut['intro'])+'</header>'+bi(cut['boundary'],'p','class="voice-boundary"')
    body+='<section id="film-preview"><video class="motion-video" controls playsinline preload="metadata" width="1536" height="1024" poster="'+poster+'" aria-describedby="film-description"><source src="'+video+'" type="video/mp4">'
    for lang,label in [('or','ଓଡ଼ିଆ'),('en','English')]:
        body+='<track kind="captions" srclang="'+lang+'" label="'+label+'" src="'+folder+cut['captions'][lang]+'"'+(' default' if lang=='or' else '')+'>'
    body+=link(video,'ଭିଡିଓ ଖୋଲନ୍ତୁ','Open the video')+'</video>'+bi(cut['description'],'p','id="film-description"')
    body+=bi(cut.get('playerNote',pair('ନିଜେ ଚଳାନ୍ତୁ। CCରେ ଓଡ଼ିଆ ଓ ଇଂରାଜୀ ଶବ୍ଦ ବର୍ଣ୍ଣନା ବାଛନ୍ତୁ।','Press play. CC offers sound descriptions in Odia and English.')),'p','class="caption"')+'<p>'+link(video,'ଭିଡିଓ ଡାଉନଲୋଡ୍ · MP4','Download video · MP4','button secondary')+' '+link(pack,'ଚିତ୍ର, ଧ୍ୱନି ଓ ଚଳନ ଫାଇଲ୍ · ZIP','Artwork, sound and animation files · ZIP','button secondary')+'</p></section>'
    body+='<section id="development">'+bi(pair('ଚିତ୍ରରୁ ଚଳଚ୍ଚିତ୍ର','From drawings to film'),'h2')+bi(cut['development'])+image(folder+cut['storyboard'],cut.get('storyboardAlt',{}).get('or','ଚାରି ଦୃଶ୍ୟର ପ୍ରଥମ ରଙ୍ଗୀନ ଖସଡ଼ା।'),cut.get('storyboardAlt',{}).get('en','The first four-frame colour storyboard.'))+'<p>'+link('/characters/scripts/'+cut['script']+'.html','ଦୁଇ ଭାଷାର ପୂରା ପାଠ୍ୟ','Full bilingual script')+' · '+link(cut.get('profile','/characters/koraput.html#character-4'),cut.get('profileLabel',{}).get('or','ଚିକୁର ଚରିତ୍ର ଅଧ୍ୟୟନ'),cut.get('profileLabel',{}).get('en','Chiku’s character study'))+'</p></section>'
    if cut.get('previous'):
        body+='<p>'+link(cut['previous'],'ପୂର୍ବ ଖସଡ଼ା ଦେଖନ୍ତୁ','View the earlier cut')+'</p>'
    if cut.get('supersededBy'):
        body+='<p>'+link(cut['supersededBy'],'ନୂଆ ସଂଶୋଧିତ ଖସଡ଼ା ଦେଖନ୍ତୁ','Watch the revised cut','button')+'</p>'
    body+='<section>'+bi(pair('ପୋଷାକ ଓ ଦୈନନ୍ଦିନ ଜୀବନ','Clothes and daily life'),'h2')+bi(cut['clothing'])+link(cut.get('wardrobeLink','/characters/regional-dress.html#koraput'),cut.get('wardrobeLabel',{}).get('or','କୋରାପୁଟର ପୋଷାକ ସମ୍ପର୍କିତ ସୂତ୍ର'),cut.get('wardrobeLabel',{}).get('en','Koraput clothing references'))+'</section>'
    body+='<section>'+bi(cut.get('editionHeading',pair('ପରବର୍ତ୍ତୀ ସଂଶୋଧନ','Next refinement')),'h2')+bi(cut['remaining'])+bi(REVIEW)+'</section><script defer src="/characters/assets/motion-player.js"></script>'+journey
    shell(cut['page'].removeprefix('/characters/').removesuffix('.html'),cut['title'],body,poster)
    for filename in ['index.html','design-path.html','complete-report.html','story-lab.html',cut['world']+'.html','scripts/'+cut['script']+'.html','regional-dress.html']+cut.get('extraFeatures',[]):
        page=OUT/filename;s=BeautifulSoup(page.read_text(),'html.parser')
        for old in s.select('#'+cut['id']):old.decompose()
        if not cut.get('featured',True):
            page.write_text(str(s).rstrip()+'\n')
            continue
        feature='<section class="report-section voices-addition" id="'+cut['id']+'">'+bi(cut.get('featureTitle',pair('ଚିକୁର ପ୍ରଥମ ଚଳଚ୍ଚିତ୍ର ଖସଡ଼ା','Chiku’s first animated cut')),'h2')+bi(cut['intro'])+bi(cut['boundary'])+'<p>'+link(cut['page'],cut.get('watchLabel',{}).get('or','ଚିକୁର ଗପ ଦେଖନ୍ତୁ · ୫୦ ସେକେଣ୍ଡ →'),cut.get('watchLabel',{}).get('en','Watch Chiku’s story · 50 seconds →'),'button')+'</p></section>'
        s.main.append(BeautifulSoup(feature,'html.parser'))
        if filename=='scripts/'+cut['script']+'.html':
            note=s.select_one('.voice-boundary')
            if note:note.replace_with(BeautifulSoup(bi(cut['boundary'],'p','class="voice-boundary"'),'html.parser'))
        page.write_text(str(s).rstrip()+'\n')
