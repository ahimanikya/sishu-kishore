import test from 'node:test';
import assert from 'node:assert/strict';
import {newProject, validateProject, fingerprint, candidateFingerprint} from '../scripts/editorial/model.mjs';
const bytes = Buffer.from('Synthetic test text, not a manuscript.');
const options = {readArtifact: () => bytes};
function artifact(id, kind, depends = []) {
  return {id, kind, revision: 1, file: `test/${id}.txt`, sha256: fingerprint(bytes), state: 'ready',
    depends_on: depends.map(id => ({id, revision: 1})), open_findings: [],
    reviews: [{reviewer: 'test fixture', kind: 'self_review', revision: 1, outcome: 'pass', dimensions: ['source_fidelity'], evidence: 'Synthetic fixture review'}]};
}
function candidate() {
  const r = newProject('magazine', 'fixture');
  r.artifacts = [artifact('source','source'), artifact('writer','author'), artifact('story','article',['source','writer']),
    artifact('art','illustration',['story']), artifact('contents','contents',['story']), artifact('cover','cover',['contents']),
    artifact('layout','layout',['contents','art','cover'])];
  r.required_artifacts = ['layout']; r.visibility = 'unlisted'; r.destination = '/review/fixture/';
  r.stages.forEach(s => {s.state = 'done'; s.evidence = 'Synthetic fixture only';});
  r.authorization = {human:r.creative_editor, instruction:'Synthetic authorization, not a real approval', candidate_revision:1, visibility:r.visibility, destination:r.destination, candidate_sha256:candidateFingerprint(r)};
  return r;
}
test('empty draft is usable but cannot pass release; unsafe identifiers rejected', () => {
  const r = newProject('book', 'fixture');
  assert.equal(validateProject(r).errors.length, 0);
  assert.ok(validateProject(r, {release:true}).errors.length);
  assert.throws(() => newProject('magazine','../../public/test'));
});
test('complete synthetic candidate passes structural pre-release check', () => {
  assert.deepEqual(validateProject(candidate(), {...options, release:true}).errors, []);
});
test('changed source revision invalidates images and layout transitively', () => {
  const r = candidate(); r.artifacts[0].revision = 2;
  const report = validateProject(r, options);
  assert.ok(report.stale.includes('story')); assert.ok(report.stale.includes('art')); assert.ok(report.stale.includes('layout'));
});
test('changed bytes invalidate the source even when revision was not bumped', () => {
  const r = candidate();
  const result = validateProject(r, {readArtifact: file => file === 'test/source.txt' ? Buffer.from('changed') : bytes});
  assert.ok(result.stale.includes('layout'));
});
test('review of an older revision and open findings block release', () => {
  const r = candidate(); r.artifacts[2].reviews[0].revision = 9; r.artifacts[3].open_findings.push('Wrong scene');
  const result = validateProject(r, {...options,release:true});
  assert.ok(result.errors.some(e=>e.includes('passing review'))); assert.ok(result.errors.some(e=>e.includes('unresolved')));
});
test('wrong visibility, destination or candidate authorization cannot pass', () => {
  for (const [key,value] of [['visibility','public'],['destination','/another/'],['candidate_revision',2]]) {
    const r = candidate(); r.authorization[key] = value;
    assert.ok(validateProject(r,{...options,release:true}).errors.some(e=>e.includes('authorization')));
  }
});
test('cycles and dangling author links are rejected', () => {
  const r = candidate(); r.artifacts[0].depends_on = [{id:'layout',revision:1}];
  assert.ok(validateProject(r,options).errors.some(e=>e.includes('cycle')));
  r.artifacts[0].depends_on = []; r.artifacts.splice(1,1);
  assert.ok(validateProject(r,options).errors.some(e=>e.includes('missing dependency writer')));
});
test('a translation cannot rely solely on a bridge translation', () => {
  const r = candidate(); r.artifacts.push(artifact('english','translation',['story']),artifact('hindi','translation',['english']));
  r.required_artifacts.push('hindi');
  assert.ok(validateProject(r,{...options,release:true}).errors.some(e=>e.includes('directly on original')));
});
test('release requires actual file verification and forbids private or retired destinations', () => {
  assert.ok(validateProject(candidate(),{release:true}).errors.some(e=>e.includes('actual file')));
  const r=candidate();r.visibility='private';r.destination='/shishu/review/';
  assert.ok(validateProject(r,{...options,release:true}).errors.some(e=>e.includes('Private')));
  assert.ok(validateProject(r,{...options,release:true}).errors.some(e=>e.includes('Retired')));
});

