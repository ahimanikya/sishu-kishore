import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const cfg=JSON.parse(fs.readFileSync('scripts/site.json','utf8')),root=path.resolve('public');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const registry='provenance/published.json',old=fs.existsSync(registry)?JSON.parse(fs.readFileSync(registry,'utf8')):{files:[],targets:[]};
const start='<!-- approved-publications:start -->',end='<!-- approved-publications:end -->';
const safe=p=>{if(typeof p!=='string'||!p.startsWith(cfg.prefix+'/')||p.includes('..')||!p.endsWith('.html'))throw Error('Invalid publication route');return path.join(root,p);};
const {fetchPublished}=await import('./lib/publications-feed.mjs');
let records=process.env.NODE_ENV==='test' && process.env.PUBLICATIONS_FIXTURE?JSON.parse(fs.readFileSync(process.env.PUBLICATIONS_FIXTURE,'utf8')):await fetchPublished({projectId:cfg.projectId});
records=records.filter(d=>d.state==='published').sort((a,b)=>a.id.localeCompare(b.id));
const activeRoutes=new Set(records.filter(d=>d.kind!=='comment').map(d=>`${cfg.prefix}/published/${d.id}.html`));
records=records.filter(d=>d.kind!=='comment'||!d.page.startsWith(cfg.prefix+'/published/')||activeRoutes.has(d.page));
records.sort((a,b)=>(a.kind==='comment')-(b.kind==='comment')||a.id.localeCompare(b.id));
const allowed=new Set(['id','kind','title','body','byline','issue','page','image','state','publishedAt']);
for(const d of records){if(!/^[a-zA-Z0-9]{20}$/.test(d.id)||!['article','book','comment'].includes(d.kind)||Object.keys(d).some(k=>!allowed.has(k)))throw Error('Invalid public record');if(!d.title||!d.body||!d.byline||d.body.length>60000||!/^\/(art|media|social)\/[a-zA-Z0-9_./-]+$/.test(d.image)||d.image.includes('..')||!fs.existsSync(path.join(root,d.image)))throw Error('Invalid content or missing artwork');if(!fs.existsSync(safe(d.kind==='comment'?d.page:d.issue))&&!activeRoutes.has(d.page))throw Error('Missing destination; preserving existing output.');}
const catalogPath=path.join(root,'edition-reader.json');
const catalog=fs.existsSync(catalogPath)?JSON.parse(fs.readFileSync(catalogPath,'utf8')):{};
for(const edition of Object.values(catalog))edition.items=edition.items.filter(item=>!item.href.startsWith(cfg.prefix+'/published/'));
for(const d of records)if(d.kind==='article'&&!catalog[d.issue])throw Error('Article issue is missing from reader catalog');
const fingerprint=crypto.createHash('sha256').update(JSON.stringify({version:2,records})).digest('hex');if(old.fingerprint===fingerprint){console.log('Approved publications unchanged.');process.exit(0);}
// Validation finishes before touching previously published files.
for(const p of old.targets){const f=safe(p);if(fs.existsSync(f)){const s=fs.readFileSync(f,'utf8');fs.writeFileSync(f,s.replace(/<!-- approved-publications:start -->[\s\S]*?<!-- approved-publications:end -->/g,''));}}
for(const p of old.files){const f=safe(p);if(p.includes('/published/')||p.includes('/writers/published-'))fs.rmSync(f,{force:true});}
const manifest=fs.existsSync('provenance/social-previews.json')?JSON.parse(fs.readFileSync('provenance/social-previews.json','utf8')):[];
const socialFor=src=>manifest.find(x=>x.source===src)?.image||manifest.find(x=>x.source===cfg.fallback)?.image||src;
const home=fs.readFileSync(path.join(root,cfg.prefix,'index.html'),'utf8');const header=home.match(/<header\b[^>]*>[\s\S]*?<\/header>/)?.[0]||'';
const footer=home.match(/<footer\b[^>]*>[\s\S]*?<\/footer>/)?.[0]||'';
const styles=[...home.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>|<link\b[^>]*href="[^"]+\.css[^>]*>/g)].map(m=>m[0]).join('');
const files=[],targets=new Map();
const readingStyles=['edition-reader','article-sidebar','reader-entry','magazine-paper','reader-switcher','article-tools','story-wash'].map(name=>`<link rel="stylesheet" href="/${name}.css">`).join('');
const readingScripts=['story-wash','reader-switcher','reader-return','article-tools','page-sounds','page-turn','edition-reader','kid-ux'].map(name=>`<script defer src="/${name}.js?v=release-v2"></script>`).join('');
function render(route,title,content,img=cfg.fallback,issue=null){const share=cfg.origin+socialFor(img),url=cfg.origin+route;return `<!doctype html><html lang="or"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} · ${esc(cfg.name)}</title>${readingStyles}${styles}<link rel="canonical" href="${esc(url)}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(title+' · '+cfg.name)}"><meta property="og:type" content="article"><meta property="og:url" content="${esc(url)}"><meta property="og:image" content="${esc(share)}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${esc(share)}"><link rel="stylesheet" href="/share.css"></head><body class="${cfg.prefix==='/shalandi'?'shalandi':'shishu'} ia-site"${issue?` data-reading-issue="${esc(issue)}" data-reader-article="true"`:''}>${header}<main class="ia-main ia-reading" id="main">${content}</main>${footer}${issue?readingScripts:''}<script defer src="/share.js?v=release-v2"></script><script defer src="/services.js?v=firebase-v1"></script></body></html>`;}
function save(route,html){const f=safe(route);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,html);files.push(route);}
function append(route,html){if(!fs.existsSync(safe(route)))throw Error('Missing publication destination '+route);targets.set(route,(targets.get(route)||'')+html);}
const choices=JSON.parse(fs.readFileSync('public/editorial/choices.json','utf8'));
const knownWriters=choices.writers||{};
const writers=new Map(),cards=[];
for(const d of records){if(d.kind==='comment'){append(d.page,`<li class="ia-comments"><h3>${esc(d.byline)}</h3><p style="white-space:pre-wrap">${esc(d.body)}</p></li>`);continue;}
 const route=`${cfg.prefix}/published/${d.id}.html`;const normalized=d.byline.normalize('NFC').trim();const writer=knownWriters[normalized]||`${cfg.prefix}/writers/published-${crypto.createHash('sha256').update(normalized).digest('hex').slice(0,12)}.html`;
 const card=`<li><a href="${route}">${esc(d.title)}</a> — ${esc(d.byline)}</li>`;cards.push(card);append(d.issue,card);
 const author=cfg.prefix==='/shishu'?`<a href="${writer}">${esc(d.byline)}</a>`:esc(d.byline);
 const paragraphs=d.body.split(/\n\s*\n/).map(part=>`<p style="white-space:pre-wrap">${esc(part)}</p>`).join('');
 const previous=catalog[d.issue]?.items.at(-1);
 const navigation=`<nav class="mag-web-reading" aria-label="ଲେଖା ପଢ଼ିବା ପଥ">${previous?`<a href="${esc(previous.href)}">← ପୂର୍ବ ଲେଖା</a>`:''}<a href="${esc(d.issue)}">ସୂଚୀପତ୍ର</a></nav>`;
 const text=`<nav class="ia-breadcrumb"><a href="${esc(d.issue)}">← ${esc(catalog[d.issue]?.title||cfg.name)}</a></nav><article class="ia-article"><header class="ia-article-head"><h1>${esc(d.title)}</h1><p class="ia-byline">${author}</p><p class="mag-article-context"><a href="${esc(d.issue)}">${esc(catalog[d.issue]?.title||cfg.name)}</a></p><button class="mag-read-button" data-quiet-reader>ରିଡର୍‌ରେ ପଢ଼ନ୍ତୁ ↗</button></header><figure class="ia-story-art"><img src="${esc(d.image)}" alt="${esc(d.title)}" width="1200" height="800" fetchpriority="high"></figure><div class="ia-prose">${paragraphs}</div></article>${navigation}`;
 save(route,render(route,d.title,text,d.image,d.kind==='article'?d.issue:null));
 if(d.kind==='article')catalog[d.issue].items.push({href:route,title:d.title,byline:d.byline});
 if(cfg.prefix==='/shishu'){const authorInfo=writers.get(writer)||{name:d.byline,cards:[]};authorInfo.cards.push(card);writers.set(writer,authorInfo);}}
