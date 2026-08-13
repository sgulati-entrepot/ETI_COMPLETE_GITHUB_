import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../components";

export const metadata: Metadata = {
  title: "Terms and Policies | Entrepôt Training Institute",
  description: "Website terms, privacy information and learning policies for Entrepôt Training Institute.",
};

const sections = [
  ["01", "Website use", "The information on this website is provided for general guidance. Programme details, schedules, fees and availability may change. Content may not be copied, republished or used commercially without written permission."],
  ["02", "Privacy and personal information", "Information submitted through enquiry, registration or contact forms is used to respond to requests, provide relevant programme information and support enrolment. We take reasonable steps to protect personal information and do not sell it to third parties."],
  ["03", "Enrolment and payment", "A place is confirmed only after the applicable admission requirements and payment terms have been completed. Programme-specific fees, deadlines and payment arrangements will be communicated before enrolment."],
  ["04", "Changes, cancellation and refunds", "Schedules, trainers, venues and delivery formats may be adjusted when necessary. Cancellation, transfer and refund conditions can vary by programme and are confirmed in the applicable proposal, invoice or enrolment communication."],
  ["05", "Attendance and certification", "Certification may be subject to attendance, assessment, participation and awarding-body requirements. Learners are responsible for meeting the requirements communicated for their programme."],
  ["06", "Cookies and analytics", "This website may use essential technologies and analytics tools to understand usage and improve the visitor experience. Browser settings can be used to manage cookies, although some website functions may be affected."],
  ["07", "Contact and updates", "These terms and policies may be updated periodically. Questions about this page or the handling of personal information may be sent to courses@entrepot.ae."],
];

export default function TermsPoliciesPage() {
  return <main><SiteHeader/><section className="policy-hero"><div><span>Website information</span><h1>Terms and<br/><em>Policies.</em></h1><p>Clear guidance for using our website and engaging with Entrepôt Training Institute.</p></div><small>Updated in 2026</small></section><section className="policy-layout section-pad"><aside><span>On this page</span>{sections.map(([no,title])=><a href={`#policy-${no}`} key={no}>{no} / {title}</a>)}</aside><div className="policy-content"><p className="policy-lead">These terms provide a general framework for our website and learning services. Programme-specific written terms shared during enrolment take precedence where applicable.</p>{sections.map(([no,title,text])=><article id={`policy-${no}`} key={no}><span>{no}</span><div><h2>{title}</h2><p>{text}</p>{no==="07"&&<a href="mailto:courses@entrepot.ae">courses@entrepot.ae ↗</a>}</div></article>)}</div></section><SiteFooter/></main>;
}
