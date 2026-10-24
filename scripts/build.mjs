import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
fs.rmSync('dist',{recursive:true,force:true});fs.cpSync('public','dist',{recursive:true});
// Preserve extensionless links shared from the former host. Relative reader assets
// use a base URL so an index alias behaves like the original .html document.
function aliases(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
 const file=path.join(dir,entry.name);
 if(entry.isDirectory())aliases(file);
 else if(file.endsWith('.html')&&entry.name!=='index.html'){
  const dest=file.slice(0,-5); if(fs.existsSync(dest))continue;
  const url='/'+path.relative('public',file).split(path.sep).join('/');
  const html=fs.readFileSync(file,'utf8').replace(/<head>/,'<head><base href="'+url+'">');
  const out=path.join('dist',path.relative('public',dest));fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'index.html'),html);
 }
}}
aliases('public/shishu');
// Refresh changed reader/home assets on both regular pages and extensionless
// aliases, even when the browser still has an earlier version cached.
const readerAssets=['book-ui.css','share.js','editorial/book-review.js','page-turn.js','edition-reader.js','edition-reader.css','shishu-magazine.js','shishu-magazine.css','children-art.css','children-identity.css','kid-ux.js'];
const versions=new Map(readerAssets.map(name=>['/'+name,createHash('sha256').update(fs.readFileSync(path.join('dist',name))).digest('hex').slice(0,12)]));
function versionReaderAssets(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
 const file=path.join(dir,entry.name);
 if(entry.isDirectory())versionReaderAssets(file);
 else if(file.endsWith('.html')){
  const html=fs.readFileSync(file,'utf8');
  // Existing source pages preload the former heading-only face. Point that
  // preload at the shared variable Odia face used by headings and body text.
  const withFont=html.includes('/children-identity.css')?html:html.replace('</head>','<link rel="stylesheet" href="/children-identity.css"></head>');
  const updated=withFont.replaceAll('/fonts/baloo-bhaina-2-semibold-oriya.woff2','/fonts/baloo-bhaina-2-variable-oriya.woff2')
   .replace(/((?:src|href)=["'])(\/[^"'?]+)(?:\?[^"']*)?(["'])/g,(match,start,url,end)=>versions.has(url)?`${start}${url}?v=${versions.get(url)}${end}`:match);
  if(updated!==html)fs.writeFileSync(file,updated);
 }
}}
versionReaderAssets('dist');
fs.writeFileSync('dist/.nojekyll','');
