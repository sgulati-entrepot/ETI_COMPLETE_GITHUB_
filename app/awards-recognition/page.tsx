import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../components";

export const metadata: Metadata = {
  title: "Awards & Recognition | Entrepôt Training Institute",
  description: "Explore Entrepôt Training Institute's recognition portfolio, institutional milestones and commitment to professional learning excellence."
};

const recognition = [
  {
    no: "01",
    label: "Academic Partnership",
    title: "Collaboration that expands opportunity.",
    text: "A partnership milestone with Yenepoya University, connecting professional learning with meaningful academic collaboration.",
    image: "/images/award-yenepoya-partnership.jpg",
    alt: "Entrepôt representatives and Yenepoya University leaders marking an academic partnership"
  },
  {
    no: "02",
    label: "Institutional Excellence",
    title: "Standards that inspire confidence.",
    text: "Recognition of the quality, consistency and professional rigour that shape every Entrepôt learning experience.",
    image: "/images/award-institutional-excellence.png",
    alt: "Gold recognition trophy in an elegant ceremonial setting"
  },
  {
    no: "03",
    label: "Learner Impact",
    title: "Progress that creates momentum.",
    text: "Acknowledging outcomes that help learners build practical capability, professional confidence and meaningful career value.",
    image: "/images/award-learner-impact.png",
    alt: "Professional learner receiving a completion certificate"
  }
];

export default function AwardsRecognitionPage(){return <main className="awards-page"><SiteHeader/>
  <section className="awards-page-hero">
    <div className="awards-page-hero-image"/>
    <div className="awards-page-hero-copy"><div className="section-kicker light">Awards &amp; Recognition</div><h1>A standard of<br/><em>excellence.</em></h1><p>A growing record of verified honours, industry acknowledgements and milestones that reflect our commitment to purposeful learning.</p></div>
    <span className="awards-page-mark">ETI · GATEWAY TO EXCELLENCE</span>
  </section>
  <section className="awards-page-intro section-pad"><div><span>Recognition Portfolio</span><h2>Credibility earned<br/>through meaningful work.</h2></div><div><p className="lead">For ETI, recognition is not the destination. It is evidence of the standards we bring to every learner, programme and professional partnership.</p><p>This portfolio is designed to present verified awards and acknowledgements with clarity—identifying the awarding organisation, recognition title and year as each milestone is formally published.</p></div></section>
  <section className="awards-page-gallery">{recognition.map((item,i)=><article className={i%2?"award-feature award-feature-reverse":"award-feature"} key={item.no}><figure><img src={item.image} alt={item.alt} loading="lazy"/><span>{item.no}</span></figure><div><small>{item.label}</small><h2>{item.title}</h2><p>{item.text}</p><div className="award-verification"><span>Recognition record</span><strong>Verified details to be published</strong></div></div></article>)}</section>
  <section className="awards-principles section-pad"><div className="section-kicker light">Our Recognition Standard</div><div><article><span>01</span><h3>Verified</h3><p>Every formal listing will identify its awarding body, title and year.</p></article><article><span>02</span><h3>Relevant</h3><p>Recognition will connect directly to learning quality, learner outcomes or industry contribution.</p></article><article><span>03</span><h3>Transparent</h3><p>Milestones will be presented clearly and without overstating their scope.</p></article></div></section>
  <section className="awards-page-cta"><div><span>Gateway to Excellence</span><h2>Build capability that<br/>earns recognition.</h2></div><div><p>Speak with our programme team about professional certification, corporate learning and upcoming cohorts.</p><a className="btn-gold" href="mailto:courses@entrepot.ae?subject=Awards and Recognition Enquiry">Contact our team <span>↗</span></a></div></section>
  <SiteFooter/>
</main>}
