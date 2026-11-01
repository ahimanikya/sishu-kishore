import test from 'node:test';
import assert from 'node:assert/strict';
import {newBookPlan, validateBookPlan} from '../scripts/editorial/book-production.mjs';
const review=()=>({reviewer:'Synthetic reviewer',outcome:'pass',evidence:'Synthetic fixture only.'});
function plan(){
 return {
  audience:{age_band:'7–10',reading_mode:'shared'}, source_language:'or',
  source_preservation:{location:'private/source.pdf',evidence:'All original pages inventoried.'},
  rights:{confirmed:true,evidence:'Synthetic authorization for requested editions.'},
  credits:{authors:['One author'],evidence:'Original author and artist credits retained.'},
  sections:[{id:'poem-1',source_refs:['pages 1–2'],text_mode:'transcription',unresolved_readings:[]},{id:'poem-2',source_refs:['pages 3–4'],text_mode:'transcription',unresolved_readings:[]}],
  language_editions:[{language:'or',mode:'original',source_fidelity_review:review(),natural_language_review:review(),typography_review:review()}],
  outputs:[{format:'web',languages:['or'],qa_review:review(),discovery:{listed:false,indexed:false}}],
 };
}
test('a single author may contribute multiple ordered book sections; no magazine rotation applies',()=>{
 assert.deepEqual(validateBookPlan(plan(),{release:true,requiredSectionIds:['poem-1','poem-2'],visibility:'unlisted'}).errors,[]);
 const english=plan();english.source_language='en';english.language_editions[0].language='en';english.outputs[0].languages=['en'];
 assert.deepEqual(validateBookPlan(english,{release:true}).errors,[]);
});
test('empty book planning record is a draft, not a release certificate',()=>{
 const draft=validateBookPlan(newBookPlan());assert.deepEqual(draft.errors,[]);assert.ok(draft.warnings.length>0);
 assert.ok(validateBookPlan(newBookPlan(),{release:true}).errors.length>0);
});
test('bilingual editions need independent language reviews and translator credit',()=>{
 const p=plan();p.language_editions.push({language:'en',mode:'translation',translator_credit:'Credited translator',source_fidelity_review:review(),natural_language_review:review(),typography_review:review()});p.outputs[0].languages.push('en');
 assert.deepEqual(validateBookPlan(p,{release:true}).errors,[]);
 delete p.language_editions[1].natural_language_review;
 assert.ok(validateBookPlan(p,{release:true}).errors.some(e=>e.includes('Language edition 2 natural language')));
 p.language_editions[1].natural_language_review=review();delete p.language_editions[1].translator_credit;
 assert.ok(validateBookPlan(p,{release:true}).errors.some(e=>e.includes('translator credit')));
});
test('web QA never certifies an additional requested PDF or EPUB',()=>{
 const p=plan();p.outputs.push({format:'pdf',languages:['or'],qa_review:null});
 assert.ok(validateBookPlan(p,{release:true}).errors.some(e=>e.includes('Output 2 pdf')));
 p.outputs[1].qa_review=review();assert.deepEqual(validateBookPlan(p,{release:true}).errors,[]);
 p.outputs.push({format:'epub',languages:['or'],qa_review:null});
 assert.ok(validateBookPlan(p,{release:true}).errors.some(e=>e.includes('Output 3 epub')));
});
test('uncertain transcription cannot become final text, while source facsimiles remain legitimate',()=>{
 const p=plan();p.sections[0].unresolved_readings=['Faded word in line 3.'];
 assert.deepEqual(validateBookPlan(p).errors,[]);assert.ok(validateBookPlan(p).warnings.some(e=>e.includes('unresolved')));
 assert.ok(validateBookPlan(p,{release:true}).errors.some(e=>e.includes('unresolved')));
 p.sections[0].text_mode='facsimile';const result=validateBookPlan(p,{release:true});
 assert.deepEqual(result.errors,[]);assert.ok(result.warnings.some(e=>e.includes('not certified transcription')));
});
test('ordered inventory cannot omit selected sections, duplicate IDs or source references',()=>{
 const p=plan();assert.ok(validateBookPlan(p,{release:true,requiredSectionIds:['poem-1','poem-2','poem-3']}).errors.some(e=>e.includes('exactly')));
 p.sections[1].id='poem-1';assert.ok(validateBookPlan(p).errors.some(e=>e.includes('Duplicate section')));
 p.sections[0].source_refs=[];assert.ok(validateBookPlan(p,{release:true}).errors.some(e=>e.includes('source pages')));
});
test('unlisted digital books require exclusions for every requested format',()=>{
 const p=plan();p.outputs.push({format:'pdf',languages:['or'],qa_review:review()});
 assert.ok(validateBookPlan(p,{release:true,visibility:'unlisted'}).errors.some(e=>e.includes('Output 2: unlisted')));
 p.outputs[1].discovery={listed:false,indexed:false};assert.deepEqual(validateBookPlan(p,{release:true,visibility:'unlisted'}).errors,[]);
});
test('malformed records, unsupported languages and unauthorized adaptations fail safely',()=>{
 for(const p of [null,[],{sections:null,language_editions:[null],outputs:[null],credits:{authors:42}}]) assert.doesNotThrow(()=>validateBookPlan(p,{release:true}));
 const p=plan();p.source_language='fr';assert.ok(validateBookPlan(p).errors.some(e=>e.includes('Source language')));
 p.source_language='or';p.language_editions[0].mode='adaptation';assert.ok(validateBookPlan(p,{release:true}).errors.some(e=>e.includes('adaptation authorization')));
 p.language_editions[0].adaptation_authorization='Explicit adaptation request.';
 assert.ok(validateBookPlan(p,{release:true}).errors.some(e=>e.includes('adapter credit')));
 p.language_editions[0].adapter_credit='Credited adapter';assert.deepEqual(validateBookPlan(p,{release:true}).errors,[]);
});
test('unchanged facsimiles record preservation without claiming a fresh literary proofread',()=>{
 const p=plan();p.sections.forEach(section=>section.text_mode='facsimile');
 const edition=p.language_editions[0];edition.unchanged_facsimile=true;edition.preservation_review=review();
 delete edition.natural_language_review;delete edition.source_fidelity_review;
 assert.deepEqual(validateBookPlan(p,{release:true}).errors,[]);
 p.sections[0].text_mode='transcription';assert.ok(validateBookPlan(p,{release:true}).errors.some(e=>e.includes('all sections')));
});
test('translated-only output is allowed; duplicate formats and missing language outputs are not',()=>{
 const p=plan();p.language_editions[0].language='en';p.language_editions[0].mode='translation';p.language_editions[0].translator_credit='Translator';p.outputs[0].languages=['en'];
 assert.deepEqual(validateBookPlan(p,{release:true}).errors,[]);
 p.outputs.push(structuredClone(p.outputs[0]));assert.ok(validateBookPlan(p,{release:true}).errors.some(e=>e.includes('Duplicate output')));
 p.outputs=[];assert.ok(validateBookPlan(p,{release:true}).errors.some(e=>e.includes('No requested output')));
});
