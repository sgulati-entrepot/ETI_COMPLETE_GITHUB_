import {createHash} from 'node:crypto';
import {applyIncoming,CRMError,text,type Incoming,type State} from './crm-domain';
import {corporateCategories} from '../../../app/crm/catalogue';

// Reading accepted submissions leaves FormSubmit's email delivery untouched.
export function formSubmitIncoming(value:unknown,since:string):Incoming|null{
 if(!value||typeof value!=='object')throw new CRMError('Invalid provider submission.');
 const row=value as Record<string,any>;
 let url:URL;try{url=new URL(row.form_url);}catch{return null;}
 if(!['etiworld.ae','www.etiworld.ae'].includes(url.hostname)||url.protocol!=='https:')return null;
 if(/^\/(feedback|careers)(\/|$)/.test(url.pathname))return null;
 if(!row.form_data||typeof row.form_data!=='object'||Array.isArray(row.form_data))throw new CRMError('Invalid provider fields.');
 const stamp=row.submitted_at;
 if(!stamp||stamp.timezone!=='UTC'||typeof stamp.date!=='string')throw new CRMError('Unsupported provider timestamp.');
 const at=stamp.date.replace(' ','T').replace(/\.(\d{3})\d+$/,'.$1')+'Z';
 if(!Number.isFinite(Date.parse(at)))throw new CRMError('Invalid provider timestamp.');
 if(Date.parse(at)<Date.parse(since))return null;
 const raw:Record<string,unknown>=Object.fromEntries(Object.entries(row.form_data).filter(([k])=>!k.startsWith('_')));
 const f:Record<string,unknown>=Object.fromEntries(Object.entries(raw).map(([k,v])=>[k.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,''),v]));
 if(f.bot_field||row.form_data._honey)return null;
 if(/feedback|career|job application/i.test(text(f.form)||text(f.lead_source)))return null;
 const id=createHash('sha256').update(JSON.stringify([url.href,stamp.date,Object.entries(raw).sort(([a],[b])=>a.localeCompare(b))])).digest('hex');
 const corporate=/corporate/i.test(url.pathname+' '+text(f.lead_source))||!!f.training_category;
 const category=text(f.training_category||f.corporate_category);
 return {eventId:`formsubmit:${id}`,source:'Website',name:text(f.name||f.full_name)||[text(f.first_name),text(f.last_name)].filter(Boolean).join(' ')||'Website enquiry',email:text(f.email),phone:text(f.phone||f.mobile_whatsapp||f.mobile),company:text(f.organisation||f.organization||f.company||f.current_role_or_organisation),program:text(f.programme||f.programme_interest||f.course||f.course_or_capability||f.interest)||'Programme to be confirmed',leadType:corporate?'corporate':'individual',corporateCategory:corporateCategories.includes(category)?category:'',message:`Website enquiry received ${at}\nPage: ${url.href}\n${Object.entries(raw).map(([k,v])=>`${k}: ${text(v,1000)}`).join('\n')}`,fields:{...raw,'Website page':url.href,'Submitted at':at} as Record<string,string>};
}
export function importFormSubmitRow(s:State,row:unknown,since:string){const incoming=formSubmitIncoming(row,since);return incoming?applyIncoming(s,incoming):{ignored:true};}
