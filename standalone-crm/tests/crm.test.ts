import test from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {applyIncoming,signatureValid,secretValid,validateRecord,websiteIncoming,type State} from '../netlify/functions/_shared/crm-domain';
import {parseCSV,csvEscape,seedData} from '../app/crm/model';
const state=():State=>({leads:[],tasks:[],events:[]});
const incoming={eventId:'event-1',source:'Website' as const,name:'Test Learner',email:' TEST@example.com ',phone:'+971 50 000 0000',message:'CMA enquiry'};
test('webhook replay creates exactly one lead, note and task',()=>{const s=state();applyIncoming(s,incoming);assert.equal(applyIncoming(s,incoming).duplicate,true);assert.equal(s.leads.length,1);assert.equal(s.tasks.length,1);assert.equal(s.leads[0].notes.length,1);assert.equal(s.leads[0].email,'test@example.com');});
test('WhatsApp updates an existing website contact without resetting the sales stage',()=>{const s=state();applyIncoming(s,incoming);s.leads[0].stage='Negotiation';applyIncoming(s,{eventId:'wa-2',source:'WhatsApp',name:'Test',phone:'00971500000000',message:'Please send the proposal'});assert.equal(s.leads.length,1);assert.equal(s.tasks.length,1);assert.equal(s.leads[0].stage,'Negotiation');assert.equal(s.leads[0].notes.length,2);assert.equal(s.leads[0].source,'Website');});
test('rejects ambiguous matches without modifying the state',()=>{const s=state();applyIncoming(s,incoming);applyIncoming(s,{...incoming,eventId:'2',email:'other@example.com',phone:'+971511111111'});const before=JSON.stringify(s);assert.throws(()=>applyIncoming(s,{...incoming,eventId:'3',email:'other@example.com'}),/Conflicting/);assert.equal(JSON.stringify(s),before);});
test('accepts only signatures matching the exact payload',()=>{const secret='test-secret';const raw='{"message":"hello"}';const signature='sha256='+createHmac('sha256',secret).update(raw).digest('hex');assert.ok(signatureValid(raw,signature,secret));assert.equal(signatureValid(raw+' ',signature,secret),false);assert.equal(signatureValid(raw,'sha256=1234',secret),false);assert.equal(signatureValid(raw,null,secret),false);assert.equal(secretValid('test','test'),true);assert.equal(secretValid('bad','test'),false);assert.equal(secretValid('test',undefined),false);});
test('CSV handles BOM, commas, quotes, multiline cells and rejects broken fields',()=>{assert.deepEqual(parseCSV('\uFEFFname,email\r\n"Ahmed, Ali",a@example.com\r\n"A ""quoted""\nname",b@example.com'),[['name','email'],['Ahmed, Ali','a@example.com'],['A "quoted"\nname','b@example.com']]);assert.throws(()=>parseCSV('name\n"broken'));assert.equal(csvEscape('=1+1'),'"\'=1+1"');});
test('record validation rejects invalid amounts, email and stage',()=>{const l=seedData().leads[0];assert.equal(validateRecord('leads',l).id,l.id);assert.throws(()=>validateRecord('leads',{...l,value:-1}));assert.throws(()=>validateRecord('leads',{...l,value:Infinity}));assert.throws(()=>validateRecord('leads',{...l,email:'bad'}));assert.throws(()=>validateRecord('leads',{...l,stage:'Whatever'}));assert.throws(()=>validateRecord('tasks',{id:'1',title:'Call',due:'not a date',type:'Call'}));});
test('quotations survive validated saves and reject impossible discounts',()=>{const l=seedData().leads[0];const quote={id:'q-1',number:'ETI-001',description:'Training',quantity:3,unitPrice:1000,discount:100,tax:0,validUntil:'2026-10-20',status:'Draft',createdAt:new Date().toISOString()};const saved=validateRecord('leads',{...l,quotes:[quote]});assert.ok('quotes' in saved);assert.equal(saved.quotes?.[0].unitPrice,1000);assert.throws(()=>validateRecord('leads',{...l,quotes:[{...quote,discount:3001}]}));});

test('ETI website form mapping handles real capitalised fields and registration names',()=>{const corporate=websiteIncoming({payload:{id:'form-1',form_name:'eti-leads-courses',data:{Name:'Test Name',Email:'name@example.com',Phone:'+971500000000',Organisation:'Demo Co','Course or capability':'Power BI'}}});assert.equal(corporate?.name,'Test Name');assert.equal(corporate?.email,'name@example.com');assert.equal(corporate?.company,'Demo Co');assert.equal(corporate?.program,'Power BI');const registration=websiteIncoming({id:'form-2',form_name:'eti-leads-courses',data:{'Full name':'Test Student','Mobile / WhatsApp':'+971500000001',Programme:'CMA'}});assert.equal(registration?.name,'Test Student');assert.equal(registration?.phone,'+971500000001');assert.equal(registration?.program,'CMA');assert.throws(()=>websiteIncoming({id:'unknown',form_name:'unrelated',data:{}}),/Unsupported/);});

