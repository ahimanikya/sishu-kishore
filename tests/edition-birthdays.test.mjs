import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {birthdaysForIssue,validateBirthday} from '../public/editorial/author-birthday-model.mjs';
const registry=JSON.parse(fs.readFileSync('data/author-birthdays.json','utf8')).authors;
const catalog=JSON.parse(fs.readFileSync('public/editorial/studio-catalog.json','utf8'));
test('verified birthday attribute belongs to each canonical author; unknown years preserved',()=>{
 for(const [profile,birthday] of Object.entries(registry)){
  assert.deepEqual(catalog.authors.find(a=>a.path===profile)?.birthday,validateBirthday(birthday));
  if(!birthday?.approved)continue;
  const page=fs.readFileSync('public'+profile,'utf8');assert.ok(page.includes(`data-birthday-month="${birthday.month}"`));
  assert.ok(page.includes(`data-birthday-day="${birthday.day}"`));
  if(birthday.year===null)assert.ok(!page.includes('data-birthday-year='));
 }
});
test('published edition birthday sections are tied to their month, not the current clock',()=>{
 for(const issue of ['2026-10','2026-11']){
  const html=fs.readFileSync(`public/editions/${issue}/index.html`,'utf8'),section=html.match(/<section\b[^>]*id="birthdays"[^>]*>([\s\S]*?)<\/section>/)?.[0];
  assert.ok(section);assert.ok(section.includes(`data-edition-month="${Number(issue.slice(5))}"`));
  const expected=birthdaysForIssue(catalog.authors,issue);
  assert.equal([...section.matchAll(/<li\b/g)].length,expected.length);
  for(const author of expected)assert.ok(section.includes(`href="${author.path}"`));
  assert.ok(!html.includes('src="/author-birthdays.mjs'));
 }
 assert.deepEqual(birthdaysForIssue(catalog.authors,'2027-11'),birthdaysForIssue(catalog.authors,'2026-11'));
});
