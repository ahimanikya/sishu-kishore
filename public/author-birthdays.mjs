// No birth year, age or child birthday is exposed by this feature.
export function magazineMonth(now=new Date()){
 return Number(new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Kolkata',month:'numeric'}).format(now));
}
export function refreshBirthdays(root,now=new Date()){
 const month=magazineMonth(now);let visible=0;
 for(const card of root.querySelectorAll('[data-birthday-month]')){
  card.hidden=Number(card.dataset.birthdayMonth)!==month;
  if(!card.hidden)visible++;
 }
 root.hidden=visible===0;
 root.querySelector('h2').textContent='ଏହି ମାସର ଜନ୍ମଦିନ';
 return visible;
}
if(typeof document!=='undefined'){
 const section=document.querySelector('.writer-birthdays');
 if(section){const update=()=>refreshBirthdays(section);update();document.addEventListener('visibilitychange',()=>{if(!document.hidden)update();});setInterval(update,60000);}
}