import {resolveActor,visibleData,enforceWrite,superAdminEmails,type Actor} from '../netlify/functions/_shared/crm-access';
import {configuredSuperAdmins} from '../app/crm/admin-config';
const staffActor:Actor={id:'staff-a',name:'Sales A',email:'a@example.com',role:'sales'};
function accessState():State{const s=state();s.team=[{...staffActor,status:'Active',createdAt:new Date().toISOString()},{id:'staff-b',name:'Sales B',email:'b@example.com',role:'sales',status:'Active',createdAt:new Date().toISOString()}];s.leads=seedData().leads.slice(0,3).map((l,i)=>({...l,ownerId:i===0?'staff-a':i===1?'staff-b':undefined}));s.tasks=[{id:'task-own',leadId:s.leads[0].id,ownerId:'staff-a',owner:'Sales A',title:'Own follow-up',due:'2026-10-02',type:'Call',done:false},{id:'task-leak',leadId:s.leads[1].id,ownerId:'staff-a',owner:'Sales A',title:'Other lead',due:'2026-10-02',type:'Call',done:false}];return s;}
test('only the configured verified email identities become super admins',()=>{const s=accessState();const emails=configuredSuperAdmins.map(a=>a.email);assert.ok(emails.includes('sales@entrepot.ae'));assert.ok(emails.includes('fly@entrepot.ae'));for(const email of emails){assert.equal(resolveActor({id:'admin-id',email,confirmedAt:'2026-10-01T00:00:00Z'},s,emails).role,'super_admin');assert.throws(()=>resolveActor({id:'admin-id',email,confirmedAt:undefined},s,emails));}assert.throws(()=>resolveActor({id:'admin-id',email:emails[0],confirmedAt:undefined},s,emails));assert.throws(()=>resolveActor({id:'other',email:'other@example.com',confirmedAt:'2026-10-01T00:00:00Z'},s,emails));assert.deepEqual(superAdminEmails('a@example.com,a@example.com'),[]);assert.deepEqual(superAdminEmails('a@example.com,b@example.com'),[]);assert.deepEqual(superAdminEmails(emails.join(',')),emails);assert.throws(()=>resolveActor({id:'old-reena',email:'reena@entrepot.ae',confirmedAt:'2026-10-01T00:00:00Z'},s,emails));});
test('staff receives only owned leads and activities, including protection from mismatched associations',()=>{const scoped=visibleData(accessState(),staffActor);assert.equal(scoped.leads.length,1);assert.equal(scoped.tasks.length,1);assert.equal(scoped.tasks[0].id,'task-own');});
test('super admin receives the complete workspace',()=>{const s=accessState();const all=visibleData(s,{...staffActor,role:'super_admin'});assert.equal(all.leads.length,3);assert.equal(all.tasks.length,2);});
test('sales cannot edit another salesperson record or unassigned record by guessing ID',()=>{const s=accessState();assert.throws(()=>enforceWrite(staffActor,{...s.leads[1],ownerId:'staff-a'},s.leads[1],s),/assigned/);assert.throws(()=>enforceWrite(staffActor,{...s.leads[2],ownerId:'staff-a'},s.leads[2],s),/assigned/);});
test('sales cannot reassign ownership or link an activity to a hidden lead',()=>{const s=accessState();assert.throws(()=>enforceWrite(staffActor,{...s.leads[0],ownerId:'staff-b'},s.leads[0],s),/reassign/);assert.throws(()=>enforceWrite(staffActor,{...s.tasks[1]},undefined,s),/access this lead/);});
test('sales-created leads stay unassigned until a super admin assigns them',()=>{const s=accessState(),lead={...s.leads[2],owner:'Sales A'};enforceWrite(staffActor,lead,undefined,s);assert.equal(lead.ownerId,undefined);assert.equal(lead.owner,'Unassigned');for(const ownerId of ['staff-a','staff-b'])assert.throws(()=>enforceWrite(staffActor,{...lead,ownerId},undefined,s),/Only super admins/);});
test('sales cannot remove lead ownership and normal edits preserve the assigned owner',()=>{const s=accessState();assert.throws(()=>enforceWrite(staffActor,{...s.leads[0],ownerId:undefined},s.leads[0],s),/Only super admins/);const lead={...s.leads[0],owner:'Sales B'};enforceWrite(staffActor,lead,s.leads[0],s);assert.equal(lead.owner,s.leads[0].owner);assert.equal(lead.ownerId,'staff-a');});
test('disabled staff is rejected on login and on a previously authorised write',()=>{const s=accessState();s.team![0].status='Disabled';assert.throws(()=>resolveActor({id:'staff-a',email:'a@example.com',confirmedAt:'2026-10-01T00:00:00Z'},s,[]),/active CRM access/);assert.throws(()=>enforceWrite(staffActor,{...s.leads[0]},s.leads[0],s),/disabled/);});
test('super admin can assign only active known accounts and tasks must match lead ownership',()=>{const s=accessState(),actor={...staffActor,role:'super_admin' as const};const lead={...s.leads[2],ownerId:'staff-b'};enforceWrite(actor,lead,s.leads[2],s);assert.equal(lead.owner,'Sales B');assert.throws(()=>enforceWrite(actor,{...lead,ownerId:'nonexistent'},s.leads[2],s),/active staff/);assert.throws(()=>enforceWrite(actor,{...s.tasks[0],ownerId:'staff-b'},s.tasks[0],s),/match/);});
test('temperature defaults safely for existing records, persists and rejects unknown values',()=>{const lead=seedData().leads[0];for(const temperature of ['Hot','Warm','Cold'])assert.equal((validateRecord('leads',{...lead,temperature}) as typeof lead).temperature,temperature);assert.equal((validateRecord('leads',{...lead,temperature:undefined}) as typeof lead).temperature,'Warm');assert.throws(()=>validateRecord('leads',{...lead,temperature:'Burning'}),/temperature/);});
test('form history retains custom answers, arrays, booleans and repeat submissions without duplication',()=>{const s=state();const data={email:'test@example.com',name:'Test',interests:['CMA','Power BI'],consent:true,delegates:5,custom_question:'x'.repeat(6000)};const event=websiteIncoming({id:'form-1',form_name:'eti-leads-courses',data})!;applyIncoming(s,event);s.leads[0].followUpAt='2026-10-15T10:00:00.000Z';applyIncoming(s,{...event,eventId:'website:form-2',fields:{...event.fields,custom_question:'Second response'}});applyIncoming(s,event);assert.equal(s.leads[0].submissions?.length,2);const original=s.leads[0].submissions![1].fields;assert.equal(original.interests,JSON.stringify(data.interests));assert.equal(original.consent,'true');assert.equal(original.delegates,'5');assert.equal(original.custom_question.length,6000);assert.equal(s.leads[0].followUpAt,'2026-10-15T10:00:00.000Z');});
test('follow-up accepts an absolute timestamp and can be cleared; rejects invalid input',()=>{const lead=seedData().leads[0];assert.equal((validateRecord('leads',{...lead,followUpAt:'2026-10-15T10:00:00.000Z'}) as typeof lead).followUpAt,'2026-10-15T10:00:00.000Z');assert.equal((validateRecord('leads',{...lead,followUpAt:''}) as typeof lead).followUpAt,'');assert.throws(()=>validateRecord('leads',{...lead,followUpAt:'bad-date'}),/follow-up/);assert.throws(()=>validateRecord('leads',{...lead,followUpAt:'2026-10-15T10:00'}),/follow-up/);});

