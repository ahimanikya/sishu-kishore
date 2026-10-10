import {test} from 'node:test';import assert from 'node:assert/strict';
import {magazineMonth,refreshBirthdays} from '../public/author-birthdays.mjs';
test('birthday month follows India midnight rather than host timezone',()=>{
 assert.equal(magazineMonth(new Date('2026-10-31T18:29:59Z')),10);
 assert.equal(magazineMonth(new Date('2026-10-31T18:30:00Z')),11);
});
test('monthly birthday list removes stale cards and hides empty months',()=>{
 const cards=[{dataset:{birthdayMonth:'10'}},{dataset:{birthdayMonth:'12'}}],heading={};
 const root={querySelectorAll:()=>cards,querySelector:()=>heading};
 assert.equal(refreshBirthdays(root,new Date('2026-10-10T12:00:00Z')),1);assert.equal(cards[0].hidden,false);assert.equal(cards[1].hidden,true);
 assert.equal(refreshBirthdays(root,new Date('2026-11-01T12:00:00Z')),0);assert.equal(root.hidden,true);
 assert.equal(refreshBirthdays(root,new Date('2026-12-01T12:00:00Z')),1);assert.equal(root.hidden,false);assert.equal(cards[1].hidden,false);
});
