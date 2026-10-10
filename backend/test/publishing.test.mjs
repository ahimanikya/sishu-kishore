import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {spawnSync} from 'node:child_process';
const script=new URL('../../scripts/sync-publications.mjs',import.meta.url).pathname.replaceAll('%20',' ');
test('approved publishing escapes content, preserves source, and withdraws generated pages',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'sishu-publication-test-'));
 try{
  for(const p of ['scripts','provenance','public/shishu','public/art','public/editorial'])fs.mkdirSync(path.join(dir,p),{recursive:true});
  fs.writeFileSync(path.join(dir,'scripts/site.json'),JSON.stringify({projectId:'demo',prefix:'/shishu',origin:'https://example.test',name:'Magazine',fallback:'/art/cover.jpg'}));
  for(const file of ['index.html','current_issue.html','writers.html'])fs.writeFileSync(path.join(dir,'public/shishu',file),'<html><head></head><body><header>Magazine</header><main>Original source text</main><footer>Footer</footer></body></html>');
  fs.writeFileSync(path.join(dir,'public/edition-reader.json'),JSON.stringify({'/shishu/current_issue.html':{title:'Issue',items:[]}}));
  fs.writeFileSync(path.join(dir,'public/art/cover.jpg'),'test');fs.writeFileSync(path.join(dir,'public/editorial/choices.json'),'{}');
  const d={id:'abcdefghijklmnopqrst',kind:'article',title:'<script>attack</script>',body:'Line one\nLine two <img src=x>',byline:'Writer',issue:'/shishu/current_issue.html',page:'',image:'/art/cover.jpg',state:'published',publishedAt:'2026-10-09T00:00:00Z'};
  const fixture=path.join(dir,'fixture.json');const run=records=>{fs.writeFileSync(fixture,JSON.stringify(records));return spawnSync(process.execPath,[script],{cwd:dir,env:{...process.env,NODE_ENV:'test',PUBLICATIONS_FIXTURE:fixture},encoding:'utf8'});};
  let r=run([d]);assert.equal(r.status,0,r.stderr);const article=fs.readFileSync(path.join(dir,'public/shishu/published/'+d.id+'.html'),'utf8');assert.ok(article.includes('&lt;script&gt;'));assert.ok(!article.includes('<script>attack'));assert.ok(article.includes('og:image'));assert.ok(fs.readFileSync(path.join(dir,'public/shishu/current_issue.html'),'utf8').includes('Original source text'));
  r=run([{...d,contact:'private@example.test'}]);assert.notEqual(r.status,0);assert.ok(fs.existsSync(path.join(dir,'public/shishu/published/'+d.id+'.html')));
  r=run([{...d,issue:'/shishu/../../private.html'}]);assert.notEqual(r.status,0);
  r=run([{...d,state:'withdrawn'}]);assert.equal(r.status,0,r.stderr);assert.ok(!fs.existsSync(path.join(dir,'public/shishu/published/'+d.id+'.html')));assert.ok(!fs.readFileSync(path.join(dir,'public/shishu/current_issue.html'),'utf8').includes('approved-publications:start'));
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
