import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {spawnSync} from 'node:child_process';
const repo=new URL('../',import.meta.url).pathname.replaceAll('%20',' ');
test('approved article joins reader/discovery; withdrawal removes every generated surface',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'sishu-release-test-'));
 try{
  for(const part of ['public','scripts','provenance'])fs.cpSync(path.join(repo,part),path.join(dir,part),{recursive:true});
  fs.copyFileSync(path.join(repo,'package.json'),path.join(dir,'package.json'));
  const cfg=JSON.parse(fs.readFileSync(path.join(dir,'scripts/site.json'))),id='ReleaseCheck12345678';
  const route=`/shishu/published/${id}.html`,fixture=path.join(dir,'fixture.json');
  const original=fs.readFileSync(path.join(dir,'public/shishu/article-790.html'),'utf8');
  const record={id,kind:'article',title:'Review fixture',body:'First paragraph.\n\nSecond paragraph.',byline:'Release fixture',issue:'/shishu/current_issue.html',page:'',image:cfg.fallback,state:'published',publishedAt:'2026-10-10T00:00:00Z'};
  const run=items=>{
   fs.writeFileSync(fixture,JSON.stringify(items));
   let r=spawnSync(process.execPath,['scripts/sync-publications.mjs'],{cwd:dir,env:{...process.env,NODE_ENV:'test',PUBLICATIONS_FIXTURE:fixture},encoding:'utf8'});assert.equal(r.status,0,r.stderr);
   r=spawnSync('npm',['run','build'],{cwd:dir,encoding:'utf8'});assert.equal(r.status,0,r.stdout+r.stderr);
  };
  run([record]);
  const html=fs.readFileSync(path.join(dir,'public',route),'utf8');
  for(const marker of ['data-reading-issue="/shishu/current_issue.html"','article-tools.js','edition-reader.js','class="ia-article-head"','First paragraph.</p>','Second paragraph.</p>'])assert.ok(html.includes(marker),marker);
  const catalog=()=>JSON.parse(fs.readFileSync(path.join(dir,'public/edition-reader.json')));
  assert.ok(catalog()['/shishu/current_issue.html'].items.some(i=>i.href===route));
  assert.ok(JSON.parse(fs.readFileSync(path.join(dir,'public/content-index.json'))).articles.some(i=>i.url===cfg.origin+route));
  assert.ok(fs.existsSync(path.join(dir,`public/reading-text/${id}.txt`)));
  run([{...record,state:'withdrawn'}]);
  assert.ok(!fs.existsSync(path.join(dir,'public',route)));
  assert.ok(!fs.existsSync(path.join(dir,`public/reading-text/${id}.txt`)));
  assert.ok(!catalog()['/shishu/current_issue.html'].items.some(i=>i.href===route));
  assert.ok(!fs.readFileSync(path.join(dir,'public/sitemap.xml'),'utf8').includes(route));
  assert.ok(!fs.readFileSync(path.join(dir,'public/shishu/current_issue.html'),'utf8').includes(route));
  assert.equal(fs.readFileSync(path.join(dir,'public/shishu/article-790.html'),'utf8'),original);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
