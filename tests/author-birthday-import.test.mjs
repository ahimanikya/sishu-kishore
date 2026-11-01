import test from 'node:test';import assert from 'node:assert/strict';
import {reconcileAuthorBirthdays} from '../scripts/editorial/import-author-birthdays.mjs';
const a='/writers/one.html',b='/writers/two.html',catalog={authors:[{path:a},{path:b}]},birthday={day:3,month:11,year:null,source:'Synthetic verified source',approved:true};
test('reviewed author export changes only explicit canonical records and supports clearing',()=>{
 const original={version:1,authors:{[a]:birthday,[b]:birthday}},input={format:'sishu-author-birthdays-v1',authors:[{profile:a,birthday:null}]};
 const result=reconcileAuthorBirthdays(input,catalog,original);assert.equal(result.changes.length,1);assert.equal(result.registry.authors[a],null);assert.deepEqual(result.registry.authors[b],birthday);assert.deepEqual(original.authors[a],birthday);
});
test('unknown identities, duplicate records and impossible dates cannot enter registry',()=>{
 for(const authors of [[{profile:'/writers/missing.html',birthday}],[{profile:a,birthday},{profile:a,birthday}],[{profile:a,birthday:{...birthday,day:31,month:2}}]])assert.throws(()=>reconcileAuthorBirthdays({format:'sishu-author-birthdays-v1',authors},catalog,{version:1,authors:{}}));
});

test('unapproved private dates are cleared from the public registry, not copied into it',()=>{
 const result=reconcileAuthorBirthdays({format:'sishu-author-birthdays-v1',authors:[{profile:a,birthday:{...birthday,approved:false}}]},catalog,{version:1,authors:{[a]:birthday}});
 assert.equal(result.registry.authors[a],null);
});
