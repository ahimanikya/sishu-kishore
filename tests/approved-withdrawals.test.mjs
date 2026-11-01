import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';

// Exercise the publication filter against an isolated miniature magazine. This
// catches lost original text, orphaned reading links and merge-time restoration.
test('approved withdrawals preserve sources and repair public reading surfaces idempotently', () => {
  const root = mkdtempSync(join(tmpdir(), 'sishu-withdrawal-'));
  const put = (p, text) => {mkdirSync(join(root, p, '..'), {recursive:true}); writeFileSync(join(root,p),text);};
  const run = (...args) => spawnSync('python3', ['scripts/apply-approved-withdrawals.py','--root',root,...args], {encoding:'utf8'});
  try {
    put('provenance/approved-withdrawals.json', JSON.stringify({private_archive:'editorial-private/saved',withdrawals:[{route:'/gone.html'},{route:'/editions/2026-11/article-09.html'},{route:'/editions/2026-11/article-14.html'}],excerpt_removals:[{route:'/mixed.html',start_text:'ଟୁକୁନା ଋଷିଛି'}]}));
    put('public/edition-reader.json',JSON.stringify({'/issue/':{items:[{href:'/a.html'},{href:'/gone.html'},{href:'/b.html'}]}}));
    put('public/gone.html','ORIGINAL WITHDRAWN TEXT');
    put('public/a.html','<nav class="mag-web-reading"><a href="/gone.html">ପର ଲେଖା →</a></nav>');
    put('public/b.html','<nav class="mag-web-reading"><a href="/gone.html">← ପୂର୍ବ ଲେଖା</a></nav>');
    put('public/index.html','<ul><li><a href="/gone.html">title</a><a href="/gone.html">read</a></li><li><a href="/a.html">keep</a></li></ul>');
    put('public/review/old.html','<a href="/gone.html">Historical review</a>');
    put('public/mixed.html','<div class="ia-prose"><p class="subject">KEEP EXACTLY<br/>ଟୁକୁନା ଋଷିଛି<br/>WRONG APPENDED BODY</p></div>');
    put('public/editions/2026-11/all-writing.html','<ul><li><a href="#article-09">remove</a></li><li><a href="#article-14">remove</a></li></ul><article id="article-09">DEFER NINE</article><article id="article-14">DEFER FOURTEEN</article><article id="article-11">KEEP ELEVEN</article>');
    const first=run(); assert.equal(first.status,0,first.stderr);
    assert.equal(existsSync(join(root,'public/gone.html')),false);
    assert.equal(readFileSync(join(root,'editorial-private/saved/public/gone.html'),'utf8'),'ORIGINAL WITHDRAWN TEXT');
    assert.match(readFileSync(join(root,'public/a.html'),'utf8'),/href="\/b.html"/);
    assert.match(readFileSync(join(root,'public/b.html'),'utf8'),/href="\/a.html"/);
    assert.doesNotMatch(readFileSync(join(root,'public/index.html'),'utf8'),/gone.html/);
    assert.match(readFileSync(join(root,'public/mixed.html'),'utf8'),/KEEP EXACTLY<br\/>/);
    assert.doesNotMatch(readFileSync(join(root,'public/mixed.html'),'utf8'),/WRONG APPENDED BODY/);
    assert.match(readFileSync(join(root,'public/review/old.html'),'utf8'),/gone.html/);
    assert.equal(JSON.parse(readFileSync(join(root,'public/edition-reader.json'),'utf8'))['/issue/'].items.length,2);
    const aggregate=readFileSync(join(root,'public/editions/2026-11/all-writing.html'),'utf8');
    assert.doesNotMatch(aggregate,/DEFER|#article-09|#article-14/);
    assert.match(aggregate,/KEEP ELEVEN/);
    const second=run(); assert.equal(second.status,0,second.stderr); assert.match(second.stdout,/0 files changed/);
    assert.equal(run('--check').status,0);
    put('public/index.html','<li><a href="/gone.html">restored by stale source</a></li>');
    assert.notEqual(run('--check').status,0);
  } finally {rmSync(root,{recursive:true,force:true});}
});
