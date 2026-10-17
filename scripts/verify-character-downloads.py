"""Audit character downloads, including text hidden inside PDF/Word/ZIP files.

Run with Python plus pypdf; visual review is still required for lettering in images.
"""
from pathlib import Path
from zipfile import ZipFile
from io import BytesIO
from xml.etree import ElementTree
import hashlib,json,re
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[1]/'public/characters'
PATTERN=re.compile(r'\bAI[\s\-\u2010-\u2014]*(?:generated|assistant)\b|\bassistant (?:editorial pass|review)\b',re.I)
errors=[];counts={'pdfs':0,'docx':0,'zips':0,'texts':0,'indexedFiles':0}

def text_check(name,text):
    counts['texts']+=1
    if PATTERN.search(text):errors.append([name,'old production wording'])

def inspect(name,blob):
    suffix=Path(name).suffix.lower()
    if suffix=='.pdf':
        counts['pdfs']+=1
        doc=PdfReader(BytesIO(blob))
        for i,p in enumerate(doc.pages):text_check(f'{name}:page-{i+1}',p.extract_text())
        for attachment,contents in doc.attachments.items():
            for content in contents:
                if Path(attachment).suffix in ['.json','.txt','.md']:text_check(name+'!'+attachment,content.decode('utf8'))
    elif suffix=='.docx':
        counts['docx']+=1
        with ZipFile(BytesIO(blob)) as z:
            for n in z.namelist():
                if n.startswith('word/') and n.endswith('.xml'):
                    text_check(name+'!'+n,' '.join(ElementTree.fromstring(z.read(n)).itertext()))
    elif suffix=='.zip':
        counts['zips']+=1
        with ZipFile(BytesIO(blob)) as z:
            bad=z.testzip()
            if bad:errors.append([name,'damaged entry',bad])
            if 'file-index.json' in z.namelist():
                for item in json.loads(z.read('file-index.json')):
                    counts['indexedFiles']+=1
                    content=z.read(item['file'])
                    if len(content)!=item['bytes'] or hashlib.sha256(content).hexdigest()!=item['sha256']:errors.append([name,'index mismatch',item['file']])
            if 'manifest-sha256.json' in z.namelist():
                for entry,digest in json.loads(z.read('manifest-sha256.json')).items():
                    counts['indexedFiles']+=1
                    if hashlib.sha256(z.read(entry)).hexdigest()!=digest:errors.append([name,'manifest mismatch',entry])
            for entry in z.namelist():inspect(name+'!'+entry,z.read(entry))
    elif suffix in ['.txt','.md','.json','.html','.csv']:
        text_check(name,blob.decode('utf8'))

for path in sorted((ROOT/'downloads').iterdir()):
    if path.is_file():inspect(path.name,path.read_bytes())
result={**counts,'errors':errors}
print(json.dumps(result,indent=2,ensure_ascii=False))
raise SystemExit(bool(errors))