import {followUpReminders} from '../app/crm/reminders';
test('follow-up reminders use calendar days, scope to assigned staff and change identity on the due day',()=>{const base=seedData().leads[0];const now=new Date(2026,9,5,23,30);const lead={...base,ownerId:'staff-a',followUpAt:new Date(2026,9,6,8).toISOString()};const tomorrow=followUpReminders([lead],now,'staff-a');assert.equal(tomorrow[0].label,'Tomorrow');const today=followUpReminders([lead],new Date(2026,9,6,0,1),'staff-a');assert.equal(today[0].label,'Today');assert.notEqual(today[0].id,tomorrow[0].id);assert.equal(followUpReminders([lead],now,'staff-b').length,0);assert.equal(followUpReminders([lead],new Date(2026,9,4),'staff-a').length,0);assert.equal(followUpReminders([lead],new Date(2026,9,7),'staff-a')[0].label,'Overdue');assert.equal(followUpReminders([{...lead,followUpAt:''}],now).length,0);assert.equal(followUpReminders([{...lead,stage:'Enrolled'}],now).length,0);});

import {planDeliveries} from '../netlify/functions/_shared/crm-reminder-delivery';
test('external reminders target assigned active salesperson, CC admins and separate WhatsApp copies',()=>{const s=accessState();s.leads=[{...s.leads[0],followUpAt:'2026-10-06T10:00:00.000Z'}];const admins=['admin@example.com'];const phones={'a@example.com':'+971500000001','admin@example.com':'+971500000002'};const jobs=planDeliveries(s,new Date('2026-10-05T05:00:00Z'),admins,phones);assert.equal(jobs[0].to,staffActor.email);assert.deepEqual(jobs[0].cc,admins);assert.equal(jobs.filter(j=>j.channel==='whatsapp').length,2);assert.equal(new Set(jobs.map(j=>j.id)).size,jobs.length);assert.equal(planDeliveries(s,new Date('2026-10-05T04:59:00Z'),admins,phones).length,0);assert.notEqual(planDeliveries(s,new Date('2026-10-06T05:00:00Z'),admins,phones)[0].id,jobs[0].id);s.team![0].status='Disabled';assert.equal(planDeliveries(s,new Date('2026-10-05T05:00:00Z'),admins,phones).length,0);});

import {reminderWhatsAppNumbers,reminderAdminEmails} from '../netlify/functions/_shared/crm-reminder-contacts';
test('ETI reminder contacts route to each salesperson and the three requested admin copies',()=>{const admins=reminderAdminEmails;assert.deepEqual(admins,['sgulati@entrepot.ae','smurthy@entrepot.ae','rdsouza@entrepot.ae']);for(const email of ['adanish@entrepot.ae','cnair@entrepot.ae']){const s=accessState();s.team![0].email=email;s.leads=[{...s.leads[0],followUpAt:'2026-10-06T10:00:00.000Z'}];const jobs=planDeliveries(s,new Date('2026-10-05T05:00:00Z'),admins,reminderWhatsAppNumbers);assert.equal(jobs[0].to,email);assert.deepEqual(jobs[0].cc,admins);assert.deepEqual(jobs.filter(j=>j.channel==='whatsapp').map(j=>j.to).sort(),[email,...admins].map(e=>reminderWhatsAppNumbers[e]).filter(Boolean).sort());assert.equal(jobs.length,5);}});

import {filterReportLeads,reportMetrics} from '../app/crm/reporting';
test('reports distinguish cohort conversion, closed win rate and pipeline and honour combined filters',()=>{const sample=seedData().leads[0];const leads=[{...sample,id:'r1',stage:'Enrolled' as const,value:100},{...sample,id:'r2',stage:'Lost' as const,value:200},{...sample,id:'r3',stage:'New' as const,value:300,owner:'Unassigned',ownerId:undefined,followUpAt:'2026-01-01T00:00:00.000Z'}];const metrics=reportMetrics(leads,[{id:'a',leadId:'r1',title:'Call',due:'2026-01-01',done:true,owner:'Staff',type:'Call'},{id:'b',leadId:'other',title:'Hidden',due:'2026-01-01',done:false,owner:'Other',type:'Call'}],new Date('2026-10-01'));assert.equal(metrics.pipeline,300);assert.equal(metrics.enrolled,100);assert.ok(Math.abs(metrics.conversion-100/3)<0.000001);assert.equal(metrics.winRate,50);assert.equal(metrics.overdue,1);assert.equal(metrics.activities,1);assert.equal(metrics.completed,1);assert.equal(metrics.unassigned,1);assert.equal(filterReportLeads(leads,{from:'',to:'',owner:'Unassigned',source:sample.source,program:sample.program,temperature:sample.temperature||'Warm'}).length,1);assert.equal(filterReportLeads(leads,{from:'2099-01-01',to:'',owner:'',source:'',program:'',temperature:''}).length,0);assert.equal(reportMetrics([],[],new Date()).conversion,0);});

