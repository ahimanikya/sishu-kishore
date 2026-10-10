(()=>{
 const issue=document.body.dataset.readingIssue;if(!issue)return;
 const arrival=location.hash==='#reader'?window.SishuReaderReturn?.entry():null;let returnTo=null,entryScroll=0,autoOpening=false;
 if(arrival)history.replaceState({...history.state,sishuReaderOrigin:arrival},'');
 const get=key=>{try{return JSON.parse(localStorage.getItem(key));}catch{return null;}};
 const put=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));}catch{}};
 const dialog=document.createElement('dialog');dialog.className='mag-quiet-reader';dialog.setAttribute('aria-label','ପଢ଼ିବା ଘର');
 dialog.innerHTML=`<header class="quiet-top"><button data-exit aria-label="ପଢ଼ିବା ବନ୍ଦ କରନ୍ତୁ">← ଫେରନ୍ତୁ</button><button data-settings aria-expanded="false" aria-controls="quiet-settings">ଅ · ପଢ଼ିବା ସୁବିଧା</button></header><section id="quiet-settings" hidden><label>ଲେଖା ବାଛନ୍ତୁ <select data-contents></select></label><div class="quiet-options"><button data-size="-2" aria-label="ଅକ୍ଷର ଛୋଟ କରନ୍ତୁ">ଅ −</button><button data-size="2" aria-label="ଅକ୍ଷର ବଡ଼ କରନ୍ତୁ">ଅ +</button><button data-theme="paper" aria-pressed="true">କାଗଜ</button><button data-theme="night" aria-pressed="false">ରାତି</button><button data-colour-paper aria-pressed="true">ରଙ୍ଗିନ କାଗଜ</button><label><input data-art type="checkbox" checked> ଚିତ୍ର</label></div></section><div class="quiet-spread-shell"><div class="quiet-print-header" aria-hidden="true"><span>ଶିଶୁ କିଶୋର</span><span>ଶିଶୁ କିଶୋର</span></div><i class="quiet-corner quiet-corner-leaf" aria-hidden="true"></i><i class="quiet-corner quiet-corner-kite" aria-hidden="true"></i><div class="quiet-page" tabindex="0" aria-label="ପତ୍ରିକା ପୃଷ୍ଠା"><div class="quiet-track"><div class="quiet-content"></div></div></div><div class="quiet-folios" aria-hidden="true"><span></span><span></span></div></div><footer class="quiet-bottom"><button data-prev aria-label="ପୂର୍ବ ପୃଷ୍ଠା">← ପୂର୍ବ</button><span role="status" aria-live="polite"></span><button data-next aria-label="ପର ପୃଷ୍ଠା">ପର →</button></footer>`;
 document.body.append(dialog);
 window.SishuPageSound?.mount(dialog.querySelector('.quiet-options'));
 window.SishuReaderSwitcher?.mount(dialog.querySelector('#quiet-settings'),issue+'#reader',()=>returnTo||{url:location.href.replace(/#reader$/,''),y:entryScroll});
 const pane=dialog.querySelector('.quiet-page'),content=dialog.querySelector('.quiet-content'),select=dialog.querySelector('select'),status=dialog.querySelector('.quiet-bottom [role=status]'),prev=dialog.querySelector('[data-prev]'),next=dialog.querySelector('[data-next]');
 let collection,index=0,opener,serial=0,size=get('sishu-reader-size')||22,theme=get('sishu-reader-theme')||'paper',busy=false,spread=0,spreadCount=1,columnCount=1,totalPages=1,articleColumns=[];
 const track=dialog.querySelector('.quiet-track'),cache=new Map();
 const odia=value=>String(value).replace(/[0-9]/g,d=>'୦୧୨୩୪୫୬୭୮୯'[Number(d)]);
 const save=()=>{if(collection&&!busy){put('sishu-place:'+issue,{version:2,index,spread});put('sishu-last-reader',{issue});window.dispatchEvent(new Event('sishu-reading-saved'));}};
 const apply=()=>{dialog.style.setProperty('--reading-size',size+'px');dialog.dataset.theme=theme;dialog.querySelectorAll('[data-theme]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.theme===theme)));};apply();
 function turn(to){
  spread=Math.max(0,Math.min(spreadCount-1,to));pane.scrollLeft=spread*(pane.clientWidth+48);
  prev.disabled=spread===0;next.disabled=spread===spreadCount-1;
  const first=spread*columnCount+1,last=Math.min(totalPages,first+columnCount-1);dialog.dataset.finalSingle=String(columnCount===2&&first===totalPages);
  index=Math.max(0,articleColumns.findLastIndex(column=>column<=first-1));select.value=String(index);window.SishuStoryWash?.paint(dialog,collection.items[index].href);
  const folios=dialog.querySelectorAll('.quiet-folios span');folios[0].textContent=odia(first);folios[1].textContent=columnCount===2&&last>first?odia(last):'';
  status.textContent=`${odia(first)}${last>first?'–'+odia(last):''} / ${odia(totalPages)} · ${collection.items[index].title}`;save();
 }
 function paginate(){
  if(!dialog.open||busy||!content.firstChild)return;
  const anchor=index,within=Math.max(0,spread*columnCount-(articleColumns[index]||0));
  columnCount=matchMedia('(min-width:1000px) and (min-height:500px)').matches?2:1;dialog.dataset.columns=columnCount;
  content.style.width=pane.clientWidth+'px';content.style.columnCount=columnCount;content.style.columnWidth=((pane.clientWidth-48*(columnCount-1))/columnCount)+'px';track.style.width=pane.clientWidth+'px';
  const headings=[...content.querySelectorAll('[data-edition-heading]')];headings.forEach(h=>h.style.breakBefore='auto');
  const pageTop=pane.getBoundingClientRect().top,minRoom=size*1.95*5;
  // Process in reading order: each forced break may move later headings.
  headings.forEach((h,i)=>{if(i&&pane.clientHeight-(h.getBoundingClientRect().top-pageTop)<Math.min(minRoom,pane.clientHeight))h.style.breakBefore='column';});
  const stride=(pane.clientWidth+48)/columnCount;
  totalPages=Math.max(1,Math.ceil((content.scrollWidth+48-2)/stride));spreadCount=Math.ceil(totalPages/columnCount);
  const left=content.getBoundingClientRect().left;
  articleColumns=[...content.querySelectorAll('[data-edition-heading]')].map(h=>Math.max(0,Math.round((h.getBoundingClientRect().left-left)/stride)));
  track.style.width=(spreadCount*(pane.clientWidth+48)-48)+'px';turn(Math.floor(((articleColumns[anchor]||0)+within)/columnCount));
 }
 function jumpArticle(n){if(busy||!articleColumns.length)return;turn(Math.floor(articleColumns[n]/columnCount));pane.focus();}
 async function articleFor(item,n){
  if(cache.has(item.href))return cache.get(item.href).cloneNode(true);
  const response=await fetch(item.href);if(!response.ok)throw Error('article');const doc=new DOMParser().parseFromString(await response.text(),'text/html');let article=doc.querySelector('.ia-article');
  if(!article){const legacy=doc.querySelector('main p.subject')?.parentElement;if(legacy){article=document.createElement('article');article.className='ia-article';const head=document.createElement('header');head.className='ia-article-head';const title=document.createElement('h1');title.textContent=item.title;head.append(title);const prose=document.createElement('div');prose.className='ia-prose';prose.append(legacy.cloneNode(true));article.append(head,prose);}}
  if(!article)throw Error('article');
  article.querySelectorAll('script,form,input,button,.article-reading-tools,.mag-read-button,.mag-article-sidebar,.mag-article-companion').forEach(e=>e.remove());
  let heading=article.querySelector('.ia-article-head')||article.querySelector('h1');if(!heading)throw Error('heading');heading.dataset.editionHeading=String(n);
  // Declared image sizes reserve space while off-screen artwork loads lazily.
  article.querySelectorAll('img').forEach(img=>{img.loading='lazy';img.removeAttribute('fetchpriority');});
  article.querySelectorAll('p').forEach(e=>{if(!e.textContent.trim()&&!e.querySelector('img'))e.remove();});
  article.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));cache.set(item.href,article);return article.cloneNode(true);
 }
 async function openEdition(start,saved){
  const token=++serial;busy=true;articleColumns=[];index=0;prev.disabled=next.disabled=true;select.disabled=true;status.textContent='ସଂଖ୍ୟାଟି ଲୋଡ୍ ହେଉଛି…';content.replaceChildren();dialog.querySelectorAll('.quiet-folios span').forEach(e=>e.textContent='');
  try{
   const articles=new Array(collection.items.length);let cursor=0;
   await Promise.all(Array.from({length:Math.min(4,articles.length)},async()=>{while(cursor<articles.length){if(token!==serial)return;const n=cursor++;articles[n]=await articleFor(collection.items[n],n);}}));
   if(token!==serial)return;content.append(...articles);await document.fonts.ready;if(token!==serial)return;
   dialog.querySelector('.quiet-print-header span').textContent=collection.title||'ଶିଶୁ କିଶୋର';busy=false;select.disabled=false;spread=0;paginate();
   if(saved?.version===2)turn(Number(saved.spread)||0);else{const first=Math.floor(articleColumns[start]/columnCount);turn(first+(Number(saved?.spread)||0));}
   pane.focus();save();
  }catch{if(token!==serial)return;busy=false;select.disabled=true;status.textContent='ସଂଖ୍ୟାଟି ଲୋଡ୍ ହୋଇପାରିଲା ନାହିଁ ।';content.replaceChildren();const a=document.createElement('a');a.href=issue;a.textContent='ସୂଚୀପତ୍ରକୁ ଫେରନ୍ତୁ →';content.append(a);prev.disabled=next.disabled=true;}
 }
 document.querySelectorAll('[data-quiet-reader]').forEach(button=>button.addEventListener('click',async event=>{event.preventDefault();if(button.disabled)return;opener=button;returnTo=autoOpening?arrival:null;entryScroll=window.scrollY;button.disabled=true;
  try{
   if(!collection){const r=await fetch('/edition-reader.json',{cache:'no-cache'});if(!r.ok)throw Error();collection=(await r.json())[issue];if(!collection?.items.length)throw Error();collection.items.forEach((item,i)=>{const o=document.createElement('option');o.value=i;o.textContent=item.title;select.append(o);});}
   const current=collection.items.findIndex(i=>i.href===location.pathname||i.href===location.pathname.replace(/\/$/,'')+'.html');const saved=get('sishu-place:'+issue);const start=current>=0?current:Math.min(collection.items.length-1,Math.max(0,Number(saved?.index)||0));
   dialog.showModal();document.documentElement.classList.add('quiet-open');await openEdition(start,current<0||saved?.index===current?saved:null);
  }catch{button.textContent='ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ';}finally{button.disabled=false;}
 }));
 dialog.querySelector('[data-exit]').onclick=()=>dialog.close();dialog.addEventListener('close',()=>{save();serial++;window.SishuPageSound?.stop();window.SishuPageTurn?.stop();document.documentElement.classList.remove('quiet-open');if(returnTo&&window.SishuReaderReturn?.leave(returnTo))return;
  if(location.hash==='#reader')history.replaceState(history.state,'',location.pathname+location.search);opener?.focus({preventScroll:true});window.scrollTo(0,entryScroll);});
 dialog.querySelector('[data-settings]').onclick=e=>{const panel=dialog.querySelector('#quiet-settings');panel.hidden=!panel.hidden;e.currentTarget.setAttribute('aria-expanded',String(!panel.hidden));paginate();};
 const colour=dialog.querySelector('[data-colour-paper]');const paint=()=>{colour.setAttribute('aria-pressed',String(window.SishuStoryWash?.enabled()));window.SishuStoryWash?.paint(dialog,collection?.items[index]?.href||issue);};colour.onclick=()=>window.SishuStoryWash?.set(!window.SishuStoryWash.enabled());window.addEventListener('sishu-paper-change',paint);paint();
 select.onchange=()=>jumpArticle(Number(select.value));
 prev.onclick=()=>{if(busy||prev.disabled)return;window.SishuPageSound?.play();window.SishuPageTurn?window.SishuPageTurn.play(pane,-1,()=>turn(spread-1)):turn(spread-1);};
 next.onclick=()=>{if(busy||next.disabled)return;window.SishuPageSound?.play();window.SishuPageTurn?window.SishuPageTurn.play(pane,1,()=>turn(spread+1)):turn(spread+1);};
 dialog.querySelectorAll('[data-size]').forEach(b=>b.onclick=()=>{size=Math.max(18,Math.min(34,size+Number(b.dataset.size)));put('sishu-reader-size',size);apply();paginate();});
 dialog.querySelectorAll('[data-theme]').forEach(b=>b.onclick=()=>{theme=b.dataset.theme;put('sishu-reader-theme',theme);apply();});
 dialog.querySelector('[data-art]').onchange=e=>{dialog.classList.toggle('quiet-hide-art',!e.target.checked);paginate();};
 dialog.addEventListener('keydown',e=>{if(e.target!==pane||busy)return;if(e.key==='ArrowRight'&&!next.disabled){e.preventDefault();next.click();}if(e.key==='ArrowLeft'&&!prev.disabled){e.preventDefault();prev.click();}});
 if(location.hash==='#reader'){autoOpening=true;document.querySelector('[data-quiet-reader]')?.click();autoOpening=false;}
 new ResizeObserver(()=>paginate()).observe(pane);document.fonts.ready.then(()=>paginate());window.addEventListener('pagehide',save);
})();
