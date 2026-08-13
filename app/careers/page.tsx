import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../components";

export const metadata: Metadata = {
  title: "Careers | Entrepôt Training Institute",
  description: "Explore career opportunities with Entrepôt Training Institute in training, consulting and learner support.",
};

const paths = [
  ["01", "Trainers & facilitators", "Bring practical industry experience into engaging, outcome-focused learning experiences."],
  ["02", "Learning & career consultants", "Help professionals and organisations identify the right pathway for their goals."],
  ["03", "Operations & support", "Create seamless learner journeys through thoughtful coordination and dependable service."],
];

export default function CareersPage() {
  return <main><SiteHeader/><section className="editorial-page-hero careers-page-hero"><div><span>Careers at Entrepôt</span><h1>Do meaningful work.<br/><em>Help people grow.</em></h1><p>Join a team committed to practical learning, professional excellence and lasting human impact.</p><a className="btn-gold" href="mailto:careers@entrepot.ae?subject=Career opportunity at Entrepot Training Institute">Share your profile <i>↗</i></a></div><aside><small>People / Purpose</small><strong>Build capability for what comes next.</strong></aside></section><section className="editorial-intro section-pad"><div><span>Work with us</span><h2>Expertise meets purpose.</h2></div><div><p className="lead">We value people who are curious, dependable and generous with what they know.</p><p>Whether you are an experienced trainer, a consultative relationship-builder or an operations professional, Entrepôt offers the opportunity to contribute to learning that makes a practical difference.</p></div></section><section className="feature-panel-grid section-pad">{paths.map(([no,title,text])=><article key={no}><span>{no}</span><h2>{title}</h2><p>{text}</p><i>↗</i></article>)}</section><section className="editorial-cta"><div><span>Expressions of interest</span><h2>Bring your experience to Entrepôt.</h2></div><div><p>Email your CV and a short introduction. We review profiles against current and upcoming requirements and contact suitable candidates.</p><a className="btn-gold" href="mailto:careers@entrepot.ae?subject=Career opportunity at Entrepot Training Institute">careers@entrepot.ae <i>↗</i></a></div></section><SiteFooter/></main>;
}
