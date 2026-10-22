"""Paired scripts and honest, silent storyboard timing studies."""
from collections import defaultdict
import hashlib, zipfile, struct

def dialogue(lines):
    return ''.join('<p>'+bi(line['speaker'],'strong')+'<br>'+bi(line['text'],'span')+'</p>' for line in lines)

def scene_heading(i,start,end):
    return pair(f'ଦୃଶ୍ୟ {i} · {start}–{end} ସେକେଣ୍ଡ',f'Scene {i} · {start}–{end} seconds')

for script in film_data['scripts']:
    sid=script['id'];board=script.get('storyboard');focus=script.get('focus')
    appearance_only=script.get('appearanceOnly',False)
    reference_label=pair('ରୂପ ଓ ଚଳନର ସୂତ୍ର','Appearance and movement references') if appearance_only else pair('ପୋଷାକର ଅଧ୍ୟୟନ','Clothing references')
    visual_title=pair('ରୂପ ଓ ଚଳନ','Appearance and movement') if appearance_only else pair('ପୋଷାକ ଓ ଚଳନ','Clothing and movement')
    full_script_label=pair('ପୂରା ପାଠ୍ୟ ଓ ଚଳନର ନିର୍ଦ୍ଦେଶ','Full script and movement notes') if appearance_only else pair('ପୂରା ପାଠ୍ୟ ଓ ପୋଷାକର ନିର୍ଦ୍ଦେଶ','Full script and wardrobe notes')
    preview=script.get('preview','/characters/koeli/assets/colour-study-v1.png')
    body='<header>'+bi(pair('ଚଳଚ୍ଚିତ୍ର ପାଠ୍ୟ · ପ୍ରଥମ ଖସଡ଼ା','Film script · First draft'),'p','class="eyebrow"')+bi(script['title'],'h1')+bi(script['premise'])+'</header>'
    body+=bi(pair('ଲକ୍ଷ୍ୟ ସମୟ: '+str(script['duration'])+' ସେକେଣ୍ଡ। କଣ୍ଠ ରେକର୍ଡ ଓ ଚଳଚ୍ଚିତ୍ର ବାକି।','Target duration: '+str(script['duration'])+' seconds. Voice recording and film production remain ahead.'),'p','class="voice-boundary"')
    if focus:
        body+='<p>'+link(focus['profile'],focus['name']['or']+' · ଚରିତ୍ର ପରିଚୟ',focus['name']['en']+' · Character profile')+' · '+link(script['wardrobeLink'],reference_label['or'],reference_label['en'])+'</p>'
    if board:body+=link(board['page'],'ସମୟଧରା ଦୃଶ୍ୟନମୁନା ଦେଖନ୍ତୁ →','Play the timed storyboard →','button')
    txt=['ପରିକଳ୍ପନା ଓ ସୃଜନ ନିର୍ଦ୍ଦେଶନା: Ahimanikya Satapathy','Concept and creative direction: Ahimanikya Satapathy',script['title']['or']+' / '+script['title']['en'],'ଚଳଚ୍ଚିତ୍ର ପାଠ୍ୟର ପ୍ରଥମ ଖସଡ଼ା। ସମୟ ଏକ ଲକ୍ଷ୍ୟ; କଣ୍ଠ ରେକର୍ଡ ହୋଇନାହିଁ।','First film-script draft. Timing is a target, not a recorded performance.','ସ୍ୱାଧୀନ ଦକ୍ଷ ଓଡ଼ିଆ ଯାଞ୍ଚ ବାକି।','Independent fluent Odia review pending.','']
    metadata=[('setting',pair('ସ୍ଥାନ ଓ ସମୟ','Place and time')),('performance',pair('ଭାବର ପରିବର୍ତ୍ତନ','The performance turn')),('wardrobe',visual_title),('continuity',pair('ପ୍ରତି ଦୃଶ୍ୟରେ ମେଳ','Continuity between shots'))]
    if script.get('setting'):
        body+='<section class="script-context"><div class="voice-sections">'
        for key,label in metadata:
            if script.get(key):
                body+='<article>'+bi(label,'h2')+bi(script[key])+'</article>'
                txt += [label['or']+' / '+label['en'],script[key]['or'],script[key]['en'],'']
        body+='</div>'+ (link(script['referenceImage'],'ପୂର୍ବ ଚରିତ୍ର ଅଧ୍ୟୟନ','Earlier character study') if appearance_only else link(script['referenceImage'],'ଚରିତ୍ର ଓ ପୋଷାକର ପୂର୍ବ ଦୃଶ୍ୟ ଦେଖନ୍ତୁ','View the earlier character and clothing scene'))
        if script.get('wardrobeImage'):body+=' · '+link(script['wardrobeImage'],'କାମର ପୋଷାକର ନୂଆ ଅଧ୍ୟୟନ','New working-wardrobe study')
        body+='</section>'
    elapsed=0
    for i,scene in enumerate(script['scenes']):
        heading=scene_heading(i+1,elapsed,elapsed+scene['seconds'])
        body+='<section id="scene-'+str(i+1)+'">'+bi(heading,'h2')+bi(scene['action'])+bi(scene['sound'],'p','class="caption"')+dialogue(scene['lines'])+'</section>'
        txt += [heading['or']+' / '+heading['en'],scene['action']['or'],scene['action']['en'],'ଧ୍ୱନି / Sound: '+scene['sound']['or']+' / '+scene['sound']['en']]
        for line in scene['lines']:txt += [line['speaker']['or']+': '+line['text']['or'],line['speaker']['en']+': '+line['text']['en']]
        elapsed+=scene['seconds'];txt+=['']
    assert elapsed==script['duration'],sid
    filename=sid+'-script-v1.txt';(OUT/'downloads'/filename).write_text('\n'.join(txt)+'\n')
    body+=bi(REVIEW)+link('/characters/downloads/'+filename,'ଦୁଇ ଭାଷାର ପାଠ୍ୟ ଡାଉନଲୋଡ୍','Download the paired script','button secondary')+'<p>'+link('/characters/story-lab.html#'+script['world'],'← କାମର ତାଲିକା','← Production list')+'</p>'
    shell('scripts/'+sid,script['title'],body,preview)

    if board:
        dest=ROOT/'public'/board['sheet'].lstrip('/');dest.parent.mkdir(parents=True,exist_ok=True)
        shutil.copy2(ARCHIVE/board['archive']/board['file'],dest)
        # A 2x2 sheet and each of its frames share the same aspect ratio.
        with dest.open('rb') as sheet:
            header=sheet.read(24)
        assert header[:8]==b'\x89PNG\r\n\x1a\n',board['sheet']
        width,height=struct.unpack('>II',header[16:24])
        title=pair(script['title']['or']+' · ସମୟଧରା ଖସଡ଼ା',script['title']['en']+' · Timed storyboard')
        body='<header>'+bi(board.get('medium',pair('ପେନ୍‌ସିଲ୍ ଦୃଶ୍ୟ · ଗତିର ପରୀକ୍ଷା','Pencil frames · A pacing study')),'p','class="eyebrow"')+bi(script['title'],'h1')+bi(board['note'])+link('/characters/scripts/'+sid+'.html',full_script_label['or'],full_script_label['en'])+'</header>'
        first=script['scenes'][0]
        body+='<section class="storyboard-player" id="preview"><div class="storyboard-stage" role="img" aria-label="'+esc(first['action']['or'])+'" data-aria-label-or="'+esc(first['action']['or'])+'" data-aria-label-en="'+esc(first['action']['en'])+'" style="background-image:url('+board['sheet']+');background-position:0% 0%;aspect-ratio:'+str(width)+'/'+str(height)+'"></div>'
        body+='<div class="storyboard-controls" hidden>'+bi(pair('ଚଳାନ୍ତୁ','Play'),'button','type="button" data-player-play')+bi(pair('ପୂର୍ବ ଦୃଶ୍ୟ','Previous scene'),'button','type="button" data-player-previous')+bi(pair('ପର ଦୃଶ୍ୟ','Next scene'),'button','type="button" data-player-next')+'<label for="storyboard-time">'+bi(pair('ସମୟ','Time'),'span')+'</label><input id="storyboard-time" type="range" min="0" max="'+str(script['duration'])+'" step="0.1" value="0"><output for="storyboard-time" data-player-clock>0:00 / 0:'+str(script['duration'])+'</output></div>'
        body+='<div class="storyboard-caption"><p class="eyebrow" data-player-scene aria-live="polite">'+bi(scene_heading(1,0,first['seconds']),'span')+'</p>'+bi(pair('ସଂଳାପର ଖସଡ଼ା · କଣ୍ଠ ରେକର୍ଡ ନାହିଁ','Draft dialogue · No recorded voice'),'p','class="caption"')+'<div data-player-dialogue>'+dialogue(first['lines'])+'</div></div></section>'
        body+='<section id="all-frames">'+bi(pair('ଚାରିଟି ଦୃଶ୍ୟ ଏକାଠି','All four frames'),'h2')+image(board['sheet'],'ନିର୍ବାଚିତ ଦୃଶ୍ୟଖସଡ଼ା, ବାମରୁ ଡାହାଣକୁ, ତା’ପରେ ତଳ ଧାଡ଼ି।','Selected storyboard frames, read left to right, then the lower row.')+'</section>'
        development=board.get('development',pair('ପ୍ରଥମ ଚିତ୍ରରେ ଅତିରିକ୍ତ ହାତ ଥିଲା। ତାହା ସଂଶୋଧନ କରାଗଲା। ନୀଳୁର ସାର୍ଟର ବେକ ଓ ଚଇତିର ଟ୍ୟୁନିକ୍‌କୁ ପୂର୍ବ ମଡେଲ୍ ସହ ମେଳାଗଲା। ଏହି ଖସଡ଼ା ଅଭିନୟର ମୁହୂର୍ତ୍ତ ଯାଞ୍ଚ କରେ; ଚଳନ ଓ କଣ୍ଠ ଏବେ ବାକି।','The first drawing had an extra hand, which was corrected. Nilu’s neckline and Chaiti’s tunic were brought back into line with the character reference. This draft tests the acting beats; movement and voices remain to be made.'))
        body+='<section id="development">'+bi(pair('ଏହି ଧାପରେ କ’ଣ ବଦଳିଲା','What changed at this stage'),'h2')+bi(development)+link(script['referenceImage'],'ପୂର୍ବ ରଙ୍ଗୀନ ଚରିତ୍ର ଅଧ୍ୟୟନ','Earlier colour character study')+' · '+link('/characters/downloads/'+script['world']+'-film-scripts-v1.zip','ପାଠ୍ୟ ଓ ଦୃଶ୍ୟ ଫାଇଲ୍ · ZIP','Scripts and storyboard files · ZIP')+'</section>'+bi(REVIEW)
        payload=json.dumps({'duration':script['duration'],'scenes':script['scenes']},ensure_ascii=False).replace('</','<\\/')
        body+='<script type="application/json" id="storyboard-data">'+payload+'</script><script defer src="/characters/assets/storyboard-player.js"></script>'
        shell('films/'+sid+'/index',title,body,board['sheet'])

