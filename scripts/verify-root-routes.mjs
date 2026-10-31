import fs from 'node:fs';
import path from 'node:path';
if(JSON.parse(fs.readFileSync('scripts/site.json')).prefix!=='')throw Error('Publication prefix must be empty');
for(const name of ['shishu','sishu'])if(fs.existsSync('public/'+name))throw Error('Retired publication directory: '+name);
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
