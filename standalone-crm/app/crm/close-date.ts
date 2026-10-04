export function validCloseDate(value:string){
 if(!value)return true;
 if(/^\d{4}-\d{2}-\d{2}$/.test(value)){const d=new Date(value);return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===value;}
 if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value))return false;
 const d=new Date(value);return Number.isFinite(d.getTime())&&d.toISOString()===value;
}
export function closeDateInput(value:string){if(!value)return '';if(value.length===10)return `${value}T00:00`;const d=new Date(value);return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16);}
