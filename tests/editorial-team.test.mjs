import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {validateTeam, safeFile} from '../scripts/editorial/team.mjs';
const content = Buffer.from('reviewed candidate');
const digest = createHash('sha256').update(content).digest('hex');
function fixture() {
  const human = 'Ahimanikya Satapathy';
  return {
    assignments:{version:1,human_supervisor:human,human_role:'Creative Editor',human_editors:'peers',authorization:'Test fixture instruction',assignments:['Disha','Anvesha','Samanta','Drishti'].map(name=>({name,reports_to:human,mode:name==='Disha'?'coordinator':'separate_task_agent',scope:'Test scope',human_reports:[]}))},
    operations:{version:1,human_supervisor:human,human_role:'Creative Editor',coordinator:'Disha',shared_writer:'Disha',publisher:'Disha',maximum_active_units:1,unit_types:['article','book_section','edition_assembly','bounded_maintenance','author_profile','translation_section','illustration_batch']},
    handoff:{id:'test',task:'Synthetic work',authorization:'Test fixture, not real approval',input_head:'abcdef123',unit_type:'bounded_maintenance',status:'in_progress',coordinator:'Disha',coordinator_files:['kb/team/receipt.json'],workers:[{role:'Samanta',runtime:'/root/samanta',status:'running',mode:'write',reserved_files:['scripts/example.mjs'],result:null}],review:null,delivery:null},
  };
}
const check = (f,options) => validateTeam(f.assignments,f.operations,f.handoff,options);
function reviewed(status='ready') {
  const f=fixture(), h=f.handoff;
  h.status=status;
  h.workers[0].status='completed';h.workers[0].reservations_released=true;h.workers[0].result={summary:'Implemented candidate',evidence:['Focused tests passed']};
  h.workers.push({role:'Drishti',runtime:'/root/drishti',status:'completed',mode:'read_only',reserved_files:[],reservations_released:true,result:{summary:'Reviewed candidate',evidence:['Read implementation and test evidence']}});
  h.review={reviewer:'Drishti',runtime:'/root/drishti',kind:'separate_ai_review',outcome:'pass',evidence:['Inspected exact candidate'],candidate_files:{'scripts/example.mjs':digest}};
  if(status==='completed') {h.coordinator_reservations_released=true;h.delivery={mode:'local',evidence:['Internal work only; local checks passed']};}
  return f;
}
test('active scoped team and reviewed candidate are structurally valid',()=>{
  assert.deepEqual(check(fixture()).errors,[]);
  assert.deepEqual(check(reviewed(),{readFile:()=>content}).errors,[]);
});
test('human reporting and coordinator authority cannot silently change',()=>{
  const f=fixture();f.assignments.assignments[2].reports_to='Disha';f.operations.publisher='Samanta';
  assert.ok(check(f).errors.some(e=>e.includes('reporting')));assert.ok(check(f).errors.some(e=>e.includes('Disha alone')));
});
test('duplicate roles and multiple active unit configuration are rejected',()=>{
  const f=fixture();f.assignments.assignments[3].name='Samanta';f.operations.maximum_active_units=2;
  assert.ok(check(f).errors.some(e=>e.includes('distinct')));assert.ok(check(f).errors.some(e=>e.includes('one active')));
});
test('active worker cannot reserve coordinator or another worker file',()=>{
  const f=fixture();f.handoff.workers[0].reserved_files.push('kb/team/receipt.json');
  f.handoff.workers.push({role:'Anvesha',status:'assigned',mode:'write',reserved_files:['scripts/example.mjs']});
  assert.equal(check(f).errors.filter(e=>e.includes('Conflicting')).length,2);
});
test('traversal, wildcard, absolute and parent-directory reservations are rejected',()=>{
  for(const file of ['../outside','/absolute','scripts/*','scripts/../x','scripts\\x','scripts/','C:/file']) assert.equal(safeFile(file),false,file);
  const f=fixture();f.handoff.coordinator_files=['scripts'];
  assert.ok(check(f).errors.some(e=>e.includes('Conflicting')));
});
test('running workers need actual distinct runtime identities',()=>{
  const f=fixture();f.handoff.workers[0].runtime=null;
  assert.ok(check(f).errors.some(e=>e.includes('runtime identity')));
  f.handoff.workers[0].runtime='/root';assert.ok(check(f).errors.some(e=>e.includes('distinct')));
});
test('reviewer cannot write or reuse implementation runtime',()=>{
  const f=reviewed();f.handoff.workers[1].mode='write';f.handoff.workers[1].runtime='/root/samanta';f.handoff.review.runtime='/root/samanta';
  assert.ok(check(f,{readFile:()=>content}).errors.some(e=>e.includes('read-only')));
  assert.ok(check(f,{readFile:()=>content}).errors.some(e=>e.includes('distinct')));
});
test('active review detects changed files and requires verification',()=>{
  assert.ok(check(reviewed(),{readFile:()=>Buffer.from('modified')}).errors.some(e=>e.includes('changed')));
  assert.ok(check(reviewed()).errors.some(e=>e.includes('verification')));
});
test('review must identify exact candidate and matching reviewer',()=>{
  const f=reviewed();delete f.handoff.review.candidate_files;f.handoff.review.runtime='/root/someone-else';
  assert.ok(check(f).errors.some(e=>e.includes('pin')));assert.ok(check(f).errors.some(e=>e.includes('actual separate')));
});
test('completed task needs released reservations, results and delivery',()=>{
  const f=reviewed('completed');f.handoff.coordinator_reservations_released=false;f.handoff.workers[0].reservations_released=false;f.handoff.workers[0].result=null;f.handoff.delivery=null;
  assert.ok(check(f).errors.some(e=>e.includes('Release coordinator')));
  assert.ok(check(f).errors.some(e=>e.includes('explicitly released')));
  assert.ok(check(f).errors.some(e=>e.includes('result and evidence')));
  assert.ok(check(f).errors.some(e=>e.includes('delivery evidence')));
});
test('completed history preserves released file lists without rechecking later file changes',()=>{
  const f=reviewed('completed');f.handoff.coordinator_files.push('scripts/example.mjs');
  assert.deepEqual(check(f,{readFile:()=>{throw Error('historical file no longer exists');}}).errors,[]);
});
test('malformed records and workers fail closed without throwing',()=>{
  assert.ok(validateTeam(null,{},{}).errors.length);
  const f=fixture();f.assignments.assignments=[null];f.handoff.workers=[null,{},'bad'];f.handoff.coordinator_files={};f.handoff.review=[];
  assert.ok(check(f).errors.length);
});

