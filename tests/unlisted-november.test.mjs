import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('public');
const prefix='/shishu/review/2026-11/';
const dir=path.join(root,prefix);

test('November review stays direct-link only and excludes private editorial material',()=>{
  const pages=fs.readdirSync(dir).filter(name=>name.endsWith('.html'));
  assert.equal(pages.length,30);
  assert.equal(pages.filter(name=>/^article-\d\d\.html$/.test(name)).length,28);
  for(const name of pages){
    const html=fs.readFileSync(path.join(dir,name),'utf8');
    assert.match(html,/<meta[^>]*content="[^"]*noindex[^"]*"[^>]*name="robots"|<meta[^>]*name="robots"[^>]*content="[^"]*noindex/);
    assert.doesNotMatch(html,/editor-notes\.html|Article_Nov_26\.docx|editorial-private|Not published|Local review draft/);
    assert.match(html,/Editorial approval pending/);
  }
  for(const file of ['index.html','shishu/current_issue.html','shishu/old_issues.html','sitemap.xml','content-index.json','edition-reader.json','reader-catalog.json']){
    assert.ok(!fs.readFileSync(path.join(root,file),'utf8').includes(prefix),file);
  }
  assert.ok(!fs.existsSync(path.join(dir,'editor-notes.html')));
  assert.ok(!fs.existsSync(path.join(dir,'READ-ME.txt')));
  assert.ok(!fs.existsSync(path.join(dir,'manifest.json')));
});
