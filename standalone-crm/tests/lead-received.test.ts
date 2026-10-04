import test from 'node:test';
import assert from 'node:assert/strict';
import {parseLeadDate,importHeader,receivedDate} from '../app/crm/lead-received';
import {saveRecord} from '../netlify/functions/_shared/crm-save';
import {seedData,type Lead} from '../app/crm/model';
import type {State} from '../netlify/functions/_shared/crm-domain';
import {newestLeads,dailyArrivals} from '../app/crm/lead-arrivals';
test('spreadsheet dates support ISO, UAE timestamps, day-first and Excel serials',()=>{
 assert.equal(parseLeadDate('2026-10-03'),'2026-10-03');assert.equal(parseLeadDate('03/10/2026'),'2026-10-03');assert.equal(parseLeadDate('2026-10-02T21:00:00Z'),'2026-10-03');assert.equal(parseLeadDate('25569'),'1970-01-01');assert.equal(parseLeadDate(''),'');assert.throws(()=>parseLeadDate('31/02/2026'));assert.throws(()=>parseLeadDate('bad'));
 assert.equal(importHeader('Lead Generation Date'),'leadReceivedDate');assert.equal(importHeader('created_time'),'leadReceivedDate');assert.equal(importHeader('Full Name'),'name');
});
test('received dates persist, validate, sort and count using generation date',()=>{
 const actor={id:'a',name:'A',email:'a@example.com',role:'sales' as const};const lead={...seedData().leads[0],ownerId:'a'};const state:State={leads:[lead],tasks:[],events:[],team:[{...actor,status:'Active',createdAt:''}]};
 const saved=saveRecord(state,actor,'leads',{...lead,leadReceivedDate:'2026-09-12'}) as Lead;
 const updated=saveRecord(state,actor,'leads',{...saved,leadReceivedDate:undefined}) as Lead;assert.equal(updated.leadReceivedDate,'2026-09-12');
 assert.throws(()=>saveRecord(state,actor,'leads',{...updated,leadReceivedDate:'2026-02-30'}));
 const newer={...saved,id:'newer',leadReceivedDate:'2026-10-03'};assert.equal(newestLeads([saved,newer])[0].id,'newer');assert.equal(dailyArrivals([saved,newer],new Date('2026-10-03T12:00:00Z'))[0].count,1);
 assert.equal(receivedDate({...lead,createdAt:'2026-10-02T21:00:00Z'}),'2026-10-03');
});
