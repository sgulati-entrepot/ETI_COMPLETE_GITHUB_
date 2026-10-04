import type {Delivery} from './crm-reminder-delivery';

export function interaktReminderPayload(job:Delivery,template:string,language='en'){
 const match=/^\+971(\d{9})$/.exec(job.to);
 if(!match)throw new Error('Invalid reminder WhatsApp number.');
 return {countryCode:'+971',phoneNumber:match[1],callbackData:job.id,type:'Template',template:{name:template,languageCode:language,bodyValues:job.parameters}};
}

export async function sendInteraktReminder(job:Delivery,key:string,template:string,language='en',send:typeof fetch=fetch):Promise<{status:'accepted'|'failed'|'unknown';messageId?:string;httpStatus?:number}>{
 try{
  const response=await send('https://api.interakt.ai/v1/public/message/',{method:'POST',signal:AbortSignal.timeout(4000),headers:{Authorization:`Basic ${key}`,'Content-Type':'application/json'},body:JSON.stringify(interaktReminderPayload(job,template,language))});
  if(!response.ok)return {status:response.status>=500||response.status===429?'unknown':'failed',httpStatus:response.status};
  const result=await response.json();
  return result.result===true&&typeof result.id==='string'?{status:'accepted',messageId:result.id,httpStatus:response.status}:{status:'unknown',httpStatus:response.status};
 }catch{return {status:'unknown'};}
}
