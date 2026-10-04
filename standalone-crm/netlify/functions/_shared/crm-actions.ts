import {setMonthlyTarget} from './crm-targets';
import {recoverWebsiteEnquiries} from './crm-website-recovery';
import {createHash} from 'node:crypto';
import {CRMError,text,normEmail,normPhone,type State} from './crm-domain';
import {visibleData,type Actor} from './crm-access';
import {saveRecord} from './crm-save';
import {audit} from './crm-audit';
import type {Lead} from '../../../app/crm/model';
const requireAdmin=(a:Actor)=>{if(a.role!=='super_admin')throw new CRMError('Only super admins can perform this action.',403);};
function writableLead(s:State,a:Actor,id:unknown,version:unknown){const l=visibleData(s,a).leads.find(l=>l.id===id);if(!l)throw new CRMError('Lead not found.',404);if((l.version||'')!==(version||''))throw new CRMError('This lead changed. Refresh and retry.',409);return l;}
function command(s:State,a:Actor,b:Record<string,unknown>):unknown{
 if(a.role==='sales'&&!s.team?.some(m=>m.id===a.id&&m.status==='Active'&&m.role==='sales'))throw new CRMError('Sales access has been disabled.',403);
 switch(b.action){
  case 'target.set':return setMonthlyTarget(s,a,b);
  case 'website.recover':{requireAdmin(a);const result=recoverWebsiteEnquiries(s);audit(s,a,'website.recovered','workspace',`${result.recovered} merged website enquiries recovered`);return result;}
  case 'delete.bulk':{
   requireAdmin(a);
   if(!Array.isArray(b.records)||!b.records.length||b.records.length>10000)throw new CRMError('Choose 1–10,000 leads.');
   const records=b.records as {id:string;version:string}[];
   if(records.some(r=>!r||typeof r.id!=='string')||new Set(records.map(r=>r.id)).size!==records.length)throw new CRMError('Invalid or duplicate lead selection.');
   const leads=records.map(r=>writableLead(s,a,r.id,r.version));
   const ids=new Set(leads.map(l=>l.id)),at=new Date().toISOString();
   s.archive=[...leads.map(lead=>({lead,tasks:s.tasks.filter(t=>t.leadId===lead.id),at,by:a.email})),...(s.archive||[])];
   s.leads=s.leads.filter(l=>!ids.has(l.id));s.tasks=s.tasks.filter(t=>!ids.has(t.leadId));
   for(const lead of leads)audit(s,a,'lead.deleted',lead.id,'Bulk deletion: lead and related activities moved to Deleted leads (recoverable)');
   return {deleted:leads.length};
  }
  case 'delete':
  case 'archive':{
   requireAdmin(a);const lead=writableLead(s,a,b.id,b.version),tasks=s.tasks.filter(t=>t.leadId===lead.id);
   s.archive=[{lead,tasks,at:new Date().toISOString(),by:a.email},...(s.archive||[])];s.leads=s.leads.filter(l=>l.id!==lead.id);s.tasks=s.tasks.filter(t=>t.leadId!==lead.id);
   audit(s,a,b.action==='delete'?'lead.deleted':'lead.archived',lead.id,b.action==='delete'?'Lead and related activities moved to Deleted leads (recoverable)':'Lead and related activities archived');return {id:lead.id};
  }
  case 'restore':{
   requireAdmin(a);const item=s.archive?.find(item=>item.lead.id===b.id);if(!item)throw new CRMError('Archived lead not found.',404);
   const websiteEnquiry=item.lead.submissions?.some(x=>x.eventId.startsWith('website-formsubmit:'));
   if(s.leads.some(l=>l.id===item.lead.id||(!websiteEnquiry&&((item.lead.email&&normEmail(l.email)===normEmail(item.lead.email))||(item.lead.phone&&normPhone(l.phone)===normPhone(item.lead.phone))))))throw new CRMError('An active lead already has this email or phone. Resolve the duplicate before restoring.',409);
   let ownerId=item.lead.ownerId,owner=item.lead.owner;if(ownerId&&!s.team?.some(m=>m.id===ownerId&&m.status==='Active')){ownerId='';owner='Unassigned';}
   const lead={...item.lead,ownerId,owner,version:crypto.randomUUID(),updatedAt:new Date().toISOString()};s.leads=[lead,...s.leads];s.tasks=[...item.tasks.map(t=>({...t,ownerId,owner,version:crypto.randomUUID()})),...s.tasks];s.archive=s.archive!.filter(x=>x!==item);
   audit(s,a,'lead.restored',lead.id,'Lead and related activities restored');return lead;
  }
  case 'assign':{
   requireAdmin(a);if(!Array.isArray(b.records)||!b.records.length||b.records.length>500)throw new CRMError('Choose 1–500 leads.');
   const records=b.records as {id:string;version:string}[];if(new Set(records.map(r=>r.id)).size!==records.length)throw new CRMError('Duplicate lead selection.');
   // Verify all versions before changing anything; caller commits one transaction.
   const leads=records.map(r=>writableLead(s,a,r.id,r.version));return leads.map(l=>saveRecord(s,a,'leads',{...l,ownerId:text(b.ownerId)}));
  }
  case 'import':{
   if(!Array.isArray(b.records)||!b.records.length||b.records.length>500)throw new CRMError('Import 1–500 leads per batch.');
   let skipped=0;const ids:string[]=[];
   for(const raw of b.records){
    if(!raw||typeof raw!=='object')throw new CRMError('Invalid import record.');
    const r=raw as Lead;const email=normEmail(text(r.email)),phone=normPhone(text(r.phone));
    if(s.leads.some(l=>(email&&normEmail(l.email)===email)||(phone&&normPhone(l.phone)===phone))){skipped++;continue;}
    const result=saveRecord(s,a,'leads',{...r,id:crypto.randomUUID(),version:'',submissions:[],...(a.role==='sales'?{ownerId:'',owner:'Unassigned'}:{})});ids.push(result.id);
   }
   audit(s,a,'leads.imported','batch',`${ids.length} imported; ${skipped} duplicates skipped`);return {imported:ids.length,skipped,ids};
  }
  case 'note':{
   const l=writableLead(s,a,b.id,b.version),remark=text(b.text,5000);if(!remark)throw new CRMError('Enter a note.');
   return saveRecord(s,a,'leads',{...l,notes:[{id:crypto.randomUUID(),text:remark,at:new Date().toISOString(),author:a.email},...l.notes]});
  }
  case 'followup':{const l=writableLead(s,a,b.id,b.version);return saveRecord(s,a,'leads',{...l,followUpAt:b.followUpAt});}
  case 'quotation':{
   const l=writableLead(s,a,b.id,b.version);if(!b.quote||typeof b.quote!=='object')throw new CRMError('Quotation is required.');
   const q=b.quote as NonNullable<Lead['quotes']>[number];return saveRecord(s,a,'leads',{...l,quotes:[q,...(l.quotes||[]).filter(x=>x.id!==q.id)]});
  }
  case 'notification.read':{
   if(!Array.isArray(b.ids)||b.ids.length>1000||b.ids.some(id=>typeof id!=='string'||id.length>300))throw new CRMError('Invalid reminder list.');
   s.notificationReads={...s.notificationReads,[a.id]:Array.from(new Set([...(s.notificationReads?.[a.id]||[]),...b.ids as string[]])).slice(-1000)};return {ids:s.notificationReads[a.id]};
  }
  default:throw new CRMError('Unknown action.');
 }
}
// A failed batch never partially updates the state, even outside the storage adapter.
// The client retains requestId when retrying an uncertain request.
export function applyCommand(state:State,actor:Actor,body:Record<string,unknown>){
 const requestId=text(body.requestId,100);if(!/^[a-zA-Z0-9-]{8,100}$/.test(requestId))throw new CRMError('A valid requestId is required.');
 const fingerprint=createHash('sha256').update(JSON.stringify({...body,requestId:undefined})).digest('hex');
 const previous=state.requests?.find(r=>r.id===requestId&&r.actorId===actor.id);
 if(previous){if(previous.fingerprint!==fingerprint)throw new CRMError('This requestId was already used with different data.',409);return previous.result;}
 const draft=structuredClone(state),result=command(draft,actor,body);
 const cutoff=Date.now()-7*86400000;
 draft.requests=[...(draft.requests||[]).filter(r=>Date.parse(r.at)>cutoff),{id:requestId,actorId:actor.id,fingerprint,result,at:new Date().toISOString()}];
 if(draft.requests.length>10000)throw new CRMError('Weekly operation limit reached. Contact your administrator.',429);
 Object.assign(state,draft);return result;
}
