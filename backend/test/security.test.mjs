import {readFileSync} from 'node:fs';
import {test,before,after,beforeEach} from 'node:test';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {ref,uploadBytes,getBytes} from 'firebase/storage';
import {doc,setDoc,getDoc,getDocs,query,limit,collection,writeBatch,serverTimestamp,Timestamp,updateDoc} from 'firebase/firestore';
import {nextQuota} from '../src/quota.js';
let env;
before(async()=>env=await initializeTestEnvironment({projectId:'demo-sishu-kishore',firestore:{rules:readFileSync('firestore.rules','utf8')},storage:{rules:readFileSync('storage.rules','utf8')}}));after(async()=>env?.cleanup());beforeEach(async()=>env.clearFirestore());
const db=(uid='writer',editor=false,verified=true)=>env.authenticatedContext(uid,{email:uid+'@example.test',email_verified:verified,editor}).firestore();
const data=()=>({owner:'writer',name:'Writer',contact:'writer@example.test',kind:'article',title:'A story',body:'Private manuscript',page:'',status:'received',consent:'editorial-review-v1',createdAt:serverTimestamp(),updatedAt:serverTimestamp()});const id='abcdefghijklmnopqrst';
async function submit(database,overrides={}){const b=writeBatch(database);b.set(doc(database,'submissions',id),{...data(),...overrides});b.set(doc(database,'submissionLimits','writer'),nextQuota((await getDoc(doc(database,'submissionLimits','writer'))).data(),{id}));return b.commit();}
const pub=()=>({kind:'article',title:'Reviewed story',body:'Public text',byline:'Writer',issue:'/shishu/current_issue.html',page:'',image:'/art/cover.webp',state:'published',publishedAt:serverTimestamp()});
test('verified writer submits atomically',async()=>assertSucceeds(submit(db())));
test('anonymous cannot submit',async()=>assertFails(submit(env.unauthenticatedContext().firestore())));
test('unverified cannot submit',async()=>assertFails(submit(db('writer',false,false))));
test('missing throttle denied',async()=>assertFails(setDoc(doc(db(),'submissions',id),data())));
test('forged ownership denied',async()=>assertFails(submit(db(),{owner:'other'})));
test('self approval denied',async()=>assertFails(submit(db(),{status:'approved'})));
test('extra fields denied',async()=>assertFails(submit(db(),{editor:true})));
test('fast repeat denied',async()=>{await submit(db());const d=db(),b=writeBatch(d),next='bcdefghijklmnopqrstuA';b.set(doc(d,'submissions',next),data());b.set(doc(d,'submissionLimits','writer'),{id:next,at:serverTimestamp()});await assertFails(b.commit());});
test('owner read only; public and stranger denied',async()=>{await submit(db());await assertSucceeds(getDoc(doc(db(),'submissions',id)));await assertFails(getDoc(doc(db('stranger'),'submissions',id)));await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(),'submissions',id)));});
test('editor reviews; writer cannot approve',async()=>{await submit(db());await assertSucceeds(getDocs(collection(db('editor',true),'submissions')));await assertSucceeds(updateDoc(doc(db('editor',true),'submissions',id),{status:'reviewing',updatedAt:serverTimestamp()}));await assertFails(updateDoc(doc(db(),'submissions',id),{status:'approved',updatedAt:serverTimestamp()}));});
test('editor cannot overwrite original submission',async()=>{await submit(db());await assertFails(updateDoc(doc(db('editor',true),'submissions',id),{body:'Changed',updatedAt:serverTimestamp()}));});
test('only editor publishes; output public',async()=>{await assertFails(setDoc(doc(db(),'publications',id),pub()));await assertSucceeds(setDoc(doc(db('editor',true),'publications',id),pub()));await assertSucceeds(getDoc(doc(env.unauthenticatedContext().firestore(),'publications',id)));});
test('publication rejects contact leak',async()=>assertFails(setDoc(doc(db('editor',true),'publications',id),{...pub(),contact:'private@example.test'})));
test('drafts private',async()=>{const d={...pub(),sourceId:'',updatedAt:serverTimestamp()};delete d.state;delete d.publishedAt;await assertSucceeds(setDoc(doc(db('editor',true),'drafts',id),d));await assertFails(getDoc(doc(db(),'drafts',id)));await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(),'drafts',id)));});
test('unverified editor denied',async()=>assertFails(setDoc(doc(db('editor',true,false),'publications',id),pub())));
test('unknown collections closed',async()=>assertFails(setDoc(doc(db('editor',true),'roles','attacker'),{editor:true})));

test('attachment upload requires an existing owned submission',async()=>{const storage=env.authenticatedContext('writer',{email_verified:true}).storage();await assertFails(uploadBytes(ref(storage,'submissions/writer/missing/manuscript'),new Uint8Array([1]),{contentType:'text/plain'}));});
test('attachment cannot be read by a stranger or anonymous visitor',async()=>{await env.withSecurityRulesDisabled(async ctx=>uploadBytes(ref(ctx.storage(),'submissions/writer/private/manuscript'),new Uint8Array([1]),{contentType:'text/plain'}));await assertFails(getBytes(ref(env.unauthenticatedContext().storage(),'submissions/writer/private/manuscript')));await assertFails(getBytes(ref(env.authenticatedContext('other',{email_verified:true}).storage(),'submissions/writer/private/manuscript')));});
test('dangerous attachment type rejected',async()=>{await submit(db());const storage=env.authenticatedContext('writer',{email_verified:true}).storage();await assertFails(uploadBytes(ref(storage,`submissions/writer/${id}/manuscript`),new Uint8Array([1]),{contentType:'text/html'}));});