# Character profiles lead directly to the scripts written for that character.
groups=defaultdict(list)
for script in film_data['scripts']:
    if script.get('focus'):groups[script['world']].append(script)
for wid,written in groups.items():
    p=OUT/(wid+'.html');s=BeautifulSoup(p.read_text(),'html.parser')
    for label in s.select('[data-en="All six character worlds"]'):
        label['data-en']='All eight character worlds'
    for node in s.select('[data-film-profile]'):node.decompose()
    section='<section class="report-section" id="film-scripts" data-film-profile><header>'+bi(pair('ଚରିତ୍ରଙ୍କ ନିଜ ଛୋଟ ଗପ','Short stories led by each character'),'h2')+bi(pair('ପ୍ରତି ଚରିତ୍ର ପାଇଁ ତିନିଟି ଚଳଚ୍ଚିତ୍ର ପାଠ୍ୟର ପ୍ରଥମ ଖସଡ଼ା। ଓଡ଼ିଆ ଓ ଇଂରାଜୀରେ ପଢ଼ନ୍ତୁ।','Three first film-script drafts for each character, in Odia and English.'))+'</header><div class="voice-sections">'
    focus_groups=defaultdict(list)
    for script in written:focus_groups[script['focus']['id']].append(script)
    for focused in focus_groups.values():
        section+='<article>'+bi(focused[0]['focus']['name'],'h3')+'<ul>'
        links=''
        for script in focused:links+='<li>'+link('/characters/scripts/'+script['id']+'.html',script['title']['or'],script['title']['en'])+'</li>'
        section+=links+'</ul></article>'
        target=s.find(id=focused[0]['focus']['profile'].split('#')[-1])
        if target:target.append(BeautifulSoup('<div data-film-profile>'+bi(pair('ଏହି ଚରିତ୍ରର ନୂଆ ପାଠ୍ୟ','New scripts for this character'),'h4')+'<ul>'+links+'</ul></div>','html.parser'))
    section+='</div><p>'+link('/characters/story-lab.html#'+wid,'କାମର ସ୍ଥିତି ଓ ପରବର୍ତ୍ତୀ ଧାପ','Progress and next stages')+'</p></section>'
    s.main.append(BeautifulSoup(section,'html.parser'));p.write_text(str(s).rstrip()+'\n')
    # Source pack separates authored text from the image and carries exact prompts.
    with zipfile.ZipFile(OUT/'downloads'/(wid+'-film-scripts-v1.zip'),'w',compression=zipfile.ZIP_DEFLATED) as z:
        z.writestr('scripts-v1.json',json.dumps(written,ensure_ascii=False,indent=2)+'\n')
        for script in written:z.write(OUT/'downloads'/(script['id']+'-script-v1.txt'),'scripts/'+script['id']+'.txt')
        for script in written:
            if script.get('storyboard'):
                board=script['storyboard'];src=ARCHIVE/board['archive']
                z.write(src/board['file'],'storyboards/'+script['id']+'/'+board['file'])
                for name in board.get('draftFiles',[]):
                    z.write(src/name,'storyboards/'+script['id']+'/earlier-drafts/'+name)
                for f in sorted(src.glob('storyboard-prompt-v*.txt')):z.write(f,'storyboards/'+script['id']+'/'+f.name)
                for name in board.get('productionFiles',[]):z.write(src/name,'storyboards/'+script['id']+'/preparation/'+name)
        z.writestr('READ-ME.txt','ପରିକଳ୍ପନା ଓ ସୃଜନ ନିର୍ଦ୍ଦେଶନା: Ahimanikya Satapathy\nConcept and creative direction: Ahimanikya Satapathy\n\nଦ୍ୱିଭାଷୀ ଚଳଚ୍ଚିତ୍ର ପାଠ୍ୟର ପ୍ରଥମ ଖସଡ଼ା: '+str(len(written))+'। ପ୍ରତି ଚରିତ୍ର ପାଇଁ ତିନିଟି।\n'+str(len(written))+' first bilingual film-script drafts. Three per character.\n\nଦୃଶ୍ୟଖସଡ଼ାରେ ଚୟନିତ ସ୍ଥିର ଚିତ୍ର ଅଛି; ସମ୍ପୂର୍ଣ୍ଣ ଚଳଚ୍ଚିତ୍ର ବାକି।\nStoryboards are selected still frames, not completed films.\nସ୍ୱାଧୀନ ଦକ୍ଷ ଓଡ଼ିଆ ଓ ସାଂସ୍କୃତିକ ଯାଞ୍ଚ ବାକି। ସମୟ ପରିବର୍ତ୍ତନଯୋଗ୍ୟ।\nIndependent fluent Odia and cultural review pending. Timing is provisional.\nପୋଷାକର ଅଞ୍ଚଳୀୟ ସୂତ୍ର / Regional clothing sources: https://shishukishora.com/characters/regional-dress.html\n')
        z.writestr('manifest-sha256.json',json.dumps({name:hashlib.sha256(z.read(name)).hexdigest() for name in z.namelist()},indent=2))

