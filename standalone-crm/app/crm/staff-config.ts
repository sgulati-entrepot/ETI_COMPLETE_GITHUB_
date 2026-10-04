import {configuredSuperAdmins} from './admin-config';
import {owners,type TeamMember} from './model';

// Requested sales profiles. Live access requires an Identity account and a server-side team record.
export const configuredSalesStaff = [
  {name:'Ali',email:'adanish@entrepot.ae'},
  {name:'cnair',email:'cnair@entrepot.ae'},
] as const;

export function demoTeam(saved:TeamMember[]=[]):TeamMember[]{
 const now=new Date().toISOString();
 const sales=saved.filter(m=>m.role==='sales');
 const existing=sales.length?sales:owners.slice(1,4).map((name,i):TeamMember=>({id:`demo-sales-${i}`,name,email:`sales${i+1}@example.com`,role:'sales',status:'Active',createdAt:now}));
 const requested=configuredSalesStaff.map((staff,i):TeamMember=>{
  const member=existing.find(m=>m.email.toLowerCase()===staff.email);
  return member?{...member,name:staff.name}:{id:`demo-requested-sales-${i}`,name:staff.name,email:staff.email,role:'sales',status:'Active',createdAt:now};
 });
 return [...requested,...existing.filter(m=>!configuredSalesStaff.some(s=>s.email===m.email.toLowerCase())),...configuredSuperAdmins.map((a,i):TeamMember=>({id:`demo-root-${i+1}`,name:a.name,email:a.email,role:'super_admin',status:'Active',createdAt:now}))];
}
