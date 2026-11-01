import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {readSiteEdition} from '../scripts/editorial/author-selection.mjs';
const catalog=JSON.parse(fs.readFileSync('public/editorial/studio-catalog.json','utf8'));
test('Studio catalog contains only existing public canonical profiles and published issues',()=>{
 assert.ok(catalog.authors.length>100);
 assert.equal(new Set(catalog.authors.map(x=>x.path)).size,catalog.authors.length);
 for(const author of catalog.authors){
  assert.match(author.path,/^\/writers\/[\w-]+\.html$/);assert.ok(author.name.trim());
  const html=fs.readFileSync('public'+author.path,'utf8');assert.ok(html.includes('https://shishukishora.com'+author.path));
 }
 for(const issue of catalog.issues){
  assert.match(issue.route,/^\/editions\/\d{4}-\d{2}\/$/);
  const actual=readSiteEdition(issue.route,issue.month);
  assert.deepEqual(issue.authors,[...new Set(actual.articles.flatMap(a=>a.author_profiles))].sort());
 }
 assert.ok(!JSON.stringify(catalog).includes('/review/'));
});
