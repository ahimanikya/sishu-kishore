(()=>{
 const issue=document.body.dataset.readingIssue;if(!issue)return;
 const arrival=location.hash==='#reader'?window.SishuReaderReturn?.entry():null;let returnTo=null,entryScroll=0,autoOpening=false;
 if(arrival)history.replaceState({...history.state,sishuReaderOrigin:arrival},'');
 const get=key=>{try{return JSON.parse(localStorage.getItem(key));}catch{return null;}};
 const put=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));}catch{}};
 const dialog=document.createElement('dialog');dialog.className='mag-quiet-reader';dialog.setAttribute('aria-label','ପଢ଼ିବା ଘର');
 dialog.innerHTML=`<header class="quiet-top"><button data-exit aria-label="ପଢ଼ିବା ବନ୍ଦ କରନ୍ତୁ">← ଫେରନ୍ତୁ</button><button data-fullscreen aria-label="Enter full screen" aria-pressed="false" title="ପୂର୍ଣ୍ଣ ପରଦା">⛶ <span>ପୂର୍ଣ୍ଣ ପରଦା</span></button><button data-settings aria-expanded="false" aria-controls="quiet-settings">ଅ · ପଢ଼ିବା ସୁବିଧା</button></header><section id="quiet-settings" hidden><label>ଲେଖା ବାଛନ୍ତୁ <select data-contents></select></label><div class="quiet-options"><button data-size="-2" aria-label="ଅକ୍ଷର ଛୋଟ କରନ୍ତୁ">ଅ −</button><button data-size="2" aria-label="ଅକ୍ଷର ବଡ଼ କରନ୍ତୁ">ଅ +</button><button data-theme="paper" aria-pressed="true">କାଗଜ</button><button data-theme="night" aria-pressed="false">ରାତି</button><button data-colour-paper aria-pressed="true">ରଙ୍ଗିନ କାଗଜ</button><label><input data-art type="checkbox" checked> ଚିତ୍ର</label></div></section><div class="quiet-spread-shell"><section class="quiet-cover-stage" aria-label="ମଲାଟ"><div class="quiet-cover-book"><div class="quiet-cover-front"></div><div class="quiet-cover-back" hidden></div></div><div class="quiet-cover-actions"><button data-open-cover disabled>ପଢ଼ିବା ଆରମ୍ଭ କରନ୍ତୁ →</button><button data-resume-place hidden>ପୁଣି ପଢ଼ନ୍ତୁ →</button><button data-skip-intro hidden>ଛାଡ଼ନ୍ତୁ</button></div></section><div class="quiet-print-header" aria-hidden="true"><span>ଶିଶୁ କିଶୋର</span><span>ଶିଶୁ କିଶୋର</span></div><i class="quiet-corner quiet-corner-leaf" aria-hidden="true"></i><i class="quiet-corner quiet-corner-kite" aria-hidden="true"></i><div class="quiet-page" tabindex="0" aria-label="ପତ୍ରିକା ପୃଷ୍ଠା"><div class="quiet-track"><div class="quiet-content"></div></div></div><div class="quiet-folios" aria-hidden="true"><span></span><span></span></div></div><footer class="quiet-bottom"><button data-prev aria-label="ପୂର୍ବ ପୃଷ୍ଠା">← ପୂର୍ବ</button><span role="status" aria-live="polite"></span><button data-next aria-label="ପର ପୃଷ୍ଠା">ପର →</button></footer>`;
 const readerFrame=document.createElement('div');readerFrame.className='quiet-reader-frame';readerFrame.append(...dialog.childNodes);dialog.append(readerFrame);
 document.body.append(dialog);
 window.SishuPageSound?.mount(dialog.querySelector('.quiet-options'));
 window.SishuReaderSwitcher?.mount(dialog.querySelector('#quiet-settings'),issue+'#reader',()=>returnTo||{url:location.href.replace(/#reader$/,''),y:entryScroll});
 const pane=dialog.querySelector('.quiet-page'),content=dialog.querySelector('.quiet-content'),select=dialog.querySelector('select'),status=dialog.querySelector('.quiet-bottom [role=status]'),prev=dialog.querySelector('[data-prev]'),next=dialog.querySelector('[data-next]');
 let collection,index=0,opener,serial=0,size=get('sishu-reader-size')||22,theme=get('sishu-reader-theme')||'paper',busy=false,spread=0,spreadCount=1,columnCount=1,totalPages=1,articleColumns=[];
 const track=dialog.querySelector('.quiet-track'),cache=new Map();
 const coverStage=dialog.querySelector('.quiet-cover-stage'),front=dialog.querySelector('.quiet-cover-front'),back=dialog.querySelector('.quiet-cover-back');
 const openCover=dialog.querySelector('[data-open-cover]'),resume=dialog.querySelector('[data-resume-place]'),skipIntro=dialog.querySelector('[data-skip-intro]'),fullscreen=dialog.querySelector('[data-fullscreen]');
 const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
 let phase='front',savedPlace=null,intro=null,ownsFullscreen=false,ready=false;
 dialog.dataset.pageKind=phase;
 function stopIntro(){intro?.cancel();intro=null;skipIntro.hidden=true;}
 function animateCover(){
  stopIntro();if(reducedMotion.matches||!front.animate)return;
  // A short opening peek returns to the front cover; navigation stays under the reader's control.
  intro=front.animate([
   {transform:'rotateY(0deg)'},{transform:'rotateY(-48deg)',offset:.58},{transform:'rotateY(0deg)'}
  ],{duration:1500,easing:'cubic-bezier(.3,.05,.25,1)',delay:180});
  skipIntro.hidden=false;intro.onfinish=stopIntro;
 }
 skipIntro.onclick=stopIntro;
 reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches)stopIntro();});
 function coverText(tag,text,className){const node=document.createElement(tag);node.textContent=text;if(className)node.className=className;return node;}
 async function prepareCovers(){
  let source=document;
  if(!document.querySelector('.mag-edition-opening')){
   const response=await fetch(issue);if(!response.ok)throw Error('cover');
   source=new DOMParser().parseFromString(await response.text(),'text/html');
  }
  const artwork=source.querySelector('.mag-edition-opening>figure img');
  const designedCover=source.querySelector('.mag-edition-opening>figure.storybook-cover');
  front.classList.toggle('quiet-illustrated-cover',Boolean(designedCover));
  front.replaceChildren();
  if(designedCover){
   const cover=designedCover.cloneNode(true);cover.removeAttribute('id');cover.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));
   cover.querySelectorAll('img').forEach(img=>{img.loading='eager';img.sizes='(max-width: 600px) 80vw, 480px';});front.append(cover);
  }else{
   front.append(coverText('strong','ଶିଶୁ କିଶୋର','quiet-cover-brand'));
   if(artwork){const img=artwork.cloneNode(true);img.className='quiet-cover-art';img.loading='eager';img.removeAttribute('id');img.sizes='(max-width: 600px) 80vw, 480px';front.append(img);}
  }
  if(!designedCover)front.append(coverText('p',collection.title,'quiet-cover-edition'));
  back.replaceChildren(coverText('strong','ଶିଶୁ କିଶୋର','quiet-cover-brand'));
  const leaf=document.createElement('img');leaf.src='/art/reader/leaf.svg';leaf.alt='';leaf.className='quiet-back-leaf';back.append(leaf);
  back.append(coverText('p',collection.title,'quiet-cover-edition'));
  const contents=document.createElement('a');contents.href=issue+'#edition-contents';contents.textContent='ସୂଚୀପତ୍ର →';back.append(contents);
  // This is a digital closing cover, not a reproduction of an unavailable printed back cover.
 }
 function showPosition(){
  const covering=phase!=='body';dialog.dataset.pageKind=phase;coverStage.hidden=!covering;
  front.hidden=phase==='back';back.hidden=phase!=='back';pane.inert=covering;pane.setAttribute('aria-hidden',String(covering));
  dialog.dataset.finalSingle=String(!covering&&columnCount===2&&spread*columnCount+1===totalPages);
  prev.disabled=!ready||busy||phase==='front';next.disabled=!ready||busy||phase==='back';openCover.disabled=!ready||busy;
  resume.hidden=phase!=='front'||!savedPlace||!ready||busy;
  openCover.textContent=phase==='back'?'ଆରମ୍ଭରୁ ପଢ଼ନ୍ତୁ ↺':'ପଢ଼ିବା ଆରମ୍ଭ କରନ୍ତୁ →';
  if(covering){select.value=phase;status.textContent=phase==='front'?'ମଲାଟ · '+collection.title:'ପଛ ମଲାଟ · '+collection.title;return;}
  const first=spread*columnCount+1,last=Math.min(totalPages,first+columnCount-1);
  index=Math.max(0,articleColumns.findLastIndex(column=>column<=first-1));select.value=String(index);window.SishuStoryWash?.paint(dialog,collection.items[index].href);
  const folios=dialog.querySelectorAll('.quiet-folios span');folios[0].textContent=odia(first);folios[1].textContent=columnCount===2&&last>first?odia(last):'';
  status.textContent=`${odia(first)}${last>first?'–'+odia(last):''} / ${odia(totalPages)} · ${collection.items[index].title}`;
 }
 function showCover(kind){stopIntro();phase=kind;showPosition();save();}
 function move(direction){
  if(busy||window.SishuPageTurn?.busy||(direction<0&&prev.disabled)||(direction>0&&next.disabled))return;
  stopIntro();window.SishuPageSound?.play();
  const update=()=>{
   if(phase==='front')turn(0);
   else if(phase==='back')turn(spreadCount-1);
   else if(direction<0&&spread===0)showCover('front');
   else if(direction>0&&spread===spreadCount-1)showCover('back');
   else turn(spread+direction);
  };
  const betweenPages=phase==='body'&&!(direction<0&&spread===0)&&!(direction>0&&spread===spreadCount-1);
  const paper=dialog.querySelector('.quiet-spread-shell');
  const surface=phase==='body'?paper:dialog.querySelector('.quiet-cover-book');
  const options={host:readerFrame,mode:betweenPages?(columnCount===2?'spread':'slide'):'cover',resolveSurface:()=>betweenPages?paper:phase==='body'?pane:dialog.querySelector('.quiet-cover-book'),destinationIsCover:()=>phase!=='body'};
  window.SishuPageTurn?window.SishuPageTurn.play(surface,direction,update,options):update();
 }
 openCover.onclick=()=>{if(phase==='back'){window.SishuPageTurn?.stop();showCover('front');openCover.focus();}else move(1);};
 resume.onclick=()=>{
  if(busy||!savedPlace)return;window.SishuPageTurn?.stop();
  if(savedPlace.phase==='back')showCover('back');
  else if(savedPlace.version===3){index=Math.max(0,Math.min(collection.items.length-1,Number(savedPlace.index)||0));turn(Math.floor(((articleColumns[index]||0)+(Number(savedPlace.within)||0))/columnCount));}
  else turn(Number(savedPlace.spread)||0);
  if(phase==='body')pane.focus();
 };
 function updateFullscreen(){const active=Boolean(document.fullscreenElement);fullscreen.setAttribute('aria-pressed',String(active));fullscreen.setAttribute('aria-label',active?'Exit full screen':'Enter full screen');fullscreen.querySelector('span').textContent=active?'ଛୋଟ ପରଦା':'ପୂର୍ଣ୍ଣ ପରଦା';if(!active)ownsFullscreen=false;paginate();}
 fullscreen.hidden=!document.documentElement.requestFullscreen||document.fullscreenEnabled===false;
 fullscreen.onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else{await readerFrame.requestFullscreen();ownsFullscreen=true;}}catch(error){console.warn('Reader full screen:',error.name,error.message);status.textContent='ପୂର୍ଣ୍ଣ ପରଦା ଖୋଲିପାରିଲା ନାହିଁ ।';}};
 document.addEventListener('fullscreenchange',updateFullscreen);
 dialog.addEventListener('cancel',event=>{if(document.fullscreenElement){event.preventDefault();document.exitFullscreen().catch(()=>{});}});
 const odia=value=>String(value).replace(/[0-9]/g,d=>'୦୧୨୩୪୫୬୭୮୯'[Number(d)]);
 const save=()=>{if(collection&&ready&&!busy&&phase!=='front'){savedPlace={version:3,phase,index,spread,within:Math.max(0,spread*columnCount-(articleColumns[index]||0))};put('sishu-place:'+issue,savedPlace);put('sishu-last-reader',{issue});window.dispatchEvent(new Event('sishu-reading-saved'));}};
 const apply=()=>{dialog.style.setProperty('--reading-size',size+'px');dialog.dataset.theme=theme;dialog.querySelectorAll('[data-theme]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.theme===theme)));};apply();
 function turn(to){
  stopIntro();phase='body';spread=Math.max(0,Math.min(spreadCount-1,to));pane.scrollLeft=spread*(pane.clientWidth+48);
  showPosition();save();
 }
 function paginate(){
  if(!dialog.open||!ready||busy||!content.firstChild)return;
  window.SishuPageTurn?.stop();
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
  track.style.width=(spreadCount*(pane.clientWidth+48)-48)+'px';spread=Math.min(spreadCount-1,Math.floor(((articleColumns[anchor]||0)+within)/columnCount));pane.scrollLeft=spread*(pane.clientWidth+48);showPosition();save();
 }
 function jumpArticle(n){if(busy||!articleColumns.length)return;window.SishuPageTurn?.stop();turn(Math.floor(articleColumns[n]/columnCount));pane.focus();}
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
 async function openEdition(){
  const token=++serial;busy=true;ready=false;phase='front';savedPlace=get('sishu-place:'+issue);articleColumns=[];index=0;spread=0;prev.disabled=next.disabled=true;select.disabled=true;status.textContent='ସଂଖ୍ୟାଟି ଲୋଡ୍ ହେଉଛି…';content.replaceChildren();dialog.querySelectorAll('.quiet-folios span').forEach(e=>e.textContent='');
  try{
   await prepareCovers();if(token!==serial)return;showPosition();animateCover();
   const articles=new Array(collection.items.length);let cursor=0;
   await Promise.all(Array.from({length:Math.min(4,articles.length)},async()=>{while(cursor<articles.length){if(token!==serial)return;const n=cursor++;articles[n]=await articleFor(collection.items[n],n);}}));
   if(token!==serial)return;content.append(...articles);await document.fonts.ready;if(token!==serial)return;
   dialog.querySelector('.quiet-print-header span').textContent=collection.title||'ଶିଶୁ କିଶୋର';busy=false;ready=true;select.disabled=false;spread=0;paginate();
   showPosition();openCover.focus();
  }catch{if(token!==serial)return;busy=false;phase='body';showPosition();select.disabled=true;status.textContent='ସଂଖ୍ୟାଟି ଲୋଡ୍ ହୋଇପାରିଲା ନାହିଁ ।';content.replaceChildren();const a=document.createElement('a');a.href=issue;a.textContent='ସୂଚୀପତ୍ରକୁ ଫେରନ୍ତୁ →';content.append(a);prev.disabled=next.disabled=true;}
 }
 document.querySelectorAll('[data-quiet-reader]').forEach(button=>button.addEventListener('click',async event=>{event.preventDefault();if(button.disabled)return;opener=button;returnTo=autoOpening?arrival:null;entryScroll=window.scrollY;button.disabled=true;
  try{
   if(!collection){const r=await fetch('/edition-reader.json',{cache:'no-cache'});if(!r.ok)throw Error();collection=(await r.json())[issue];if(!collection?.items.length)throw Error();select.append(new Option('ମଲାଟ','front'));collection.items.forEach((item,i)=>select.append(new Option(item.title,String(i))));select.append(new Option('ପଛ ମଲାଟ','back'));}
   dialog.showModal();document.documentElement.classList.add('quiet-open');await openEdition();
  }catch{button.textContent='ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ';}finally{button.disabled=false;}
 }));
 dialog.querySelector('[data-exit]').onclick=()=>dialog.close();dialog.addEventListener('close',()=>{save();serial++;stopIntro();if(ownsFullscreen&&document.fullscreenElement)document.exitFullscreen().catch(()=>{});window.SishuPageSound?.stop();window.SishuPageTurn?.stop();document.documentElement.classList.remove('quiet-open');if(returnTo&&window.SishuReaderReturn?.leave(returnTo))return;
  if(location.hash==='#reader')history.replaceState(history.state,'',location.pathname+location.search);opener?.focus({preventScroll:true});window.scrollTo(0,entryScroll);});
 dialog.querySelector('[data-settings]').onclick=e=>{const panel=dialog.querySelector('#quiet-settings');panel.hidden=!panel.hidden;e.currentTarget.setAttribute('aria-expanded',String(!panel.hidden));paginate();};
 const colour=dialog.querySelector('[data-colour-paper]');const paint=()=>{colour.setAttribute('aria-pressed',String(window.SishuStoryWash?.enabled()));window.SishuStoryWash?.paint(dialog,collection?.items[index]?.href||issue);};colour.onclick=()=>window.SishuStoryWash?.set(!window.SishuStoryWash.enabled());window.addEventListener('sishu-paper-change',paint);paint();
 select.onchange=()=>{window.SishuPageTurn?.stop();if(select.value==='front'||select.value==='back')showCover(select.value);else jumpArticle(Number(select.value));};
 prev.onclick=()=>move(-1);
 next.onclick=()=>move(1);
 dialog.querySelectorAll('[data-size]').forEach(b=>b.onclick=()=>{size=Math.max(18,Math.min(34,size+Number(b.dataset.size)));put('sishu-reader-size',size);apply();paginate();});
 dialog.querySelectorAll('[data-theme]').forEach(b=>b.onclick=()=>{window.SishuPageTurn?.stop();theme=b.dataset.theme;put('sishu-reader-theme',theme);apply();});
 dialog.querySelector('[data-art]').onchange=e=>{dialog.classList.toggle('quiet-hide-art',!e.target.checked);paginate();};
 dialog.addEventListener('keydown',e=>{
  if(!ready||busy||e.defaultPrevented||e.altKey||e.metaKey||e.ctrlKey||e.shiftKey||e.target.isContentEditable||e.target.closest('input,select,textarea,[contenteditable="true"],[role="slider"]'))return;
  if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1);}
  if(e.key==='Home'||e.key==='End'){e.preventDefault();window.SishuPageTurn?.stop();showCover(e.key==='Home'?'front':'back');}
 });
 if(location.hash==='#reader'){autoOpening=true;document.querySelector('[data-quiet-reader]')?.click();autoOpening=false;}
 new ResizeObserver(()=>paginate()).observe(pane);document.fonts.ready.then(()=>paginate());window.addEventListener('pagehide',save);
})();