import {registerInvitedStaff} from '../netlify/functions/_shared/crm-invited-staff';
test('requested staff can bootstrap only a verified invitation and never reactivate or rebind an account',()=>{const s=state();const user={id:'ali-live',email:'adanish@entrepot.ae',confirmedAt:'2026-10-01',invitedAt:'2026-10-01'};assert.equal(registerInvitedStaff({...user,invitedAt:undefined},s),false);assert.equal(registerInvitedStaff({...user,confirmedAt:undefined},s),false);assert.equal(registerInvitedStaff({...user,email:'other@example.com'},s),false);assert.equal(registerInvitedStaff(user,s),true);assert.equal(s.team![0].role,'sales');s.team![0].status='Disabled';assert.equal(registerInvitedStaff(user,s),false);assert.equal(s.team![0].status,'Disabled');assert.equal(registerInvitedStaff({...user,id:'another-id'},s),false);});

import {saveRecord,saveTarget} from '../netlify/functions/_shared/crm-save';
import {importOwner} from '../app/crm/import-owner';
import {reconcileDirectory} from '../netlify/functions/_shared/crm-directory';
const adminActor:Actor={id:'root',name:'Sajeev',email:'sgulati@entrepot.ae',role:'super_admin'};
test('complete record lifecycle persists assignments, notes, follow-up, quotation and activities',()=>{
 const s=accessState();s.leads=[];s.tasks=[];
 let lead=saveRecord(s,adminActor,'leads',{...seedData().leads[0],id:'workflow-lead',ownerId:staffActor.id,notes:[]}) as typeof s.leads[number];
 assert.equal(visibleData(s,staffActor).leads.length,1);
 lead=saveRecord(s,staffActor,'leads',{...lead,stage:'Qualified',temperature:'Hot',followUpAt:'2026-10-20T08:00:00.000Z',notes:[{id:'remark',text:'Confirmed interest',author:'spoofed',at:new Date().toISOString()}],quotes:[{id:'q1',number:'ETI-1',description:'CMA',quantity:2,unitPrice:500,discount:0,tax:0,status:'Draft',validUntil:'2026-10-30',createdAt:new Date().toISOString()}]}) as typeof lead;
 assert.equal(lead.notes[0].author,staffActor.email);assert.equal(lead.quotes?.[0].unitPrice,500);assert.equal(lead.temperature,'Hot');
 let task=saveRecord(s,staffActor,'tasks',{id:'call',title:'Call learner',leadId:lead.id,ownerId:staffActor.id,type:'Call',due:'2026-10-20'}) as typeof s.tasks[number];
 task=saveRecord(s,staffActor,'tasks',{...task,done:true}) as typeof task;assert.equal(task.done,true);
 const oldTaskVersion=task.version;
 lead=saveRecord(s,adminActor,'leads',{...lead,ownerId:'staff-b'}) as typeof lead;
 assert.equal(s.tasks[0].ownerId,'staff-b');assert.notEqual(s.tasks[0].version,oldTaskVersion);
 assert.equal(visibleData(s,staffActor).leads.length,0);assert.equal(visibleData(s,staffActor).tasks.length,0);
 assert.throws(()=>saveRecord(s,staffActor,'leads',lead),/assigned/);
 assert.throws(()=>saveRecord(s,adminActor,'tasks',task),/owner must match/);
});
test('stale writes and duplicates do not overwrite records; original notes and forms are retained',()=>{
 const s=state();applyIncoming(s,{...incoming,fields:{custom:'kept'}});const original=structuredClone(s.leads[0]);
 const saved=saveRecord(s,adminActor,'leads',{...original,name:'Updated',notes:original.notes.map(n=>({...n,text:'tampered'}))}) as typeof original;
 assert.equal(saved.notes[0].text,original.notes[0].text);assert.equal(saved.submissions?.[0].fields.custom,'kept');
 assert.throws(()=>saveRecord(s,adminActor,'leads',original),/Someone updated/);
 assert.equal(s.leads[0].name,'Updated');
 assert.throws(()=>saveRecord(s,adminActor,'leads',{...saved,id:'duplicate'}),/already exists/);
});
test('CSV maps active staff names or email to immutable IDs and cannot assign as salesperson',()=>{
 const s=accessState();assert.equal(importOwner('Sales A',s.team!,true,true).ownerId,'staff-a');
 assert.equal(importOwner('a@example.com',s.team!,true,true).ownerId,'staff-a');
 assert.equal(importOwner('Sales A',s.team!,true,false).ownerId,'');
 assert.throws(()=>importOwner('Missing',s.team!,true,true),/must match/);
 s.team![0].status='Disabled';assert.throws(()=>importOwner('Sales A',s.team!,true,true),/must match/);
});
test('workspace settings are shared, validated and restricted to admins',()=>{
 const s=state();saveTarget(s,adminActor,250000);assert.equal(s.settings?.enrolmentTarget,250000);
 assert.throws(()=>saveTarget(s,staffActor,1),/Only super admins/);assert.throws(()=>saveTarget(s,adminActor,-1),/target/);
});
test('directory includes approved pending invitees, excludes unrelated accounts, preserves disabled access',()=>{
 const s=state();const users=[{id:'ali-invite',email:'adanish@entrepot.ae',invitedAt:'2026-10-01'},{id:'unknown',email:'unknown@example.com',confirmedAt:'2026-10-01'}];
 assert.equal(reconcileDirectory(s,users as never),1);assert.equal(s.team![0].name,'Ali');s.team![0].status='Disabled';
 assert.equal(reconcileDirectory(s,users as never),0);assert.equal(s.team![0].status,'Disabled');
 assert.equal(reconcileDirectory(s,[{...users[0],id:'rebound'}] as never),0);
});

