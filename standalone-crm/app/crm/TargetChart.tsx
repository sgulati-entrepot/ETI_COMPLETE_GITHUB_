import {targetStatus} from './target-status';
type ChartRow={name:string;target:number|null;achieved:number;percentage:number|null;remaining:number|null};
const amount=(n:number)=>new Intl.NumberFormat('en-AE',{maximumFractionDigits:2}).format(n);
export default function TargetChart({row,max}:{row:ChartRow;max:number}){
 const status=targetStatus(row.target,row.achieved);
 const percent=row.percentage??0,fill=Math.max(0,Math.min(100,percent));
 return <figure className="crm-target-chart" aria-label={`${row.name}: achieved AED ${amount(row.achieved)} of ${row.target===null?'an unset target':`AED ${amount(row.target)}`}`}>
 <div className="crm-target-ring"><svg viewBox="0 0 140 140" role="img" aria-label={row.percentage===null?'Monthly target not set':`${percent.toFixed(1)} percent achieved`}><circle cx="70" cy="70" r="56" fill="none" stroke="#e8ebe5" strokeWidth="12"/><circle cx="70" cy="70" r="56" fill="none" stroke={status.color} strokeWidth="12" pathLength="100" strokeDasharray={`${fill} ${100-fill}`} transform="rotate(-90 70 70)"/><text x="70" y="69" textAnchor="middle" className="crm-ring-number" style={{fill:status.color}}>{row.percentage===null?'—':`${percent.toFixed(1)}%`}</text><text x="70" y="88" textAnchor="middle" className="crm-ring-label">{row.percentage===null?'No positive target':'achieved'}</text></svg></div>
 <div className="crm-target-bars">{[{label:'Target',value:row.target,color:'#946200'},{label:'Achieved',value:row.achieved,color:status.color}].map(bar=><div key={bar.label}><div className="crm-target-bar-label"><span>{bar.label}</span><b style={{color:bar.color}}>{bar.value===null?'Not set':`AED ${amount(bar.value)}`}</b></div><div className="crm-target-track"><span style={{width:`${Math.max(0,(bar.value||0)/max*100)}%`,background:bar.color}}/></div></div>)}<figcaption style={{color:status.color}}>{status.kind==='unset'?'Set a monthly target to measure progress.':status.kind==='met'?'On target · AED 0 remaining':`${status.label}: AED ${amount(Math.abs(status.difference))}`}</figcaption></div>
 </figure>;
}
