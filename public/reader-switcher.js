(()=>{
 let catalog;
 window.SishuReaderSwitcher={mount(container,current,origin){
  if(!container)return;
  const section=document.createElement('div');section.className='reader-switcher';
  const label=document.createElement('label');label.textContent='ସଂଖ୍ୟା ବା ବହି ବଦଳାନ୍ତୁ';
  const select=document.createElement('select');select.setAttribute('aria-label','ସଂଖ୍ୟା ବା ବହି ବାଛନ୍ତୁ');select.disabled=true;label.append(select);
  const open=document.createElement('button');open.type='button';open.textContent='ଖୋଲନ୍ତୁ →';open.disabled=true;
  const status=document.createElement('span');status.setAttribute('role','status');status.textContent='ଲୋଡ୍ ହେଉଛି…';section.append(label,open,status);container.append(section);
  catalog ||= fetch('/reader-catalog.json').then(r=>{if(!r.ok)throw Error();return r.json();}).catch(e=>{catalog=null;throw e;});
  catalog.then(groups=>{
   groups.forEach(group=>{const optgroup=document.createElement('optgroup');optgroup.label=group.title;group.items.forEach(item=>{const option=document.createElement('option');option.value=item.href;option.textContent=item.title;if(item.book)option.dataset.book=item.book;optgroup.append(option);});select.append(optgroup);});
   select.value=current;select.disabled=false;status.textContent='';select.onchange=()=>{open.disabled=!select.value||select.value===current;};
   open.onclick=()=>{const option=select.selectedOptions[0];if(!option||option.value===current)return;let href=option.value;
    if(option.dataset.book){try{const page=Number(localStorage.getItem('sishu-book-'+option.dataset.book));const max=groups.flatMap(g=>g.items).find(i=>i.href===option.value)?.total;if(Number.isInteger(page)&&page>1&&page<=max)href=href.replace('page-1.html','page-'+page+'.html');}catch{}}
    window.SishuReaderReturn?.prepare(href,origin());location.assign(href);
   };
  }).catch(()=>{status.textContent='ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ ।';const link=document.createElement('a');link.href='/shishu/old_issues.html';link.textContent='ସଂଖ୍ୟାଗୁଡ଼ିକ →';section.append(link);});
 }};
})();
