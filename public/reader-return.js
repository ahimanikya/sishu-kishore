(()=>{
 const read=k=>{try{return JSON.parse(sessionStorage.getItem(k));}catch{return null;}},write=(k,v)=>{try{sessionStorage.setItem(k,JSON.stringify(v));}catch{}},remove=k=>{try{sessionStorage.removeItem(k);}catch{}};
 const safe=value=>{try{const url=new URL(value,location.href);return url.origin===location.origin?url:null;}catch{return null;}};
 const key='sishu-reader-entry',restoreKey='sishu-reader-return';
 const restore=read(restoreKey);
 if(restore&&restore.url===location.href){remove(restoreKey);window.addEventListener('load',()=>requestAnimationFrame(()=>window.scrollTo(0,restore.y||0)),{once:true});}
 document.addEventListener('click',event=>{
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const a=event.target.closest('a[href]');if(!a||a.target==='_blank'||a.hasAttribute('download'))return;
  const url=safe(a.href);if(!url)return;
  if(url.pathname===location.pathname&&url.hash==='#reader'&&a.hasAttribute('data-quiet-reader'))return;
  if(url.hash!=='#reader'&&!/\/books\/[^/]+\/page-\d+(?:\.html)?$/.test(url.pathname))return;
  // Navigation inside a reader must not replace its original entry point.
  if(document.querySelector('#book-reader')||document.querySelector('.mag-quiet-reader[open]'))return;
  write(key,{target:url.pathname,origin:{url:location.href,y:window.scrollY},time:Date.now()});
 },true);
 window.SishuReaderReturn={entry(){
  const pending=read(key);remove(key);
  if(pending&&pending.target===location.pathname&&Date.now()-pending.time<300000&&safe(pending.origin?.url))return pending.origin;
  const saved=history.state?.sishuReaderOrigin;if(saved&&safe(saved.url))return saved;
  const ref=safe(document.referrer);if(ref&&ref.pathname!==location.pathname&&!/\/books\/[^/]+\/page-\d+/.test(ref.pathname))return {url:ref.href,y:0};
  return null;
 },leave(origin){if(!origin||!safe(origin.url))return false;write(restoreKey,origin);location.assign(origin.url);return true;}};
})();
