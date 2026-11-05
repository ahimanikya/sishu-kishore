import {getMagazineApp} from './app.js';
import {getAuth,GoogleAuthProvider,signInWithPopup,signOut,onAuthStateChanged,browserSessionPersistence,setPersistence,getIdTokenResult} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';
import {createStudioService} from './studio-service.js';
import {mountStudio} from '../../public/editorial/studio-ui.mjs';
const app=getMagazineApp(),auth=getAuth(app),db=getFirestore(app),root=document.querySelector('#studio-app');
const el=(tag,text)=>{const node=document.createElement(tag);node.textContent=text;return node;};
let generation=0,cleanup;
const message=error=>error?.code==='auth/popup-blocked'?'Allow pop-ups to sign in, then try again.':error?.code==='auth/popup-closed-by-user'?'Sign-in was cancelled.':'Unable to connect. Please try again.';
onAuthStateChanged(auth,async user=>{
 const ticket=++generation;cleanup?.();cleanup=null;document.body.classList.remove('studio-ready');root.replaceChildren();
 const host=el('div',''),status=el('p','');status.setAttribute('role','status');root.append(status,host);
 if(!user){
  host.append(el('p','Sign in with your editor account. Only authorized editors can access these drafts and preparation records.'));
  const login=el('button','Continue with Google');login.type='button';host.append(login);
  login.onclick=async()=>{login.disabled=true;try{await setPersistence(auth,browserSessionPersistence);await signInWithPopup(auth,new GoogleAuthProvider());}catch(e){status.textContent=message(e);}finally{login.disabled=false;}};return;
 }
 status.textContent='Checking editor access…';
 const logout=el('button','Sign out');logout.type='button';
 logout.onclick=async()=>{if(cleanup?.canLeave && !cleanup.canLeave())return;logout.disabled=true;try{await signOut(auth);}catch(e){status.textContent=message(e);logout.disabled=false;}};
 try {
  const token=await getIdTokenResult(user,true);if(ticket!==generation)return;
  host.append(logout);
  if(!user.emailVerified||token.claims.editor!==true){status.textContent='This account does not have editor access.';return;}
  status.textContent='';const editor=el('div','');host.append(editor);
  const assertSession=()=>{if(ticket!==generation||auth.currentUser?.uid!==user.uid)throw Object.assign(new Error('Session ended'),{code:'studio/session'});return user.uid;};
  const service=createStudioService(db,assertSession);
  cleanup=await mountStudio(editor,service,{accountLabel:user.displayName||user.email||'Editor',onSignOut:()=>logout.click()});
  if(ticket!==generation){cleanup?.();return;}
  logout.hidden=true;document.body.classList.add('studio-ready');
 }catch(e){if(ticket===generation)status.textContent=message(e);}
});
