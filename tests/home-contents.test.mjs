import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../public/shishu-magazine.js',import.meta.url),'utf8');
const ids=Array.from({length:25},(_,i)=>`/shishu/article-${i}.html`);
function visit({state=null,random=()=>0.25,blocked=false,home=true,articles=ids,navigation='navigate'}={}){
 const cards=articles.map(id=>({id,querySelector:()=>({getAttribute:()=>id})}));
 const list={children:[...cards],append(...nodes){this.children=nodes;}};
 const history={state,replaceState(value){if(blocked)throw Error('history disabled');this.state=value;}};
 vm.runInNewContext(source,{
  document:{querySelector:s=>home&&s==='.mag-home-articles #issue-articles'?list:null,querySelectorAll:()=>[]},
  performance:{getEntriesByType:()=>[{type:navigation}]},
  history,Math:Object.assign(Object.create(Math),{random})
 });
 return {order:list.children.map(c=>c.id),cards,list,state:history.state};
}

test('a fresh visit shuffles every original card exactly once, retaining its link and identity',()=>{
 const a=visit(),b=visit({random:()=>0.75});
 assert.equal(a.order.length,25);assert.deepEqual([...a.order].sort(),[...ids].sort());
 assert.notDeepEqual(a.order,ids);assert.notDeepEqual(a.order,b.order);
 assert.ok(a.list.children.every(c=>a.cards.includes(c)));
});
test('reload and returning via a homepage link reshuffle even with a previously saved order',()=>{
 const a=visit();
 for(const navigation of ['navigate','reload']){
  const b=visit({state:a.state,navigation,random:()=>0.75});
  assert.notDeepEqual(b.order,a.order);
  assert.deepEqual([...b.order].sort(),[...ids].sort());
 }
});
test('Back/Forward preserves the reader’s place and unrelated history state',()=>{
 const a=visit({state:{readerOrigin:'kept'}});
 assert.equal(a.state.readerOrigin,'kept');
 const b=visit({state:a.state,navigation:'back_forward',random:()=>{throw Error('must not reshuffle');}});
 assert.deepEqual(b.order,a.order);
});
test('all articles remain available when saving history is unavailable',()=>{
 const a=visit({blocked:true});
 assert.deepEqual([...a.order].sort(),[...ids].sort());
 assert.notDeepEqual(a.order,ids);
});
test('changed contents and corrupt or duplicate saved IDs cannot omit or duplicate an article',()=>{
 for(const saved of ['bad data',ids.slice(1),ids.map(()=>ids[0]),[...ids.slice(1),'/old-issue.html']]){
  const a=visit({state:{sishuHomeArticleOrder:saved},navigation:'back_forward'});
  assert.deepEqual([...a.order].sort(),[...ids].sort());
 }
 const first=visit();const next=visit({state:first.state,navigation:'back_forward',articles:[...ids,'/shishu/new.html']});
 assert.equal(next.order.length,26);assert.equal(new Set(next.order).size,26);
 assert.ok(next.order.includes('/shishu/new.html'));
});
test('issue and other non-home pages do not reorder or write history state',()=>{
 const a=visit({home:false,random:()=>{throw Error('must not shuffle');}});
 assert.deepEqual(a.order,ids);assert.equal(a.state,null);
});
