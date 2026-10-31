import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('November publication preserves the October archive and review boundaries',()=>{
 const read=p=>fs.readFileSync('public/'+p,'utf8');
 const route='/editions/2026-11/';
 const catalog=JSON.parse(read('edition-reader.json'));
 assert.equal(catalog[route].items.length,28);
 assert.equal(catalog['/editions/2026-10/'].items.length,25);
 const home=read('index.html'),current=read('current_issue.html');
 assert.equal((home.match(/id="home-art"/g)||[]).length,1);
 assert.match(current,/data-reading-issue="\/editions\/2026-11\/"/);
 for(const item of catalog[route].items){
  assert.ok(home.includes(item.href));
  assert.ok(current.includes(item.href));
  const page=read(item.href.slice(1));
  assert.ok(!page.includes('Editorial approval pending'));
  assert.ok(read('sitemap.xml').includes('https://shishukishora.com'+item.href));
 }
 for(const item of catalog['/editions/2026-10/'].items){
  assert.ok(read(item.href.slice(1)).includes('data-reading-issue="/editions/2026-10/"'));
 }
 assert.ok(read('old_issues.html').includes('/editions/2026-10/'));
 assert.ok(!read('old_issues.html').includes(route));
 for(const page of [home,current,read('sitemap.xml')])assert.ok(!page.includes('/review/'));
 assert.ok(read('review/2026-11/index.html').includes('noindex, follow'));
});
