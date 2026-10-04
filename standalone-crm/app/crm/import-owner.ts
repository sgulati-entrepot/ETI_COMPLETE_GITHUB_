import type {TeamMember} from './model';
export function importOwner(value:string, members:TeamMember[], live:boolean, isSuperAdmin:boolean){
 const requested=value.trim();
 if(!live)return {owner:requested||'Unassigned'};
 if(!isSuperAdmin||!requested||requested.toLowerCase()==='unassigned')return {owner:'Unassigned',ownerId:''};
 const matches=members.filter(m=>m.status==='Active'&&[m.id,m.email,m.name].some(v=>v.toLowerCase()===requested.toLowerCase()));
 if(matches.length!==1)throw Error(`Owner “${requested}” must match one active staff name or email. Use the email if names are repeated.`);
 return {owner:matches[0].name,ownerId:matches[0].id};
}
