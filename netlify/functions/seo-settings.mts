import { getStore } from "@netlify/blobs";
import { getUser } from "@netlify/identity";
import type { Context } from "@netlify/functions";

const defaults={siteName:"Entrepôt Training Institute",siteUrl:"https://www.etiworld.ae",defaultOgImage:"",metaPixelId:"1976753683143225",googleAnalyticsId:"",records:[],redirects:[]};

export default async (req:Request,_context:Context)=>{
  const user=await getUser();
  const allowedEmail=Netlify.env.get("SEO_ADMIN_EMAIL")?.toLowerCase();
  const authorised=!!user&&(user.roles?.includes("admin")||!!allowedEmail&&user.email?.toLowerCase()===allowedEmail);
  if(!authorised)return new Response("Unauthorized",{status:401});
  const store=getStore({name:"eti-seo",consistency:"strong"});
  if(req.method==="GET")return Response.json((await store.get("settings",{type:"json"}))||defaults);
  if(req.method==="PUT"){
    const body=await req.json();
    if(!body||!Array.isArray(body.records)||!Array.isArray(body.redirects))return new Response("Invalid settings payload",{status:400});
    await store.setJSON("settings",body,{metadata:{updatedAt:new Date().toISOString(),updatedBy:user.email||user.id}});
    return Response.json({ok:true});
  }
  return new Response("Method not allowed",{status:405,headers:{allow:"GET, PUT"}});
};
