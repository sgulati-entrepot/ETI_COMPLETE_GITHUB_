// The configured CRM super-admin identities requested by the institute. These are not passwords.
export const configuredSuperAdmins = [
  {name:'Sajeev Gulati',email:'sgulati@entrepot.ae'},
  {name:'Reena',email:'rdsouza@entrepot.ae'},
  {name:'Sheetal',email:'smurthy@entrepot.ae'},
  {name:'Sales Admin',email:'sales@entrepot.ae'},
  {name:'Fly Admin',email:'fly@entrepot.ae'},
] as const;

export function canCreateSuperAdmin(actor:{email?:string;role?:string}|null|undefined){
 return actor?.role==='super_admin'&&actor.email?.trim().toLowerCase()==='sgulati@entrepot.ae';
}

export function canEditLeadValue(actor:{email?:string;role?:string}|null|undefined){
 return actor?.role==='sales'||actor?.role==='super_admin';
}
