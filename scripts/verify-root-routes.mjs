import fs from 'node:fs';
import path from 'node:path';
if(JSON.parse(fs.readFileSync('scripts/site.json')).prefix!=='')throw Error('Publication prefix must be empty');
for(const name of ['shishu','sishu'])if(fs.existsSync('public/'+name))throw Error('Retired publication directory: '+name);
const withdrawn=JSON.parse(fs.readFileSync('provenance/three-mysteries-withdrawal.json'));
for(const route of Object.keys(withdrawn.withdrawn_files_sha256))if(fs.existsSync('public'+route))throw Error('Private book file restored: '+route);
function check(dir){
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  const file=path.join(dir,entry.name);
  if(entry.isDirectory())check(file);
  else if(/\.(html|json|xml)$/.test(file)&&entry.name!=='legacy-routes.json'){
   if(fs.readFileSync(file,'utf8').includes(withdrawn.prefix))throw Error('Private book linked in public content: '+file);
   if(/\/(?:shishu|sishu)\//.test(fs.readFileSync(file,'utf8')))throw Error('Retired route in public content: '+file);
  }
 }
}
check('public');
console.log('Root publication verified: no retired directory or public content routes.');
