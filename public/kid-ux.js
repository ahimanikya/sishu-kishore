/* Reading progress stays on this device; no account is needed. */
(()=>{
 const read=key=>{try{return JSON.parse(localStorage.getItem(key));}catch{return null;}};
 const home=location.pathname==='/shishu/'||location.pathname==='/shishu/index.html';
 const refresh=()=>document.querySelectorAll('.mag-edition-actions .ia-button').forEach(link=>{
  let issue=document.body.dataset.readingIssue||new URL(link.href,location.href).pathname;
  if(home){const last=read('sishu-last-reader');if(last?.issue&&/^\/shishu\/[a-zA-Z0-9_-]+\.html$/.test(last.issue))issue=last.issue;}
  const place=read('sishu-place:'+issue);
  const continuing=place&&Number.isFinite(place.spread)&&place.spread>0;
  link.textContent=continuing?'ପୁଣି ପଢ଼ନ୍ତୁ →':'ପଢ଼ିବା ଆରମ୍ଭ କରନ୍ତୁ →';
  link.setAttribute('aria-label',link.textContent);
  if(home&&continuing)link.href=issue+'#reader';
 });
 refresh();window.addEventListener('pageshow',refresh);window.addEventListener('sishu-reading-saved',refresh);
})();
