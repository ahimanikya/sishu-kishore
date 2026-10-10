(()=>{
 const main=document.querySelector('main');if(!main)return;
 const url=document.querySelector('link[rel="canonical"]')?.href||location.href,title=document.title;
 const el=(tag,text,attrs={})=>{const e=document.createElement(tag);e.textContent=text;for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);return e;};
 const share=el('details','',{class:'mag-share-menu'}),summary=el('summary','ସେୟାର',{ 'aria-label':'ସେୟାର କରନ୍ତୁ'}),options=el('div','',{class:'mag-share-options'}),status=el('span','',{role:'status'});
 summary.insertAdjacentHTML('afterbegin','<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m8 12 8-5M8 12l8 5"/><circle cx="5" cy="12" r="3"/><circle cx="18" cy="5" r="3"/><circle cx="18" cy="19" r="3"/></svg>');
 const whatsapp=el('a','WhatsApp',{href:'https://wa.me/?text='+encodeURIComponent(title+'\n'+url),target:'_blank',rel:'noopener noreferrer'}),copy=el('button','ଲିଙ୍କ କପି',{type:'button'});
 copy.onclick=async()=>{try{await navigator.clipboard.writeText(url);status.textContent='ଲିଙ୍କ କପି ହେଲା ।';}catch{status.textContent=url;}};
 options.append(whatsapp,copy);
 if(navigator.share){const native=el('button','ଅନ୍ୟ ଆପ୍…',{type:'button'});native.onclick=async()=>{try{await navigator.share({title,url});share.open=false;}catch(e){if(e.name!=='AbortError')status.textContent='WhatsApp ବା ଲିଙ୍କ କପି ବ୍ୟବହାର କରନ୍ତୁ ।';}};options.append(native);}
 options.append(status);share.append(summary,options);
 document.addEventListener('click',e=>{if(!share.contains(e.target))share.open=false;});share.addEventListener('keydown',e=>{if(e.key==='Escape'){share.open=false;summary.focus();}});
 const article=main.querySelector('.ia-article')||(main.matches('.ia-secondary-prose')?main:main.querySelector('.ia-secondary-prose'));
 const isArticle=article&&(document.body.dataset.readerArticle==='true'||document.body.dataset.readingIssue||location.pathname.includes('/published/'));
 if(!isArticle){const nav=el('nav','',{class:'mag-share','aria-label':'Share this page'});nav.append(share);main.append(nav);return;}
 const root=el('section','',{class:'mag-responses','aria-label':'Reader responses'}),bar=el('div','',{class:'response-actions'}),like=el('button','♡ ଭଲ ଲାଗିଲା',{type:'button'}),comment=el('button','ମତାମତ',{type:'button'});bar.append(like,comment,share);root.append(bar);main.append(root);
 let pending;
 const start=()=>pending??=(async()=>{try{const {mount}=await import('/editorial/engagement.js?v=appcheck-ready-v1');await mount(root,{page:new URL(url).pathname,title:article.querySelector('h1')?.textContent||title,shareControl:share});return true;}catch{pending=null;const error=el('p','Unable to load likes and comments. Tap to retry.',{role:'status'});root.querySelector('.response-load-error')?.remove();error.className='response-load-error';root.append(error);return false;}})();
 like.onclick=async()=>{if(await start())root.querySelector('[data-like]')?.click();};comment.onclick=async()=>{if(await start())root.querySelector('[data-comments]')?.click();};
 if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();start();}},{rootMargin:'100px'});observer.observe(root);}
})();
