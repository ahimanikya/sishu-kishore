
const buttons=[...document.querySelectorAll('[data-language]')];
function selectLanguage(lang){if(!['or','en'].includes(lang))return;document.documentElement.dataset.lang=lang;document.documentElement.lang=lang;buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.language===lang)));document.querySelectorAll('.art').forEach(x=>x.setAttribute('aria-label',x.dataset[lang==='or'?'altOr':'altEn']));const u=new URL(location.href);u.searchParams.set('lang',lang);history.replaceState(null,'',u)}
buttons.forEach(b=>b.addEventListener('click',()=>selectLanguage(b.dataset.language)));
selectLanguage(new URLSearchParams(location.search).get('lang')||document.documentElement.dataset.lang);
