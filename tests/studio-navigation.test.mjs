import test from 'node:test';
import assert from 'node:assert/strict';
import {filterPublications} from '../public/editorial/studio-ui.mjs';
const records=[
 {id:'one',payload:{title:'Winter issue',theme:'Stories',month:'2026-12',kind:'magazine',state:'draft'}},
 {id:'two',payload:{title:'Summer book',theme:'Birds',month:'',kind:'book',state:'review'}},
 {id:'three',payload:{title:'Cafe\u0301 poems',theme:'Nature',month:'2027-01',kind:'magazine',state:'review'}}
];
test('publication filters combine search, kind and state while preserving saved order',()=>{
 assert.deepEqual(filterPublications(records,{query:'  WINTER ',kind:'magazine',state:'draft'}).map(r=>r.id),['one']);
 assert.deepEqual(filterPublications(records,{state:'review'}).map(r=>r.id),['two','three']);
 assert.deepEqual(filterPublications(records,{query:'birds',kind:'magazine'}),[]);
 assert.deepEqual(filterPublications(records,{query:'2027-01'}).map(r=>r.id),['three']);
});
test('publication search handles composed text without mutating manuscripts or records',()=>{
 const before=JSON.stringify(records);
 assert.deepEqual(filterPublications(records,{query:'Café'}).map(r=>r.id),['three']);
 assert.equal(JSON.stringify(records),before);
 assert.equal(filterPublications(records)[0],records[0]);
});
