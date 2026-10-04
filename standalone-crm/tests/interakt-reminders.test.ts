import test from 'node:test';
import assert from 'node:assert/strict';
import {blankLead} from '../app/crm/model';
import type {State} from '../netlify/functions/_shared/crm-domain';
import {planDeliveries} from '../netlify/functions/_shared/crm-reminder-delivery';
import {reminderAdminEmails,reminderWhatsAppNumbers} from '../netlify/functions/_shared/crm-reminder-contacts';
import {interaktReminderPayload,sendInteraktReminder} from '../netlify/functions/_shared/crm-interakt-reminders';

test('staff and all three super admins get tomorrow and due-day WhatsApp reminders with four template values',()=>{
 const lead={...blankLead(),id:'lead-1',name:'Example Learner',ownerId:'ali',followUpAt:'2026-10-05T06:00:00.000Z'};
 const state:State={leads:[lead],tasks:[],events:[],team:[{id:'ali',name:'Ali',email:'adanish@entrepot.ae',role:'sales',status:'Active'}] as State['team']};
 const tomorrow=planDeliveries(state,new Date('2026-10-04T06:00:00.000Z'),reminderAdminEmails,reminderWhatsAppNumbers);
 const due=planDeliveries(state,new Date('2026-10-05T06:00:00.000Z'),reminderAdminEmails,reminderWhatsAppNumbers);
 for(const jobs of [tomorrow,due]){
  const whatsapp=jobs.filter(j=>j.channel==='whatsapp');
  assert.deepEqual(whatsapp.map(j=>j.to).sort(),['+971504075609','+971543757558','+971544177480','+971545353558'].sort());
  assert.equal(jobs.filter(j=>j.channel==='email').length,1);
  assert.equal(whatsapp[0].parameters.length,4);
  assert.deepEqual(interaktReminderPayload(whatsapp[0],'eti_staff_followup_reminder').template.bodyValues,whatsapp[0].parameters);
 }
 assert.notEqual(tomorrow[0].id,due[0].id);
});

test('Interakt acceptance requires a message ID; failed or uncertain sends are recorded without blind retry',async()=>{
 const job={id:'reminder-id',to:'+971544177480',parameters:['Tomorrow','Example Learner','Ali','5 Oct 2026, 10:00 AM UAE time']} as Parameters<typeof interaktReminderPayload>[0];
 let payload:unknown;
 const send=(async (_url:string,options:RequestInit)=>{payload=JSON.parse(String(options.body));return Response.json({result:true,id:'msg-1'});}) as typeof fetch;
 assert.deepEqual(await sendInteraktReminder(job,'key','eti_staff_followup_reminder','en',send),{status:'accepted',messageId:'msg-1',httpStatus:200});
 assert.deepEqual(payload,{countryCode:'+971',phoneNumber:'544177480',callbackData:'reminder-id',type:'Template',template:{name:'eti_staff_followup_reminder',languageCode:'en',bodyValues:job.parameters}});
 assert.equal((await sendInteraktReminder(job,'key','template','en',async()=>Response.json({result:false}))).status,'unknown');
 assert.equal((await sendInteraktReminder(job,'key','template','en',async()=>Response.json({}, {status:400}))).status,'failed');
 assert.equal((await sendInteraktReminder(job,'key','template','en',async()=>{throw Error('timeout');})).status,'unknown');
});
