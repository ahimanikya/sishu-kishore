import {readFileSync} from 'node:fs';
import {test,before,after,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {doc,getDoc,getDocs,collection,writeBatch,serverTimestamp,deleteDoc,setDoc} from 'firebase/firestore';
import {createStudioService} from '../src/studio-service.js';
let env;
before(async()=>env=await initializeTestEnvironment({projectId:'demo-sishu-birthdays',firestore:{rules:readFileSync('firestore.rules','utf8')}}));after(async()=>env?.cleanup());beforeEach(async()=>env.clearFirestore());
const db=(uid='editor',editor=true,verified=true)=>env.authenticatedContext(uid,{email_verified:verified,editor}).firestore();
const birthday={day:29,month:2,year:null,source:'Synthetic verified source',approved:true};
const profile='/writers/fixture.html';
function record(revision=1,b=birthday){return {format:'sishu-author-birthday-v1',profile,birthday:b,revision,updatedBy:'editor',updatedAt:serverTimestamp()};}
function save(database,revision=1,b=birthday){const batch=writeBatch(database),data=record(revision,b);batch.set(doc(database,'editorAuthors','fixture'),data);batch.set(doc(database,'editorAuthors','fixture','history',String(revision)),data);return batch.commit();}
test('author birthdays and history private to verified editors',async()=>{
 await assertSucceeds(save(db()));for(const d of [env.unauthenticatedContext().firestore(),db('reader',false),db('editor',true,false)]){
 await assertFails(getDoc(doc(d,'editorAuthors','fixture')));await assertFails(getDocs(collection(d,'editorAuthors')));await assertFails(getDoc(doc(d,'editorAuthors','fixture','history','1')));await assertFails(save(d,2));}
});
test('birthday writes require valid calendar, identity and paired immutable history',async()=>{
 const d=db();await assertFails(setDoc(doc(d,'editorAuthors','fixture'),record()));
 for(const b of [{...birthday,day:31,month:4},{...birthday,year:2025},{...birthday,source:''},{...birthday,day:'29'}])await assertFails(save(d,1,b));
 await assertSucceeds(save(d));await assertSucceeds(save(d,2,{...birthday,year:2000}));await assertFails(save(d,2));await assertFails(save(d,4));
 await assertFails(deleteDoc(doc(d,'editorAuthors','fixture')));await assertFails(deleteDoc(doc(d,'editorAuthors','fixture','history','1')));await assertFails(setDoc(doc(d,'editorAuthors','other'),record(3)));
});
test('birthday service roundtrips unknown years, rejects stale saves, and clears by new revision',async()=>{
 const service=createStudioService(db(),()=> 'editor');const first=await service.saveAuthorBirthday(profile,birthday,0);assert.equal(first.revision,1);assert.deepEqual((await service.listAuthorBirthdays())[0].birthday,birthday);
 await service.saveAuthorBirthday(profile,{...birthday,year:2000},1);
 await assert.rejects(service.saveAuthorBirthday(profile,birthday,1),e=>e.code==='studio/conflict');
 await service.saveAuthorBirthday(profile,null,2);assert.equal((await service.listAuthorBirthdays())[0].birthday,null);
 assert.equal((await getDoc(doc(db(),'editorAuthors','fixture','history','1'))).data().birthday.year,null);
 assert.equal((await getDocs(collection(db(),'publications'))).size,0);
});
