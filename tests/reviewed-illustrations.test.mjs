import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const hash=p=>createHash('sha256').update(fs.readFileSync(new URL('../public'+p,import.meta.url))).digest('hex');
test('reviewed illustrations retain originals and ship the approved story-specific versions',()=>{
 const {records}=JSON.parse(read('provenance/reviewed-illustrations-2026-11.json'));
 for(const r of records){
  assert.equal(hash(r.previous),r.source_sha256,'Original changed: '+r.previous);
  assert.equal(hash(r.replacement),r.sha256,'Reviewed image changed: '+r.replacement);
  const page=read('public'+r.article);
  assert.ok(page.includes('src="'+r.replacement+'"'),r.article);
  assert.ok(!page.includes('src="'+r.previous+'"'),r.article);
  assert.ok(page.includes('https://shishukishora.com'+r.share_image),r.article+' share');
 }
 const forest=read('public/books/paresh/forest.html');
 for(const asset of ['forest-opening-v1-anatomy-v2.jpg','forest-art/chapter-06-anatomy-v2.jpg','forest-art/chapter-06-extra-01-anatomy-v2.jpg','forest-art/chapter-08-anatomy-v2.jpg'])assert.ok(forest.includes('assets/'+asset));
 const november=read('public/editions/2026-11/article-07.html');
 assert.ok(november.includes('article-07-v3.webp'),'Do not restore the three-legged elephant variant');
});
