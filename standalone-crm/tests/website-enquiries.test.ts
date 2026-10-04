import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildLeadPayload} from '../../app/lib/submitLead';
import {publicWebsiteIncoming} from '../netlify/functions/_shared/crm-public-website';
import {applyIncoming,type State} from '../netlify/functions/_shared/crm-domain';
import {applyCommand} from '../netlify/functions/_shared/crm-actions';
import {saveRecord} from '../netlify/functions/_shared/crm-save';
const admin={id:'admin',email:'admin@example.com',role:'super_admin' as const};
function enquiry(path:string,fields:Record<string,string>,id=crypto.randomUUID()){
 const form=new FormData();Object.entries(fields).forEach(([k,v])=>form.set(k,v));
 const payload=buildLeadPayload(form);payload.set('CRM Submission ID',id);payload.set('CRM Page URL',`https://etiworld.ae${path}`);
 return publicWebsiteIncoming({form_data:Object.fromEntries(payload)})!;
}
const forms=[
 ['home','/','app/HomeClient.tsx',{name:'Audit',email:'audit@example.com',Phone:'+971500000001',organisation:'Audit company',interest:'CMA','Lead source':'Main website homepage'}],
 ['contact','/contact','app/contact/ContactLeadForm.tsx',{Name:'Audit',Email:'audit@example.com',Phone:'+971500000001',Programme:'CMA'}],
 ['registration','/student-registration','app/student-registration/StudentRegistrationForm.tsx',{'Full name':'Audit',Email:'audit@example.com','Mobile / WhatsApp':'+971500000001',Programme:'CMA',Nationality:'Test',Country:'UAE','Learning objective':'Training'}],
 ['programme enquiry','/programs/certified-management-accountant','app/components.tsx',{Name:'Audit',Email:'audit@example.com',Phone:'+971500000001',Programme:'CMA'}],
 ['brochure','/programs/certified-management-accountant','app/components.tsx',{Name:'Audit',Email:'audit@example.com',Phone:'+971500000001',Programme:'CMA','Programme interest':'Power BI',Company:'Audit company'}],
 ['corporate','/corporate-training','app/corporate-training/CorporateLeadForm.tsx',{Name:'Audit',Email:'audit@example.com',Phone:'+971500000001',Organisation:'Audit company','Training category':'AI - Artificial Intelligence','Course or capability':'CMA','Group size':'11-25 participants'}],
 ['paid compact','/customised-corporate-training','app/customised-corporate-training/PaidCorporateLanding.tsx',{Name:'Audit',Email:'audit@example.com',Phone:'+971500000001',Organisation:'Audit company','Training category':'AI - Artificial Intelligence','Course or capability':'CMA'}],
 ['paid full','/customised-corporate-training','app/customised-corporate-training/PaidCorporateLanding.tsx',{Name:'Audit',Email:'audit@example.com',Phone:'+971500000001',Organisation:'Audit company','Course or capability':'CMA',Requirements:'Training for team'}],
 ['compliance compact','/customised-corporate-trainings-programmes','app/customised-corporate-trainings-programmes/ComplianceCorporateLanding.tsx',{Name:'Audit',Email:'audit@example.com',Phone:'+971500000001',Organisation:'Audit company',Course:'CMA'}],
 ['compliance full','/customised-corporate-trainings-programmes','app/customised-corporate-trainings-programmes/ComplianceCorporateLanding.tsx',{Name:'Audit',Email:'audit@example.com',Phone:'+971500000001',Organisation:'Audit company',Course:'CMA',Requirements:'AML training'}],
] as const;
test('all ten sales form variants create distinct enquiries for the SAME contact; transport retries do not duplicate',()=>{
 const s:State={leads:[],tasks:[],events:[]};
 for(const [label,path,source,fields] of forms){
  assert.match(readFileSync(new URL(`../../${source}`,import.meta.url),'utf8'),/await submitLead\(data/);
  const input=enquiry(path,fields);const result=applyIncoming(s,input);assert.equal(applyIncoming(s,input).duplicate,true,label);
  const lead=s.leads.find(l=>l.id===result.id)!;assert.equal(lead.name,'Audit');assert.equal(lead.email,'audit@example.com');assert.equal(lead.owner,'Unassigned');assert.equal(lead.leadType,path.includes('corporate')?'corporate':'individual');
  assert.ok(lead.submissions?.[0].fields['CRM Page URL']);
  if('Requirements' in fields)assert.equal(lead.submissions![0].fields.Requirements,fields.Requirements);
 }
 assert.equal(s.leads.length,10);assert.equal(s.tasks.length,10);
 const lead=s.leads[0];saveRecord(s,admin,'leads',{...lead,stage:'Contacted'});assert.equal(s.leads[0].stage,'Contacted');
 const current=s.leads[0];applyCommand(s,admin,{action:'delete',id:current.id,version:current.version,requestId:crypto.randomUUID()});
 applyCommand(s,admin,{action:'restore',id:current.id,requestId:crypto.randomUUID()});assert.equal(s.leads.length,10);
});
test('legacy merged enquiries recover independently, preserve original records and cannot be recovered by sales',()=>{
 const s:State={leads:[],tasks:[],events:[],team:[{id:'sales',name:'Sales',email:'sales@example.com',role:'sales',status:'Active'}]};
 const first=enquiry('/contact',{Name:'Original',Email:'same@example.com',Phone:'+971500000001'});applyIncoming(s,first);
 const corporate=enquiry('/corporate-training',{Name:'Corporate',Email:'same@example.com',Phone:'+971500000001',Organisation:'Company','Training category':'AI - Artificial Intelligence'});
 const original=s.leads[0];original.stage='Negotiation';original.submissions!.unshift({eventId:corporate.eventId,source:'Website',receivedAt:'2026-10-01T10:00:00.000Z',fields:corporate.fields!});s.events.push(corporate.eventId);
 assert.throws(()=>applyCommand(s,{id:'sales',email:'sales@example.com',role:'sales'},{action:'website.recover',requestId:crypto.randomUUID()}),/Only super admins/);
 assert.deepEqual(applyCommand(s,admin,{action:'website.recover',requestId:crypto.randomUUID()}),{recovered:1});
 assert.deepEqual(applyCommand(s,admin,{action:'website.recover',requestId:crypto.randomUUID()}),{recovered:0});
 assert.equal(s.leads.length,2);assert.equal(s.leads[0].leadType,'corporate');assert.equal(s.leads[0].createdAt,'2026-10-01T10:00:00.000Z');assert.equal(s.leads.find(l=>l.id===original.id)!.stage,'Negotiation');
});