test('changing an accepted candidate without changing its revision invalidates authorization', () => {
  const r=candidate();r.artifacts[2].metadata={title:'Changed title'};
  assert.ok(validateProject(r,{...options,release:true}).errors.some(e=>e.includes('authorization')));
});
test('malformed top-level arrays produce errors rather than throwing', () => {
  const r=candidate();r.artifacts={};r.required_artifacts=null;
  assert.ok(validateProject(r,options).errors.length);
});

test('public magazine release requires complete author selection and a resolved rotation policy',()=>{
 const r=candidate();r.visibility='public';
 let report=validateProject(r,{...options,release:true});
 assert.ok(report.errors.some(e=>e.includes('author_selection')));
 r.author_selection={candidate:{issue:'2026-12',articles:[{id:'story',title:'Test',author_profiles:['/writers/a.html']},{id:'extra',title:'Second',author_profiles:['/writers/a.html']}]},previous:{issue:'2026-11',articles:[{id:'prior',title:'Earlier',author_profiles:['/writers/b.html']}]}};
 report=validateProject(r,{...options,release:true});
 assert.ok(report.errors.some(e=>e.includes('More than one contribution')));
 assert.ok(report.errors.some(e=>e.includes('exactly the release article')));
});
test('public release accepts unique rotated authors and rejects a consecutive author',()=>{
 const r=candidate();r.visibility='public';r.destination='/editions/2026-12/';
 r.author_selection={candidate:{issue:'2026-12',articles:[{id:'story',title:'Test',author_profiles:['/writers/a.html']}]},previous:{issue:'2026-11',articles:[{id:'prior',title:'Earlier',author_profiles:['/writers/b.html']}]}};
 r.authorization={...r.authorization,visibility:r.visibility,destination:r.destination,candidate_sha256:candidateFingerprint(r)};
 assert.deepEqual(validateProject(r,{...options,release:true}).errors,[]);
 r.author_selection.previous.articles[0].author_profiles=['/writers/a.html'];
 r.authorization.candidate_sha256=candidateFingerprint(r);
 assert.ok(validateProject(r,{...options,release:true}).errors.some(e=>e.includes('previous issue')));
});
test('integrated book release requires its own output QA even with renewed authorization',()=>{
 const r=candidate();r.kind='book';r.stages=newProject('book','fixture').stages;
 r.stages.forEach(s=>{s.state='done';s.evidence='Synthetic fixture';});
 r.artifacts.find(x=>x.id==='story').kind='book-text';delete r.author_selection;
 const review={reviewer:'Fixture',outcome:'pass',evidence:'Synthetic only'};
 r.book_plan={audience:{age_band:'8–10',reading_mode:'shared'},source_language:'or',source_preservation:{location:'test/source.txt',evidence:'Synthetic'},rights:{confirmed:true,evidence:'Synthetic'},credits:{authors:['Fixture author'],evidence:'Synthetic'},sections:[{id:'story',source_refs:['Source page 1'],text_mode:'born_digital',unresolved_readings:[]}],language_editions:[{language:'or',mode:'original',source_fidelity_review:review,natural_language_review:review,typography_review:review}],outputs:[{format:'web',languages:['or'],qa_review:review,discovery:{listed:false,indexed:false}},{format:'pdf',languages:['or'],qa_review:review,discovery:{listed:false,indexed:false}}]};
 r.authorization.candidate_sha256=candidateFingerprint(r);
 assert.deepEqual(validateProject(r,{...options,release:true}).errors,[]);
 delete r.book_plan.outputs[1].qa_review;r.authorization.candidate_sha256=candidateFingerprint(r);
 const errors=validateProject(r,{...options,release:true}).errors;
 assert.ok(errors.some(e=>e.includes('Output 2 pdf')));
 assert.ok(!errors.some(e=>e.includes('authorization')));
});