async function toggleLike(database,key='article-790',uid='writer',remove=false){const b=writeBatch(database),c=doc(database,'articleLikes',key),l=doc(database,'articleLikes',key,'readers',uid);const current=await getDoc(c);const quota=doc(database,'engagementLimits',uid);b.set(quota,nextQuota((await getDoc(quota)).data(),{article:key}));b.set(c,{count:(current.exists()?current.data().count:0)+(remove?-1:1)});if(remove)b.delete(l);else b.set(l,{at:serverTimestamp()});return b.commit();}
test('like/unlike atomically updates public count, readers remain private',async()=>{await assertSucceeds(toggleLike(db()));await assertSucceeds(getDoc(doc(env.unauthenticatedContext().firestore(),'articleLikes','article-790')));await assertFails(getDocs(collection(env.unauthenticatedContext().firestore(),'articleLikes','article-790','readers')));await assertFails(getDoc(doc(db('other'),'articleLikes','article-790','readers','writer')));await ageLike();await assertSucceeds(toggleLike(db(),'article-790','writer',true));});
test('duplicate like cannot inflate count',async()=>{await toggleLike(db());await assertFails(toggleLike(db()));});
test('like counter cannot be changed alone or with forged identity',async()=>{await assertFails(setDoc(doc(db(),'articleLikes','article-790'),{count:100}));await assertFails(toggleLike(db(),'article-790','other'));});
test('anonymous and unverified likes rejected',async()=>{await assertFails(toggleLike(env.unauthenticatedContext().firestore()));await assertFails(toggleLike(db('writer',false,false)));});
test('two readers have independent likes',async()=>{await toggleLike(db());await toggleLike(db('other'),'article-790','other');const c=await getDoc(doc(db(),'articleLikes','article-790'));if(c.data().count!==2)throw Error('wrong count');await ageLike();await toggleLike(db(),'article-790','writer',true);});
test('comment uses private moderated submissions and cannot self-publish',async()=>{await assertSucceeds(submit(db(),{kind:'comment',page:'/shishu/article-790.html',name:'ପାଠକ'}));await assertFails(getDocs(collection(env.unauthenticatedContext().firestore(),'submissions')));await assertFails(setDoc(doc(db(),'publications',id),{...pub(),kind:'comment',page:'/shishu/article-790.html'}));});
test('oversized comments rejected',async()=>assertFails(submit(db(),{kind:'comment',body:'x'.repeat(2001)})));

async function ageLike(){await env.withSecurityRulesDisabled(async c=>updateDoc(doc(c.firestore(),'engagementLimits','writer'),{at:Timestamp.fromMillis(Date.now()-5000)}));}
test('rapid like toggles denied even with atomic counters',async()=>{await toggleLike(db());await assertFails(toggleLike(db(),'article-790','writer',true));});
test('hourly submission cap cannot be reset early',async()=>{await env.withSecurityRulesDisabled(async c=>setDoc(doc(c.firestore(),'submissionLimits','writer'),{id:'old',at:Timestamp.fromMillis(Date.now()-120000),startedAt:Timestamp.fromMillis(Date.now()-180000),count:10}));await assertFails(submit(db()));});
test('expired submission window resets',async()=>{await env.withSecurityRulesDisabled(async c=>setDoc(doc(c.firestore(),'submissionLimits','writer'),{id:'old',at:Timestamp.fromMillis(Date.now()-3700000),startedAt:Timestamp.fromMillis(Date.now()-3700000),count:10}));await assertSucceeds(submit(db()));});
test('quota cannot be advanced independently',async()=>assertFails(setDoc(doc(db(),'submissionLimits','writer'),nextQuota(null,{id}))));
test('forged contact email denied',async()=>assertFails(submit(db(),{contact:'someoneelse@example.test'})));
test('hourly like cap enforced',async()=>{await env.withSecurityRulesDisabled(async c=>setDoc(doc(c.firestore(),'engagementLimits','writer'),{article:'article-1',at:Timestamp.fromMillis(Date.now()-5000),startedAt:Timestamp.fromMillis(Date.now()-60000),count:60}));await assertFails(toggleLike(db()));});

test('public comment queries require a bounded limit',async()=>{const d=env.unauthenticatedContext().firestore();await assertFails(getDocs(collection(d,'publications')));await assertFails(getDocs(query(collection(d,'publications'),limit(101))));await assertSucceeds(getDocs(query(collection(d,'publications'),limit(100))));});
test('public cannot enumerate like counters',async()=>assertFails(getDocs(collection(env.unauthenticatedContext().firestore(),'articleLikes'))));
test('a fabricated fresh quota window cannot evade submission cap',async()=>{await env.withSecurityRulesDisabled(async c=>setDoc(doc(c.firestore(),'submissionLimits','writer'),{id:'old',at:Timestamp.fromMillis(Date.now()-120000),startedAt:Timestamp.fromMillis(Date.now()-180000),count:10}));const d=db(),batch=writeBatch(d);batch.set(doc(d,'submissions',id),data());batch.set(doc(d,'submissionLimits','writer'),nextQuota(null,{id}));await assertFails(batch.commit());});
