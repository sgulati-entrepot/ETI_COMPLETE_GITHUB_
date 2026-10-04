import test from 'node:test';
import assert from 'node:assert/strict';
import {canEditLeadValue} from '../app/crm/admin-config';
import {saveRecord} from '../netlify/functions/_shared/crm-save';
import {seedData} from '../app/crm/model';
import type {Actor} from '../netlify/functions/_shared/crm-access';
import type {State} from '../netlify/functions/_shared/crm-domain';
const lead={...seedData().leads[0],ownerId:'staff',owner:'Sales',value:100};
const state=():State=>({leads:[structuredClone(lead)],tasks:[],events:[],team:[{id:'staff',name:'Sales',email:'staff@example.com',role:'sales',status:'Active'}]});
test('named admins and all sales roles have value permission',()=>{
 for(const email of ['sgulati@entrepot.ae','rdsouza@entrepot.ae','smurthy@entrepot.ae']){
  const actor:Actor={id:'admin',name:'Admin',email,role:'super_admin'};
  assert.equal(canEditLeadValue(actor),true);
  assert.equal(saveRecord(state(),actor,'leads',{...lead,value:200}).value,200);
 }
 const actor:Actor={id:'staff',name:'Sales',email:'staff@example.com',role:'sales'};
 assert.equal(saveRecord(state(),actor,'leads',{...lead,value:250}).value,250);
 const otherState=state();otherState.team!.push({id:'other',name:'Other sales',email:'other@example.com',role:'sales',status:'Active'});
 assert.throws(()=>saveRecord(otherState,{...actor,id:'other'},'leads',{...lead,value:250}),/assigned/);
});
test('all super admins can edit values, including additional admin accounts',()=>{
 for(const email of ['sales@entrepot.ae','fly@entrepot.ae','new@example.com']){
  const actor:Actor={id:'other-admin',name:'Admin',email,role:'super_admin'};
  assert.equal(canEditLeadValue(actor),true);
  assert.equal(saveRecord(state(),actor,'leads',{...lead,value:500}).value,500);
 }
 assert.equal(canEditLeadValue(null),false);
});