import {requestUser} from '../netlify/functions/_shared/crm-session';
test('request session validates browser cookie with Identity without ambient runtime context',async()=>{
 let calls=0;
 const fetcher=(async(url:URL|RequestInfo,init?:RequestInit)=>{calls++;assert.equal(String(url),'https://crm.etiworld.ae/.netlify/identity/user');assert.equal((init?.headers as Record<string,string>).Authorization,'Bearer test-session');return Response.json({id:'verified-sajeev',email:'sgulati@entrepot.ae',confirmed_at:'2026-10-01',invited_at:'2026-10-01',user_metadata:{full_name:'Sajeev'}});}) as typeof fetch;
 const user=await requestUser(new Request('https://crm.etiworld.ae/.netlify/functions/crm',{headers:{cookie:'other=1; nf_jwt=test-session'}}),'https://crm.etiworld.ae',fetcher);
 assert.equal(user?.confirmedAt,'2026-10-01');assert.equal(resolveActor(user,state(),configuredSuperAdmins.map(a=>a.email)).role,'super_admin');assert.equal(calls,1);
 assert.equal(await requestUser(new Request('https://crm.etiworld.ae'),'https://crm.etiworld.ae',fetcher),null);assert.equal(calls,1);
});
test('invalid and expired sessions fail closed; Identity downtime is not misreported as wrong password',async()=>{
 const req=new Request('https://crm.etiworld.ae',{headers:{cookie:'nf_jwt=invalid'}});
 assert.equal(await requestUser(req,'https://crm.etiworld.ae',(async()=>new Response('',{status:401})) as typeof fetch),null);
 await assert.rejects(()=>requestUser(req,'https://crm.etiworld.ae',(async()=>new Response('',{status:503})) as typeof fetch),/temporarily unavailable/);
});

