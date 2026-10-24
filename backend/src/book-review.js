import {getMagazineApp} from './app.js';
import {getAuth,GoogleAuthProvider,signInWithPopup,signOut,onAuthStateChanged,browserSessionPersistence,setPersistence,getIdTokenResult} from 'firebase/auth';
import {getFirestore,doc,getDocFromServer} from 'firebase/firestore';
const auth=getAuth(getMagazineApp()),db=getFirestore(),root=document.querySelector('#book-review-app'),book=document.body.dataset.reviewBook;
const title=root.querySelector('h1').textContent;let generation=0;
const el=(tag,text,attrs={})=>{const x=document.createElement(tag);if(text)x.textContent=text;for(const [k,v]of Object.entries(attrs))x.setAttribute(k,v);return x;};
const error=e=>e.code==='permission-denied'?'A verified Google sign-in is required.':e.code==='auth/popup-closed-by-user'?'Sign-in was cancelled.':e.code==='auth/popup-blocked'?'Allow the Google sign-in window and try again.':'Unable to load proofreading. Please try again.';
function button(text,action,status){const b=el('button',text,{type:'button'});b.onclick=async()=>{b.disabled=true;try{await action();}catch(e){status.textContent=error(e);}finally{b.disabled=false;}};return b;}
onAuthStateChanged(auth,async user=>{
 const version=++generation;root.replaceChildren(el('h1',title));const status=el('p','',{role:'status'});root.append(status);
 if(!user){root.append(el('p','Sign in with Google to view and edit the proofreading draft.'),button('Continue with Google',async()=>{await setPersistence(auth,browserSessionPersistence);await signInWithPopup(auth,new GoogleAuthProvider());},status));return;}
 const account=el('div','',{class:'review-account'});account.append(el('span',user.email),button('Sign out',()=>signOut(auth),status));root.append(account);
 try{
  const token=await getIdTokenResult(user);if(!user.emailVerified||token.signInProvider!=='google.com'){status.textContent='Please use a verified Google account.';return;}
  status.textContent='Loading proofreading…';const snapshot=await getDocFromServer(doc(db,'bookReviews',book));
  if(version!==generation)return;if(!snapshot.exists())throw Error('missing');const data=JSON.parse(snapshot.data().payload);render(data,user,version,status);status.textContent='Edits stay in this browser. Download corrections to share them; this does not publish changes.';
 }catch(e){if(version===generation)status.textContent=error(e);}
});
function render(data,user,version,status){
 const key=`book-review-${book}-${user.uid}-v1`;let changes={};try{changes=JSON.parse(localStorage.getItem(key)||'{}');}catch{}
 const controls=el('nav','',{class:'review-controls','aria-label':'Proofreading controls'}),picker=el('select',null,{'aria-label':'Source page'}),scan=el('img',null,{alt:'Original source page'}),scanLink=el('a',null,{target:'_blank',rel:'noopener'}),edit=el('textarea',null,{'aria-label':'Proofreading text',spellcheck:'false'}),comparison=el('div','',{class:'review-comparison'});let pos=0;
 data.pages.forEach((p,i)=>picker.append(el('option',p.label||`Page ${p.printedPage} (scan ${p.page})`,{value:i})));
 const previous=el('button','← Previous',{type:'button'}),next=el('button','Next →',{type:'button'});previous.onclick=()=>{if(pos>0){pos--;show();}};next.onclick=()=>{if(pos<data.pages.length-1){pos++;show();}};
 const download=button('Download corrections',()=>{const corrections=data.pages.filter(p=>changes[p.page]!==undefined&&changes[p.page]!==p.text).map(p=>({scanPage:p.page,printedPage:p.printedPage,originalDraft:p.text,correctedText:changes[p.page]}));const url=URL.createObjectURL(new Blob([JSON.stringify({book,exportedAt:new Date().toISOString(),corrections},null,2)],{type:'application/json'}));const a=el('a',null,{href:url,download:`${book}-corrections.json`});a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);},status);
 function show(){const p=data.pages[pos];picker.value=pos;scan.src=p.src;scanLink.href=p.src;edit.value=changes[p.page]??p.text;previous.disabled=pos===0;next.disabled=pos===data.pages.length-1;}
 picker.onchange=()=>{pos=Number(picker.value);show();};edit.oninput=()=>{if(version!==generation)return;changes[data.pages[pos].page]=edit.value;try{localStorage.setItem(key,JSON.stringify(changes));status.textContent='Saved in this browser.';}catch{status.textContent='Download corrections before leaving; browser storage is unavailable.';}};
 controls.append(picker,previous,next,download);
 const legacyKey={ketejami_loda:'kete-jami-loda-writer-corrections-v1',musha_mushi:'musha-mushi-writer-corrections-v1',forest:'forest-proofread-v1'}[book];let legacy={};try{legacy=JSON.parse(localStorage.getItem(legacyKey)||'{}');}catch{}
 if(data.pages.some(p=>typeof legacy[p.page]==='string'&&legacy[p.page]!==p.text)){
  const restore=button('Import previous browser corrections',()=>{for(const p of data.pages)if(changes[p.page]===undefined&&typeof legacy[p.page]==='string')changes[p.page]=legacy[p.page];localStorage.setItem(key,JSON.stringify(changes));show();restore.remove();status.textContent='Previous browser corrections imported for this account.';},status);controls.append(restore);
 }
 scanLink.append(scan);comparison.append(scanLink,edit);root.append(controls,comparison);show();
}
