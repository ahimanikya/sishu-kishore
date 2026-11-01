import {collection,doc,getDoc,getDocs,query,limit,orderBy,runTransaction,serverTimestamp} from 'firebase/firestore';
import {validateBirthday} from '../../public/editorial/author-birthday-model.mjs';
import {validateWorkspace,reviewProblems} from '../../public/editorial/studio-model.mjs';
const validId=id=>typeof id==='string' && /^[a-zA-Z0-9_-]{1,80}$/.test(id);
const conflict=()=>Object.assign(new Error('The shared draft changed. Export this copy and reload before saving.'),{code:'studio/conflict'});
export function createStudioService(db, assertSession) {
 const check=id=>{assertSession();if(!validId(id))throw Error('Invalid workspace identity.');};
 const decode=snapshot=>{
  if(!snapshot.exists())return null;
  const data=snapshot.data();
  if(!Number.isSafeInteger(data.revision)||data.revision<1)throw Error('Invalid saved revision.');
  const payload=validateWorkspace(JSON.parse(data.payload));
  if(payload.kind!==data.kind||payload.title!==data.title||payload.state!==data.state)throw Error('Saved envelope mismatch.');
  return {id:snapshot.id,...data,payload};
 };
 const authorId=profile=>{if(typeof profile!=='string'||!/^\/writers\/[a-zA-Z0-9][a-zA-Z0-9_-]*\.html$/.test(profile))throw Error('Choose a canonical author profile.');return profile.slice(9,-5);};
 const authorRecord=snapshot=>{const d=snapshot.data();if(!Number.isSafeInteger(d.revision)||d.revision<1||snapshot.id!==authorId(d.profile))throw Error('Invalid author record.');return {profile:d.profile,birthday:validateBirthday(d.birthday),revision:d.revision};};
 return {
  async listAuthorBirthdays(){assertSession();const result=await getDocs(collection(db,'editorAuthors'));assertSession();return result.docs.map(authorRecord);},
  async saveAuthorBirthday(profile,birthday,expectedRevision){
   assertSession();const id=authorId(profile),valid=validateBirthday(birthday);
   if(!Number.isSafeInteger(expectedRevision)||expectedRevision<0)throw Error('Invalid author revision.');
   const reference=doc(db,'editorAuthors',id);
   const result=await runTransaction(db,async transaction=>{
    const old=await transaction.get(reference),uid=assertSession(),revision=old.exists()?old.data().revision:0;
    if(revision!==expectedRevision)throw conflict();
    const record={format:'sishu-author-birthday-v1',profile,birthday:valid,revision:revision+1,updatedBy:uid,updatedAt:serverTimestamp()};
    transaction.set(reference,record);transaction.set(doc(db,'editorAuthors',id,'history',String(record.revision)),record);
    return {profile,birthday:valid,revision:record.revision};
   });assertSession();return result;
  },
  async list(){assertSession();const result=await getDocs(query(collection(db,'editorStudios'),orderBy('updatedAt','desc'),limit(200)));assertSession();return result.docs.map(decode);},
  async load(id){check(id);const result=await getDoc(doc(db,'editorStudios',id));assertSession();return decode(result);},
  async history(id){check(id);const result=await getDocs(query(collection(db,'editorStudios',id,'history'),orderBy('revision','desc'),limit(20)));assertSession();return result.docs.map(decode);},
  async save(id,input,expectedRevision){
   check(id);if(!Number.isSafeInteger(expectedRevision)||expectedRevision<0)throw Error('Invalid expected revision.');
   const payload=validateWorkspace(input),encoded=JSON.stringify(payload);
   if(payload.state==='review' && reviewProblems(payload).length)throw Error('Complete the remaining checks before requesting review.');
   if(new TextEncoder().encode(encoded).length>700000)throw Error('Workspace too large.');
   const reference=doc(db,'editorStudios',id);
   const result=await runTransaction(db,async transaction=>{
    const current=await transaction.get(reference),uid=assertSession();
    const revision=current.exists()?current.data().revision:0;
    if(revision!==expectedRevision)throw conflict();
    if(current.exists()&&current.data().kind!==payload.kind)throw Error('Workspace kind cannot change.');
    const record={format:'sishu-studio-record-v1',revision:revision+1,kind:payload.kind,title:payload.title,state:payload.state,payload:encoded,updatedBy:uid,updatedAt:serverTimestamp()};
    transaction.set(reference,record);
    transaction.set(doc(db,'editorStudios',id,'history',String(record.revision)),record);
    return {id,...record,payload};
   });assertSession();return result;
  }
 };
}