import {applyCommand} from '../netlify/functions/_shared/crm-actions';
import {queryWorkspace,integrationHealth} from '../netlify/functions/_shared/crm-queries';
import {createHandler} from '../netlify/functions/crm.mts';
const requestId=()=>crypto.randomUUID();
test('atomic import rolls back all earlier rows if a later row is invalid',()=>{
 const s=accessState(),before=JSON.stringify(s),base=seedData().leads[0];
 assert.throws(()=>applyCommand(s,adminActor,{action:'import',requestId:requestId(),records:[{...base,email:'unique@example.com'},{...base,email:'bad-email'}]}),/email/);
 assert.equal(JSON.stringify(s),before);
});
test('import retry is idempotent and an operation ID cannot be reused for different data',()=>{
 const s=state(),body={action:'import',requestId:requestId(),records:[seedData().leads[0]]};
 const first=applyCommand(s,adminActor,body);assert.deepEqual(applyCommand(s,adminActor,body),first);assert.equal(s.leads.length,1);
 assert.throws(()=>applyCommand(s,adminActor,{...body,records:[]}),/different data/);
});
test('bulk assignment validates every version before making changes and updates related activities',()=>{
 const s=accessState(),lead=s.leads[0];const before=JSON.stringify(s);
 assert.throws(()=>applyCommand(s,adminActor,{action:'assign',requestId:requestId(),ownerId:'staff-b',records:[{id:lead.id,version:lead.version},{id:'missing'}]}),/not found/);assert.equal(JSON.stringify(s),before);
 applyCommand(s,adminActor,{action:'assign',requestId:requestId(),ownerId:'staff-b',records:[{id:lead.id,version:lead.version}]});assert.equal(s.leads[0].ownerId,'staff-b');
 assert.throws(()=>applyCommand(s,staffActor,{action:'assign',requestId:requestId(),records:[]}),/super admins/);
});
test('archive and restore retain notes, quotes and tasks, block stale edits, and enforce admin access',()=>{
 const s=accessState(),lead=structuredClone(s.leads[0]);s.tasks=[{id:'related',leadId:lead.id,title:'Call',due:'2026-10-05',type:'Call',owner:staffActor.name,ownerId:staffActor.id,done:false}];
 assert.throws(()=>applyCommand(s,staffActor,{action:'archive',requestId:requestId(),id:lead.id}),/super admins/);
 applyCommand(s,adminActor,{action:'archive',requestId:requestId(),id:lead.id,version:lead.version});assert.equal(s.tasks.length,0);assert.equal(s.archive?.[0].tasks.length,1);
 assert.throws(()=>saveRecord(s,adminActor,'leads',lead),/archived/);
 applyCommand(s,adminActor,{action:'restore',requestId:requestId(),id:lead.id});assert.equal(s.archive?.length,0);assert.equal(s.tasks.length,1);assert.deepEqual(s.leads[0].notes,lead.notes);assert.notEqual(s.leads[0].version,lead.version);
});
test('restoring a lead refuses duplicate contact details',()=>{
 const s=accessState(),lead=s.leads[0];applyCommand(s,adminActor,{action:'archive',requestId:requestId(),id:lead.id,version:lead.version});
 s.leads.push({...lead,id:'new-contact'});assert.throws(()=>applyCommand(s,adminActor,{action:'restore',requestId:requestId(),id:lead.id}),/already has/);
});
test('salesperson imports cannot self-assign and notification reads stay per-account',()=>{
 const s=accessState();applyCommand(s,staffActor,{action:'import',requestId:requestId(),records:[{...seedData().leads[0],email:'sales-import@example.com',ownerId:staffActor.id}]});assert.equal(s.leads[0].ownerId||'','');
 applyCommand(s,staffActor,{action:'notification.read',requestId:requestId(),ids:['reminder-one']});assert.deepEqual(queryWorkspace(s,staffActor,new URLSearchParams('view=notifications')),{readIds:['reminder-one']});assert.deepEqual(queryWorkspace(s,adminActor,new URLSearchParams('view=notifications')),{readIds:[]});
});
test('server queries scope reports, contacts, tasks and exports to the signed-in salesperson',()=>{
 const s=accessState();const rows=queryWorkspace(s,staffActor,new URLSearchParams('view=leads')) as {items:typeof s.leads};assert.ok(rows.items.every(l=>l.ownerId===staffActor.id));
 const report=queryWorkspace(s,staffActor,new URLSearchParams('view=reports')) as {metrics:{total:number}};assert.equal(report.metrics.total,rows.items.length);
 const csv=queryWorkspace(s,staffActor,new URLSearchParams('view=export')) as string;for(const hidden of s.leads.filter(l=>l.ownerId!==staffActor.id))assert.ok(!csv.includes(hidden.email));
 for(const view of ['audit','archive','backup'])assert.throws(()=>queryWorkspace(s,staffActor,new URLSearchParams({view})),/super admins/);
 assert.throws(()=>queryWorkspace(s,adminActor,new URLSearchParams('view=leads&limit=9999')),/maximum/);
});
test('health reports readiness without revealing provider secrets',()=>{
 const h=integrationHealth(state(),()=> 'secret-value');assert.ok(!JSON.stringify(h).includes('secret-value'));assert.equal(h.inbound.meta.configured,true);assert.equal(h.reminders.enabled,false);
});
test('HTTP API validates origin, JSON, roles, route methods and persists changes across requests',async()=>{
 let db=accessState();const handler=createHandler({access:async()=>({actor:adminActor,state:structuredClone(db)}),mutate:async fn=>{const copy=structuredClone(db),result=fn(copy);db=copy;return result;},env:()=>undefined});
 const url='https://crm.etiworld.ae/.netlify/functions/crm';
 assert.equal((await handler(new Request(url,{method:'POST',body:'{}'}))).status,403);
 assert.equal((await handler(new Request(url,{method:'DELETE'}))).status,405);
 const headers={'Origin':'https://crm.etiworld.ae','Content-Type':'application/json'};
 assert.equal((await handler(new Request(url,{method:'POST',headers,body:'null'}))).status,400);
 const saved=await handler(new Request(url,{method:'PATCH',headers,body:JSON.stringify({enrolmentTarget:125000})}));assert.equal(saved.status,200);
 const loaded=await (await handler(new Request(url))).json();assert.equal(loaded.settings.enrolmentTarget,125000);
 const history=await (await handler(new Request(url+'?view=audit'))).json();assert.equal(history.items[0].action,'settings.updated');
 const sales=createHandler({access:async()=>({actor:staffActor,state:db}),mutate:async fn=>fn(db),env:()=>undefined});
 assert.equal((await sales(new Request(url+'?view=backup'))).status,403);
 assert.equal((await sales(new Request(url,{method:'PATCH',headers,body:JSON.stringify({enrolmentTarget:1})}))).status,403);
});

test('assignment transfers visibility, activities and audit; sales cannot assign or unassign',()=>{
 const s=accessState(),id=s.leads[0].id;
 s.tasks=[{id:'assignment-task',leadId:id,title:'Follow up',due:'2026-10-05',type:'Call',owner:staffActor.name,ownerId:staffActor.id,done:false}];
 const assign=(actor:typeof adminActor,ownerId:string)=>applyCommand(s,actor,{action:'assign',requestId:requestId(),ownerId,records:[{id,version:s.leads.find(l=>l.id===id)?.version}]});
 for(const ownerId of ['staff-a','staff-b','']){const before=JSON.stringify(s);assert.throws(()=>assign(staffActor,ownerId),/super admins/);assert.equal(JSON.stringify(s),before);}
 assign(adminActor,'staff-b');
 assert.equal(visibleData(s,staffActor).leads.some(l=>l.id===id),false);
 assert.equal(s.tasks[0].ownerId,'staff-b');
 assert.ok(s.audit?.some(a=>a.action==='lead.assigned'&&a.recordId===id&&a.summary.includes('Sales B')));
 assign(adminActor,'');assert.equal(s.leads.find(l=>l.id===id)?.owner,'Unassigned');assert.ok(!s.tasks[0].ownerId);
 s.team!.find(m=>m.id==='staff-b')!.status='Disabled';
 assert.throws(()=>assign(adminActor,'staff-b'),/active staff/);
});

