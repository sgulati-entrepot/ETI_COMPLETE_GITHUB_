import type {State} from './crm-domain';
export type AuditEntry={id:string;at:string;actorId:string;actor:string;action:string;recordId:string;summary:string};
export function audit(state:State,actor:{id:string;email:string},action:string,recordId:string,summary:string){
 const entry:AuditEntry={id:crypto.randomUUID(),at:new Date().toISOString(),actorId:actor.id,actor:actor.email,action,recordId,summary};
 state.audit=[entry,...(state.audit||[])];return entry;
}
