import {CRMError,text,type Incoming} from './crm-domain';
import {corporateCategories} from '../../../app/crm/catalogue';
// Public intake only: never returns stored contacts or permits ownership/stage changes.
export function publicWebsiteIncoming(body:unknown):Incoming|null{
 if(!body||typeof body!=='object')throw new CRMError('Invalid submission.');
 const raw=(body as {form_data?:unknown}).form_data;
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new CRMError('FormSubmit form_data is required.');
 const data=raw as Record<string,unknown>;
 if(data._honey||data['bot-field'])return null;
 const id=text(data['CRM Submission ID']);if(!/^[0-9a-f-]{36}$/i.test(id))throw new CRMError('Submission ID required.');
 let url:URL;try{url=new URL(text(data['CRM Page URL'],2000));}catch{throw new CRMError('Website URL required.');}
 if(!['etiworld.ae','www.etiworld.ae'].includes(url.hostname)||url.protocol!=='https:')throw new CRMError('Unsupported website.');
 if(/^\/(feedback|careers)(\/|$)/.test(url.pathname))return null;
 const fields=Object.fromEntries(Object.entries(data).filter(([k])=>!k.startsWith('_')));
 const f=Object.fromEntries(Object.entries(fields).map(([k,v])=>[k.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,''),v]));
 const email=text(f.email),phone=text(f.phone||f.mobile_whatsapp||f.mobile);
 if(!email&&!phone)throw new CRMError('Contact details required.');
 if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new CRMError('Invalid email.');
 const corporate=/corporate/i.test(url.pathname+' '+text(f.lead_source))||!!f.training_category;
 const category=text(f.training_category);
 return {eventId:`website-formsubmit:${id}`,source:'Website',name:text(f.name||f.full_name)||'Website enquiry',email,phone,company:text(f.organisation||f.company||f.current_role_or_organisation),program:text(f.programme||f.course||f.programme_interest)||'Programme to be confirmed',leadType:corporate?'corporate':'individual',corporateCategory:corporateCategories.includes(category)?category:'',fields:fields as Record<string,string>,message:`Website enquiry · ${url.pathname}\n${Object.entries(fields).map(([k,v])=>`${k}: ${text(v,1000)}`).join('\n')}`};
}
