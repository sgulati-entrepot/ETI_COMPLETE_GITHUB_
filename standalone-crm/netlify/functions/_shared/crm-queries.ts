import {CRMError,type State} from './crm-domain';
import {visibleData,type Actor} from './crm-access';
import {reportMetrics} from '../../../app/crm/reporting';
import {csvEscape} from '../../../app/crm/model';
function admin(a:Actor){if(a.role!=='super_admin')throw new CRMError('Only super admins can access this information.',403);}
function paged<T>(rows:T[],p:URLSearchParams){const page=Number(p.get('page')||1),limit=Number(p.get('limit')||50);if(!Number.isInteger(page)||page<1||!Number.isInteger(limit)||limit<1||limit>200)throw new CRMError('Invalid page or limit (maximum 200).');return {items:rows.slice((page-1)*limit,page*limit),total:rows.length,page,limit,pages:Math.ceil(rows.length/limit)};}
export function queryWorkspace(state:State,actor:Actor,params:URLSearchParams){
 const data=visibleData(state,actor),view=params.get('view');
 if(view==='archive'){admin(actor);return paged((state.archive||[]).map(x=>({id:x.lead.id,name:x.lead.name,email:x.lead.email,owner:x.lead.owner,at:x.at,by:x.by})),params);}
 if(view==='audit'){admin(actor);const id=params.get('recordId'),q=(params.get('q')||'').toLowerCase();return paged((state.audit||[]).filter(e=>(!id||e.recordId===id)&&(!q||`${e.actor} ${e.action} ${e.summary}`.toLowerCase().includes(q))),params);}
 if(view==='backup'){admin(actor);return {schemaVersion:2,exportedAt:new Date().toISOString(),data:{leads:state.leads,tasks:state.tasks},team:state.team||[],settings:state.settings||{enrolmentTarget:100000},archive:state.archive||[],audit:state.audit||[]};}
 if(view==='notifications')return {readIds:state.notificationReads?.[actor.id]||[]};
 if(view==='tasks')return paged(data.tasks.filter(t=>!params.get('leadId')||t.leadId===params.get('leadId')).sort((a,b)=>a.due.localeCompare(b.due)),params);
 if(view==='contacts')return paged(data.leads.map(l=>({id:l.id,name:l.name,email:l.email,phone:l.phone,company:l.company,owner:l.owner,ownerId:l.ownerId})),params);
 if(view==='accounts'){const companies=Array.from(new Set(data.leads.map(l=>l.company).filter(Boolean)));return paged(companies.map(company=>{const leads=data.leads.filter(l=>l.company===company);return {company,contacts:leads.length,value:leads.reduce((n,l)=>n+l.value,0),leadIds:leads.map(l=>l.id)};}),params);}
 if(view==='quotations')return paged(data.leads.flatMap(l=>(l.quotes||[]).map(q=>({...q,leadId:l.id,client:l.name,total:Math.max(0,q.quantity*q.unitPrice-q.discount)*(1+q.tax/100)}))),params);
 const from=params.get('from'),to=params.get('to');for(const date of [from,to])if(date&&!/^\d{4}-\d{2}-\d{2}$/.test(date))throw new CRMError('Use YYYY-MM-DD for report dates.');if(from&&to&&from>to)throw new CRMError('Start date must be before end date.');
 const q=(params.get('q')||'').toLowerCase();
 const leads=data.leads.filter(l=>{const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dubai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(l.createdAt));return (!params.get('leadType')||(l.leadType||'individual')===params.get('leadType'))&&(!q||`${l.name} ${l.email} ${l.phone} ${l.company} ${l.program}`.toLowerCase().includes(q))&&(!from||date>=from)&&(!to||date<=to)&&['source','stage','temperature','program','corporateCategory'].every(k=>!params.get(k)||l[k as 'source'|'stage'|'temperature'|'program'|'corporateCategory']===params.get(k))&&(!params.has('ownerId')||(l.ownerId||'')===params.get('ownerId'));});
 if(view==='leads')return paged([...leads].sort((a,b)=>b.createdAt.localeCompare(a.createdAt)||a.id.localeCompare(b.id)),params);
 if(view==='export')return [['id','name','email','phone','company','program','source','stage','owner','value','temperature','followUpAt','leadType','designation','industry','participants','deliveryMode','trainingRequirements','corporateCategory','paymentMethod','paymentDate','paymentPlan','emiDates','amountPaid','nextPaymentDate'].map(csvEscape).join(','),...leads.map(l=>[l.id,l.name,l.email,l.phone,l.company,l.program,l.source,l.stage,l.owner,l.value,l.temperature,l.followUpAt,l.leadType||'individual',l.designation,l.industry,l.participants,l.deliveryMode,l.trainingRequirements,l.corporateCategory,l.paymentMethod,l.paymentDate,l.paymentPlan,(l.emiDates||[]).join(';'),l.amountPaid,l.nextPaymentDate].map(csvEscape).join(','))].join('\r\n');
 if(view==='reports'){
  const group=(key:'ownerId'|'source'|'program'|'stage'|'temperature')=>Array.from(new Set(leads.map(l=>l[key]||'Unassigned'))).map(value=>{const rows=leads.filter(l=>(l[key]||'Unassigned')===value);return {key:value,label:key==='ownerId'?rows[0].owner:value,...reportMetrics(rows,data.tasks,new Date())};});
  return {generatedAt:new Date().toISOString(),dateTimezone:'Asia/Dubai',metrics:reportMetrics(leads,data.tasks,new Date()),salespeople:group('ownerId'),sources:group('source'),programmes:group('program'),pipeline:group('stage'),temperatures:group('temperature')};
 }
 throw new CRMError('Unknown view.');
}
export function integrationHealth(state:State,get:(name:string)=>string|undefined){
 const needs=(keys:string[])=>({configured:keys.every(k=>!!get(k)),missing:keys.filter(k=>!get(k))});
 return {
  inbound:{meta:needs(['CRM_META_APP_SECRET','CRM_META_VERIFY_TOKEN','CRM_META_PAGE_TOKEN','CRM_META_PAGE_ID','CRM_META_GRAPH_VERSION']),whatsapp:needs(['CRM_META_APP_SECRET','CRM_META_VERIFY_TOKEN','CRM_WHATSAPP_PHONE_ID']),website:['webhook','direct'].includes(get('CRM_WEBSITE_MODE')||'')?{configured:true,missing:[]}:get('CRM_FORMSUBMIT_API_KEY')?needs(['CRM_FORMSUBMIT_API_KEY']):needs(['CRM_WEBSITE_WEBHOOK_TOKEN'])},
  reminders:{enabled:get('CRM_REMINDERS_ENABLED')==='true',email:needs(['CRM_RESEND_API_KEY','CRM_REMINDER_FROM']),whatsapp:needs(['CRM_WHATSAPP_ACCESS_TOKEN','CRM_WHATSAPP_PHONE_ID','CRM_META_GRAPH_VERSION','CRM_REMINDER_TEMPLATE','CRM_REMINDER_TEMPLATE_LANGUAGE'])},
  recentDeliveries:(state.deliveries||[]).slice(-50).map(d=>({id:d.id,channel:d.channel,status:d.status})),
  storage:{bytes:Buffer.byteLength(JSON.stringify(state),'utf8'),capacity:8000000},
  receivedEvents:state.events.length,
  websiteSync:{...state.websiteSync,mode:['webhook','direct'].includes(get('CRM_WEBSITE_MODE')||'')?get('CRM_WEBSITE_MODE'):'poll',configured:['webhook','direct'].includes(get('CRM_WEBSITE_MODE')||'')||!!get('CRM_FORMSUBMIT_API_KEY'),status:['webhook','direct'].includes(get('CRM_WEBSITE_MODE')||'')&&!state.websiteSync?.status?.startsWith('Website enquiries')?'Website connection ready — awaiting first delivery':state.websiteSync?.status},
 };
}
