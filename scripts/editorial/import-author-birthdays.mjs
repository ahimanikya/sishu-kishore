// Explicit editorial reconciliation; no database access or publication side effects.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateBirthday} from '../../public/editorial/author-birthday-model.mjs';
export function reconcileAuthorBirthdays(input,catalog,registry){
 if(input?.format!=='sishu-author-birthdays-v1'||!Array.isArray(input.authors)||!input.authors.length)throw Error('Use a Studio author-record export.');
 const known=new Set(catalog.authors.map(a=>a.path)),seen=new Set(),next=structuredClone(registry),changes=[];
 for(const item of input.authors){
  if(!item||!known.has(item.profile)||seen.has(item.profile))throw Error('Unknown or duplicate canonical author.');
  seen.add(item.profile);const validated=validateBirthday(item.birthday),birthday=validated?.approved?validated:null,before=next.authors[item.profile]??null;
  if(JSON.stringify(before)!==JSON.stringify(birthday)){changes.push({profile:item.profile,before,after:birthday});next.authors[item.profile]=birthday;}
 }
 return {registry:next,changes};
}
function main(args){
 const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),file=args[0];
 if(!file||path.isAbsolute(file))throw Error('Use an editorial-private relative JSON export path, optionally followed by --apply after review.');
 const privateRoot=fs.realpathSync(path.join(root,'editorial-private')),source=fs.realpathSync(path.resolve(root,file));
 if(!source.startsWith(privateRoot+path.sep))throw Error('Author exports must remain inside editorial-private.');
 const target=path.join(root,'data/author-birthdays.json'),catalog=JSON.parse(fs.readFileSync(path.join(root,'public/editorial/studio-catalog.json'),'utf8'));
 const result=reconcileAuthorBirthdays(JSON.parse(fs.readFileSync(source,'utf8')),catalog,JSON.parse(fs.readFileSync(target,'utf8')));
 console.log(JSON.stringify({mode:args.includes('--apply')?'apply':'preview',changes:result.changes},null,2));
 if(args.includes('--apply'))fs.writeFileSync(target,JSON.stringify(result.registry,null,2)+'\n');
 console.log('No publication performed. Review the changes, rebuild, and follow the normal release process.');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{main(process.argv.slice(2));}catch(e){console.error(e.message);process.exitCode=1;}}
