(()=>{
 const site=location.pathname.startsWith('/shishu')?'shishu':'shalandi';
 const canonical=p=>p.replace(/\.html$/,'').replace(/\/$/,'');
 let booksPromise;const books=()=>booksPromise??=fetch('/api/service?action=catalog').then(r=>{if(!r.ok)throw Error('Catalogue unavailable');return r.json()});

 document.addEventListener('click',async e=>{
  const target=e.target.closest('[data-service],a[href="/services.html"]');if(!target)return;
  e.preventDefault();e.stopImmediatePropagation();
  const text=(target.textContent+' '+target.title+' '+target.className).toLowerCase();
  if(/wishlist/.test(text)){location.href='/services.html#wishlist';return}
  if(/cart|buy|basket/.test(text)){
   try{const all=await books();const card=target.closest('.product-item,.book-card-glass,.vesitable-item,.book-card');const route=card?.querySelector('a[href*="description-"]')?.getAttribute('href')||location.pathname;const book=all.find(b=>canonical(b.detailRoute)===canonical(route));location.href='/account'+(book?'?book='+encodeURIComponent(book.PID):'')}catch{location.href='/account'}
  }else location.href='/account';
 },true);
 for(const form of document.querySelectorAll('#comment_form')){
  const submit=form.querySelector('input[type=submit]');if(submit?.parentElement.tagName==='A')submit.parentElement.replaceWith(submit);
  form.addEventListener('submit',async e=>{
   e.preventDefault();e.stopImmediatePropagation();const fd=new FormData(form);let status=form.querySelector('[role=status]');if(!status){status=document.createElement('p');status.setAttribute('role','status');form.append(status)}
   if(form.dataset.sent)return;const button=form.querySelector('[type=submit]');if(button)button.disabled=true;status.textContent='Saving for editorial review…';
   try{const response=await fetch('/api/service?action=submission',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({site,kind:'comment',title:document.title.slice(0,240),contact:String(fd.get('email')||''),body:'Name: '+String(fd.get('name')||'')+'\nPage: '+location.pathname+'\n\n'+String(fd.get('comments')||'')})});const data=await response.json();if(!response.ok){if(response.status===401){status.textContent='Please sign in, then return to send your comment. ';const a=document.createElement('a');a.href='/signin-with-chatgpt?return_to='+encodeURIComponent(location.pathname);a.textContent='Sign in';status.append(a);return}throw Error(data.error||'Please try again.')}status.textContent='Comment saved for editorial review. Reference: '+data.id;form.dataset.sent='1'}catch(err){status.textContent=err.message}finally{if(button&&!form.dataset.sent)button.disabled=false}
  },true)
 }
 for(const form of document.querySelectorAll('#subscribeForm'))form.addEventListener('submit',e=>{e.preventDefault();e.stopImmediatePropagation();location.href='/account#subscriptions'},true);
})();
