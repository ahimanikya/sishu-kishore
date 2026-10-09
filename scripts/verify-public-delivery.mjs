import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('public'); let count=0;
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else if(file.endsWith('.html')){const html=fs.readFileSync(file,'utf8');for(const match of html.matchAll(/<img\b[^>]*>/g)){const tag=match[0];const src=tag.match(/\bsrc="([^"]+)"/)?.[1];if(!src?.startsWith('/'))continue;if(!fs.existsSync(path.join(root,src.split('?')[0])))throw Error(`Missing image: ${file} ${src}`);if(!/\bwidth="\d+"/.test(tag)||!/\bheight="\d+"/.test(tag))throw Error(`Unreserved image: ${file} ${src}`);if(/fetchpriority="high"/.test(tag)&&/loading="lazy"/.test(tag))throw Error(`Lazy opening image: ${file}`);for(const url of (tag.match(/srcset="([^"]+)"/)?.[1]||'').split(',').filter(Boolean)){if(!fs.existsSync(path.join(root,url.trim().split(' ')[0])))throw Error(`Missing responsive image: ${file}`);}} count++;}}}
walk(path.join(root,'shishu'));
if(fs.readFileSync(path.join(root,'fonts/fonts.css'),'utf8').includes('.ttf'))throw Error('Uncompressed font delivery');
console.log(`Public delivery verified: ${count} static pages`);
