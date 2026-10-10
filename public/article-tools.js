(()=>{
 if(document.body.dataset.readerArticle!=='true')return;
 const article=document.querySelector('main .ia-article');
 const text=article?.querySelector('.ia-prose')||document.querySelector('main p.subject')?.parentElement;
 if(!text)return;
 const read=(key,fallback)=>{try{return localStorage.getItem(key)||fallback;}catch{return fallback;}};
 const save=(key,value)=>{try{localStorage.setItem(key,String(value));}catch{}};
 let size=Math.min(34,Math.max(18,Number(read('sishu-article-size',24))||24)),night=read('sishu-article-night','false')==='true';
 const tools=document.createElement('div');tools.className='article-reading-tools';tools.setAttribute('aria-label','ପଢ଼ିବା ସୁବିଧା');
 const options=document.createElement('details');const summary=document.createElement('summary');summary.textContent='ଅ · ପଢ଼ିବା ସୁବିଧା';options.append(summary);
 const controls=document.createElement('div');controls.className='article-reading-controls';
 const wash=document.createElement('button');wash.textContent='ରଙ୍ଗିନ କାଗଜ';
 const smaller=document.createElement('button'),larger=document.createElement('button'),theme=document.createElement('button'),reset=document.createElement('button');
 smaller.textContent='ଅ −';smaller.setAttribute('aria-label','ଅକ୍ଷର ଛୋଟ କରନ୍ତୁ');larger.textContent='ଅ +';larger.setAttribute('aria-label','ଅକ୍ଷର ବଡ଼ କରନ୍ତୁ');theme.textContent='ରାତି';reset.textContent='ପୂର୍ବ ଆକାର';
 [smaller,larger,theme,wash,reset].forEach(b=>{b.type='button';controls.append(b);});options.append(controls);tools.append(options);
 const reader=article?.querySelector('[data-quiet-reader]');
 if(reader){reader.textContent='ରିଡର୍‌ରେ ପଢ଼ନ୍ତୁ ↗';tools.append(reader);}else if(document.body.dataset.readingIssue){const link=document.createElement('a');link.href=document.body.dataset.readingIssue+'#reader';link.textContent='ରିଡର୍‌ରେ ପଢ଼ନ୍ତୁ ↗';tools.append(link);}
 const head=article?.querySelector('.ia-article-head');if(head)head.append(tools);else text.before(tools);
 text.classList.add('article-reading-text');
 const paint=()=>{window.SishuStoryWash?.paint(document.body,location.pathname);wash.setAttribute('aria-pressed',String(window.SishuStoryWash?.enabled()));};wash.onclick=()=>window.SishuStoryWash?.set(!window.SishuStoryWash.enabled());window.addEventListener('sishu-paper-change',paint);paint();
 const apply=()=>{text.style.setProperty('--article-type',size+'px');text.classList.toggle('article-reading-night',night);theme.setAttribute('aria-pressed',String(night));smaller.disabled=size<=18;larger.disabled=size>=34;save('sishu-article-size',size);save('sishu-article-night',night);};
 smaller.onclick=()=>{size=Math.max(18,size-2);apply();};larger.onclick=()=>{size=Math.min(34,size+2);apply();};theme.onclick=()=>{night=!night;apply();};reset.onclick=()=>{size=24;night=false;apply();};apply();
 document.addEventListener('click',e=>{if(!options.contains(e.target))options.open=false;});options.addEventListener('keydown',e=>{if(e.key==='Escape'){options.open=false;summary.focus();}});
})();