test('delete is admin-only, recoverable, audited and removes lead activities from active data',()=>{
 const s=accessState(),lead=structuredClone(s.leads[0]);
 s.tasks=[{id:'delete-task',leadId:lead.id,title:'Call',due:'2026-10-05',type:'Call',owner:staffActor.name,ownerId:staffActor.id,done:false}];
 const body={action:'delete',requestId:requestId(),id:lead.id,version:lead.version};
 const before=JSON.stringify(s);assert.throws(()=>applyCommand(s,staffActor,body),/super admins/);assert.equal(JSON.stringify(s),before);
 applyCommand(s,adminActor,body);assert.ok(!s.leads.some(l=>l.id===lead.id));assert.equal(s.tasks.length,0);
 assert.ok(s.audit?.some(e=>e.action==='lead.deleted'&&e.recordId===lead.id));assert.deepEqual(s.archive?.[0].lead.notes,lead.notes);
 applyCommand(s,adminActor,body);assert.equal(s.archive?.length,1);
 applyCommand(s,adminActor,{action:'restore',requestId:requestId(),id:lead.id});assert.ok(s.leads.some(l=>l.id===lead.id));assert.equal(s.tasks.length,1);
});

test('corporate lifecycle retains training details and enforces ownership for lists and reports',()=>{
 const s=accessState();
 const base={...seedData().leads[0],id:'corporate-test',email:'corporate@example.com',phone:'',corporateCategory:'Leadership & Management',company:'Corporate Test Ltd',leadType:'corporate' as const,designation:'HR Manager',industry:'Logistics',participants:25,deliveryMode:'On-site' as const,trainingRequirements:'Team leadership workshop',ownerId:'staff-a'};
 let lead=saveRecord(s,adminActor,'leads',base);
 assert.equal((lead as typeof base).participants,25);assert.equal((lead as typeof base).corporateCategory,'Leadership & Management');
 assert.equal((queryWorkspace(s,staffActor,new URLSearchParams({view:'leads',leadType:'corporate'})) as any).total,1);
 assert.equal((queryWorkspace(s,{...staffActor,id:'staff-b'},new URLSearchParams({view:'leads',leadType:'corporate'})) as any).total,0);
 assert.match(String(queryWorkspace(s,adminActor,new URLSearchParams({view:'export',leadType:'corporate'}))),/Team leadership workshop/);
 applyCommand(s,adminActor,{action:'assign',requestId:requestId(),ownerId:'staff-b',records:[{id:lead.id,version:lead.version}]});
 assert.equal(s.leads.find(l=>l.id===lead.id)?.participants,25);
 assert.equal((queryWorkspace(s,staffActor,new URLSearchParams({view:'leads',leadType:'corporate'})) as any).total,0);
 lead=s.leads.find(l=>l.id===lead.id)!;
 applyCommand(s,adminActor,{action:'delete',requestId:requestId(),id:lead.id,version:lead.version});
 applyCommand(s,adminActor,{action:'restore',requestId:requestId(),id:lead.id});
 assert.equal(s.leads.find(l=>l.id===lead.id)?.trainingRequirements,base.trainingRequirements);
});
test('corporate validation rejects missing company, invalid participant count, mode and category',()=>{
 const lead={...seedData().leads[0],leadType:'corporate',company:'Example'};
 for(const patch of [{corporateCategory:'Invented category'},{company:''},{participants:0},{participants:1.5},{participants:100001},{deliveryMode:'Unknown'},{leadType:'other'}])assert.throws(()=>validateRecord('leads',{...lead,...patch}));
 assert.equal((validateRecord('leads',seedData().leads[0]) as any).leadType,'individual');
});

import {formSubmitIncoming,importFormSubmitRow} from '../netlify/functions/_shared/crm-formsubmit';
const providerRow={form_url:'https://www.etiworld.ae/corporate-training',form_data:{Name:'Corporate Contact',Email:'corporate-incoming@example.com',Organisation:'Example Ltd','Training category':'Human Resources',Programme:'Certified Human Resource Professional (CHRP)','Custom question':'Complete answer'},submitted_at:{date:'2026-10-02 10:00:00.000000',timezone:'UTC'}};
test('FormSubmit imports accepted enquiries once, retains all fields and classifies corporate training',()=>{
 const s=state(),since='2026-10-02T09:00:00.000Z';importFormSubmitRow(s,providerRow,since);importFormSubmitRow(s,providerRow,since);
 assert.equal(s.leads.length,1);assert.equal(s.tasks.length,1);assert.equal(s.leads[0].corporateCategory,'Human Resources');assert.equal(s.leads[0].leadType,'corporate');assert.equal(s.leads[0].submissions?.[0].fields['Custom question'],'Complete answer');assert.equal(s.leads[0].owner,'Unassigned');
 const shuffled={...providerRow,form_data:Object.fromEntries(Object.entries(providerRow.form_data).reverse())};assert.equal(formSubmitIncoming(shuffled,since)?.eventId,formSubmitIncoming(providerRow,since)?.eventId);
});
test('FormSubmit skips unrelated sites, pre-activation submissions, feedback and honeypot spam',()=>{
 const since='2026-10-02T09:00:00.000Z';
 for(const patch of [{form_url:'https://example.com/contact'},{form_url:'https://etiworld.ae.evil.com/contact'},{form_url:'https://etiworld.ae/feedback'},{form_data:{...providerRow.form_data,_honey:'spam'}}])assert.equal(formSubmitIncoming({...providerRow,...patch},since),null);
 assert.equal(formSubmitIncoming(providerRow,'2026-10-03T00:00:00.000Z'),null);
 assert.throws(()=>formSubmitIncoming({...providerRow,submitted_at:{date:'invalid',timezone:'UTC'}},since));
});
test('FormSubmit retries do not resurrect deleted leads or alter assigned ownership',()=>{
 const s=accessState(),since='2026-10-02T09:00:00.000Z';importFormSubmitRow(s,providerRow,since);const lead=s.leads.find(l=>l.email==='corporate-incoming@example.com')!;
 applyCommand(s,adminActor,{action:'assign',requestId:requestId(),ownerId:'staff-a',records:[{id:lead.id,version:lead.version}]});
 const later={...providerRow,submitted_at:{date:'2026-10-02 11:00:00.000000',timezone:'UTC'}};importFormSubmitRow(s,later,since);const updated=s.leads.find(l=>l.id===lead.id)!;assert.equal(updated.ownerId,'staff-a');assert.equal(updated.notes.length,2);
 applyCommand(s,adminActor,{action:'delete',requestId:requestId(),id:updated.id,version:updated.version});importFormSubmitRow(s,later,since);assert.ok(!s.leads.some(l=>l.id===lead.id));
});

