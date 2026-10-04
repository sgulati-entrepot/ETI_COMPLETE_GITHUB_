export const stages = ['New', 'Contacted', 'Qualified', 'Proposal sent', 'Negotiation', 'Enrolled', 'Lost'] as const;
export const sources = ['Meta Ads', 'WhatsApp', 'Website', 'Referral', 'Manual', 'Coursetakes'] as const;
export {programs,corporateCategories} from './catalogue';
import {programs} from './catalogue';
export type Stage = typeof stages[number];
export type Source = typeof sources[number];
export type Note = {id:string; text:string; at:string; author:string};
export type Quote = {id:string; number:string; description:string; quantity:number; unitPrice:number; discount:number; tax:number; validUntil:string; status:"Draft"|"Sent"|"Accepted"|"Rejected"; createdAt:string};
export type Temperature = "Hot"|"Warm"|"Cold";
export type TeamMember={id:string;name:string;email:string;role:"super_admin"|"sales";status:"Active"|"Disabled";createdAt:string};
export type FormSubmission = {eventId:string; source:string; receivedAt:string; fields:Record<string,string>};
export type FollowUp = {id:string;due:string;remark:string;at:string;author:string};
export type Lead = {leadReceivedDate?:string;proposalSentDate?:string;enrolmentDate?:string;nextPaymentDate?:string;amountPaid?:number|null;paymentPlan?:''|'Full'|'EMI'|'Part';emiDates?:string[];paymentMethod?:import('./payments').PaymentMethod|'';paymentDate?:string;enrolledAt?:string;followUps?:FollowUp[];corporateCategory?:string;leadType?:"individual"|"corporate"; designation?:string; industry?:string; participants?:number; deliveryMode?:""|"On-site"|"Online"|"At ETI"|"Hybrid"; trainingRequirements?:string; followUpAt?:string; submissions?:FormSubmission[]; id:string; name:string; email:string; phone:string; company:string; program:string; source:Source; stage:Stage; owner:string; ownerId?:string; temperature?:Temperature; value:number; priority:'High'|'Medium'|'Low'; createdAt:string; updatedAt:string; closeDate:string; notes:Note[]; quotes?:Quote[]; version?:string};
export type Task = {id:string; title:string; leadId:string; due:string; owner:string; ownerId?:string; type:'Call'|'Email'|'Meeting'|'Follow-up'; done:boolean; version?:string};
export type Data = {leads:Lead[]; tasks:Task[]};
export const owners = ['Unassigned', 'Sarah Ahmed', 'Omar Hassan', 'Priya Sharma', 'Sajeev Gulati'];
export const money = (n:number) => new Intl.NumberFormat('en-AE',{maximumFractionDigits:0}).format(n);
export const initials = (s:string) => s.split(' ').filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase();
export function blankLead():Lead {const now = new Date().toISOString();return {id:crypto.randomUUID(),name:'',email:'',phone:'',company:'',program:'',source:'Manual',stage:'New',owner:'Unassigned',value:0,temperature:'Warm',priority:'Medium',createdAt:now,updatedAt:now,closeDate:'',notes:[]};}
export function seedData():Data {
 const names=['Aisha Al Mansoori','Rahul Mehta','Fatima Hassan','James Wilson','Maria Santos','Ahmed Khalid','Neha Kapoor','David Chen','Sara Ibrahim','Mohammed Ali','Anna Thomas','Khalid Saeed','Riya Nair','Daniel George','Noor Ahmed','Arjun Patel','Lina Haddad','Omar Farooq'];
 const companies=['Al Noor Logistics','Individual learner','Meridian Group','Horizon Aviation','Individual learner','Gulf Trading Co.','Individual learner','Vertex Consulting','Emirates Learning','Individual learner','Bluewater Group','Al Noor Logistics','Individual learner','Meridian Group','Individual learner','Vertex Consulting','Gulf Trading Co.','Individual learner'];
 const stageList:Stage[]=['New','New','Qualified','Proposal sent','Contacted','Negotiation','Enrolled','Qualified','Proposal sent','New','Contacted','Enrolled','Lost','Negotiation','Contacted','Qualified','Enrolled','New'];
 const values=[12500,4200,18000,24000,3800,16500,4500,6200,32000,3200,5500,14500,3800,22000,4200,6500,18000,4500];
 const leads:Lead[] = names.map((name,i)=>{const createdAt=new Date(Date.now()-(i*1.6)*86400000).toISOString();return {id:`demo-${i}`,name,email:`${name.toLowerCase().replaceAll(' ','.')}@example.com`,phone:'',company:companies[i],program:programs[i%programs.length],source:sources[i%4],stage:stageList[i],owner:owners[1+i%3],value:values[i],temperature:(['Hot','Warm','Cold'] as const)[i%3],priority:(i%3===0?'High':i%3===1?'Medium':'Low') as Lead['priority'],createdAt,updatedAt:createdAt,closeDate:new Date(Date.now()+(3+i)*86400000).toISOString().slice(0,10),notes:[{id:`note-${i}`,text:'Sample enquiry. Interested in the next available programme. Arrange a consultation to discuss learning goals.',at:createdAt,author:'Demo workspace'}]};});
 leads[3].quotes=[{id:'demo-quote-1',number:'ETI-DEMO-001',description:leads[3].program,quantity:8,unitPrice:3000,discount:0,tax:0,validUntil:leads[3].closeDate,status:'Sent',createdAt:leads[3].createdAt}];
 leads[8].quotes=[{id:'demo-quote-2',number:'ETI-DEMO-002',description:leads[8].program,quantity:10,unitPrice:3200,discount:0,tax:0,validUntil:leads[8].closeDate,status:'Draft',createdAt:leads[8].createdAt}];
 const tasks:Task[] = ['Discuss corporate training requirements','Follow up on programme proposal','Schedule a course consultation','Send the CMA programme outline','Confirm enrolment details'].map((title,i)=>({id:`task-${i}`,title,leadId:leads[i].id,due:new Date(Date.now()+(i-1)*86400000).toISOString().slice(0,10),owner:owners[1+i%3],type:(['Call','Email','Meeting','Follow-up','Call'] as Task['type'][])[i],done:false}));
 return {leads,tasks};
}
export function csvEscape(value:unknown) {let text=String(value??'');if(/^[=+@\-\t\r]/.test(text))text="'"+text;return '"'+text.replaceAll('"','""')+'"';}
export function parseCSV(input:string):string[][] {const rows:string[][]=[];let row:string[]=[],cell='',quoted=false;const text=input.replace(/^\uFEFF/,'');for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(cell);cell='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(Boolean))rows.push(row);row=[];cell='';}else cell+=c;}if(quoted)throw new Error('CSV contains an unclosed quoted field.');row.push(cell);if(row.some(Boolean))rows.push(row);return rows;}
