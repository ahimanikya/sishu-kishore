import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash,webcrypto} from 'node:crypto';

test('root publication has no retired directory and preserves original assets',()=>{
 assert.equal(JSON.parse(fs.readFileSync('scripts/site.json')).prefix,'');
 for(const name of ['shishu','sishu'])assert.ok(!fs.existsSync('public/'+name));
 const receipt=JSON.parse(fs.readFileSync('provenance/root-route-migration.json'));
 for(const [route,hash] of Object.entries(receipt.preserved_binary_sha256)){
  assert.equal(createHash('sha256').update(fs.readFileSync('public'+route)).digest('hex'),hash,route);
 }
 for(const file of ['index.html','current_issue.html','edition-reader.json','reader-catalog.json','sitemap.xml','editorial/choices.json']){
  assert.ok(!fs.readFileSync('public/'+file,'utf8').includes('/shishu/'),file);
 }
});

test('legacy bookmarks retain queries and fragments without restoring removed routes',async()=>{
 const routes=JSON.parse(fs.readFileSync('public/legacy-routes.json'));
 assert.ok(!JSON.stringify(routes).includes('/review/'));
 const source=fs.readFileSync('public/legacy-routes.js','utf8');
 for(const [pathname,expected] of [
  ['/shishu/','/'],['/shishu/current_issue.html','/current_issue.html'],
  ['/shishu/editions/2026-11/','/editions/2026-11/'],
  ['/shishu/books/paresh/forest','/books/paresh/forest.html'],
  ['/shishu/review/2026-11/','/review/2026-11/'],
  ['/shishu/books/three-mysteries/','/books/three-mysteries/'],['/shishu/books/three-mysteries/line-art','/books/three-mysteries/line-art.html'],['/shishu/characters/',undefined],['/shishu/does-not-exist',undefined],
  ['/some-other-missing-page',undefined]
 ]){
  let destination;
  await vm.runInNewContext(source,{
   location:{pathname,search:'?from=bookmark',hash:'#reader',replace:url=>destination=url},
   fetch:async()=>({ok:true,json:async()=>routes}),crypto:webcrypto,TextEncoder,
  });
  assert.equal(destination,expected&&expected+'?from=bookmark#reader',pathname);
 }
});
