import fs from 'node:fs';
import path from 'node:path';
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
fs.writeFileSync('dist/.nojekyll','');
