import {uaeDate} from '../../../app/crm/lead-received';
import {audit} from './crm-audit';
import type {Lead,Task} from '../../../app/crm/model';
import {CRMError,validateRecord,normEmail,normPhone,type State} from './crm-domain';
import {enforceWrite,type Actor} from './crm-access';
// Used by the API and regression tests; the storage layer commits this atomically.
export function saveRecord(state:State,actor:Actor,kind:unknown,input:unknown){
 const record=validateRecord(kind,input);
 const key=kind as 'leads'|'tasks';
 const previous=state[key].find(r=>r.id===record.id);
 if(key==='leads'&&state.archive?.some(a=>a.lead.id===record.id))throw new CRMError('This lead is archived. Restore it before editing.',409);
 if(key==='tasks'&&state.archive?.some(a=>a.tasks.some(t=>t.id===record.id)))throw new CRMError('This activity belongs to an archived lead.',409);
 enforceWrite(actor,record,previous,state);
 if(previous&&(previous.version||'')!==(record.version||''))throw new CRMError('Someone updated this record. Refresh before saving.',409);
 if(key==='leads'){
  const lead=record as Lead,old=previous as Lead|undefined;
  const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dubai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  lead.leadReceivedDate=lead.leadReceivedDate||old?.leadReceivedDate||uaeDate(old?.createdAt||new Date());
  lead.proposalSentDate=lead.proposalSentDate??old?.proposalSentDate??'';
  lead.enrolmentDate=lead.enrolmentDate??old?.enrolmentDate??(old?.enrolledAt?new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dubai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(old.enrolledAt)):'');
  if(lead.stage==='Proposal sent'&&old?.stage!=='Proposal sent'&&!lead.proposalSentDate)lead.proposalSentDate=today;
  if(lead.stage==='Enrolled'&&old?.stage!=='Enrolled'&&!lead.enrolmentDate)lead.enrolmentDate=today;
  if(lead.proposalSentDate!==(old?.proposalSentDate||'')||lead.enrolmentDate!==(old?.enrolmentDate||''))audit(state,actor,'lead.dates.updated',lead.id,`Proposal sent: ${lead.proposalSentDate||'not recorded'}; enrolment: ${lead.enrolmentDate||'not recorded'}`);
  lead.submissions=old?.submissions||[];
  lead.paymentMethod=lead.paymentMethod??old?.paymentMethod??'';lead.paymentDate=lead.paymentDate??old?.paymentDate??'';
  lead.nextPaymentDate=lead.nextPaymentDate??old?.nextPaymentDate??'';
  if(lead.nextPaymentDate!==(old?.nextPaymentDate||''))audit(state,actor,'payment.next-date.updated',lead.id,`Next payment: ${lead.nextPaymentDate||'cleared'}`);
  lead.amountPaid=lead.amountPaid===undefined?old?.amountPaid:lead.amountPaid;
  lead.paymentPlan=lead.paymentPlan??old?.paymentPlan??'';lead.emiDates=lead.emiDates??old?.emiDates??[];
  if(lead.paymentPlan==='EMI'&&!lead.emiDates.length)throw new CRMError('Add at least one EMI due date.');
  if(lead.paymentPlan!=='EMI'&&lead.emiDates.length)throw new CRMError('Choose EMI to save instalment dates.');
  lead.emiDates=[...lead.emiDates].sort();
  if(lead.paymentPlan!==old?.paymentPlan||JSON.stringify(lead.emiDates)!==JSON.stringify(old?.emiDates||[])){if(lead.paymentPlan||old?.paymentPlan)audit(state,actor,'payment.schedule.updated',lead.id,`${lead.paymentPlan||'Not specified'}: ${lead.emiDates.join(', ')}`);}
  if(Boolean(lead.paymentMethod)!==Boolean(lead.paymentDate))throw new CRMError('Enter both payment method and payment date, or clear both.');
  if(lead.paymentMethod!==old?.paymentMethod||lead.paymentDate!==old?.paymentDate){if(lead.paymentMethod||old?.paymentMethod)audit(state,actor,'payment.updated',lead.id,`Payment details: ${lead.paymentMethod||'cleared'} ${lead.paymentDate}`);}
  if(lead.paymentPlan==='Part'&&!(Number(lead.amountPaid)>0))throw new CRMError('Enter the amount received for this part payment.');
  if(Number(lead.amountPaid)>0&&(!lead.paymentMethod||!lead.paymentDate))throw new CRMError('Record the payment method and received date with the amount paid.');
  if(lead.amountPaid!==old?.amountPaid)audit(state,actor,'payment.amount.updated',lead.id,`Total received: ${lead.amountPaid===null||lead.amountPaid===undefined?'Not recorded':`AED ${lead.amountPaid}`}`);
  lead.enrolledAt=lead.stage==='Enrolled'?(old?.stage==='Enrolled'?old.enrolledAt:new Date().toISOString()):undefined;
  const history=[...(old?.followUps||[])];
  if(old?.followUpAt&&!history.some(f=>f.due===old.followUpAt))history.unshift({id:crypto.randomUUID(),due:old.followUpAt,remark:'Previously scheduled follow-up',at:old.updatedAt,author:'CRM'});
  const additionsToHistory=(lead.followUps||[]).filter(f=>!history.some(h=>h.id===f.id));
  if(new Set(additionsToHistory.map(f=>f.id)).size!==additionsToHistory.length)throw new CRMError('Duplicate follow-up ID.');
  if(lead.followUpAt&&lead.followUpAt!==old?.followUpAt&&!additionsToHistory.some(f=>f.due===lead.followUpAt))additionsToHistory.unshift({id:crypto.randomUUID(),due:lead.followUpAt,remark:'Follow-up scheduled',at:'',author:''});
  lead.followUps=[...additionsToHistory.map(f=>({...f,at:new Date().toISOString(),author:actor.email})),...history];
  if(lead.followUps.length>1000)throw new CRMError('Follow-up history limit reached.',409);

  if((!old||normEmail(old.email)!==normEmail(lead.email)||normPhone(old.phone)!==normPhone(lead.phone))&&state.leads.some(l=>l.id!==lead.id&&((lead.email&&normEmail(l.email)===normEmail(lead.email))||(lead.phone&&normPhone(l.phone)===normPhone(lead.phone)))))throw new CRMError('A lead with this email or phone already exists.',409);
  lead.createdAt=old?.createdAt||new Date().toISOString();
  // Timeline history cannot be rewritten by posting a modified note ID.
  const oldNotes=new Map(old?.notes.map(n=>[n.id,n])||[]);
  const additions=lead.notes.filter(n=>!oldNotes.has(n.id));
  if(new Set(additions.map(n=>n.id)).size!==additions.length)throw new CRMError('Duplicate note ID.');
  lead.notes=[...additions.map(n=>({...n,author:actor.email,at:new Date().toISOString()})),...(old?.notes||[])];
  if(lead.notes.length>1000)throw new CRMError('Lead timeline limit reached.',409);
 }
 if(key==='leads'&&previous&&previous.ownerId!==record.ownerId){state.tasks=state.tasks.map(t=>t.leadId===record.id?{...t,owner:record.owner,ownerId:record.ownerId,version:crypto.randomUUID()}:t);}
 if(key==='leads'&&previous&&previous.ownerId!==record.ownerId)audit(state,actor,'lead.assigned',record.id,`${(record as Lead).name}: ${previous.owner||'Unassigned'} → ${record.owner||'Unassigned'}`);
 const next={...record,version:crypto.randomUUID()};
 if(key==='leads')state.leads=[next as Lead,...state.leads.filter(l=>l.id!==record.id)];
 else state.tasks=[next as Task,...state.tasks.filter(t=>t.id!==record.id)];
 audit(state,actor,previous?'record.updated':'record.created',record.id,`${key==='leads'?'Lead':'Activity'} ${previous?'updated':'created'}${previous&&previous.ownerId!==record.ownerId?' · ownership changed':''}`);
 return next;
}
export function saveTarget(state:State,actor:Actor,target:unknown){
 if(actor.role!=='super_admin')throw new CRMError('Only super admins can change workspace settings.',403);
 if(typeof target!=='number'||!Number.isFinite(target)||target<=0||target>1000000000)throw new CRMError('Enter a target between 1 and 1,000,000,000 AED.');
 state.settings={enrolmentTarget:target};audit(state,actor,'settings.updated','workspace','Enrolment target updated');return state.settings;
}
