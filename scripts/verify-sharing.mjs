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
