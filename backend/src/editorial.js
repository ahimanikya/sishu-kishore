import {getMagazineApp} from './app.js';
import {getAuth,GoogleAuthProvider,signInWithPopup,signOut,onAuthStateChanged,browserSessionPersistence,setPersistence,getIdTokenResult} from 'firebase/auth';
import {getFirestore,collection,doc,getDocs,query,where,limit,runTransaction,writeBatch,serverTimestamp,setDoc,updateDoc} from 'firebase/firestore';
import {getStorage,ref,uploadBytes,getBlob} from 'firebase/storage';
import {nextQuota} from './quota.js';
import {site} from './config.js';
const app=getMagazineApp(),auth=getAuth(app),db=getFirestore(app),storage=getStorage(app);
const root=document.querySelector('#editorial-app');const params=new URLSearchParams(location.search);
const editorMode=document.body.dataset.mode==='editor';
const el=(tag,text,attrs={})=>{const e=document.createElement(tag);if(text)e.textContent=text;for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);return e;};
const status=el('p','',{role:'status'});let user,editor=false,draftId=null,submissions=[],drafts=[],publications=[],sessionVersion=0,writingDirty=false;
window.addEventListener('beforeunload',event=>{if(writingDirty){event.preventDefault();event.returnValue='';}});
const formError=e=> !editorMode ? (e.code==='permission-denied'?'ଅନୁମତି ଯାଞ୍ଚ କରନ୍ତୁ ବା କିଛି ସମୟ ପରେ ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ। ଗୋଟିଏ ମିନିଟ୍‌ରେ ଗୋଟିଏ ଓ ଘଣ୍ଟାକୁ ଦଶଟି ଦାଖଲ କରିପାରିବେ। ଆପଣଙ୍କ ଲେଖା ଏଠାରେ ଅଛି।':e.code==='auth/popup-closed-by-user'?'ପ୍ରବେଶ ବାତିଲ ହୋଇଛି।':e.code==='auth/popup-blocked'?'ପ୍ରବେଶ ପାଇଁ ପପ୍‌ଅପ୍ ଖୋଲିବାକୁ ଅନୁମତି ଦିଅନ୍ତୁ।':'କାମଟି ସମ୍ପୂର୍ଣ୍ଣ ହୋଇନାହିଁ। ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ। ଆପଣଙ୍କ ଲେଖା ଏଠାରେ ଅଛି।') : e.code==='permission-denied'?'Please check your access or try later. Submissions are limited to one per minute and ten per hour; your writing is still here.': e.code==='auth/popup-closed-by-user'?'Sign-in was cancelled.':e.code==='auth/popup-blocked'?'Please allow the sign-in window and try again.':'Unable to complete that action. Please try again. Your writing remains in the form.';
const button=(text,action)=>{const b=el('button',text,{type:'button'});b.onclick=async()=>{b.disabled=true;status.textContent='';try{await action();}catch(e){status.textContent=formError(e);}finally{b.disabled=false;}};return b;};
function field(form,label,name,{type='text',value='',max=240,required=true}={}){const l=el('label',label),input=el(type==='textarea'?'textarea':'input');input.name=name;input.id='field-'+name;if(type!=='textarea')input.type=type;input.value=value;input.required=required;input.maxLength=max;l.htmlFor=input.id;form.append(l,input);return input;}
function select(form,label,name,options,value){const l=el('label',label),input=el('select');input.name=name;input.id='field-'+name;l.htmlFor=input.id;for(const [v,t]of options){const o=el('option',t,{value:v});input.append(o);}input.value=value;form.append(l,input);return input;}
function base(){root.replaceChildren();const actions=el('div','',{class:'editorial-actions'});actions.append(el('span',user?.email||''),button(editorMode?'Sign out':'ବାହାରି ଯାଆନ୍ତୁ',()=>{if(writingDirty&&!confirm('ପଠାଯାଇନଥିବା ଲେଖା ଛାଡ଼ି ବାହାରିବେ? ପ୍ରଥମେ ଲେଖାର ନକଲ ନିଜ ପାଖରେ ରଖନ୍ତୁ।'))return;return signOut(auth);}));root.append(actions,status);status.textContent='';}
async function login(){await setPersistence(auth,browserSessionPersistence);await signInWithPopup(auth,new GoogleAuthProvider());}
onAuthStateChanged(auth,async current=>{const version=++sessionVersion;user=current;writingDirty=false;root.replaceChildren();status.textContent='';if(!current){root.append(el('p',editorMode?'Sign in with your editor account.':'ସମ୍ପାଦକଙ୍କୁ ଲେଖା ପଠାଇବା ପାଇଁ ପ୍ରବେଶ କରନ୍ତୁ। ପତ୍ରିକା ପଢ଼ିବା ପାଇଁ ଖାତା ଦରକାର ନାହିଁ।'),button(editorMode?'Continue with Google':'Google ସହ ପ୍ରବେଶ କରନ୍ତୁ',login),status);return;}
try{const token=await getIdTokenResult(current,true);if(version!==sessionVersion)return;editor=!!token.claims.editor;base();if(!current.emailVerified){status.textContent=editorMode?'A verified Google email is required.':'ଯାଞ୍ଚ ହୋଇଥିବା Google ଇମେଲ୍ ଆବଶ୍ୟକ।';return;}if(editorMode){if(!editor){status.textContent='This account does not have editor access.';return;}await dashboard();}else await submissionForm(current,version);}catch(e){if(version===sessionVersion)status.textContent=formError(e);}});
async function submissionForm(account,version){
 const active=()=>version===sessionVersion&&user?.uid===account.uid;
 const kind=['article','comment','contact','book'].includes(params.get('kind'))?params.get('kind'):'article';
 const form=el('form',null,{id:'writing-form',method:'post'});form.append(el('h2',kind==='comment'?'ଆପଣଙ୍କ ମତାମତ':kind==='contact'?'ଯୋଗାଯୋଗ':kind==='book'?'ବହି ସମ୍ପର୍କରେ ପଚାରନ୍ତୁ':'ସମ୍ପାଦକଙ୍କୁ ଲେଖା ପଠାନ୍ତୁ'));
 form.append(el('p','ସମସ୍ତ ଘର ପୂରଣ କରନ୍ତୁ। ଲେଖା ପ୍ରଥମେ ନିଜସ୍ୱ ସମ୍ପାଦନା ଯାଞ୍ଚ ପାଇଁ ଯିବ; ଦାଖଲ କଲେ ଆପେ ଆପେ ପ୍ରକାଶ ହେବ ନାହିଁ।',{class:'editorial-help'}));
 if(kind==='book')form.append(el('p','ବହି ମିଳିବା ବା କିଣିବା ବିଷୟରେ ପ୍ରକାଶକଙ୍କୁ ପଚାରନ୍ତୁ। ଏହା କେବଳ ଅନୁସନ୍ଧାନ; ଅର୍ଥ ପୈଠ ବା ବହି କିଣିବା ହୁଏନାହିଁ।'));
 const name=field(form,'ଲେଖକଙ୍କ ନାମ — ପ୍ରକାଶନରେ ଯେପରି ରହିବ','name',{value:account.displayName||'',max:120});name.autocomplete='name';
 const email=field(form,'ଇମେଲ୍ — କେବଳ ସମ୍ପାଦକଙ୍କ ଯୋଗାଯୋଗ ପାଇଁ','contact',{type:'email',value:account.email,max:254});email.readOnly=true;email.autocomplete='email';
 const title=field(form,'ଶୀର୍ଷକ','title',{value:(params.get('title')||'').slice(0,240)});
 const body=field(form,kind==='article'?'ସମ୍ପୂର୍ଣ୍ଣ ଲେଖା':'ଆପଣଙ୍କ ବାର୍ତ୍ତା','body',{type:'textarea',max:kind==='comment'?2000:60000});
 const hint=el('p',kind==='comment'?'ସର୍ବାଧିକ ୨,୦୦୦ ଅକ୍ଷର।':'ଗପ, କବିତା ବା ଲେଖା ଏଠାରେ ଲେଖନ୍ତୁ କିମ୍ବା ପେଷ୍ଟ କରନ୍ତୁ। କବିତାର ଧାଡ଼ି ଓ ପଦ ବିନ୍ୟାସ ରଖନ୍ତୁ। ସର୍ବାଧିକ ୬୦,୦୦୦ ଅକ୍ଷର।',{id:'writing-help',class:'editorial-help'});body.setAttribute('aria-describedby',hint.id);form.append(hint);
 let file;if(site.uploadsEnabled){file=field(form,'ଇଚ୍ଛାଧୀନ ପାଣ୍ଡୁଲିପି — PDF, DOCX ବା ଟେକ୍ସଟ୍; ସର୍ବାଧିକ ୧୦ MB','attachment',{type:'file',required:false});file.accept='.pdf,.docx,.txt';}else form.append(el('p','ଏବେ ଫାଇଲ୍ ସଂଲଗ୍ନ କରିହେବ ନାହିଁ। ଉପରେ ସମ୍ପୂର୍ଣ୍ଣ ଲେଖା ପେଷ୍ଟ କରନ୍ତୁ।',{class:'editorial-help'}));
 const consent=el('label','',{class:'editorial-consent'}),check=el('input',null,{type:'checkbox',required:'',name:'consent'});consent.append(check,el('span','ଏହି ଲେଖା ଦାଖଲ କରିବାର ଅନୁମତି ମୋର ଅଛି। ସମ୍ପାଦକ ମୋ ସହ ଯୋଗାଯୋଗ ଓ ଲେଖାର ଯାଞ୍ଚ କରିପାରିବେ। କେବଳ ଅନୁମୋଦିତ ଲେଖା ଓ ଶ୍ରେୟ ନାମ ପ୍ରକାଶ ହୋଇପାରିବ। ପିଲାମାନେ ଅଭିଭାବକ ବା ଶିକ୍ଷକଙ୍କ ସହାୟତା ନିଅନ୍ତୁ।'));form.append(consent);
 const preview=el('details',null,{class:'writing-preview'}),summary=el('summary','ପଠାଇବା ପୂର୍ବରୁ ଲେଖା ପଢ଼ନ୍ତୁ'),previewTitle=el('h3'),previewName=el('p'),previewBody=el('pre');preview.append(summary,previewTitle,previewName,previewBody);preview.ontoggle=()=>{if(preview.open){previewTitle.textContent=title.value;previewName.textContent=name.value;previewBody.textContent=body.value;}};form.append(preview);
 const send=el('button','ସମ୍ପାଦନା ଯାଞ୍ଚ ପାଇଁ ପଠାନ୍ତୁ',{type:'submit'});form.append(send);root.append(form);
 form.addEventListener('input',()=>{writingDirty=true;for(const input of [name,title,body])input.setCustomValidity('');if(preview.open){previewTitle.textContent=title.value;previewName.textContent=name.value;previewBody.textContent=body.value;}});
 let sending=false;
 form.onsubmit=async event=>{
  event.preventDefault();if(sending||!active())return;
  for(const input of [name,title,body])input.setCustomValidity(input.value.trim()?'':'ଏହି ଘର ପୂରଣ କରନ୍ତୁ।');
  if(!form.reportValidity())return;
  sending=true;send.disabled=true;form.inert=true;form.setAttribute('aria-busy','true');status.textContent='ପଠାଯାଉଛି…';
  const attachment=file?.files[0];
  try{
   if(attachment&&(attachment.size>10*1024*1024||!['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/plain'].includes(attachment.type)))throw Error('attachment');
   const item=doc(collection(db,'submissions')),page=params.get('page')||'';
   const safePage=page.startsWith('/')&&!page.startsWith('//')&&!page.startsWith('/shishu/')&&!page.startsWith('/sishu/')?page.slice(0,300):'';
   const submission={owner:account.uid,name:name.value.trim(),contact:account.email,kind,title:title.value.trim(),body:body.value,page:safePage,status:'received',consent:'editorial-review-v1',createdAt:serverTimestamp(),updatedAt:serverTimestamp()};
   await runTransaction(db,async batch=>{if(!active())throw Error('session');const quota=doc(db,'submissionLimits',account.uid),q=await batch.get(quota);if(!active())throw Error('session');batch.set(item,submission);batch.set(quota,nextQuota(q.data(),{id:item.id}));});
   if(!active())return;
   writingDirty=false;body.value='';check.checked=false;preview.open=false;previewBody.textContent='';
   if(attachment){try{await uploadBytes(ref(storage,`submissions/${account.uid}/${item.id}/manuscript`),attachment,{contentType:attachment.type});}catch{if(active())status.textContent='ଲେଖା ମିଳିଛି, କିନ୍ତୁ ଫାଇଲ୍ ପଠାଯାଇନାହିଁ। ଦାଖଲ ସଂଖ୍ୟା: '+item.id;return;}}
   if(!active())return;if(file)file.value='';
   status.textContent='ନିଜସ୍ୱ ସମ୍ପାଦନା ଯାଞ୍ଚ ପାଇଁ ଲେଖା ମିଳିଛି। ଦାଖଲ ସଂଖ୍ୟା: '+item.id;
   try{await ownSubmissions(account,version);}catch{if(active())status.textContent+=' ଦାଖଲ ତାଲିକା ଏବେ ଲୋଡ୍ ହୋଇପାରିଲା ନାହିଁ; ଲେଖା ପୁଣି ପଠାଇବା ଦରକାର ନାହିଁ।';}
  }catch(error){if(active())status.textContent=error.message==='attachment'?'୧୦ MB ଠାରୁ ଛୋଟ PDF, DOCX ବା ଟେକ୍ସଟ୍ ଫାଇଲ୍ ବାଛନ୍ତୁ।':formError(error);}
  finally{sending=false;send.disabled=false;form.inert=false;form.removeAttribute('aria-busy');}
 };
 try{await ownSubmissions(account,version);}catch{if(active())status.textContent='ପୂର୍ବ ଦାଖଲ ତାଲିକା ଏବେ ଲୋଡ୍ ହୋଇପାରିଲା ନାହିଁ। ଉପର ଫର୍ମରେ ନୂଆ ଲେଖା ପଠାଇପାରିବେ।';}
}
async function ownSubmissions(account=user,version=sessionVersion){
 const snapshot=await getDocs(query(collection(db,'submissions'),where('owner','==',account.uid),limit(50)));
 if(version!==sessionVersion||user?.uid!==account.uid)return;
 root.querySelector('#my-submissions')?.remove();const section=el('section',null,{id:'my-submissions'});section.append(el('h2','ଆପଣଙ୍କ ଦାଖଲ'));
 const items=snapshot.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0)),labels={received:'ମିଳିଛି',reviewing:'ଯାଞ୍ଚ ଚାଲିଛି',approved:'ଅନୁମୋଦିତ',rejected:'ଗ୍ରହଣ ହୋଇନାହିଁ'};
 if(!items.length)section.append(el('p','ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ଦାଖଲ ନାହିଁ।'));
 for(const d of items)section.append(el('p',`${d.title} — ${labels[d.status]||'ସମ୍ପାଦକଙ୍କ ପାଖରେ'}`));root.append(section);
}
async function dashboard(){root.querySelector('#dashboard')?.remove();const panel=el('div',null,{id:'dashboard'});root.append(panel);
 const version=sessionVersion;const [a,b,c]=await Promise.all(['submissions','drafts','publications'].map(name=>getDocs(query(collection(db,name),limit(200)))));if(version!==sessionVersion)return;submissions=a.docs.map(d=>({id:d.id,...d.data()}));drafts=b.docs.map(d=>({id:d.id,...d.data()}));publications=c.docs.map(d=>({id:d.id,...d.data()}));
 panel.append(el('p','Private submissions and drafts are visible only to editors. Publish releases the approved text and byline; contact details stay private. Website updates usually appear within 30 minutes.'));
 const actions=el('div',null,{class:'editorial-actions'});actions.append(button('Refresh',dashboard),button('New draft',()=>editDraft({})));panel.append(actions);
 panel.append(el('h2','Submissions'));if(!submissions.length)panel.append(el('p','No submissions yet.'));
 for(const d of submissions.sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0))){const card=el('article',null,{class:'editorial-card'});card.append(el('h3',d.title),el('p',`${d.name} · ${d.kind} · ${d.status}`),el('p','Private contact: '+d.contact));const details=el('details'),summary=el('summary','Read submission');details.append(summary,el('pre',d.body));card.append(details);const actions=el('div',null,{class:'editorial-actions'});
 actions.append(button('Review',async()=>{await updateDoc(doc(db,'submissions',d.id),{status:'reviewing',updatedAt:serverTimestamp()});await dashboard();}));
 if(d.kind!=='contact')actions.append(button('Prepare draft',()=>editDraft({id:d.id,sourceId:d.id,kind:d.kind,title:d.title,body:d.body,byline:d.name,page:d.page})));
 actions.append(button('Decline',async()=>{await updateDoc(doc(db,'submissions',d.id),{status:'rejected',updatedAt:serverTimestamp()});await dashboard();}));
 if(site.uploadsEnabled)actions.append(button('Open manuscript',async()=>{try{const blob=await getBlob(ref(storage,`submissions/${d.owner}/${d.id}/manuscript`));const a=el('a','Download manuscript',{href:URL.createObjectURL(blob),download:'manuscript'});card.append(a);}catch{status.textContent='No manuscript attachment is available.';}}));card.append(actions);panel.append(card);}
 panel.append(el('h2','Drafts'));for(const d of drafts)panel.append(button(d.title,()=>editDraft(d)));
 panel.append(el('h2','Published'));for(const d of publications.filter(d=>d.state==='published')){const row=el('div',null,{class:'editorial-card'});row.append(el('strong',d.title),button('Edit',()=>editDraft({...d,id:d.id})),button('Withdraw',async()=>{if(!confirm('Withdraw this item from the website?'))return;await updateDoc(doc(db,'publications',d.id),{state:'withdrawn',publishedAt:serverTimestamp()});await dashboard();}));panel.append(row);}
}
async function editDraft(d){d={...d,issue:d.issue?.replace(/^\/shishu\//,'/'),page:d.page?.replace(/^\/shishu\//,'/')};root.querySelector('#draft-editor')?.remove();draftId=d.id||doc(collection(db,'drafts')).id;const id=draftId;
 const version=sessionVersion;const choices=await fetch('/editorial/choices.json').then(r=>{if(!r.ok)throw Error('choices');return r.json();});if(version!==sessionVersion)return;
 const form=el('form',null,{id:'draft-editor'});form.append(el('h2','Prepare for publication'));select(form,'Type','kind',site.prefix==='/shalandi'?[['book','Book / publication'],['article','Article'],['comment','Comment']]:[['article','Article'],['comment','Comment']],d.kind||'article');
 field(form,'Title','title',{value:d.title||''});field(form,'Public byline','byline',{value:d.byline||'',max:120});field(form,'Approved text','body',{type:'textarea',value:d.body||'',max:60000});
 select(form,'Issue / collection','issue',choices.issues,d.issue||choices.issues[0]?.[0]);field(form,'Article path (comments only)','page',{value:d.page||'',required:false,max:300});
 const image=select(form,'Existing artwork / cover','image',choices.images,d.image||choices.images[0]?.[0]);const preview=el('img',null,{alt:'Selected publication artwork',width:'300',height:'200',class:'editorial-preview'});preview.src=image.value;image.onchange=()=>{preview.src=image.value};form.append(preview);
 const collect=()=>{const f=new FormData(form);return {kind:f.get('kind'),title:f.get('title').trim(),byline:f.get('byline').trim(),body:f.get('body'),issue:f.get('issue'),page:f.get('page').trim().replace(/^\/shishu\//,'/'),image:f.get('image')};};
 form.append(button('Save draft',async()=>{if(!form.reportValidity())return;await setDoc(doc(db,'drafts',id),{...collect(),sourceId:d.sourceId||'',updatedAt:serverTimestamp()});status.textContent='Draft saved privately.';await dashboard();}),button('Publish approved version',async()=>{if(!form.reportValidity())return;const data=collect();if(data.kind==='comment'&&!data.page.startsWith(site.prefix+'/')){status.textContent='Choose the article path for this comment.';return;}if(!confirm('Publish this approved text, byline and artwork? Contact details will stay private.'))return;const batch=writeBatch(db);batch.set(doc(db,'publications',id),{...data,state:'published',publishedAt:serverTimestamp()});batch.set(doc(db,'drafts',id),{...data,sourceId:d.sourceId||'',updatedAt:serverTimestamp()});if(d.sourceId)batch.update(doc(db,'submissions',d.sourceId),{status:'approved',updatedAt:serverTimestamp()});await batch.commit();status.textContent='Approved for publication. The website will update automatically, usually within 30 minutes.';form.remove();await dashboard();}),button('Close',()=>form.remove()));
 root.append(form);form.querySelector('input')?.focus();}
