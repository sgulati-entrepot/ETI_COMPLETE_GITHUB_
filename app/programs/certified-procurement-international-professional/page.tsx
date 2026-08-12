import type {Metadata} from "next";
import {BrochureCoursePage} from "../../components";

const metaTitle="Certified Procurement International Professional | Entrepot";
const metaDescription="Advance your procurement career with the Certified Procurement International Professional course at Entrepot Training Institute, UAE. Gain global sourcing & supply chain expertise.";

export const metadata:Metadata={
  title:metaTitle,
  description:metaDescription,
  alternates:{canonical:"https://etiworld.ae/programs/certified-procurement-international-professional"},
  openGraph:{title:metaTitle,description:metaDescription,url:"https://etiworld.ae/programs/certified-procurement-international-professional",siteName:"Entrepot Training Institute",type:"website"},
  twitter:{card:"summary_large_image",title:metaTitle,description:metaDescription}
};
const course={code:"CPIP",title:"Certified Procurement International Professional",strapline:"Source strategically. Negotiate effectively. Deliver value.",summary:"CPIP builds the core competencies required in procurement and supply management. Participants gain practical knowledge of procurement planning, sourcing strategies, supplier evaluation, international procurement, contracts, negotiation and procurement risk management.",cover:"/images/course-cpip.png",file:"/brochures/cpip.pdf",duration:"12 training hours / 15 learning hours",format:"Face-to-face or virtual instructor-led",qualification:["Proficiency in English","Procurement or supply chain experience is advantageous","No prior certification is required"],audience:["Procurement and purchasing professionals","Sourcing and vendor management specialists","Contract administrators","Professionals beginning a procurement career"],benefits:["Develop practical procurement and supply expertise","Use structured supplier evaluation methods","Strengthen contract and negotiation skills","Build globally relevant competencies for progression"],modules:[{title:"Procurement Foundations",topics:["Procurement cycle","Systems and steps","Global procurement context"]},{title:"International Planning",topics:["Advanced purchase planning","Procurement complexity","Planning content"]},{title:"Methods & Sourcing",topics:["Competitive approaches","Electronic procurement","Worldwide sourcing"]},{title:"Currency Risk & Hedging",topics:["Currency risk management","Adjustment factors","Global sourcing strategies"]},{title:"Supplier Evaluation",topics:["Categorical method","Weighted point method","Vendor profile analysis"]},{title:"Contracts & Negotiation",topics:["Contract types and obligations","Negotiation methods and tools","Ethics in procurement"]}],outcomes:["Apply structured procurement planning","Evaluate and select suppliers objectively","Manage international sourcing activity","Identify procurement risks and negotiate effectively"]};
export default function Page(){return <BrochureCoursePage course={course}/>}
