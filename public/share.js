(()=>{
 const main=document.querySelector('main');if(!main)return;
 const url=document.querySelector('link[rel="canonical"]')?.href||location.href;
 const title=document.title;
 const nav=document.createElement('nav');nav.className='mag-share';nav.setAttribute('aria-label','Share this page');
 const label=document.createElement('span');label.textContent='Share';nav.append(label);
 const whatsapp=document.createElement('a');whatsapp.href='https://wa.me/?text='+encodeURIComponent(title+'\n'+url);whatsapp.textContent='WhatsApp';whatsapp.target='_blank';whatsapp.rel='noopener noreferrer';nav.append(whatsapp);
 const copy=document.createElement('button');copy.type='button';copy.textContent='Copy link';
 const status=document.createElement('span');status.setAttribute('role','status');
 copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(url);status.textContent='Link copied';}catch{status.textContent=url;}});nav.append(copy);
 if(navigator.share){const share=document.createElement('button');share.type='button';share.textContent='More…';share.addEventListener('click',async()=>{try{await navigator.share({title,url});}catch(error){if(error.name!=='AbortError')status.textContent='Use WhatsApp or Copy link.';}});nav.append(share);}
 nav.append(status);main.append(nav);
})();
