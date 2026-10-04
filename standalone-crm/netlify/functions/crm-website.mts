import type {} from "@netlify/functions";
import {applyIncoming,secretValid,websiteIncoming,CRMError} from './_shared/crm-domain';
import {mutate,fail} from './_shared/crm-store';
export default async function handler(req:Request){try{
 if(req.method!=='POST')return new Response('Method not allowed',{status:405});const secret=Netlify.env.get('CRM_WEBSITE_WEBHOOK_TOKEN');if(!secret)throw new CRMError('Website integration is not configured.',503);
 const token=req.headers.get('authorization')?.replace(/^Bearer /,'')||new URL(req.url).searchParams.get('token');if(!secretValid(token,secret))throw new CRMError('Invalid webhook token.',401);
 const raw=await req.text();if(raw.length>100000)throw new CRMError('Payload too large.',413);let body;try{body=JSON.parse(raw);}catch{throw new CRMError('Invalid JSON.');}const incoming=websiteIncoming(body);if(!incoming)return Response.json({ignored:true});
 const result=await mutate(state=>applyIncoming(state,incoming));return Response.json({received:true,...result});
 }catch(error){return fail(error);}};
