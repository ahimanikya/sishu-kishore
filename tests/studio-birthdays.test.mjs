import test from 'node:test';
import assert from 'node:assert/strict';
import {validateBirthday,mergeAuthorBirthdays,birthdaysForIssue} from '../public/editorial/author-birthday-model.mjs';
const birthday=(day=3,month=11)=>({day,month,year:null,source:'Verified source fixture',approved:true});
const authors=[{path:'/writers/a.html',name:'ଅ',birthday:birthday()},{path:'/writers/b.html',name:'ଆ',birthday:birthday(1,10)}];
test('birthday validation preserves unknown years and validates real calendar days',()=>{
 assert.equal(validateBirthday(birthday()).year,null);
 assert.deepEqual(validateBirthday(null),null);
 assert.equal(validateBirthday(birthday(29,2)).day,29);
 assert.throws(()=>validateBirthday({...birthday(29,2),year:2025}));
 assert.equal(validateBirthday({...birthday(29,2),year:2024}).day,29);
 for(const value of [birthday(31,4),birthday(0,11),birthday(2,13),{...birthday(),source:''},{...birthday(),approved:'yes'},{...birthday(),year:99}])assert.throws(()=>validateBirthday(value));
});
test('edition month selects all approved authors without literary quota or wall clock',()=>{
 assert.deepEqual(birthdaysForIssue(authors,'2026-11').map(a=>a.path),['/writers/a.html']);
 assert.deepEqual(birthdaysForIssue(authors,'2030-10').map(a=>a.path),['/writers/b.html']);
 assert.equal(birthdaysForIssue([{...authors[0],birthday:{...birthday(),approved:false}}],'2026-11').length,0);
 assert.equal(birthdaysForIssue(authors,'2026-12').length,0);
 assert.throws(()=>birthdaysForIssue(authors,''));
 assert.throws(()=>birthdaysForIssue(authors,'2026-13'));
});
test('private central edits override catalog dates by canonical identity, with null clearing',()=>{
 const merged=mergeAuthorBirthdays(authors,[{profile:'/writers/a.html',birthday:birthday(8,12),revision:2}]);
 assert.equal(merged[0].birthdayRevision,2);assert.equal(merged[0].birthday.month,12);
 assert.equal(authors[0].birthday.month,11);
 assert.equal(birthdaysForIssue(merged,'2026-11').length,0);
 const cleared=mergeAuthorBirthdays(authors,[{profile:'/writers/a.html',birthday:null,revision:3}]);
 assert.equal(cleared[0].birthday,null);
});
test('unknown authors, duplicate identities and malformed revision records cannot be merged',()=>{
 assert.throws(()=>mergeAuthorBirthdays([...authors,authors[0]]));
 for(const overrides of [[{profile:'/writers/unknown.html',birthday:birthday(),revision:1}],[{profile:'https://other.test/a',birthday:birthday(),revision:1}],[{profile:'/writers/a.html',birthday:birthday(),revision:0}],[{profile:'/writers/a.html',birthday:birthday(),revision:1},{profile:'/writers/a.html',birthday:birthday(),revision:2}]])assert.throws(()=>mergeAuthorBirthdays(authors,overrides));
});
test('birthday acknowledgements sort by day and preserve Odia names and canonical links',()=>{
 const many=[...authors,{path:'/writers/c.html',name:'କ',birthday:birthday(1,11)}];
 assert.deepEqual(birthdaysForIssue(many,'2026-11').map(a=>[a.birthday.day,a.name]),[[1,'କ'],[3,'ଅ']]);
});
