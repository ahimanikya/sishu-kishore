import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const cfg=JSON.parse(fs.readFileSync('scripts/site.json','utf8')),root=path.resolve('public');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const registry='provenance/published.json',old=fs.existsSync(registry)?JSON.parse(fs.readFileSync(registry,'utf8')):{files:[],targets:[]};
const start='<!-- approved-publications:start -->',end='<!-- approved-publications:end -->';
const safe=p=>{if(typeof p!=='string'||!p.startsWith(cfg.prefix+'/')||p.includes('..')||!p.endsWith('.html'))throw Error('Invalid publication route');return path.join(root,p);};
function decode(v){return v.stringValue??v.timestampValue??'';}
let records=[],pageToken='';
if(process.env.NODE_ENV==='test' && process.env.PUBLICATIONS_FIXTURE){records=JSON.parse(fs.readFileSync(process.env.PUBLICATIONS_FIXTURE,'utf8'));}else do{const url=new URL(`https://firestore.googleapis.com/v1/projects/${cfg.projectId}/databases/(default)/documents/publications`);url.searchParams.set('pageSize','1000');if(pageToken)url.searchParams.set('pageToken',pageToken);const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(`Publication fetch failed (${r.status}); preserving existing output.`);const data=await r.json();records.push(...(data.documents||[]).map(d=>({id:d.name.split('/').pop(),...Object.fromEntries(Object.entries(d.fields||{}).map(([k,v])=>[k,decode(v)]))})));pageToken=data.nextPageToken||'';}while(pageToken);
records=records.filter(d=>d.state==='published').sort((a,b)=>a.id.localeCompare(b.id));
const allowed=new Set(['id','kind','title','body','byline','issue','page','image','state','publishedAt']);
for(const d of records){if(!/^[a-zA-Z0-9]{20}$/.test(d.id)||!['article','book','comment'].includes(d.kind)||Object.keys(d).some(k=>!allowed.has(k)))throw Error('Invalid public record');if(!d.title||!d.body||!d.byline||d.body.length>60000||!/^\/(art|media|social)\/[a-zA-Z0-9_./-]+$/.test(d.image)||d.image.includes('..')||!fs.existsSync(path.join(root,d.image)))throw Error('Invalid content or missing artwork');if(!fs.existsSync(safe(d.kind==='comment'?d.page:d.issue)))throw Error('Missing destination; preserving existing output.');}
const fingerprint=crypto.createHash('sha256').update(JSON.stringify(records)).digest('hex');if(old.fingerprint===fingerprint){console.log('Approved publications unchanged.');process.exit(0);}
// Validation finishes before touching previously published files.
for(const p of old.targets){const f=safe(p);if(fs.existsSync(f)){const s=fs.readFileSync(f,'utf8');fs.writeFileSync(f,s.replace(/<!-- approved-publications:start -->[\s\S]*?<!-- approved-publications:end -->/g,''));}}
for(const p of old.files){const f=safe(p);if(p.includes('/published/')||p.includes('/writers/published-'))fs.rmSync(f,{force:true});}
const manifest=fs.existsSync('provenance/social-previews.json')?JSON.parse(fs.readFileSync('provenance/social-previews.json','utf8')):[];
const socialFor=src=>manifest.find(x=>x.source===src)?.image||manifest.find(x=>x.source===cfg.fallback)?.image||src;
const home=fs.readFileSync(path.join(root,cfg.prefix,'index.html'),'utf8');const header=home.match(/<header\b[^>]*>[\s\S]*?<\/header>/)?.[0]||'';
const footer=home.match(/<footer\b[^>]*>[\s\S]*?<\/footer>/)?.[0]||'';
const styles=[...home.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>|<link\b[^>]*href="[^"]+\.css[^>]*>/g)].map(m=>m[0]).join('');
const files=[],targets=new Map();
function render(route,title,content,img=cfg.fallback){const share=cfg.origin+socialFor(img),url=cfg.origin+route;return `<!doctype html><html lang="or"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} · ${esc(cfg.name)}</title>${styles}<link rel="canonical" href="${esc(url)}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(title+' · '+cfg.name)}"><meta property="og:type" content="article"><meta property="og:url" content="${esc(url)}"><meta property="og:image" content="${esc(share)}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${esc(share)}"><link rel="stylesheet" href="/share.css"></head><body class="${cfg.prefix==='/shalandi'?'shalandi':'shishu'} ia-site">${header}<main class="ia-main ia-reading" id="main">${content}</main>${footer}<script defer src="/share.js"></script><script defer src="/services.js?v=firebase-v1"></script></body></html>`;}
function save(route,html){const f=safe(route);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,html);files.push(route);}
function append(route,html){if(!fs.existsSync(safe(route)))throw Error('Missing publication destination '+route);targets.set(route,(targets.get(route)||'')+html);}
const choices=JSON.parse(fs.readFileSync('public/editorial/choices.json','utf8'));
const knownWriters=choices.writers||{};
const writers=new Map(),cards=[];
for(const d of records){if(d.kind==='comment'){append(d.page,`<li class="ia-comments"><h3>${esc(d.byline)}</h3><p style="white-space:pre-wrap">${esc(d.body)}</p></li>`);continue;}
 const route=`${cfg.prefix}/published/${d.id}.html`;const normalized=d.byline.normalize('NFC').trim();const writer=knownWriters[normalized]||`${cfg.prefix}/writers/published-${crypto.createHash('sha256').update(normalized).digest('hex').slice(0,12)}.html`;
 const card=`<li><a href="${route}">${esc(d.title)}</a> — ${esc(d.byline)}</li>`;cards.push(card);append(d.issue,card);
 const author=cfg.prefix==='/shishu'?`<a href="${writer}">${esc(d.byline)}</a>`:esc(d.byline);
 const text=`<nav class="ia-breadcrumb"><a href="${esc(d.issue)}">← ${esc(cfg.name)}</a></nav><article class="ia-article"><h1>${esc(d.title)}</h1><p class="ia-byline">${author}</p><figure class="ia-story-art"><img src="${esc(d.image)}" alt="${esc(d.title)}" width="1200" height="800" style="width:100%;height:auto;max-height:600px;object-fit:contain" fetchpriority="high"></figure><div class="ia-prose" style="white-space:pre-wrap">${esc(d.body)}</div></article>`;
 save(route,render(route,d.title,text,d.image));if(cfg.prefix==='/shishu'){const authorInfo=writers.get(writer)||{name:d.byline,cards:[]};authorInfo.cards.push(card);writers.set(writer,authorInfo);}}
for(const [route,w]of writers){if(Object.values(knownWriters).includes(route)){append(route,w.cards.join(''));}else{save(route,render(route,w.name,`<h1>${esc(w.name)}</h1><ul>${w.cards.join('')}</ul>`));append('/shishu/writers.html',`<li><a href="${route}">${esc(w.name)}</a></li>`);}}
if(cards.length){const route=cfg.prefix+'/published/index.html';save(route,render(route,'Published writing',`<h1>Published writing</h1><ul>${cards.join('')}</ul>`));append(cfg.prefix+'/index.html',`<li><a href="${route}">Published writing →</a></li>`);}
for(const [route,html]of targets){const f=safe(route),s=fs.readFileSync(f,'utf8');fs.writeFileSync(f,s.replace('</main>',`${start}<section class="ia-published"><ul>${html}</ul></section>${end}</main>`));}
fs.writeFileSync(registry,JSON.stringify({fingerprint,files,targets:[...targets.keys()]},null,2)+'\n');console.log(`Published ${records.length} approved items; private submissions never fetched.`);
