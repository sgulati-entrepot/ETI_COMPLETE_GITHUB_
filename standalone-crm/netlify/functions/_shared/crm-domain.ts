import {uaeDate} from '../../../app/crm/lead-received';
import {paymentMethods,validPaymentDate,type PaymentMethod} from '../../../app/crm/payments';
import {validCloseDate} from '../../../app/crm/close-date';
import {audit} from './crm-audit';
import {createHash,createHmac,timingSafeEqual} from 'node:crypto';
import {corporateCategories,stages,sources,type Lead,type Task,type Data,type Quote,type TeamMember} from '../../../app/crm/model';
export type State = Data & {interaktAlerts?:import('./crm-interakt-alerts').InteraktAlert[];newLeadAlerts?:import('./crm-new-lead-alerts').NewLeadAlert[];unassignedAlerts?:import('./crm-unassigned-alerts').UnassignedAlert[];monthlyTargets?:Record<string,{amount:number;version:string;updatedAt:string;updatedBy:string}>;websiteSync?:{since:string;lastAttempt?:string;lastSuccess?:string;received?:number;errors?:number;status?:string};events:string[];schemaVersion?:number;audit?:import('./crm-audit').AuditEntry[];archive?:{lead:Lead;tasks:Task[];at:string;by:string}[];notificationReads?:Record<string,string[]>;requests?:{id:string;actorId:string;fingerprint:string;result:unknown;at:string}[];settings?:{enrolmentTarget:number};deliveries?:import('./crm-reminder-delivery').Delivery[];team?:TeamMember[]};
export class CRMError extends Error{constructor(message:string,public status=400){super(message);}}
export function text(v:unknown,max=200):string{return typeof v==='string'?v.trim().slice(0,max):'';}
export const normEmail=(v:string)=>v.trim().toLowerCase();
export const normPhone=(v:string)=>{const digits=v.replace(/\D/g,'');return digits.startsWith('00')?digits.slice(2):digits;};
export function signatureValid(raw:string,signature:string|null,secret:string){if(!secret||!signature||!/^sha256=[a-f0-9]{64}$/.test(signature))return false;const actual=Buffer.from(signature.slice(7),'hex');const expected=createHmac('sha256',secret).update(raw).digest();return actual.length===expected.length&&timingSafeEqual(actual,expected);}
export function secretValid(given:string|null,expected:string|undefined){if(!given||!expected)return false;const a=createHash('sha256').update(given).digest(),b=createHash('sha256').update(expected).digest();return timingSafeEqual(a,b);}
export function captureFields(raw:Record<string,unknown>):Record<string,string>{
 const entries=Object.entries(raw).filter(([k])=>!['bot-field','form-name','_captcha','g-recaptcha-response','h-captcha-response'].includes(k));
 if(entries.length>200)throw new CRMError('Too many form fields.',413);
 return Object.fromEntries(entries.map(([k,v])=>{const value=typeof v==='string'?v:JSON.stringify(v)??'';if(k.length>300||value.length>20000)throw new CRMError('Form field is too large.',413);return [k,value];}));
}
export function validateRecord(kind:unknown,value:unknown):Lead|Task{
 if(!value||typeof value!=='object')throw new CRMError('Invalid record.');const r=value as Record<string,unknown>;
 if(!/^[a-zA-Z0-9-]{1,80}$/.test(text(r.id)))throw new CRMError('Invalid record ID.');
 if(kind==='tasks'){if(!text(r.title)||!/^\d{4}-\d{2}-\d{2}$/.test(text(r.due))||!Number.isFinite(Date.parse(text(r.due)))||!['Call','Email','Meeting','Follow-up'].includes(text(r.type)))throw new CRMError('Activity title, type and valid due date are required.');return {id:text(r.id),title:text(r.title),leadId:text(r.leadId),due:text(r.due),owner:text(r.owner)||'Unassigned',ownerId:text(r.ownerId),type:r.type as Task['type'],done:r.done===true,version:text(r.version)};}
 if(kind==='leads')for(const field of ['proposalSentDate','enrolmentDate','leadReceivedDate'])if(r[field]!==undefined&&r[field]!==''&&(typeof r[field]!=='string'||!validPaymentDate(r[field] as string)))throw new CRMError('Enter a valid '+field+' date.');
 if(kind!=='leads')throw new CRMError('Invalid record type.');const email=normEmail(text(r.email)),phone=text(r.phone);
 if(!text(r.name)||(!email&&!phone))throw new CRMError('Name and email or phone are required.');
 if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new CRMError('Invalid email address.');
 if(phone&&!/^\+?[\d\s()-]{6,30}$/.test(phone))throw new CRMError('Invalid phone number.');
 if(!stages.includes(r.stage as Lead['stage'])||!sources.includes(r.source as Lead['source']))throw new CRMError('Invalid stage or source.');
 if(typeof r.value!=='number'||!Number.isFinite(r.value)||r.value<0||r.value>100000000)throw new CRMError('Invalid deal value.');
 if(!['High','Medium','Low'].includes(text(r.priority)))throw new CRMError('Invalid priority.');
 if(r.amountPaid!==undefined&&r.amountPaid!==null&&(typeof r.amountPaid!=='number'||!Number.isFinite(r.amountPaid)||r.amountPaid<0||r.amountPaid>100000000||Math.abs(r.amountPaid*100-Math.round(r.amountPaid*100))>0.00001))throw new CRMError('Enter a valid amount paid in AED with up to two decimal places.');
 if(r.nextPaymentDate!==undefined&&r.nextPaymentDate!==''&&(typeof r.nextPaymentDate!=='string'||!validPaymentDate(r.nextPaymentDate)))throw new CRMError('Choose a valid next payment date.');
 if(r.paymentPlan!==undefined&&!['','Full','EMI','Part'].includes(String(r.paymentPlan)))throw new CRMError('Choose Full payment, Part payment or EMI.');
 if(r.emiDates!==undefined&&(!Array.isArray(r.emiDates)||r.emiDates.length>60||r.emiDates.some(d=>typeof d!=='string'||!validPaymentDate(d))||new Set(r.emiDates).size!==r.emiDates.length))throw new CRMError('Enter up to 60 valid, distinct EMI dates.');
 if(r.paymentMethod!==undefined&&r.paymentMethod!==''&&!paymentMethods.includes(r.paymentMethod as PaymentMethod))throw new CRMError('Choose a valid payment method.');
 if(r.paymentDate!==undefined&&r.paymentDate!==''&&(typeof r.paymentDate!=='string'||!validPaymentDate(r.paymentDate)))throw new CRMError('Choose a valid payment date.');
 if(!validCloseDate(text(r.closeDate)))throw new CRMError('Invalid expected close date and time.');
 if(r.temperature!==undefined&&!['Hot','Warm','Cold'].includes(text(r.temperature)))throw new CRMError('Invalid lead temperature.');
 if(!Array.isArray(r.notes)||r.notes.length>1000)throw new CRMError('Invalid notes.');
 if(r.followUpAt&&(typeof r.followUpAt!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(r.followUpAt)||!Number.isFinite(Date.parse(r.followUpAt))))throw new CRMError('Invalid follow-up date and time.');
 if(r.corporateCategory!==undefined&&r.corporateCategory!==''&&!corporateCategories.includes(String(r.corporateCategory)))throw new CRMError('Choose a corporate category from the list.');
 if(r.leadType!==undefined&&!['individual','corporate'].includes(String(r.leadType)))throw new CRMError('Invalid lead type.');
 if(r.leadType==='corporate'&&!text(r.company))throw new CRMError('Company name is required for a corporate lead.');
 if(r.participants!==undefined&&(!Number.isInteger(r.participants)||Number(r.participants)<1||Number(r.participants)>100000))throw new CRMError('Participants must be a whole number between 1 and 100,000.');
 if(r.deliveryMode!==undefined&&!['','On-site','Online','At ETI','Hybrid'].includes(String(r.deliveryMode)))throw new CRMError('Invalid delivery mode.');
 if(r.followUps!==undefined&&(!Array.isArray(r.followUps)||r.followUps.length>1000))throw new CRMError('Invalid follow-up history.');
 const followUps=(Array.isArray(r.followUps)?r.followUps:[]).map(f=>{if(!f||typeof f!=='object'||!text(f.id)||!Number.isFinite(Date.parse(text(f.due))))throw new CRMError('Invalid follow-up entry.');return {id:text(f.id),due:new Date(f.due).toISOString(),remark:text(f.remark,5000),at:text(f.at),author:text(f.author)};});
 const notes=r.notes.map(n=>{if(!n||typeof n!=='object'||!text(n.id)||!text(n.text,5000)||!Number.isFinite(Date.parse(text(n.at))))throw new CRMError('Invalid note.');return {id:text(n.id),text:text(n.text,5000),at:text(n.at),author:text(n.author)};});
 const quotes:Quote[]=Array.isArray(r.quotes)?r.quotes.map(q=>{if(!q||typeof q!=='object'||!text(q.id)||!text(q.number)||!text(q.description)||!['Draft','Sent','Accepted','Rejected'].includes(q.status))throw new CRMError('Invalid quotation.');for(const k of ['quantity','unitPrice','discount','tax'])if(typeof q[k]!=='number'||!Number.isFinite(q[k])||q[k]<0||q[k]>10000000)throw new CRMError('Invalid quotation amount.');if(!Number.isInteger(q.quantity)||q.quantity<1||q.tax>100||q.discount>q.quantity*q.unitPrice||!/^\d{4}-\d{2}-\d{2}$/.test(q.validUntil))throw new CRMError('Invalid quotation values.');return {id:text(q.id),number:text(q.number),description:text(q.description),quantity:q.quantity,unitPrice:q.unitPrice,discount:q.discount,tax:q.tax,validUntil:text(q.validUntil),status:q.status,createdAt:text(q.createdAt)};}):[];if(quotes.length>100)throw new CRMError('Too many quotations.');
 return {leadReceivedDate:r.leadReceivedDate as string|undefined,proposalSentDate:r.proposalSentDate as string|undefined,enrolmentDate:r.enrolmentDate as string|undefined,nextPaymentDate:r.nextPaymentDate as string|undefined,amountPaid:r.amountPaid as number|null|undefined,paymentPlan:r.paymentPlan as Lead['paymentPlan'],emiDates:r.emiDates as string[]|undefined,paymentMethod:r.paymentMethod as Lead['paymentMethod'],paymentDate:r.paymentDate as string|undefined,followUps,corporateCategory:text(r.corporateCategory),leadType:(r.leadType||'individual') as Lead['leadType'],designation:text(r.designation),industry:text(r.industry),participants:r.participants as number|undefined,deliveryMode:(r.deliveryMode||'') as Lead['deliveryMode'],trainingRequirements:text(r.trainingRequirements,5000),id:text(r.id),name:text(r.name),email,phone,company:text(r.company),program:text(r.program),source:r.source as Lead['source'],stage:r.stage as Lead['stage'],owner:text(r.owner)||'Unassigned',ownerId:text(r.ownerId),temperature:(r.temperature||'Warm') as Lead['temperature'],value:r.value,priority:r.priority as Lead['priority'],createdAt:Number.isFinite(Date.parse(text(r.createdAt)))?text(r.createdAt):new Date().toISOString(),updatedAt:new Date().toISOString(),closeDate:text(r.closeDate),followUpAt:r.followUpAt?new Date(r.followUpAt as string).toISOString():'',notes,quotes,version:text(r.version)};
}
export type Incoming={leadType?:Lead['leadType'];corporateCategory?:string;eventId:string;source:Lead['source'];name:string;email?:string;phone?:string;company?:string;program?:string;message:string;fields?:Record<string,string>};
export function applyIncoming(state:State,input:Incoming):{duplicate:boolean;id?:string}{
 if(state.events.includes(input.eventId))return {duplicate:true};
 const email=normEmail(text(input.email)),phone=normPhone(text(input.phone));
 if(!email&&!phone)throw new CRMError('Incoming lead has no email or phone.');
 // A website submission is an enquiry, not a contact: retain each opportunity.
 const separateEnquiry=input.source==='Website'&&input.eventId.startsWith('website-formsubmit:');
 const matches=separateEnquiry?[]:state.leads.filter(l=>(email&&normEmail(l.email)===email)||(phone&&normPhone(l.phone)===phone));
 if(matches.length>1)throw new CRMError('Conflicting contact matches; review duplicate records.',409);
 const now=new Date().toISOString();const id=matches[0]?.id||crypto.randomUUID();const previous=matches[0];
 const note={id:crypto.randomUUID(),text:text(input.message,5000)||`New ${input.source} enquiry`,at:now,author:input.source};
 const lead:Lead=previous?{...previous,updatedAt:now,version:crypto.randomUUID(),notes:[note,...previous.notes],email:previous.email||email,phone:previous.phone||text(input.phone)}:{id,leadReceivedDate:uaeDate(now),leadType:input.leadType||'individual',corporateCategory:input.corporateCategory||'',name:text(input.name)||'New enquiry',email,phone:text(input.phone),company:text(input.company),program:text(input.program)||'Programme to be confirmed',source:input.source,stage:'New',owner:'Unassigned',value:0,temperature:'Warm',priority:'Medium',createdAt:now,updatedAt:now,closeDate:'',notes:[note],version:crypto.randomUUID()};
 if(input.fields){lead.submissions=[{eventId:input.eventId,source:input.source,receivedAt:now,fields:captureFields(input.fields)},...(previous?.submissions||[])];if(lead.submissions.length>200)throw new CRMError('Form submission history limit reached.',409);}
 if(lead.notes.length>1000)throw new CRMError('Lead timeline limit reached. Export and archive before retrying.',409);
 state.leads=[lead,...state.leads.filter(l=>l.id!==id)];
 if(!previous)state.tasks.push({id:crypto.randomUUID(),title:`Follow up with ${lead.name}`,leadId:id,due:new Date(Date.now()+86400000).toISOString().slice(0,10),owner:'Unassigned',type:'Follow-up',done:false,version:crypto.randomUUID()});
 state.events.push(input.eventId);audit(state,{id:'integration',email:input.source},previous?'integration.updated':'integration.created',id,`${input.source} enquiry received`);return {duplicate:false,id};
}
export function websiteIncoming(body:unknown):Incoming|null{
 if(!body||typeof body!=='object')throw new CRMError('Invalid submission.');
 const envelope=body as Record<string,unknown>;const submission=(envelope.payload||envelope) as Record<string,unknown>;const raw=(submission.data||submission) as Record<string,unknown>;
 if(!raw||typeof raw!=='object')throw new CRMError('Invalid form data.');
 const fields:Record<string,unknown>=Object.fromEntries(Object.entries(raw).map(([k,v])=>[k.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,''),v]));
 const id=text(submission.id);if(!id)throw new CRMError('Submission ID is required for retry-safe delivery.');
 const formName=text(submission.form_name||fields.form_name);
 if(!['eti-leads-courses','eti-leads-programs'].includes(formName))throw new CRMError('Unsupported form.');
 if(fields.bot_field)return null;
 return {fields:captureFields(raw),eventId:`website:${id}`,source:'Website',name:text(fields.name||fields.full_name)||[text(fields.first_name),text(fields.last_name)].filter(Boolean).join(' ')||'Website enquiry',email:text(fields.email),phone:text(fields.phone||fields.mobile_whatsapp||fields.mobile||fields.telephone),company:text(fields.company||fields.organisation||fields.organization||fields.current_role_or_organisation),program:text(fields.course||fields.program||fields.programme||fields.programme_interest||fields.course_name||fields.course_or_capability||fields.training_category||fields.interest),message:`Website enquiry · ${formName}\n${Object.entries(raw).filter(([k,v])=>typeof v==='string'&&!['bot-field','form-name','_captcha'].includes(k)).map(([k,v])=>`${k}: ${text(v,1000)}`).join('\n')}`};
}
