"""Paired scripts and honest, silent storyboard timing studies."""
from collections import defaultdict
import hashlib, zipfile

def dialogue(lines):
    return ''.join('<p>'+bi(line['speaker'],'strong')+'<br>'+bi(line['text'],'span')+'</p>' for line in lines)

def scene_heading(i,start,end):
    return pair(f'ଦୃଶ୍ୟ {i} · {start}–{end} ସେକେଣ୍ଡ',f'Scene {i} · {start}–{end} seconds')

for script in film_data['scripts']:
    sid=script['id'];board=script.get('storyboard');focus=script.get('focus')
    preview=script.get('preview','/characters/koeli/assets/colour-study-v1.png')
    body='<header>'+bi(pair('ଚଳଚ୍ଚିତ୍ର ପାଠ୍ୟ · ପ୍ରଥମ ଖସଡ଼ା','Film script · First draft'),'p','class="eyebrow"')+bi(script['title'],'h1')+bi(script['premise'])+'</header>'
    body+=bi(pair('ଲକ୍ଷ୍ୟ ସମୟ: '+str(script['duration'])+' ସେକେଣ୍ଡ। କଣ୍ଠ ରେକର୍ଡ ଓ ଚଳଚ୍ଚିତ୍ର ବାକି।','Target duration: '+str(script['duration'])+' seconds. Voice recording and film production remain ahead.'),'p','class="voice-boundary"')
    if focus:
        body+='<p>'+link(focus['profile'],focus['name']['or']+' · ଚରିତ୍ର ପରିଚୟ',focus['name']['en']+' · Character profile')+' · '+link(script['wardrobeLink'],'ପୋଷାକର ଅଧ୍ୟୟନ','Clothing references')+'</p>'
    if board:body+=link(board['page'],'ସମୟଧରା ଦୃଶ୍ୟନମୁନା ଦେଖନ୍ତୁ →','Play the timed storyboard →','button')
    txt=['Concept and creative direction: Ahimanikya Satapathy',script['title']['or']+' / '+script['title']['en'],'First film-script draft. Timing is a target, not a recorded performance.','Independent fluent Odia review pending.','']
    metadata=[('setting',pair('ସ୍ଥାନ ଓ ସମୟ','Place and time')),('performance',pair('ଭାବର ପରିବର୍ତ୍ତନ','The performance turn')),('wardrobe',pair('ପୋଷାକ ଓ ଚଳନ','Clothing and movement')),('continuity',pair('ପ୍ରତି ଦୃଶ୍ୟରେ ମେଳ','Continuity between shots'))]
    if script.get('setting'):
        body+='<section class="script-context"><div class="voice-sections">'
        for key,label in metadata:
            if script.get(key):
                body+='<article>'+bi(label,'h2')+bi(script[key])+'</article>'
                txt += [label['or']+' / '+label['en'],script[key]['or'],script[key]['en'],'']
        body+='</div>'+link(script['referenceImage'],'ନିର୍ବାଚିତ ଚରିତ୍ର ଓ ପୋଷାକ ଦେଖନ୍ତୁ','View the established character and clothing reference')+'</section>'
    elapsed=0
    for i,scene in enumerate(script['scenes']):
        heading=scene_heading(i+1,elapsed,elapsed+scene['seconds'])
        body+='<section id="scene-'+str(i+1)+'">'+bi(heading,'h2')+bi(scene['action'])+bi(scene['sound'],'p','class="caption"')+dialogue(scene['lines'])+'</section>'
        txt += [heading['or']+' / '+heading['en'],scene['action']['or'],scene['action']['en'],'Sound: '+scene['sound']['or']+' / '+scene['sound']['en']]
        for line in scene['lines']:txt += [line['speaker']['or']+': '+line['text']['or'],line['speaker']['en']+': '+line['text']['en']]
        elapsed+=scene['seconds'];txt+=['']
    assert elapsed==script['duration'],sid
    filename=sid+'-script-v1.txt';(OUT/'downloads'/filename).write_text('\n'.join(txt)+'\n')
    body+=bi(REVIEW)+link('/characters/downloads/'+filename,'ଦୁଇ ଭାଷାର ପାଠ୍ୟ ଡାଉନଲୋଡ୍','Download the paired script','button secondary')+'<p>'+link('/characters/story-lab.html#'+script['world'],'← କାମର ତାଲିକା','← Production list')+'</p>'
    shell('scripts/'+sid,script['title'],body,preview)

    if board:
        dest=ROOT/'public'/board['sheet'].lstrip('/');dest.parent.mkdir(parents=True,exist_ok=True)
        shutil.copy2(ARCHIVE/board['archive']/board['file'],dest)
        title=pair(script['title']['or']+' · ସମୟଧରା ଖସଡ଼ା',script['title']['en']+' · Timed storyboard')
        body='<header>'+bi(pair('ପେନ୍‌ସିଲ୍ ଦୃଶ୍ୟ · ଗତିର ପରୀକ୍ଷା','Pencil frames · A pacing study'),'p','class="eyebrow"')+bi(script['title'],'h1')+bi(board['note'])+link('/characters/scripts/'+sid+'.html','ପୂରା ପାଠ୍ୟ ଓ ପୋଷାକର ନିର୍ଦ୍ଦେଶ','Full script and wardrobe notes')+'</header>'
        first=script['scenes'][0]
        body+='<section class="storyboard-player" id="preview"><div class="storyboard-stage" role="img" aria-label="'+esc(first['action']['or'])+'" data-aria-label-or="'+esc(first['action']['or'])+'" data-aria-label-en="'+esc(first['action']['en'])+'" style="background-image:url('+board['sheet']+');background-position:0% 0%"></div>'
        body+='<div class="storyboard-controls" hidden>'+bi(pair('ଚଳାନ୍ତୁ','Play'),'button','type="button" data-player-play')+bi(pair('ପୂର୍ବ ଦୃଶ୍ୟ','Previous scene'),'button','type="button" data-player-previous')+bi(pair('ପର ଦୃଶ୍ୟ','Next scene'),'button','type="button" data-player-next')+'<label for="storyboard-time">'+bi(pair('ସମୟ','Time'),'span')+'</label><input id="storyboard-time" type="range" min="0" max="'+str(script['duration'])+'" step="0.1" value="0"><output for="storyboard-time" data-player-clock>0:00 / 0:'+str(script['duration'])+'</output></div>'
        body+='<div class="storyboard-caption"><p class="eyebrow" data-player-scene aria-live="polite">'+bi(scene_heading(1,0,first['seconds']),'span')+'</p>'+bi(pair('ସଂଳାପର ଖସଡ଼ା · କଣ୍ଠ ରେକର୍ଡ ନାହିଁ','Draft dialogue · No recorded voice'),'p','class="caption"')+'<div data-player-dialogue>'+dialogue(first['lines'])+'</div></div></section>'
        body+='<section id="all-frames">'+bi(pair('ଚାରିଟି ଦୃଶ୍ୟ ଏକାଠି','All four frames'),'h2')+image(board['sheet'],'ସଂଶୋଧିତ ପେନ୍‌ସିଲ୍ ଦୃଶ୍ୟ, ବାମରୁ ଡାହାଣକୁ, ତା’ପରେ ତଳ ଧାଡ଼ି।','Corrected pencil frames, read left to right, then the lower row.')+'</section>'
        body+='<section id="development">'+bi(pair('ଏହି ଧାପରେ କ’ଣ ବଦଳିଲା','What changed at this stage'),'h2')+bi(pair('ପ୍ରଥମ ଚିତ୍ରରେ ଅତିରିକ୍ତ ହାତ ଥିଲା। ତାହା ସଂଶୋଧନ କରାଗଲା। ନୀଳୁର ସାର୍ଟର ବେକ ଓ ଚଇତିର ଟ୍ୟୁନିକ୍‌କୁ ପୂର୍ବ ମଡେଲ୍ ସହ ମେଳାଗଲା। ଏହି ଖସଡ଼ା ଅଭିନୟର ମୁହୂର୍ତ୍ତ ଯାଞ୍ଚ କରେ; ଚଳନ ଓ କଣ୍ଠ ଏବେ ବାକି।','The first drawing had an extra hand, which was corrected. Nilu’s neckline and Chaiti’s tunic were brought back into line with the character reference. This draft tests the acting beats; movement and voices remain to be made.'))+link(script['referenceImage'],'ପୂର୍ବ ରଙ୍ଗୀନ ଚରିତ୍ର ଅଧ୍ୟୟନ','Earlier colour character study')+' · '+link('/characters/downloads/nilu-chaiti-film-scripts-v1.zip','ପାଠ୍ୟ ଓ ଦୃଶ୍ୟ ଫାଇଲ୍ · ZIP','Scripts and storyboard files · ZIP')+'</section>'+bi(REVIEW)
        payload=json.dumps({'duration':script['duration'],'scenes':script['scenes']},ensure_ascii=False).replace('</','<\\/')
        body+='<script type="application/json" id="storyboard-data">'+payload+'</script><script defer src="/characters/assets/storyboard-player.js"></script>'
        shell('films/'+sid+'/index',title,body,board['sheet'])

