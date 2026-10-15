const search=document.querySelector('#writer-search');
if(search){
 const rows=[...document.querySelectorAll('[data-writer]')];
 const biographies=document.querySelector('#writer-biographies');
 const normalize=value=>value.normalize('NFC').replace(/[\s\u200c\u200d]+/g,'').toLocaleLowerCase();
 const filter=()=>{
  const q=normalize(search.value);let count=0;
  for(const row of rows){
   const match=normalize(row.dataset.writer+' '+(row.dataset.aliases||'')).includes(q)&&(!biographies?.checked||row.dataset.biography==='true');
   row.hidden=!match;if(match)count++;
  }
  document.querySelector('#writer-count').textContent=new Intl.NumberFormat('or',{numberingSystem:'orya'}).format(count)+' ଲେଖକ';
  document.querySelector('#writer-empty').hidden=count!==0;
 };
 search.addEventListener('input',filter);biographies?.addEventListener('change',filter);filter();
}
const jump=document.querySelector('#ebook-jump');if(jump)jump.addEventListener('change',()=>{if(jump.value)location.href=jump.value;});
let size=21;document.querySelectorAll('[data-text-size]').forEach(button=>button.addEventListener('click',()=>{size=Math.max(17,Math.min(32,size+Number(button.dataset.textSize)));document.documentElement.style.setProperty('--ebook-size',size+'px');}));

// Shuffle the complete homepage list once per tab session, never during reading.
// The issue's editorial order and reader page sequence are not touched.
(()=>{
 const list=document.querySelector('.mag-home-articles #issue-articles');
 if(!list)return;
 const cards=[...list.children];
 const byId=new Map(cards.map(card=>[card.querySelector('a[href]').getAttribute('href'),card]));
 if(byId.size!==cards.length||cards.length<2)return;
 const ids=[...byId.keys()],key='sishu-home-article-order-v1';
 const valid=order=>Array.isArray(order)&&order.length===ids.length&&new Set(order).size===ids.length&&order.every(id=>byId.has(id));
 let order;
 // History also preserves Back/Forward ordering if session storage is unavailable.
 try{order=history.state?.sishuHomeArticleOrder;}catch{}
 if(!valid(order)){
  try{order=JSON.parse(sessionStorage.getItem(key));}catch{}
 }
 if(!valid(order)){
  order=[...ids];
  for(let i=order.length-1;i>0;i--){
   const j=Math.floor(Math.random()*(i+1));
   [order[i],order[j]]=[order[j],order[i]];
  }
 }
 // Move the actual cards so visual, keyboard and screen-reader order all agree.
 list.append(...order.map(id=>byId.get(id)));
 try{sessionStorage.setItem(key,JSON.stringify(order));}catch{}
 try{history.replaceState({...history.state,sishuHomeArticleOrder:order},'');}catch{}
})();
