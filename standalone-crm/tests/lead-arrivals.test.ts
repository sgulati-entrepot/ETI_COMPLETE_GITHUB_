import test from 'node:test';
import assert from 'node:assert/strict';
import {dailyArrivals,newestLeads} from '../app/crm/lead-arrivals';
import {seedData} from '../app/crm/model';
test('newest enquiries sort by creation, not modification, without mutating input',()=>{
 const base=seedData().leads[0];const rows=[{...base,id:'old',createdAt:'2026-10-01T10:00:00Z',updatedAt:'2026-10-04T10:00:00Z'},{...base,id:'new',createdAt:'2026-10-03T10:00:00Z'}];
 assert.deepEqual(newestLeads(rows).map(l=>l.id),['new','old']);assert.equal(rows[0].id,'old');
});
test('daily counts use UAE midnight and exclude previous days regardless of edits',()=>{
 const base=seedData().leads[0];const rows=['2026-10-02T19:59:59Z','2026-10-02T20:00:00Z','2026-10-03T10:00:00Z','invalid'].map((createdAt,i)=>({...base,id:String(i),createdAt,updatedAt:'2026-10-03T10:01:00Z'}));
 const days=dailyArrivals(rows,new Date('2026-10-03T12:00:00Z'));assert.equal(days[0].count,2);assert.equal(days[1].count,1);assert.equal(days.length,7);
 assert.equal(dailyArrivals([],new Date('2026-10-03T12:00:00Z'))[0].count,0);
});