# Character profiles lead directly to the scripts written for that character.
groups=defaultdict(list)
for script in film_data['scripts']:
    if script.get('focus'):groups[script['world']].append(script)
for wid,written in groups.items():
    p=OUT/(wid+'.html');s=BeautifulSoup(p.read_text(),'html.parser')
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
                for f in sorted(src.glob('storyboard-prompt-v*.txt')):z.write(f,'storyboards/'+script['id']+'/'+f.name)
        z.writestr('READ-ME.txt','Concept and creative direction: Ahimanikya Satapathy\n\n'+str(len(written))+' first bilingual film-script drafts. Three per character.\nStoryboards are selected still frames, not completed films.\nIndependent fluent Odia and cultural review pending. Timing is provisional.\nRegional clothing sources: https://sishu.kabitawithoutborders.org/characters/regional-dress.html\n')
        z.writestr('manifest-sha256.json',json.dumps({name:hashlib.sha256(z.read(name)).hexdigest() for name in z.namelist()},indent=2))

# The design archive and overview expose the new artifacts, not only the plan.
boards=[s for s in film_data['scripts'] if s.get('storyboard')]
for filename in ['index.html','design-path.html','complete-report.html']:
    p=OUT/filename;s=BeautifulSoup(p.read_text(),'html.parser')
    for old in s.select('#film-development-milestone'):old.decompose()
    section='<section class="report-section voices-addition" id="film-development-milestone">'+bi(pair('ପାଠ୍ୟରୁ ପେନ୍‌ସିଲ୍ ଦୃଶ୍ୟ','From scripts to pencil frames'),'h2')
    section+=bi(pair('ନୀଳୁ–ଚଇତିର ଚାରି ଚରିତ୍ର ପାଇଁ ୧୨ଟି ନୂଆ ଦ୍ୱିଭାଷୀ ପାଠ୍ୟ। ପ୍ରତି ପାଠ୍ୟରେ ପୋଷାକ, ଚଳନ ଓ ଦୃଶ୍ୟର ମେଳ ସମ୍ପର୍କିତ ନିର୍ଦ୍ଦେଶ ଅଛି।','Twelve new bilingual scripts for Nilu–Chaiti’s four characters. Each script includes clothing, movement and shot-continuity notes.'))
    for script in boards:section+='<p>'+link(script['storyboard']['page'],script['title']['or']+' · ସମୟଧରା ଦୃଶ୍ୟନମୁନା',script['title']['en']+' · Timed storyboard')+'</p>'
    section+='<p>'+link('/characters/story-lab.html#nilu-chaiti','୧୨ଟି ପାଠ୍ୟ ପଢ଼ନ୍ତୁ','Read the twelve scripts')+' · '+link('/characters/downloads/nilu-chaiti-film-scripts-v1.zip','ପାଠ୍ୟ ଓ ଚିତ୍ର ଫାଇଲ୍ · ZIP','Scripts and artwork files · ZIP')+'</p></section>'
    s.main.append(BeautifulSoup(section,'html.parser'));p.write_text(str(s).rstrip()+'\n')
