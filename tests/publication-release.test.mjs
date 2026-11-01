import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {spawnSync} from 'node:child_process';
const repo=new URL('../',import.meta.url).pathname.replaceAll('%20',' ');
test('approved article joins reader/discovery; withdrawal removes every generated surface',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'sishu-release-test-'));
 try{
  for(const part of ['public','scripts','provenance','data'])fs.cpSync(path.join(repo,part),path.join(dir,part),{recursive:true});
  fs.copyFileSync(path.join(repo,'package.json'),path.join(dir,'package.json'));
  fs.mkdirSync(path.join(dir,'kb/editorial-model'),{recursive:true});
  fs.copyFileSync(path.join(repo,'kb/editorial-model/model.json'),path.join(dir,'kb/editorial-model/model.json'));
  const cfg=JSON.parse(fs.readFileSync(path.join(dir,'scripts/site.json'))),id='ReleaseCheck12345678';
  const route=`/published/${id}.html`,fixture=path.join(dir,'fixture.json');
  const original=fs.readFileSync(path.join(dir,'public/article-790.html'),'utf8');
  const issue=fs.readFileSync(path.join(dir,'public/current_issue.html'),'utf8').match(/data-reading-issue="([^"]+)"/)[1];
  const record={id,kind:'article',title:'Review fixture',body:'First paragraph.\n\nSecond paragraph.',byline:'Release fixture',issue,page:'',image:cfg.fallback,state:'published',publishedAt:'2026-10-10T00:00:00Z'};
  const run=items=>{
   fs.writeFileSync(fixture,JSON.stringify(items));
   let r=spawnSync(process.execPath,['scripts/sync-publications.mjs'],{cwd:dir,env:{...process.env,NODE_ENV:'test',PUBLICATIONS_FIXTURE:fixture},encoding:'utf8'});assert.equal(r.status,0,r.stderr);
   r=spawnSync('npm',['run','build'],{cwd:dir,encoding:'utf8'});assert.equal(r.status,0,r.stdout+r.stderr);
  };
  run([record]);
  const html=fs.readFileSync(path.join(dir,'public',route),'utf8');
  for(const marker of [`data-reading-issue="${issue}"`,'article-tools.js','edition-reader.js','class="ia-article-head"','First paragraph.</p>','Second paragraph.</p>'])assert.ok(html.includes(marker),marker);
  const catalog=()=>JSON.parse(fs.readFileSync(path.join(dir,'public/edition-reader.json')));
  assert.ok(catalog()[issue].items.some(i=>i.href===route));
  assert.ok(JSON.parse(fs.readFileSync(path.join(dir,'public/content-index.json'))).articles.some(i=>i.url===cfg.origin+route));
  assert.ok(fs.existsSync(path.join(dir,`public/reading-text/${id}.txt`)));
  assert.ok(fs.readFileSync(path.join(dir,'public/index.html'),'utf8').includes('Published writing →'));
  assert.ok(!fs.existsSync(path.join(dir,'public/shishu')));
  // Approved-feed imports also pass through the canonical-author gate.
  const second={...record,id:'ReleaseCheck87654321',title:'Second fixture'};
  fs.writeFileSync(fixture,JSON.stringify([record,second]));
  let attempt=spawnSync(process.execPath,['scripts/sync-publications.mjs'],{cwd:dir,env:{...process.env,NODE_ENV:'test',PUBLICATIONS_FIXTURE:fixture},encoding:'utf8'});
  assert.equal(attempt.status,0,attempt.stderr);
  attempt=spawnSync(process.execPath,['scripts/editorial/check-current-authors.mjs'],{cwd:dir,encoding:'utf8'});
  assert.notEqual(attempt.status,0);
  assert.match(attempt.stderr,/More than one contribution/);
  fs.writeFileSync(fixture,JSON.stringify([record,{...second,issue:'/editions/2026-10/'}]));
  attempt=spawnSync(process.execPath,['scripts/sync-publications.mjs'],{cwd:dir,env:{...process.env,NODE_ENV:'test',PUBLICATIONS_FIXTURE:fixture},encoding:'utf8'});
  assert.equal(attempt.status,0,attempt.stderr);
  attempt=spawnSync(process.execPath,['scripts/editorial/check-current-authors.mjs'],{cwd:dir,encoding:'utf8'});
  assert.notEqual(attempt.status,0);
  assert.match(attempt.stderr,/previous issue/);
  run([{...record,state:'withdrawn'}]);
  assert.ok(!fs.existsSync(path.join(dir,'public',route)));
  assert.ok(!fs.existsSync(path.join(dir,`public/reading-text/${id}.txt`)));
  assert.ok(!catalog()[issue].items.some(i=>i.href===route));
  assert.ok(!fs.readFileSync(path.join(dir,'public/sitemap.xml'),'utf8').includes(route));
  assert.ok(!fs.readFileSync(path.join(dir,'public/current_issue.html'),'utf8').includes(route));
  assert.equal(fs.readFileSync(path.join(dir,'public/article-790.html'),'utf8'),original);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
