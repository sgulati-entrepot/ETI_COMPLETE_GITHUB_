import { getStore } from "@netlify/blobs";
import type { Config, Context } from "@netlify/edge-functions";

type SeoRecord={path:string;title?:string;description?:string;canonical?:string;ogTitle?:string;ogDescription?:string;ogImage?:string;index?:boolean;structuredData?:string};
type Settings={siteName?:string;siteUrl?:string;defaultOgImage?:string;metaPixelId?:string;googleAnalyticsId?:string;records?:SeoRecord[];redirects?:{from:string;to:string;status:301|302}[]};
const attr=(v:string)=>v.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;");
const text=(v:string)=>v.replace(/&/g,"&amp;").replace(/</g,"&lt;");

export default async (req:Request,context:Context)=>{
  const url=new URL(req.url);
  if(url.pathname.startsWith("/admin")||url.pathname.startsWith("/.netlify/")||url.pathname.includes("."))return context.next();
  let settings:Settings|null=null;
  try{settings=await getStore({name:"eti-seo"}).get("settings",{type:"json"}) as Settings|null}catch{return context.next()}
  if(!settings)return context.next();
  const redirect=settings.redirects?.find(r=>r.from===url.pathname);
  if(redirect?.to)return Response.redirect(new URL(redirect.to,url.origin),redirect.status);
  const response=await context.next();
  if(!response.headers.get("content-type")?.includes("text/html"))return response;
  const record=settings.records?.find(r=>r.path===url.pathname);
  const pixel=settings.metaPixelId?.replace(/\D/g,"");
  const ga=settings.googleAnalyticsId?.trim();
  if(!record&&!pixel&&!ga)return response;
  let html=await response.text();
  if(record?.title)html=html.replace(/<title>[\s\S]*?<\/title>/i,`<title>${text(record.title)}</title>`);
  const tags:string[]=[];
  if(record?.description)tags.push(`<meta name="description" content="${attr(record.description)}">`);
  tags.push(`<meta name="robots" content="${record?.index===false?"noindex, nofollow":"index, follow"}">`);
  const canonical=record?.canonical||`${settings.siteUrl||url.origin}${url.pathname}`;
  tags.push(`<link rel="canonical" href="${attr(canonical)}">`);
  const ogTitle=record?.ogTitle||record?.title;
  const ogDescription=record?.ogDescription||record?.description;
  const ogImage=record?.ogImage||settings.defaultOgImage;
  if(ogTitle)tags.push(`<meta property="og:title" content="${attr(ogTitle)}">`);
  if(ogDescription)tags.push(`<meta property="og:description" content="${attr(ogDescription)}">`);
  if(ogImage)tags.push(`<meta property="og:image" content="${attr(ogImage)}">`);
  tags.push(`<meta property="og:url" content="${attr(canonical)}"><meta property="og:type" content="website">`);
  if(record?.structuredData){try{JSON.parse(record.structuredData);tags.push(`<script type="application/ld+json">${record.structuredData.replace(/<\/script/gi,"<\\/script")}</script>`)}catch{}}
  if(pixel&&!html.includes("connect.facebook.net/en_US/fbevents.js"))tags.push(`<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');</script><noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixel}&ev=PageView&noscript=1" alt=""></noscript>`);
  if(ga)tags.push(`<script async src="https://www.googletagmanager.com/gtag/js?id=${attr(ga)}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${attr(ga)}');</script>`);
  html=html.replace(/<meta name="description"[^>]*>/gi,"").replace(/<meta name="robots"[^>]*>/gi,"").replace(/<link rel="canonical"[^>]*>/gi,"").replace(/<\/head>/i,`${tags.join("")} </head>`);
  return new Response(html,{status:response.status,statusText:response.statusText,headers:response.headers});
};

export const config:Config={path:"/*",excludedPath:["/admin/*","/.netlify/*","/_next/*"],onError:"bypass"};
