import {readFileSync} from 'node:fs';
import {test,before,after,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {doc,setDoc,getDoc,getDocs,collection,writeBatch,serverTimestamp,deleteDoc} from 'firebase/firestore';
let env;
before(async()=>env=await initializeTestEnvironment({projectId:'demo-sishu-studio',firestore:{rules:readFileSync('firestore.rules','utf8')}}));
after(async()=>env?.cleanup());beforeEach(async()=>env.clearFirestore());
const db=(uid='editor',editor=true,verified=true)=>env.authenticatedContext(uid,{email_verified:verified,editor}).firestore();
const record=(revision=1,extra={})=>({format:'sishu-studio-record-v1',revision,kind:'magazine',title:'Synthetic draft',state:'draft',payload:'{"synthetic":true}',updatedBy:'editor',updatedAt:serverTimestamp(),...extra});
function save(database,revision=1,extra={}){const batch=writeBatch(database),data=record(revision,extra);batch.set(doc(database,'editorStudios','fixture'),data);batch.set(doc(database,'editorStudios','fixture','history',String(revision)),data);return batch.commit();}
test('studio is editor-only, including all history and listings',async()=>{
 await assertSucceeds(save(db()));
 for(const database of [env.unauthenticatedContext().firestore(),db('writer',false),db('editor',true,false)]){
  await assertFails(getDoc(doc(database,'editorStudios','fixture')));await assertFails(getDocs(collection(database,'editorStudios')));
  await assertFails(getDoc(doc(database,'editorStudios','fixture','history','1')));await assertFails(save(database,2));
 }
 await assertSucceeds(getDocs(collection(db(),'editorStudios','fixture','history')));
});
test('studio revisions paired and sequential; history immutable',async()=>{
 const database=db();await assertFails(setDoc(doc(database,'editorStudios','fixture'),record()));
 await assertFails(setDoc(doc(database,'editorStudios','fixture','history','1'),record()));
 await assertSucceeds(save(database));await assertSucceeds(save(database,2));await assertFails(save(database,2));await assertFails(save(database,4));
 await assertFails(setDoc(doc(database,'editorStudios','fixture','history','1'),record()));
 await assertFails(deleteDoc(doc(database,'editorStudios','fixture')));await assertFails(deleteDoc(doc(database,'editorStudios','fixture','history','1')));
 assert.equal((await getDoc(doc(database,'editorStudios','fixture'))).data().revision,2);
});
test('studio rejects publication, forged identity, type changes and mismatched history',async()=>{
 for(const extra of [{state:'published'},{updatedBy:'other'},{kind:'unknown'},{title:''},{extra:'unexpected'}])await assertFails(save(db(),1,extra));
 await assertSucceeds(save(db()));await assertFails(save(db(),2,{kind:'book'}));
 const database=db(),batch=writeBatch(database);batch.set(doc(database,'editorStudios','fixture'),record(2));
 batch.set(doc(database,'editorStudios','fixture','history','2'),record(2,{title:'Different snapshot'}));await assertFails(batch.commit());
});
test('review snapshot stays private and creates no publication',async()=>{
 const database=db();await assertSucceeds(save(database,1,{state:'review',kind:'book'}));
 assert.equal((await getDocs(collection(database,'publications'))).size,0);
 await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(),'editorStudios','fixture')));
});
test('Studio service roundtrips snapshots and preserves winner on stale save',async()=>{
 const {createStudioService}=await import('../src/studio-service.js');
 const {newWorkspace}=await import('../../public/editorial/studio-model.mjs');
 const service=createStudioService(db(),()=> 'editor'),draft=newWorkspace('book');draft.title='Synthetic book';
 const first=await service.save('shared',draft,0);assert.equal(first.revision,1);
 assert.deepEqual((await service.load('shared')).payload,draft);
 const changed={...draft,title:'Winner'};await service.save('shared',changed,1);
 await assert.rejects(service.save('shared',{...draft,title:'Stale'},1),e=>e.code==='studio/conflict');
 assert.equal((await service.load('shared')).payload.title,'Winner');
 assert.deepEqual((await service.history('shared')).map(x=>x.revision),[2,1]);
 assert.equal((await service.list()).length,1);
 await assert.rejects(service.save('shared',{...draft,state:'review'},2));
 assert.equal((await service.load('shared')).revision,2);
});
test('Studio service denies ended sessions before reads and writes',async()=>{
 const {createStudioService}=await import('../src/studio-service.js');
 const service=createStudioService(db(),()=>{throw Object.assign(new Error('Ended'),{code:'studio/session'});});
 await assert.rejects(service.list(),e=>e.code==='studio/session');
 await assert.rejects(service.load('shared'),e=>e.code==='studio/session');
 await assert.rejects(service.save('shared',{},0),e=>e.code==='studio/session');
});
