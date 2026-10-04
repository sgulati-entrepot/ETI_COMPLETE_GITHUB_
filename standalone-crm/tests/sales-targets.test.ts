import test from 'node:test';
import assert from 'node:assert/strict';
import {setMonthlyTarget,targetProgress} from '../netlify/functions/_shared/crm-targets';
import {saveRecord} from '../netlify/functions/_shared/crm-save';
import {seedData,type Lead} from '../app/crm/model';
import type {State} from '../netlify/functions/_shared/crm-domain';
const admin={id:'admin',name:'Admin',email:'admin@example.com',role:'super_admin' as const};
const sales={id:'a',name:'A',email:'a@example.com',role:'sales' as const};
const state=():State=>({leads:[],tasks:[],events:[],team:[{...sales,status:'Active',createdAt:''},{...sales,id:'b',name:'B',email:'b@example.com',status:'Active',createdAt:''}]});
test('targets are admin-only, month-specific and protected against stale updates',()=>{
 const s=state();assert.throws(()=>setMonthlyTarget(s,sales,{month:'2026-10',staffId:'a',amount:1000}),/Only super admins/);
 assert.throws(()=>setMonthlyTarget(s,admin,{month:'2026-13',staffId:'a',amount:1000}));
 assert.throws(()=>setMonthlyTarget(s,admin,{month:'2026-10',staffId:'a',amount:-1}));
 setMonthlyTarget(s,admin,{month:'2026-10',staffId:'a',amount:1000});
 setMonthlyTarget(s,admin,{month:'2026-11',staffId:'a',amount:2000});
 assert.throws(()=>setMonthlyTarget(s,admin,{month:'2026-10',staffId:'a',amount:500}),/changed/);
 assert.equal(targetProgress(s,sales,'2026-10').rows[0].target,1000);
 assert.equal(targetProgress(s,sales,'2026-11').rows[0].target,2000);
 assert.equal(targetProgress(s,sales,'2026-10').rows.length,1);
 assert.equal(targetProgress(s,admin,'2026-10').rows.length,2);
});
test('calendar-month achievements use UAE boundaries and cap remaining at zero',()=>{
 const s=state(),base=seedData().leads[0];setMonthlyTarget(s,admin,{month:'2026-10',staffId:'a',amount:1000});
 s.leads=[{...base,id:'yes',ownerId:'a',stage:'Enrolled',enrolledAt:'2026-09-30T20:00:00.000Z',value:1200},{...base,id:'no',ownerId:'a',stage:'Enrolled',enrolledAt:'2026-09-30T19:59:59.000Z',value:500},{...base,id:'other',ownerId:'b',stage:'Enrolled',enrolledAt:'2026-10-03T10:00:00.000Z',value:800},{...base,id:'undated',ownerId:'a',stage:'Enrolled',value:900}];
 const result=targetProgress(s,sales,'2026-10',new Date('2026-10-03T10:00:00Z'));
 assert.equal(result.daysRemaining,29);assert.equal(result.rows[0].achieved,1200);assert.equal(result.rows[0].percentage,120);assert.equal(result.rows[0].remaining,0);assert.equal(result.rows[0].undatedEnrolments,1);
 assert.equal(targetProgress(s,sales,'2024-02',new Date('2024-02-28T20:00:00Z')).daysRemaining,1);
 assert.equal(targetProgress(s,sales,'2026-09',new Date('2026-10-03T10:00:00Z')).daysRemaining,0);
});
test('enrolment date is server recorded, stable on normal edits and cannot be forged',()=>{
 const s=state(),lead={...seedData().leads[0],ownerId:'a',stage:'New' as const};s.leads=[lead];
 const saved=saveRecord(s,sales,'leads',{...lead,stage:'Enrolled',enrolledAt:'2000-01-01T00:00:00.000Z'}) as Lead;
 assert.ok(saved.enrolledAt);assert.notEqual(saved.enrolledAt,'2000-01-01T00:00:00.000Z');
 const edited=saveRecord(s,sales,'leads',{...saved,value:5000}) as Lead;assert.equal(edited.enrolledAt,saved.enrolledAt);
 const lost=saveRecord(s,sales,'leads',{...edited,stage:'Lost'}) as Lead;assert.equal(lost.enrolledAt,undefined);
});

test('manual milestone dates persist and actual enrolment month controls targets',()=>{
 const s=state(),lead={...seedData().leads[0],ownerId:'a',stage:'New' as const};s.leads=[lead];
 const saved=saveRecord(s,sales,'leads',{...lead,stage:'Enrolled',proposalSentDate:'2026-08-25',enrolmentDate:'2026-09-02',value:2500}) as Lead;
 assert.equal(saved.proposalSentDate,'2026-08-25');assert.equal(saved.enrolmentDate,'2026-09-02');
 assert.equal(targetProgress(s,sales,'2026-09').rows[0].achieved,2500);
 const next=saveRecord(s,sales,'leads',{...saved,proposalSentDate:undefined,enrolmentDate:undefined}) as Lead;
 assert.equal(next.enrolmentDate,'2026-09-02');assert.equal(next.proposalSentDate,'2026-08-25');
 assert.ok(s.audit?.some(a=>a.action==='lead.dates.updated'));
});
test('milestone validation and stage defaults preserve permission boundaries',()=>{
 const s=state(),lead={...seedData().leads[0],ownerId:'a',stage:'New' as const};s.leads=[lead];
 assert.throws(()=>saveRecord(s,sales,'leads',{...lead,proposalSentDate:'2026-02-30'}),/valid/);
 assert.throws(()=>saveRecord(s,{...sales,id:'b'},'leads',{...lead,enrolmentDate:'2026-10-01'}),/assigned/);
 const proposal=saveRecord(s,sales,'leads',{...lead,stage:'Proposal sent'}) as Lead;
 assert.match(proposal.proposalSentDate!,/^\d{4}-\d{2}-\d{2}$/);
 const enrolled=saveRecord(s,sales,'leads',{...proposal,stage:'Enrolled'}) as Lead;
 assert.match(enrolled.enrolmentDate!,/^\d{4}-\d{2}-\d{2}$/);assert.equal(enrolled.proposalSentDate,proposal.proposalSentDate);
});
