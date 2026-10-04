import type {Config} from '@netlify/functions';
import {publicWebsiteIncoming} from './_shared/crm-public-website';
import {applyIncoming,CRMError} from './_shared/crm-domain';
import {mutate,fail} from './_shared/crm-store';
export const config:Config={rateLimit:{windowLimit:100,windowSize:60,aggregateBy:['ip']}};
export default async function handler(req:Request){
 const origin=req.headers.get('origin');
 const allowed=origin==='https://etiworld.ae'||origin==='https://www.etiworld.ae';
 const cors:Record<string,string>=allowed?{'Access-Control-Allow-Origin':origin!,'Vary':'Origin','Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type'}:{};
 if(origin&&!allowed)return new Response('Unsupported origin',{status:403});
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
 try{
 if(req.method!=='POST')return new Response('Method not allowed',{status:405});
 if(!req.headers.get('content-type')?.includes('application/json'))throw new CRMError('JSON required.',415);
 const raw=await req.text();if(Buffer.byteLength(raw)>100000)throw new CRMError('Submission too large.',413);
 let body;try{body=JSON.parse(raw);}catch{throw new CRMError('Invalid JSON.');}
 const incoming=publicWebsiteIncoming(body);if(incoming)await mutate(s=>{const result=applyIncoming(s,incoming);const now=new Date().toISOString();s.websiteSync={since:s.websiteSync?.since||now,lastAttempt:now,lastSuccess:now,received:(s.websiteSync?.received||0)+(result.duplicate?0:1),errors:0,status:'Website enquiries received'};return result;});
 return Response.json({received:true},{headers:{...cors,'Cache-Control':'no-store'}});
 }catch(error){const response=fail(error);for(const [key,value] of Object.entries(cors))response.headers.set(key,value);return response;}}
