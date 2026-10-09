import fs from 'node:fs';
import path from 'node:path';
const root='public';
const dir=path.join(root,'art/writer-avatars');fs.mkdirSync(dir,{recursive:true});
// These are generic UI illustrations, never representations of an author's face.
for(const variant of ['neutral','male','female']){
 const hair=variant==='female'?'<path d="M29 53Q21 12 50 13Q80 12 73 62L62 66L36 65Z" fill="#40392e"/>':variant==='male'?'<path d="M28 39Q23 13 50 14Q77 13 74 41L65 32L33 36Z" fill="#40392e"/>':'<path d="M27 40Q21 24 32 22Q29 11 43 17Q53 7 60 19Q80 14 74 40Z" fill="#40392e"/>';
 const shirt=variant==='female'?'#af6459':variant==='male'?'#6b929e':'#789774';
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 110"><rect x="2" y="2" width="96" height="106" rx="22" fill="#f4e9cf"/><g stroke="#433d32" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${hair}<path d="M19 106V89Q21 70 41 70H60Q80 72 82 91V106" fill="${shirt}"/><path d="M42 63V76Q50 83 58 76V62" fill="#e9b88b"/><ellipse cx="29" cy="47" rx="5" ry="7" fill="#e9b88b"/><ellipse cx="71" cy="47" rx="5" ry="7" fill="#e9b88b"/><path d="M30 34Q50 41 69 29L70 51Q69 71 50 72Q31 71 30 51Z" fill="#efc79e"/><path d="M39 47h1m20 0h1M50 48l-2 8h4M42 61q8 5 16-1" fill="none"/><path d="M27 87l4 19m42-19-4 19" fill="none"/><path d="M36 82l14 9 15-10" fill="none"/></g></svg>`;
 fs.writeFileSync(path.join(dir,variant+'.svg'),svg);
}
const segmenter=new Intl.Segmenter('or',{granularity:'grapheme'});
const strip=name=>{let old;do{old=name;name=name.replace(/^(?:[;\s]+|ଡକ୍ଟର\s+|ଡଃ\.?\s*|ଅଧ୍ୟାପକ\s+|ଶ୍ରୀମତୀ\s+|ଶ୍ରୀ\s+|ପ୍ରଫେସର\s+)/u,'').trim();}while(name!==old);return name;};
const initial=name=>[...segmenter.segment(strip(name))].find(x=>/\p{L}/u.test(x.segment))?.segment||'✦';
const styleFor=name=>/(^|\s)ଶ୍ରୀମତୀ\s/u.test(name)?'female':/(^|\s)ଶ୍ରୀ\s/u.test(name)?'male':'neutral';
const escape=x=>x.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
function avatar(name){const variant=styleFor(name);return `<span class="writer-photo writer-avatar" role="img" aria-label="ସାଙ୍କେତିକ ଚିତ୍ର · ${escape(name)}"><img src="/art/writer-avatars/${variant}.svg" alt="" width="100" height="110" loading="lazy" decoding="async"><span class="writer-initial" aria-hidden="true" lang="or">${initial(name)}</span></span>`;}
const generated=/<span class="writer-photo writer-avatar"[\s\S]*?<\/span><\/span>/g;
const empty=/<span\b[^>]*class="writer-photo writer-photo-empty"[^>]*>\s*<\/span>/g;
const css='<link rel="stylesheet" href="/writer-avatars.css?v=1">';
const index=path.join(root,'shishu/writers.html');let html=fs.readFileSync(index,'utf8');let count=0;html=html.replace(generated,'<span class="writer-photo writer-photo-empty"></span>');
html=html.replace(/<li data-writer="([^"]+)"[\s\S]*?<\/li>/g,(card,name)=>card.replace(empty,()=>{count++;return avatar(name);}));
if(!html.includes('/writer-avatars.css'))html=html.replace('</head>',css+'</head>');
if(!html.includes('writer-avatar-note'))html=html.replace('<label class="mag-search">','<p class="writer-avatar-note">ଫଟୋ ନଥିଲେ ସାଙ୍କେତିକ ଚିତ୍ର ଓ ନାମର ପ୍ରଥମ ଅକ୍ଷର ଦିଆଯାଇଛି ।</p><label class="mag-search">');
fs.writeFileSync(index,html);
for(const file of fs.readdirSync(path.join(root,'shishu/writers'))){if(!file.endsWith('.html'))continue;const p=path.join(root,'shishu/writers',file);let text=fs.readFileSync(p,'utf8').replace(generated,'<span class="writer-photo writer-photo-empty"></span>');const name=text.match(/<h1[^>]*>([^<]+)<\/h1>/)?.[1];if(!name||!text.includes('writer-photo-empty'))continue;text=text.replace(empty,()=>avatar(name));if(!text.includes('/writer-avatars.css'))text=text.replace('</head>',css+'</head>');fs.writeFileSync(p,text);}
console.log(`Added ${count} generic directory avatars; verified photos retained. Gender variants use explicit source honorifics only.`);
