// Public reference data only. Never inspect editorial-private or unlisted reviews.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readSiteEdition} from './author-selection.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const decode=s=>s.replace(/<[^>]*>/g,'').replace(/&#(x[0-9a-f]+|\d+);/gi,(_,n)=>String.fromCodePoint(n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):Number(n))).replace(/&(amp|lt|gt|quot|apos|nbsp);/g,(_,n)=>({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '})[n]).trim();
const birthdayRecords=JSON.parse(fs.readFileSync(path.join(root,'data/author-birthdays.json'),'utf8')).authors;
const authors=[];
for(const name of fs.readdirSync(path.join(root,'public/writers')).filter(n=>n.endsWith('.html'))){
 const route='/writers/'+name,html=fs.readFileSync(path.join(root,'public',route),'utf8');
 if(/<meta[^>]*content=["'][^"']*noindex/i.test(html))continue;
 const canonical=[...html.matchAll(/<link\b[^>]*>/g)].find(m=>/rel=["']canonical["']/.test(m[0]))?.[0].match(/href=["']([^"']+)/)?.[1];
 if(canonical!=='https://shishukishora.com'+route)continue;
 const title=html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1];if(title)authors.push({path:route,name:decode(title),birthday:birthdayRecords[route]?.approved?birthdayRecords[route]:null});
}
authors.sort((a,b)=>a.name.localeCompare(b.name,'or'));
const catalog=JSON.parse(fs.readFileSync(path.join(root,'public/edition-reader.json'),'utf8'));
const issues=Object.keys(catalog).filter(route=>/^\/editions\/\d{4}-\d{2}\/$/.test(route)).sort().map(route=>{
 const month=route.split('/')[2],issue=readSiteEdition(route,month,root);
 return {month,route,authors:[...new Set(issue.articles.flatMap(a=>a.author_profiles))].sort(),evidence:`Published issue ${route}; ${issue.articles.length} contributions. Recheck against the actual issue before publication.`};
});
fs.writeFileSync(path.join(root,'public/editorial/studio-catalog.json'),JSON.stringify({authors,issues},null,2)+'\n');
console.log(`Studio references: ${authors.length} public authors, ${issues.length} dated published issues.`);
