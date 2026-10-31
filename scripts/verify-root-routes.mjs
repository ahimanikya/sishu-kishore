import fs from 'node:fs';
import path from 'node:path';
if(JSON.parse(fs.readFileSync('scripts/site.json')).prefix!=='')throw Error('Publication prefix must be empty');
for(const name of ['shishu','sishu'])if(fs.existsSync('public/'+name))throw Error('Retired publication directory: '+name);
const unlisted=JSON.parse(fs.readFileSync('provenance/three-mysteries-visibility.json'));
for(const file of ['index.html','elibrary_main.html','reader-catalog.json','review/2026-11/reader-catalog.json','sitemap.xml','content-index.json']){
 if(fs.readFileSync('public/'+file,'utf8').includes(unlisted.prefix))throw Error('Unlisted book exposed: '+file);
}
for(const file of ['index.html','line-art.html']){
 if(!fs.readFileSync('public'+unlisted.prefix+file,'utf8').includes('noindex, follow'))throw Error('Unlisted reader must not be indexed');
}
function check(dir){
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  const file=path.join(dir,entry.name);
  if(entry.isDirectory())check(file);
  else if(/\.(html|json|xml)$/.test(file)&&entry.name!=='legacy-routes.json'){
   if(/\/(?:shishu|sishu)\//.test(fs.readFileSync(file,'utf8')))throw Error('Retired route in public content: '+file);
  }
 }
}
check('public');
console.log('Root publication verified: no retired directory or public content routes.');
