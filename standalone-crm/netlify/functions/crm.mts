import {targetProgress,monthInUAE} from './_shared/crm-targets';
import type {} from '@netlify/functions';
import {access,sameOrigin} from './_shared/crm-auth';
import {visibleData,type Actor} from './_shared/crm-access';
import {mutate,fail} from './_shared/crm-store';
import {CRMError,type State} from './_shared/crm-domain';
import {saveRecord,saveTarget} from './_shared/crm-save';
import {applyCommand} from './_shared/crm-actions';
import {queryWorkspace,integrationHealth} from './_shared/crm-queries';
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
type Dependencies={access:(req:Request)=>Promise<{actor:Actor;state:State}>;mutate:<T>(fn:(state:State)=>T)=>Promise<T>;env:(key:string)=>string|undefined};
export function createHandler(deps:Dependencies){return async function handler(req:Request){try{
 if(!['GET','PUT','PATCH','POST'].includes(req.method))return new Response('Method not allowed',{status:405,headers:{...headers,Allow:'GET, PUT, PATCH, POST'}});
 if(req.method!=='GET')sameOrigin(req);
 const {actor,state}=await deps.access(req);
 if(req.method==='GET'){
  const params=new URL(req.url).searchParams;
  if(params.get('view')==='targets')return Response.json(targetProgress(state,actor,params.get('month')||monthInUAE()),{headers});
  if(params.get('view')==='health'){if(actor.role!=='super_admin')throw new CRMError('Only super admins can view integration health.',403);return Response.json(integrationHealth(state,k=>deps.env(k)),{headers});}
  if(params.has('view')){const result=queryWorkspace(state,actor,params);return typeof result==='string'?new Response(result,{headers:{...headers,'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="eti-leads.csv"'}}):Response.json(result,{headers});}
  const configured=(...keys:string[])=>keys.every(k=>!!deps.env(k));
  return Response.json({actor,team:actor.role==='super_admin'?(state.team||[]):[],data:visibleData(state,actor),notificationReads:state.notificationReads?.[actor.id]||[],settings:actor.role==='super_admin'?(state.settings||{enrolmentTarget:100000}):{},integrations:actor.role==='super_admin'?{'Meta Ads':configured('CRM_META_APP_SECRET','CRM_META_VERIFY_TOKEN','CRM_META_PAGE_TOKEN','CRM_META_PAGE_ID','CRM_META_GRAPH_VERSION'),'WhatsApp':configured('CRM_META_APP_SECRET','CRM_META_VERIFY_TOKEN','CRM_WHATSAPP_PHONE_ID'),'Website':configured('CRM_FORMSUBMIT_API_KEY')||configured('CRM_WEBSITE_WEBHOOK_TOKEN')}:{ }},{headers});
 }
 if(!req.headers.get('content-type')?.toLowerCase().startsWith('application/json'))throw new CRMError('Use application/json.',415);
 const raw=await req.text();if(Buffer.byteLength(raw,'utf8')>2000000)throw new CRMError('Request is too large (maximum 2 MB).',413);
 let body;try{body=JSON.parse(raw);}catch{throw new CRMError('Invalid JSON.');}if(!body||typeof body!=='object'||Array.isArray(body))throw new CRMError('JSON object required.');
 const result=req.method==='POST'?await deps.mutate(s=>applyCommand(s,actor,body)):req.method==='PATCH'?await deps.mutate(s=>saveTarget(s,actor,body.enrolmentTarget)):await deps.mutate(s=>saveRecord(s,actor,body.kind,body.record));
 return Response.json(result,{headers});
 }catch(error){return fail(error);}};}
export default createHandler({access,mutate,env:key=>Netlify.env.get(key)});
