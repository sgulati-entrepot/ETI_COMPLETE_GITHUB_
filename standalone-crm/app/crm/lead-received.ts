import {validPaymentDate} from './payments';
import type {Lead} from './model';
export const uaeDate=(value:string|Date)=>{const d=new Date(value);return Number.isFinite(d.getTime())?new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dubai',year:'numeric',month:'2-digit',day:'2-digit'}).format(d):'';};
export const receivedDate=(lead:Lead)=>lead.leadReceivedDate||uaeDate(lead.createdAt);
export function parseLeadDate(value:string){
 const raw=value.trim();if(!raw)return '';
 if(validPaymentDate(raw))return raw;
 const local=/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})(?:\s.*)?$/.exec(raw);
 if(local){const date=`${local[3]}-${local[2].padStart(2,'0')}-${local[1].padStart(2,'0')}`;if(validPaymentDate(date))return date;}
 if(/^\d{4}-\d{2}-\d{2}T/.test(raw)&&validPaymentDate(raw.slice(0,10))&&Number.isFinite(Date.parse(raw)))return uaeDate(raw);
 if(/^\d{5}(?:\.\d+)?$/.test(raw)){const date=new Date(Date.UTC(1899,11,30)+Math.floor(Number(raw))*86400000).toISOString().slice(0,10);if(validPaymentDate(date))return date;}
 throw Error('Use YYYY-MM-DD, DD/MM/YYYY, or an Excel date cell for the lead-generation date.');
}
export function importHeader(header:string){const key=header.trim().toLowerCase().replace(/[\s_-]+/g,'');if(['leadreceiveddate','leadgenerationdate','leadgenerateddate','generationdate','generateddate','createddate','createdat','createdtime','receiveddate','date'].includes(key))return 'leadReceivedDate';const aliases:Record<string,string>={fullname:'name',emailaddress:'email',phonenumber:'phone',coursename:'program',programme:'program',course:'program'};const fields=['name','email','phone','company','program','source','stage','owner','value','priority','temperature','leadType','corporateCategory','designation','industry','participants','deliveryMode','trainingRequirements','followUpAt','closeDate','paymentMethod','paymentDate','paymentPlan','emiDates','amountPaid','nextPaymentDate','proposalSentDate','enrolmentDate'];return aliases[key]||fields.find(f=>f.toLowerCase()===key)||header.trim();}
