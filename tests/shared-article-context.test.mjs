import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync('public/shared-article-context.js','utf8');
const catalog=JSON.parse(fs.readFileSync('public/edition-reader.json','utf8'));
const target='/article_details-90e919ace4.html';
const contexts=Object.fromEntries(Object.entries(catalog).filter(([,d])=>d.items.some(i=>i.href===target)));
const october='/old_issues_details-4de6385d8a.html';
const august='/old_issues_details-8a077c1fec.html';
function run(issue){
 const body={dataset:{readingIssue:october}};let links;
 const nav={replaceChildren(...items){links=items;}};
 const document={body,getElementById:()=>({textContent:JSON.stringify(contexts)}),querySelectorAll:()=>[],querySelector:s=>s==='.mag-web-reading'?nav:null,createElement:()=>({})};
 vm.runInNewContext(source,{document,location:{href:'https://shishukishora.com'+target+'?issue='+encodeURIComponent(issue),pathname:target},URL});
 return {body,links};
}
test('shared poem uses August sequence only for a known issue context',()=>{
 const result=run(august);
 assert.equal(result.body.dataset.readingIssue,august);
 assert.deepEqual(Array.from(result.links,x=>x.href),['/article_details-1e47d6bd18.html',august,'/article_details-fe1f30ea01.html']);
 for(const invalid of ['https://other.example/','/review/2026-12/','__proto__']){
  const bad=run(invalid);assert.equal(bad.body.dataset.readingIssue,october);assert.equal(bad.links,undefined);
 }
});
test('context is initialized before the reading tools and both issue cards carry it',()=>{
 const html=fs.readFileSync('public'+target,'utf8');
 assert.ok(html.indexOf('/shared-article-context.js')<html.indexOf('/article-tools.js'));
 for(const issue of [august,october]){
  const page=fs.readFileSync('public'+issue,'utf8');
  assert.ok(page.includes(target+'?issue='+encodeURIComponent(issue)));
 }
});
