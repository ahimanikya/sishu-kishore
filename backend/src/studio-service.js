import {collection,doc,getDoc,getDocs,query,limit,orderBy,runTransaction,serverTimestamp} from 'firebase/firestore';
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
 return {
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
