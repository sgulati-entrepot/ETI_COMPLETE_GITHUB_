import test from 'node:test';
import assert from 'node:assert/strict';
import {saveRecord} from '../netlify/functions/_shared/crm-save';
import {seedData,type Lead} from '../app/crm/model';
import type {State} from '../netlify/functions/_shared/crm-domain';
const actor={id:'root',name:'Admin',email:'fly@entrepot.ae',role:'super_admin' as const};
test('follow-up history preserves dates and remarks, authenticates authors and survives old clients',()=>{
 const old={...seedData().leads[0],ownerId:'',followUpAt:'2026-10-04T10:00:00.000Z'};
 const state:State={leads:[old],tasks:[],events:[]};
 const due='2026-10-05T10:00:00.000Z';
 const saved=saveRecord(state,actor,'leads',{...old,followUpAt:due,followUps:[{id:'entry',due,remark:'Requested a callback',author:'forged',at:''}]}) as Lead;
 assert.equal(saved.followUps?.length,2);
 assert.equal(saved.followUps?.[0].author,actor.email);
 assert.equal(saved.followUps?.[0].remark,'Requested a callback');
 assert.equal(saved.followUps?.[1].due,old.followUpAt);
 const cleared=saveRecord(state,actor,'leads',{...saved,followUpAt:'',followUps:undefined}) as Lead;
 assert.equal(cleared.followUps?.length,2);
 assert.equal(cleared.followUpAt,'');
 const tampered=saveRecord(state,actor,'leads',{...cleared,followUps:cleared.followUps?.map(f=>({...f,remark:'rewritten'}))}) as Lead;
 assert.equal(tampered.followUps?.[0].remark,'Requested a callback');
});
test('follow-up edits through the standard editor are retained and invalid dates rejected',()=>{
 const old={...seedData().leads[0],ownerId:''};const state:State={leads:[old],tasks:[],events:[]};
 const saved=saveRecord(state,actor,'leads',{...old,followUpAt:'2026-10-06T10:00:00.000Z'}) as Lead;
 assert.equal(saved.followUps?.length,1);
 assert.throws(()=>saveRecord(state,actor,'leads',{...saved,followUps:[{id:'bad',due:'invalid',remark:'test'}]}),/follow-up/);
});
