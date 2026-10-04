const API='/.netlify/functions/crm';
const pending=new Map<string,string>();
export async function readBackend(view:string){const response=await fetch(`${API}?${view}`,{credentials:'include',cache:'no-store'});if(!response.ok)throw Error(await response.text());return response.json();}
export async function runCommand(body:Record<string,unknown>){
 const signature=JSON.stringify(body),requestId=pending.get(signature)||crypto.randomUUID();pending.set(signature,requestId);
 const response=await fetch(API,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({...body,requestId})});
 if(!response.ok){if(response.status<500)pending.delete(signature);throw Error(await response.text());}
 const result=await response.json();pending.delete(signature);return result;
}
