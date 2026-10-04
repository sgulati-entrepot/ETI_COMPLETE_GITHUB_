import {CRMError,type State} from './crm-domain';
import type {Actor} from './crm-access';
import {audit} from './crm-audit';
export const monthInUAE=(date=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dubai',year:'numeric',month:'2-digit',day:'2-digit'}).format(date).slice(0,7);
export function validMonth(month:unknown):month is string{return typeof month==='string'&&/^20\d{2}-(0[1-9]|1[0-2])$/.test(month);}
export function setMonthlyTarget(state:State,actor:Actor,body:Record<string,unknown>){
 if(actor.role!=='super_admin')throw new CRMError('Only super admins can set sales targets.',403);
 if(!validMonth(body.month)||typeof body.staffId!=='string'||!state.team?.some(m=>m.id===body.staffId&&m.role==='sales'))throw new CRMError('Choose a valid month and salesperson.');
 if(typeof body.amount!=='number'||!Number.isFinite(body.amount)||body.amount<0||body.amount>1000000000)throw new CRMError('Enter a target between AED 0 and AED 1,000,000,000.');
 const key=`${body.month}:${body.staffId}`,current=state.monthlyTargets?.[key];
 if((current?.version||'')!==(body.version||''))throw new CRMError('This target changed. Refresh and try again.',409);
 const target={amount:Math.round(body.amount*100)/100,version:crypto.randomUUID(),updatedAt:new Date().toISOString(),updatedBy:actor.email};
 state.monthlyTargets={...(state.monthlyTargets||{}),[key]:target};audit(state,actor,'target.updated',body.staffId,`${body.month}: monthly target AED ${target.amount}`);return target;
}
export function targetProgress(state:State,actor:Actor,month:string,now=new Date()){
 if(!validMonth(month))throw new CRMError('Choose a valid calendar month.');
 const currentMonth=monthInUAE(now),lastDay=new Date(Date.UTC(Number(month.slice(0,4)),Number(month.slice(5)),0)).getUTCDate();
 const today=Number(new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dubai',day:'2-digit'}).format(now));
 const daysRemaining=month<currentMonth?0:month>currentMonth?lastDay:lastDay-today+1;
 const members=(state.team||[]).filter(m=>m.role==='sales'&&(actor.role==='super_admin'||m.id===actor.id));
 return {month,daysRemaining,rows:members.map(member=>{
  const target=state.monthlyTargets?.[`${month}:${member.id}`];
  const leads=state.leads.filter(l=>l.ownerId===member.id&&l.stage==='Enrolled');
  const achieved=leads.filter(l=>(l.enrolmentDate?l.enrolmentDate.slice(0,7):l.enrolledAt?monthInUAE(new Date(l.enrolledAt)):'')===month).reduce((sum,l)=>sum+l.value,0);
  return {staffId:member.id,name:member.name,email:member.email,status:member.status,target:target?.amount??null,version:target?.version||'',achieved,percentage:target&&target.amount>0?achieved/target.amount*100:null,remaining:target?Math.max(0,target.amount-achieved):null,undatedEnrolments:leads.filter(l=>!l.enrolmentDate&&!l.enrolledAt).length};
 })};
}
