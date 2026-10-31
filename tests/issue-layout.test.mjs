import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('every published issue has the same cover, reading entry and complete contents',()=>{
 const catalog=JSON.parse(fs.readFileSync('public/edition-reader.json'));
 assert.ok(Object.keys(catalog).length>=35);
 for(const [route,issue] of Object.entries(catalog)){
  const html=fs.readFileSync('public'+route+(route.endsWith('/')?'index.html':''),'utf8');
  assert.ok(html.includes('magazine-cover'),route);
  assert.ok(html.includes('class="mag-cover-heading"'),route);
  assert.ok(html.includes('class="mag-cover-date">'+issue.title),route);
  assert.ok(html.includes('/issue-layout.css'),route);
  assert.equal((html.match(/class="ia-article-card"/g)||[]).length,issue.items.length,route);
  for(const item of issue.items)assert.ok(html.includes('href="'+item.href+'"'),item.href);
 }
 const archive=fs.readFileSync('public/old_issues.html','utf8');
 assert.equal((archive.match(/class="storybook-cover magazine-cover"/g)||[]).length,Object.keys(catalog).length-1);
 const current=fs.readFileSync('public/current_issue.html','utf8').match(/data-reading-issue="([^"]+)"/)[1];
 assert.ok(!archive.includes('href="'+current+'"'));
});