function selfReviewed(status='ready') {
  const f=reviewed(status);f.handoff.workers=[];
  f.handoff.review={...f.handoff.review,reviewer:'Disha',runtime:'/root',kind:'self_review',exception_reason:'trivial_change',limitation:'One assistant performed implementation and review; no independent review.'};
  return f;
}
test('ready cannot race a running implementer or reviewer',()=>{
  for(const workerIndex of [0,1]) {
    const f=reviewed();f.handoff.workers[workerIndex].status='running';f.handoff.workers[workerIndex].reservations_released=false;
    assert.ok(check(f,{readFile:()=>content}).errors.some(e=>e.includes('completed workers only')));
  }
});
test('bounded coordinator self-review permits empty workers for ready and completed records',()=>{
  for(const status of ['ready','completed']) {
    const f=selfReviewed(status);
    assert.deepEqual(check(f,{readFile:()=>content}).errors,[]);
    f.handoff.review.exception_reason='separate_agents_unavailable';
    assert.deepEqual(check(f,{readFile:()=>content}).errors,[]);
  }
});
test('self-review without valid reason, limitation or coordinator identity is rejected',()=>{
  for(const [key,value] of [['exception_reason','convenience'],['limitation',''],['runtime','/root/other'],['reviewer','Samanta'],['independent',true]]) {
    const f=selfReviewed();f.handoff.review[key]=value;
    assert.ok(check(f,{readFile:()=>content}).errors.some(e=>e.includes('Self-review requires')),key);
  }
});
test('self-review cannot be relabelled separate and still needs candidate evidence',()=>{
  const f=selfReviewed();f.handoff.review.kind='separate_ai_review';
  assert.ok(check(f,{readFile:()=>content}).errors.some(e=>e.includes('actual separate')));
  const g=selfReviewed();delete g.handoff.review.candidate_files;
  assert.ok(check(g,{readFile:()=>content}).errors.some(e=>e.includes('pin')));
  g.handoff.review.candidate_files={'scripts/example.mjs':digest};g.handoff.review.evidence=[];
  assert.ok(check(g,{readFile:()=>content}).errors.some(e=>e.includes('outcome and evidence')));
});
test('ready workers must release reservations and return results while coordinator retains ownership',()=>{
  const f=reviewed();f.handoff.workers[0].reservations_released=false;f.handoff.workers[1].result=null;f.handoff.coordinator_reservations_released=true;
  const result=check(f,{readFile:()=>content});
  assert.ok(result.errors.some(e=>e.includes('explicitly released')));
  assert.ok(result.errors.some(e=>e.includes('result and evidence')));
  assert.ok(result.errors.some(e=>e.includes('Keep coordinator')));
});
