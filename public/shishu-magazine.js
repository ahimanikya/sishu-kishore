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