// Complete previous/next navigation after every article is in the issue catalog.
for(const [issueRoute,edition] of Object.entries(catalog))for(let i=0;i<edition.items.length;i++){
 const item=edition.items[i];if(!files.includes(item.href))continue;
 const next=edition.items[i+1];
 const sidebar=`<section class="mag-article-sidebar"><nav aria-label="ଏହି ସଂଖ୍ୟାରେ"><h2>ଏହି ସଂଖ୍ୟାରେ</h2><ol>${edition.items.slice(0,5).map(entry=>`<li><a href="${esc(entry.href)}"${entry.href===item.href?' aria-current="page"':''}><span class="mag-toc-title">${esc(entry.title)}</span><small>${esc(entry.byline)}</small></a></li>`).join('')}</ol><a class="mag-toc-all" href="${esc(issueRoute)}#edition-contents">ଏହି ସଂଖ୍ୟାର ସବୁ ଲେଖା →</a></nav></section>`;
 const articlePath=safe(item.href);fs.writeFileSync(articlePath,fs.readFileSync(articlePath,'utf8').replace('</figure>',sidebar+'</figure>'));
 if(!next)continue;
 const f=safe(item.href);fs.writeFileSync(f,fs.readFileSync(f,'utf8').replace(/(<nav class="mag-web-reading"[^>]*>[\s\S]*?)(<\/nav>)/,`$1<a href="${esc(next.href)}">ପର ଲେଖା →</a>$2`));
}
if(fs.existsSync(catalogPath))fs.writeFileSync(catalogPath,JSON.stringify(catalog)+'\n');

for(const [route,w]of writers){if(Object.values(knownWriters).includes(route)){append(route,w.cards.join(''));}else{save(route,render(route,w.name,`<h1>${esc(w.name)}</h1><ul>${w.cards.join('')}</ul>`));append('/shishu/writers.html',`<li><a href="${route}">${esc(w.name)}</a></li>`);}}
if(cards.length){const route=cfg.prefix+'/published/index.html';save(route,render(route,'Published writing',`<h1>Published writing</h1><ul>${cards.join('')}</ul>`));append(cfg.prefix+'/index.html',`<li><a href="${route}">Published writing →</a></li>`);}
for(const [route,html]of targets){const f=safe(route),s=fs.readFileSync(f,'utf8');fs.writeFileSync(f,s.replace('</main>',`${start}<section class="ia-published"><ul>${html}</ul></section>${end}</main>`));}
fs.writeFileSync(registry,JSON.stringify({fingerprint,files,targets:[...targets.keys()]},null,2)+'\n');console.log(`Published ${records.length} approved items; private submissions never fetched.`);
