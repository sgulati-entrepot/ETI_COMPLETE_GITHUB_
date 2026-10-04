import {receivedDate} from './lead-received';
import type {Lead} from './model';
const dayFormat=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dubai',year:'numeric',month:'2-digit',day:'2-digit'});
export function dubaiDay(value:string|Date){const date=new Date(value);return Number.isFinite(date.getTime())?dayFormat.format(date):'';}
export function newestLeads(leads:Lead[]){return [...leads].sort((a,b)=>receivedDate(b).localeCompare(receivedDate(a))||(Date.parse(b.createdAt)||0)-(Date.parse(a.createdAt)||0)||a.id.localeCompare(b.id));}
export function dailyArrivals(leads:Lead[],now=new Date()){
 return Array.from({length:7},(_,i)=>{const date=new Date(now.getTime()-i*86400000),day=dubaiDay(date);return {day,label:i===0?'Today':i===1?'Yesterday':new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Dubai',day:'numeric',month:'short'}).format(date),count:leads.filter(l=>receivedDate(l)===day).length};});
}
