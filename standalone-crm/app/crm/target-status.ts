export function targetStatus(target:number|null,achieved:number){
 if(target===null)return {kind:'unset',color:'#617057',difference:0,label:'Target not set'};
 const difference=(Math.round(achieved*100)-Math.round(target*100))/100;
 return difference<0?{kind:'deficit',color:'#b42318',difference,label:'Deficit'}:difference>0?{kind:'surplus',color:'#237344',difference,label:'Surplus'}:{kind:'met',color:'#946200',difference,label:'On target'};
}
