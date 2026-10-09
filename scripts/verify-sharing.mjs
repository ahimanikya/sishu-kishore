import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('public');
const items=JSON.parse(fs.readFileSync('provenance/social-previews.json','utf8'));
for(const item of items){
 const html=fs.readFileSync(path.join(root,item.page),'utf8');
 for(const field of ['og:title','og:url','og:image','og:image:width','og:image:height','twitter:card']){
  if(!html.includes(`="${field}"`))throw Error(`Missing ${field}: ${item.page}`);
 }
 if(!html.includes(item.url)||!html.includes('https://sishu.kabitawithoutborders.org'+item.image))throw Error(`Wrong sharing origin: ${item.page}`);
 const image=fs.readFileSync(path.join(root,item.image));
 if(image[0]!==255||image[1]!==216||image.length>1000000)throw Error(`Invalid or oversized sharing JPEG: ${item.image}`);
}
console.log(`Sharing verified: ${items.length} pages, public HTTPS image URLs and JPEG previews`);

// Also inspect pages created after the preview manifest (for example editor publications).
function* pages(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())yield* pages(file);else if(file.endsWith('.html'))yield file;}}
function meta(html,key){for(const tag of html.matchAll(/<meta\b[^>]*>/gi)){const attrs=Object.fromEntries([...tag[0].matchAll(/([\w:-]+)=["']([^"']*)["']/g)].map(m=>[m[1],m[2]]));if(attrs.property===key||attrs.name===key)return attrs.content;}return '';}
let pageCount=0;
for(const file of pages(root)){
 const html=fs.readFileSync(file,'utf8'),image=meta(html,'og:image');
 if(!image.startsWith('https://sishu.kabitawithoutborders.org/'))throw Error(`Missing public image: ${file}`);
 const local=path.resolve(root,'.'+new URL(image).pathname);
 if(!local.startsWith(root+path.sep)||!fs.existsSync(local)||fs.statSync(local).size===0)throw Error(`Missing local preview image: ${file}`);
 if(meta(html,'twitter:image')!==image||meta(html,'twitter:card')!=='summary_large_image')throw Error(`Inconsistent image sharing: ${file}`);
 pageCount++;
}
console.log(`All ${pageCount} HTML pages have local, public social-preview images.`);