import {publicWebsiteIncoming} from '../netlify/functions/_shared/crm-public-website';
test('public FormSubmit webhook captures corporate fields, deduplicates and cannot assign or alter stages',()=>{
 const s=state(),body={form_data:{Name:'Webhook test',Email:'webhook@example.com',Organisation:'Test Ltd','Training category':'Human Resources','CRM Submission ID':crypto.randomUUID(),'CRM Page URL':'https://etiworld.ae/corporate-training',ownerId:'staff-a',stage:'Enrolled'}};
 const incoming=publicWebsiteIncoming(body)!;applyIncoming(s,incoming);applyIncoming(s,incoming);
 assert.equal(s.leads.length,1);assert.equal(s.leads[0].stage,'New');assert.ok(!s.leads[0].ownerId);assert.equal(s.leads[0].corporateCategory,'Human Resources');
 assert.throws(()=>publicWebsiteIncoming({form_data:{...body.form_data,'CRM Page URL':'https://evil.example'}}));
 assert.throws(()=>publicWebsiteIncoming({form_data:{...body.form_data,'CRM Submission ID':''}}));
 assert.equal(publicWebsiteIncoming({form_data:{...body.form_data,_honey:'bot'}}),null);
});

test('temperature quick updates allow admin and assigned sales only, preserving ownership',()=>{
 const s=accessState(),own=s.leads[0],other=s.leads[1],unassigned=s.leads[2];
 const saved=saveRecord(s,staffActor,'leads',{...own,temperature:'Hot'}) as typeof own;
 assert.equal(saved.temperature,'Hot');assert.equal(saved.ownerId,staffActor.id);
 assert.throws(()=>saveRecord(s,staffActor,'leads',{...other,temperature:'Cold'}),/assigned records/);
 assert.throws(()=>saveRecord(s,staffActor,'leads',{...unassigned,temperature:'Cold'}),/assigned records/);
 assert.equal((saveRecord(s,adminActor,'leads',{...other,temperature:'Cold'}) as typeof own).temperature,'Cold');
});

test('bulk delete is admin only, atomic on stale versions, retry safe and preserves archived histories',()=>{
 const s=accessState();const chosen=s.leads.slice(0,2);const records=chosen.map(l=>({id:l.id,version:l.version}));const requestId=crypto.randomUUID();
 const before=structuredClone(s);
 assert.throws(()=>applyCommand(s,staffActor,{action:'delete.bulk',records,requestId}),/Only super admins/);assert.deepEqual(s,before);
 assert.throws(()=>applyCommand(s,adminActor,{action:'delete.bulk',records:[records[0],{...records[1],version:'stale'}],requestId}),/changed/);assert.deepEqual(s,before);
 assert.throws(()=>applyCommand(s,adminActor,{action:'delete.bulk',records:[records[0],records[0]],requestId}),/duplicate/);assert.deepEqual(s,before);
 const result=applyCommand(s,adminActor,{action:'delete.bulk',records,requestId});assert.deepEqual(result,{deleted:2});
 assert.equal(s.leads.length,1);assert.equal(s.leads[0].id,before.leads[2].id);assert.equal(s.tasks.length,0);assert.equal(s.archive?.length,2);
 assert.deepEqual(s.archive?.[0].lead.notes,chosen[0].notes);assert.equal(s.archive?.[0].tasks.length,1);
 assert.deepEqual(applyCommand(s,adminActor,{action:'delete.bulk',records,requestId}),result);assert.equal(s.archive?.length,2);
 applyCommand(s,adminActor,{action:'restore',id:chosen[0].id,requestId:crypto.randomUUID()});assert.ok(s.leads.some(l=>l.id===chosen[0].id));assert.equal(s.tasks.length,1);
});

test('approved Reena email change reconciles the same Identity ID without losing ownership',()=>{
 const s=state();s.team=[{id:'reena-id',name:'Reena',email:'reena@entrepot.ae',role:'super_admin',status:'Active'}];s.leads=[{...seedData().leads[0],ownerId:'reena-id',owner:'Reena'}];
 const users=[{id:'reena-id',email:'rdsouza@entrepot.ae',confirmedAt:'2026-10-02T00:00:00Z'}] as Parameters<typeof reconcileDirectory>[1];
 assert.equal(reconcileDirectory(s,users),1);assert.equal(s.team[0].email,'rdsouza@entrepot.ae');assert.equal(s.leads[0].ownerId,'reena-id');assert.equal(reconcileDirectory(s,users),0);
 assert.equal(resolveActor(users[0],s,configuredSuperAdmins.map(m=>m.email)).role,'super_admin');
 assert.throws(()=>resolveActor({...users[0],email:'reena@entrepot.ae'},s,configuredSuperAdmins.map(m=>m.email)),/active CRM access/);
});
