export const paymentMethods=['TABBY','TAMARA','RAK BANK Link','Direct Bank - RAK','Direct Bank - Emirates Bank','RAK BANK POS','NETWORK POS','Credit Card','Cash'] as const;
export type PaymentMethod=typeof paymentMethods[number];
export function validPaymentDate(value:string){if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const date=new Date(value);return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===value;}

export function paymentBalance(value:number,paid:number|null|undefined){if(paid===null||paid===undefined)return null;return (Math.round(value*100)-Math.round(paid*100))/100;}

export function equalEmiSchedule(value:number,paid:number|null|undefined,dates:string[]){
 const balance=paymentBalance(value,paid);
 if(balance===null||!dates.length||dates.some(d=>!validPaymentDate(d))||new Set(dates).size!==dates.length)return [];
 const total=Math.max(0,Math.round(balance*100)),base=Math.floor(total/dates.length);
 let remaining=total;
 return [...dates].sort().map((date,index)=>{const cents=index===dates.length-1?remaining:base;remaining-=cents;return {date,amount:cents/100,balanceAfter:remaining/100};});
}
