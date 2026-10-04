import type {User} from '@netlify/identity';
import {CRMError} from './crm-domain';
// Validate the browser's session with Identity itself. Do not depend on ambient
// runtime cookie context, and never authorize by decoding an unverified JWT.
export async function requestUser(req:Request,identityOrigin:string,fetcher:typeof fetch=fetch):Promise<User|null>{
 const encoded=(req.headers.get('cookie')||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('nf_jwt='))?.slice(7);
 if(!encoded)return null;
 let token:string;try{token=decodeURIComponent(encoded);}catch{return null;}
 if(!token||token.length>16000||/[\r\n]/.test(token))return null;
 const origin=new URL(identityOrigin);if(origin.protocol!=='https:')throw new CRMError('Account service configuration is invalid.',503);
 let response:Response;try{response=await fetcher(new URL('/.netlify/identity/user',origin),{headers:{Authorization:`Bearer ${token}`},signal:AbortSignal.timeout(8000),redirect:'error'});}catch{throw new CRMError('Account verification is temporarily unavailable. Please retry.',503);}
 if(response.status===401||response.status===403)return null;
 if(!response.ok)throw new CRMError('Account verification is temporarily unavailable. Please retry.',503);
 const u=await response.json();if(typeof u.id!=='string'||typeof u.email!=='string')return null;
 return {id:u.id,email:u.email,confirmedAt:u.confirmed_at,invitedAt:u.invited_at,name:u.user_metadata?.full_name||u.user_metadata?.name,userMetadata:u.user_metadata||{},appMetadata:u.app_metadata||{},roles:u.app_metadata?.roles};
}
