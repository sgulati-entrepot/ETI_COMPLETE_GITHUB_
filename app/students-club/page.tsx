import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "../components";

export const metadata: Metadata = {
  title: "Student's Club | Entrepôt Training Institute",
  description: "A connected learning community for Entrepôt students, alumni and future professionals.",
};

const benefits = [
  ["01", "Connect", "Build meaningful relationships with fellow learners, alumni and professionals across industries."],
  ["02", "Grow", "Join practical workshops, conversations and activities that extend learning beyond the classroom."],
  ["03", "Contribute", "Share ideas, celebrate achievements and help create a supportive professional community."],
];

export default function StudentsClubPage() {
  return <main className="community-page"><SiteHeader/><section className="editorial-page-hero club-page-hero"><div><span>Entrepôt community</span><h1>Student&apos;s Club.<br/><em>Learn. Connect. Belong.</em></h1><p>A place for our learners to exchange ideas, grow their networks and remain connected throughout their professional journey.</p><Link className="btn-gold" href="/student-registration">Join the community <i>↗</i></Link></div><aside><small>ETI / Community</small><strong>Together, learning goes further.</strong></aside></section><section className="editorial-intro section-pad"><div><span>Beyond the classroom</span><h2>A community shaped around ambition.</h2></div><div><p className="lead">Learning becomes more powerful when people have a place to connect, exchange perspectives and support one another.</p><p>The Student&apos;s Club brings together current learners and alumni through professional conversations, collaborative experiences and opportunities to celebrate progress.</p></div></section><section className="feature-panel-grid section-pad">{benefits.map(([no,title,text])=><article key={no}><span>{no}</span><h2>{title}</h2><p>{text}</p><i>↗</i></article>)}</section><section className="editorial-cta"><div><span>Become part of ETI</span><h2>Your next connection could shape your next opportunity.</h2></div><div><p>Register your interest and our team will keep you informed about Student&apos;s Club activities and learning opportunities.</p><Link className="btn-gold" href="/contact">Contact our team <i>↗</i></Link></div></section><SiteFooter/></main>;
}
