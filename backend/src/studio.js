import {getMagazineApp} from './app.js';
import {getAuth,GoogleAuthProvider,signInWithPopup,signOut,onAuthStateChanged,browserSessionPersistence,setPersistence,getIdTokenResult} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';
import {createStudioService} from './studio-service.js';
import {mountStudio} from '../../public/editorial/studio-ui.mjs';
const app=getMagazineApp(),auth=getAuth(app),db=getFirestore(app),root=document.querySelector('#studio-app');
const el=(tag,text)=>{const node=document.createElement(tag);node.textContent=text;return node;};
let generation=0,cleanup;
const message=error=>error?.code==='auth/popup-blocked'?'ସାଇନ୍ ଇନ୍ ପାଇଁ ପପ୍‌ଅପ୍ ଖୋଲିବାକୁ ଅନୁମତି ଦିଅନ୍ତୁ।':error?.code==='auth/popup-closed-by-user'?'ସାଇନ୍ ଇନ୍ ବାତିଲ ହୋଇଛି।':'ଏବେ ସଂଯୋଗ ହୋଇପାରିଲା ନାହିଁ। ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।';
onAuthStateChanged(auth,async user=>{
 const ticket=++generation;cleanup?.();cleanup=null;root.replaceChildren();
 const host=el('div',''),status=el('p','');status.setAttribute('role','status');root.append(status,host);
 if(!user){
  host.append(el('p','ସମ୍ପାଦକଙ୍କ ଖାତାରେ ପ୍ରବେଶ କରନ୍ତୁ। ଏଠାରେ ଥିବା ଲେଖା ଓ ପ୍ରସ୍ତୁତି କେବଳ ଅନୁମୋଦିତ ସମ୍ପାଦକମାନେ ଦେଖିପାରିବେ।'));
  const login=el('button','Google ସହ ପ୍ରବେଶ କରନ୍ତୁ');login.type='button';host.append(login);
  login.onclick=async()=>{login.disabled=true;try{await setPersistence(auth,browserSessionPersistence);await signInWithPopup(auth,new GoogleAuthProvider());}catch(e){status.textContent=message(e);}finally{login.disabled=false;}};return;
 }
 status.textContent='ସମ୍ପାଦକଙ୍କ ଅନୁମତି ଯାଞ୍ଚ ଚାଲିଛି…';
 const logout=el('button','ବାହାରି ଯାଆନ୍ତୁ');logout.type='button';
 logout.onclick=async()=>{if(cleanup?.canLeave && !cleanup.canLeave())return;logout.disabled=true;try{await signOut(auth);}catch(e){status.textContent=message(e);logout.disabled=false;}};
 try {
  const token=await getIdTokenResult(user,true);if(ticket!==generation)return;
  host.append(logout);
  if(!user.emailVerified||token.claims.editor!==true){status.textContent='ଏହି ଖାତାରେ ସମ୍ପାଦନାର ଅନୁମତି ନାହିଁ।';return;}
  status.textContent='';const editor=el('div','');host.append(editor);
  const assertSession=()=>{if(ticket!==generation||auth.currentUser?.uid!==user.uid)throw Object.assign(new Error('Session ended'),{code:'studio/session'});return user.uid;};
  const service=createStudioService(db,assertSession);
  cleanup=await mountStudio(editor,service);
 }catch(e){if(ticket===generation)status.textContent=message(e);}
});
