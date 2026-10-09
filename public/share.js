(()=>{
 const main=document.querySelector('main');if(!main)return;
 const url=document.querySelector('link[rel="canonical"]')?.href||location.href;
 const title=document.title;
 const nav=document.createElement('nav');nav.className='mag-share';nav.setAttribute('aria-label','Share this page');
 const label=document.createElement('span');label.textContent='ସେୟାର କରନ୍ତୁ';nav.append(label);
 const whatsapp=document.createElement('a');whatsapp.href='https://wa.me/?text='+encodeURIComponent(title+'\n'+url);whatsapp.textContent='WhatsApp';whatsapp.target='_blank';whatsapp.rel='noopener noreferrer';nav.append(whatsapp);
 const copy=document.createElement('button');copy.type='button';copy.textContent='Copy link';
 const status=document.createElement('span');status.setAttribute('role','status');
 copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(url);status.textContent='Link copied';}catch{status.textContent=url;}});nav.append(copy);
 if(navigator.share){const share=document.createElement('button');share.type='button';share.textContent='More…';share.addEventListener('click',async()=>{try{await navigator.share({title,url});}catch(error){if(error.name!=='AbortError')status.textContent='Use WhatsApp or Copy link.';}});nav.append(share);}
 nav.append(status);main.append(nav);
 const article=main.querySelector('.ia-article');
 if(article && (document.body.dataset.readingIssue || location.pathname.includes('/published/'))){
  const root=document.createElement('section');root.className='mag-responses';root.setAttribute('aria-label','Reader responses');
  const load=document.createElement('button');load.type='button';load.textContent='♡ ଭଲ ଲାଗିଲା · ମତାମତ';root.append(load);nav.before(root);
  // Keep the Firebase bundle off the initial reading path.
  let started=false;
  const start=async()=>{if(started)return;started=true;load.disabled=true;try{const {mount}=await import('/editorial/engagement.js?v=2');root.replaceChildren();await mount(root,{page:new URL(url).pathname,title:article.querySelector('h1')?.textContent||title});}catch{root.replaceChildren(load);load.disabled=false;load.textContent='Retry likes and comments';started=false;}};
  load.addEventListener('click',start);
  if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();start();}},{rootMargin:'100px'});observer.observe(root);}
 }

})();
