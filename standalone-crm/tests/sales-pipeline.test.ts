import test from 'node:test';
import assert from 'node:assert/strict';
import {salespersonPipeline} from '../app/crm/SalesPipeline';
import {blankLead} from '../app/crm/model';
test('salesperson pipeline uses owner IDs, open stages, and both lead types',()=>{
 const base=blankLead();const leads=[{...base,id:'1',ownerId:'a',value:100},{...base,id:'2',ownerId:'a',leadType:'corporate' as const,value:200},{...base,id:'3',ownerId:'a',stage:'Enrolled' as const,value:900},{...base,id:'4',ownerId:'b',value:500},{...base,id:'5',owner:'A',value:1000},{...base,id:'6',ownerId:'a',stage:'Lost' as const,value:900}];
 const rows=salespersonPipeline(leads,[{id:'a',name:'A'},{id:'b',name:'B'},{id:'c',name:'C'}],true);
 assert.deepEqual(rows[0],{id:'a',name:'A',count:2,value:300,individual:1,corporate:1});assert.equal(rows[1].value,500);assert.equal(rows[2].value,0);
});

test('enrolment revenue includes only enrolled values for each assigned salesperson',()=>{
 const base=blankLead();const leads=[{...base,ownerId:'a',stage:'Enrolled' as const,value:1200},{...base,ownerId:'a',stage:'Enrolled' as const,leadType:'corporate' as const,value:2300},{...base,ownerId:'a',stage:'Lost' as const,value:900},{...base,ownerId:'a',value:800},{...base,ownerId:'b',stage:'Enrolled' as const,value:500},{...base,owner:'A',stage:'Enrolled' as const,value:700}];
 const rows=salespersonPipeline(leads,[{id:'a',name:'A'},{id:'b',name:'B'},{id:'c',name:'C'}],true,'revenue');
 assert.deepEqual(rows[0],{id:'a',name:'A',count:2,value:3500,individual:1,corporate:1});assert.equal(rows[1].value,500);assert.equal(rows[2].value,0);
});
