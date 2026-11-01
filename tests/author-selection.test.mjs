import test from 'node:test';
import assert from 'node:assert/strict';
import {precedingIssue, validateAuthorSelection} from '../scripts/editorial/author-selection.mjs';
const a='/writers/alpha.html', b='/writers/beta.html', c='/writers/gamma.html';
const article=(id,authors,title=id)=>({id,title,author_profiles:authors});
const prior={issue:'2026-11',articles:[article('old',[a])]};
const candidate=articles=>({issue:'2026-12',articles});

test('different byline spellings cannot bypass one contribution per canonical author',()=>{
 const r=validateAuthorSelection(candidate([article('one',[b],'Name spelling one'),article('two',[b],'Name spelling two')]),prior);
 assert.equal(r.duplicates.length,1);assert.deepEqual(r.duplicates[0].articles.map(x=>x.id),['one','two']);assert.ok(r.errors.length);
});
test('rotation is strict by default and advisory only when explicitly selected',()=>{
 assert.ok(validateAuthorSelection(candidate([article('one',[a])]),prior).errors.length);
 const advisory=validateAuthorSelection(candidate([article('one',[a])]),prior,{rotationMode:'advisory'});
 assert.equal(advisory.errors.length,0);assert.equal(advisory.warnings.length,1);
 assert.ok(validateAuthorSelection(candidate([article('one',[a]),article('two',[a])]),prior,{rotationMode:'advisory'}).errors.length);
 assert.ok(validateAuthorSelection(candidate([article('one',[b])]),prior,{rotationMode:'off'}).errors.length);
});
test('every coauthor counts for duplicate and rotation checks',()=>{
 const r=validateAuthorSelection(candidate([article('one',[a,b]),article('two',[b,c])]),prior);
 assert.equal(r.duplicates[0].author_profile,b);assert.equal(r.rotation[0].author_profile,a);
});
test('malformed identities, duplicate ids and unknown previous issues fail closed',()=>{
 for(const authors of [[],null,['Name only'],['/writers/a.html?alias=b'],['/writers/../a.html'],[b,b]]){
  assert.ok(validateAuthorSelection(candidate([article('one',authors)]),prior).errors.length);
 }
 assert.ok(validateAuthorSelection(candidate([article('one',[b]),article('one',[c])]),prior).errors.length);
 assert.ok(validateAuthorSelection(candidate([article('one',[b])]),undefined).errors.length);
 assert.ok(validateAuthorSelection(candidate([]),prior).errors.length);
 assert.ok(validateAuthorSelection(null,prior).errors.length);
 assert.ok(validateAuthorSelection(candidate([null]),prior).errors.length);
});
test('previous month is validated across December and January',()=>{
 assert.equal(precedingIssue('2027-01'),'2026-12');assert.equal(precedingIssue('2026-12'),'2026-11');
 assert.throws(()=>precedingIssue('2026-13'));assert.throws(()=>precedingIssue('0001-01'));
 const jan={issue:'2027-01',articles:[article('new',[b])]};
 assert.equal(validateAuthorSelection(jan,{issue:'2026-12',articles:[article('old',[a])]}).errors.length,0);
 assert.ok(validateAuthorSelection(jan,prior).errors.length);
});
test('first edition requires explicit declaration; historical duplicate authors do not block new selections',()=>{
 const first={issue:'2026-01',first_issue:true,articles:[article('one',[a])]};
 assert.equal(validateAuthorSelection(first,null).errors.length,0);
 assert.ok(validateAuthorSelection({...first,first_issue:false},null).errors.length);
 assert.ok(validateAuthorSelection(first,prior).errors.length);
 assert.equal(validateAuthorSelection(candidate([article('new',[b])]),{issue:'2026-11',articles:[article('old1',[a]),article('old2',[a])]}).errors.length,0);
});

test('site adapter resolves profile aliases and fails on missing identity evidence',async()=>{
 const {readSiteEdition}=await import('../scripts/editorial/author-selection.mjs');
 const fs=await import('node:fs'); const path=await import('node:path'); const os=await import('node:os');
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'sishu-author-selection-'));
 const put=(name,body)=>{const file=path.join(root,name);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,body);};
 try {
  put('public/writers/alpha.html','canonical profile');
  put('public/writers/beta.html','canonical profile');
  put('provenance/writer-merges.json',JSON.stringify({groups:[{canonical:a,members:[{route:a},{route:'/shishu/writers/old-alpha.html'}]}]}));
  put('public/edition-reader.json',JSON.stringify({'/editions/2026-12/':{items:[{href:'/one.html',title:'One'},{href:'/two.html',title:'Two'}]}}));
  put('public/one.html',`<p class="ia-byline"><a href="/writers/old-alpha.html">Different name</a></p>`);
  put('public/two.html',`<p class='ia-byline extra'><a href='${a}'>Other spelling</a><a href='${b}'>Coauthor</a></p>`);
  const selected=readSiteEdition('/editions/2026-12/',undefined,root);
  assert.equal(selected.issue,'2026-12');assert.deepEqual(selected.articles.map(x=>x.author_profiles),[[a],[a,b]]);
  assert.equal(validateAuthorSelection(selected,prior).duplicates[0].author_profile,a);
  put('public/two.html','<p class="ia-byline">Unresolved author name</p>');
  assert.throws(()=>readSiteEdition('/editions/2026-12/',undefined,root),/Missing canonical author link/);
  assert.throws(()=>readSiteEdition('/unknown.html',undefined,root),/explicit YYYY-MM/);
  assert.throws(()=>readSiteEdition('/editions/2026-12/?x=1',undefined,root),/Invalid edition/);
 } finally {fs.rmSync(root,{recursive:true,force:true});}
});
