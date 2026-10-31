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

test('November uses the magazine reader with linked authors and individual artwork',()=>{
  const authors=JSON.parse(fs.readFileSync('provenance/november-2026-author-links.json','utf8')).articles;
  const catalog=JSON.parse(fs.readFileSync(path.join(dir,'edition-reader.json'),'utf8'));
  assert.equal(catalog[prefix].items.length,28);
  const images=new Set();
  for(const author of authors){
    const html=fs.readFileSync(path.join(dir,author.id+'.html'),'utf8');
    assert.ok(html.includes('data-edition-catalog="'+prefix+'edition-reader.json"'));
    assert.ok(html.includes('data-reading-issue="'+prefix+'"'));
    assert.ok(html.includes('<p class="ia-byline"><a href="'+author.profile+'">'));
    assert.ok(fs.existsSync(path.join(root,author.profile)));
    const artwork=JSON.parse(fs.readFileSync('provenance/november-2026-art/'+author.id+'.json','utf8')).asset;
    assert.ok(artwork.startsWith(prefix+'assets/articles/'+author.id+'-'));
    assert.ok(html.includes(artwork));
    assert.ok(fs.existsSync(path.join(root,artwork)));
    images.add(artwork);
    assert.ok(catalog[prefix].items.some(item=>item.href===prefix+author.id+'.html'));
  }
  assert.equal(images.size,28);
  const home=fs.readFileSync(path.join(dir,'index.html'),'utf8');
  assert.equal((home.match(/class="nov-card-byline"/g)||[]).length,28);
  assert.match(home,/class="ia-page-head mag-edition-opening"/);
  assert.match(home,/class="ia-contents ia-illustrated-contents"/);
});
