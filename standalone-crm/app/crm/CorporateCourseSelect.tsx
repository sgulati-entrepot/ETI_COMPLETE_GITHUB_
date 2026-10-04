import {corporateCategories} from './catalogue';
import {corporateCourses} from './corporate-courses';
export default function CorporateCourseSelect({value,category='',disabled=false,label,onChange}:{value:string;category?:string;disabled?:boolean;label:string;onChange:(title:string,category:string)=>void}){
 const matches=corporateCourses.filter(c=>!category||c.category===category);
 return <select className="crm-corporate-course-select" aria-label={label} value={value} disabled={disabled} required onChange={e=>{const item=matches.find(c=>c.title===e.target.value);onChange(e.target.value,item?.category||category);}}><option value="" disabled>Choose a corporate course</option>{value&&!matches.some(c=>c.title===value)&&<option value={value}>{value} (current)</option>}{corporateCategories.filter(c=>!category||category===c).map(c=><optgroup key={c} label={c}>{matches.filter(item=>item.category===c).map(item=><option key={item.title} value={item.title}>{item.title}</option>)}</optgroup>)}</select>;
}