# The design archive and overview expose every completed script batch.
boards=[s for s in film_data['scripts'] if s.get('storyboard')]
cast_names={w['id']:w['name'] for w in json.loads((ROOT/'data/character-production-v1.json').read_text())['worlds']}
for filename in ['index.html','design-path.html','complete-report.html']:
    p=OUT/filename;s=BeautifulSoup(p.read_text(),'html.parser')
    for old in s.select('#film-development-milestone'):old.decompose()
    section='<section class="report-section voices-addition" id="film-development-milestone">'+bi(pair('ପାଠ୍ୟରୁ ଦୃଶ୍ୟଖସଡ଼ା','From scripts to storyboards'),'h2')
    section+=bi(pair('ନୂଆ ପାଠ୍ୟରେ ପ୍ରତି ଚରିତ୍ରର ନିଜ ଭୂମିକା, ପୋଷାକ, ଚଳନ ଓ ଦୃଶ୍ୟର ମେଳ ସମ୍ପର୍କିତ ନିର୍ଦ୍ଦେଶ ଅଛି। ପାଠ୍ୟ, ସ୍ଥିର ଦୃଶ୍ୟ ଓ ସମ୍ପୂର୍ଣ୍ଣ ଚଳଚ୍ଚିତ୍ରର ସ୍ଥିତି ଅଲଗା।','The new scripts give each character a leading contribution, with clothing, movement and shot-continuity notes. Scripts, still storyboards and completed films are tracked separately.'))
    section+='<div class="voice-sections">'
    for wid,written in groups.items():
        section+='<article>'+bi(cast_names[wid],'h3')+bi(pair(f'ଦ୍ୱିଭାଷୀ ପାଠ୍ୟର ପ୍ରଥମ ଖସଡ଼ା: {len(written)}।',f'First bilingual script drafts: {len(written)}.'))
        for script in written:
            if script.get('storyboard'):section+='<p>'+link(script['storyboard']['page'],script['title']['or']+' · ସମୟଧରା ଦୃଶ୍ୟନମୁନା',script['title']['en']+' · Timed storyboard')+'</p>'
        section+='<p>'+link('/characters/story-lab.html#'+wid,'ସବୁ ପାଠ୍ୟ ପଢ଼ନ୍ତୁ','Read all the scripts')+' · '+link('/characters/downloads/'+wid+'-film-scripts-v1.zip','ପାଠ୍ୟ ଓ ଚିତ୍ର ଫାଇଲ୍ · ZIP','Scripts and artwork files · ZIP')+'</p></article>'
    section+='</div></section>'
    s.main.append(BeautifulSoup(section,'html.parser'));p.write_text(str(s).rstrip()+'\n')
