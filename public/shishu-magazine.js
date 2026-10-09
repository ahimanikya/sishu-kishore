const search=document.querySelector('#writer-search');
if(search){const rows=[...document.querySelectorAll('[data-writer]')];const filter=()=>{const q=search.value.normalize('NFC').replace(/\s+/g,'').toLocaleLowerCase();let count=0;for(const row of rows){const match=row.dataset.writer.normalize('NFC').replace(/\s+/g,'').toLocaleLowerCase().includes(q);row.hidden=!match;if(match)count++;}document.querySelector('#writer-count').textContent=count+' ଲେଖକ';document.querySelector('#writer-empty').hidden=count!==0;};search.addEventListener('input',filter);filter();}
const jump=document.querySelector('#ebook-jump');if(jump)jump.addEventListener('change',()=>{if(jump.value)location.href=jump.value;});
let size=21;document.querySelectorAll('[data-text-size]').forEach(button=>button.addEventListener('click',()=>{size=Math.max(17,Math.min(32,size+Number(button.dataset.textSize)));document.documentElement.style.setProperty('--ebook-size',size+'px');}));

// Manual browsing only: native touch scrolling, keyboard arrows, and real links.
const articleRail=document.querySelector('#issue-articles');
if(articleRail){
 const controls=document.querySelector('.mag-browse-controls');
 const cards=[...articleRail.children];
 const previous=controls.querySelector('[data-browse="-1"]');
 const next=controls.querySelector('[data-browse="1"]');
 const status=controls.querySelector('.mag-browse-status');
 const step=()=>cards[0].getBoundingClientRect().width+parseFloat(getComputedStyle(articleRail).gap);
 const update=()=>{
  const start=Math.round(articleRail.scrollLeft/step());
  const count=Math.max(1,Math.round(articleRail.clientWidth/step()));
  previous.disabled=articleRail.scrollLeft<4;
  next.disabled=articleRail.scrollLeft+articleRail.clientWidth>=articleRail.scrollWidth-4;
  if(status) status.textContent=`${start+1}–${Math.min(cards.length,start+count)} / ${cards.length}`;
 };
 const move=direction=>articleRail.scrollBy({left:direction*step(),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 controls.hidden=false;
 controls.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>move(Number(button.dataset.browse))));
 articleRail.addEventListener('keydown',event=>{if(event.target===articleRail && ['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();move(event.key==='ArrowLeft'?-1:1);}});
 articleRail.addEventListener('scroll',update,{passive:true});
 new ResizeObserver(update).observe(articleRail);update();
}
