"""Apply approved editorial credit and remove production-role labels from public copy."""
from pathlib import Path
from bs4 import BeautifulSoup
from html import escape

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'public/characters'
CREDIT_EN = 'Concept and creative direction: Ahimanikya Satapathy'
CREDIT_OR = 'ପରିକଳ୍ପନା ଓ ସୃଜନ ନିର୍ଦ୍ଦେଶନା: Ahimanikya Satapathy'
PROCESS = [
    ('Our characters begin with conversations about people, places, memories and the stories children might enjoy. We research relevant cultural references, explore character sketches and visual studies, and develop personalities through small, believable actions.',
     'ଲୋକ, ସ୍ଥାନ, ସ୍ମୃତି ଓ ପିଲାଙ୍କୁ ଭଲ ଲାଗିପାରୁଥିବା ଗପକୁ ନେଇ ଆଲୋଚନାରୁ ଆମ ଚରିତ୍ରମାନଙ୍କ ଆରମ୍ଭ। ଆମେ ପ୍ରାସଙ୍ଗିକ ସାଂସ୍କୃତିକ ଉତ୍ସ ପଢ଼ୁ, ଚରିତ୍ରର ଖସଡ଼ା ଓ ଚିତ୍ର ଅଧ୍ୟୟନ କରୁ। ଛୋଟ, ବିଶ୍ୱାସଯୋଗ୍ୟ କାମ ମାଧ୍ୟମରେ ସେମାନଙ୍କ ସ୍ୱଭାବ ଗଢ଼ିଉଠେ।'),
    ('We follow a Human Natural approach: expressive characters, everyday details and a restrained sense of place. Odisha emerges through language, relationships, clothing and lived experiences.',
     'ଆମେ ଚିତ୍ରରେ ସ୍ୱାଭାବିକତାକୁ ଗୁରୁତ୍ୱ ଦେଉ: ଭାବପୂର୍ଣ୍ଣ ଚରିତ୍ର, ଦୈନନ୍ଦିନ ଜୀବନର ଛୋଟ କଥା ଓ ସଂଯତ ପରିବେଶ। ଭାଷା, ସମ୍ପର୍କ, ପୋଷାକ ଓ ଜୀବନର ଅନୁଭବ ଭିତରେ ଓଡ଼ିଶା ଦେଖାଯାଏ।'),
    ('Each story moves from an idea to a script, storyboard, refined illustration and readable page. Odia leads, with English versions developed alongside it. Earlier studies and revisions remain available so readers can follow how the work evolved.',
     'ପ୍ରତି ଗଳ୍ପ ଭାବନାରୁ ପାଠ୍ୟ, ଦୃଶ୍ୟଖସଡ଼ା, ସଂଶୋଧିତ ଚିତ୍ର ଓ ପାଠଯୋଗ୍ୟ ପୃଷ୍ଠା ଯାଏ ଆଗେଇଯାଏ। ଓଡ଼ିଆ ଆଗରେ ରହେ; ତା’ ସହ ଇଂରାଜୀ ସଂସ୍କରଣ ମଧ୍ୟ ତିଆରି ହୁଏ। କାମ କିପରି ବଦଳିଲା ଦେଖିବା ପାଇଁ ପୂର୍ବ ଅଧ୍ୟୟନ ଓ ସଂଶୋଧନଗୁଡ଼ିକ ସଂରକ୍ଷିତ ରହେ।')
]
REPLACEMENTS = {
    'an assistant editorial pass': 'an initial editorial pass',
    'The current assistant review': 'The initial text comparison',
    'in assistant review': 'in the initial text check',
    'All 15 paired entries were compared by the same assistant.': 'All 15 paired entries have been compared in the initial text check.',
    'Assistant comparison is complete': 'Initial text comparison is complete',
    'Assistant visual and bilingual comparison completed': 'Initial visual and bilingual comparison completed',
    'Same-assistant language and visual review': 'Initial language and visual review',
    'same-assistant bilingual review': 'initial bilingual comparison',
    'ସହାୟକର ସମ୍ପାଦନା ପରେ': 'ପ୍ରଥମ ସମ୍ପାଦନା ପରେ',
    'ସହାୟକର ଯାଞ୍ଚରେ': 'ପ୍ରଥମ ପାଠ ଯାଞ୍ଚରେ',
    'ସହାୟକ ଯାଞ୍ଚରେ': 'ପ୍ରଥମ ଯାଞ୍ଚରେ',
    'ସହାୟକର ତୁଳନା ସମ୍ପୂର୍ଣ୍ଣ': 'ପ୍ରଥମ ପାଠ ତୁଳନା ସମ୍ପୂର୍ଣ୍ଣ',
    '୧୫ ଯୋଡ଼ା ପାଠ ଏକା ସହାୟକ ମିଳାଇଛି।': 'ପ୍ରଥମ ପାଠ ଯାଞ୍ଚରେ ୧୫ ଯୋଡ଼ା ପାଠ ମିଳାଯାଇଛି।',
}

def clean_text(text):
    for before, after in REPLACEMENTS.items():
        text = text.replace(before, after)
    return text

def bi(en, odia, tag='p', extra=''):
    return f'<{tag} data-en="{escape(en, quote=True)}" data-or="{escape(odia, quote=True)}" {extra}>{escape(odia)}</{tag}>'

def apply():
    for file in PUBLIC.rglob('*'):
        if file.suffix not in {'.html', '.json', '.txt', '.md'}:
            continue
        old = file.read_text()
        text = clean_text(old)
        if file.suffix == '.html':
            soup = BeautifulSoup(text, 'html.parser')
            for node in soup.select('[data-character-credit],#creative-process'):
                node.decompose()
            footer = soup.select_one('footer')
            if footer is None:
                footer = soup.new_tag('footer', attrs={'class':'character-credit-footer'})
                soup.body.append(footer)
            footer.append(BeautifulSoup(bi(CREDIT_EN, CREDIT_OR, extra='class="character-credit" data-character-credit'), 'html.parser'))
            if file.name in {'index.html', 'complete-report.html'} and file.parent == PUBLIC:
                section = '<section id="creative-process" class="report-section creative-process">'
                section += bi('How we develop the characters', 'ଚରିତ୍ରମାନଙ୍କୁ ଆମେ କିପରି ଗଢ଼ୁ', 'h2')
                section += bi(CREDIT_EN, CREDIT_OR, extra='class="credit-lead"')
                section += ''.join(bi(e,o) for e,o in PROCESS) + '</section>'
                soup.main.append(BeautifulSoup(section, 'html.parser'))
            text = str(soup) + '\n'
        if text != old:
            file.write_text(text)
    css = PUBLIC/'assets/heritage.css'
    style = '\n/* Approved creative credit */\n.character-credit{font-size:.9rem;line-height:1.7;margin-top:1.5rem}.character-credit-footer{max-width:1152px;margin:2rem auto;padding:1rem 24px;border-top:1px solid #d8d6ca}.creative-process{max-width:920px;margin:4rem auto;padding:2rem 24px;border-top:1px solid #d8d6ca}.creative-process p{line-height:1.85}.credit-lead{font-weight:650}\n'
    if '/* Approved creative credit */' not in css.read_text():
        css.write_text(css.read_text()+style)
    print('Applied approved bilingual credit and process note; editorial-role labels cleaned.')

if __name__ == '__main__':
    apply()
