"use client";
/* eslint-disable @next/next/no-html-link-for-pages */

import { FormEvent, useEffect, useState } from "react";
import { AboutMenu, CAMSRegistrationLeadButton, CorporateMenu, EnquiryLeadButton, FacebookLink, InstagramLink, InsightsMenu, LinkedInLink, ProgramMenu, SiteFooter, WhatsAppLink, YouTubeLink } from "./components";

const programs = [
  { no: "01", slug: "leadership-management", title: "Leadership & Management", image:"/images/course-leadership.png", text: "Strengthen the judgement, communication and people-leadership capabilities your organisation needs next.", meta: "12 WEEKS · HYBRID" },
  { no: "02", slug: "professional-excellence", title: "Professional Excellence", image:"/images/course-professional-excellence.png", text: "Build confident communication, executive presence and practical effectiveness across professional teams.", meta: "8 WEEKS · IN-PERSON" },
  { no: "03", slug: "business-entrepreneurship", title: "Business & Entrepreneurship", image:"/images/course-entrepreneurship.png", text: "Develop stronger commercial thinking, ownership and execution for people responsible for growth.", meta: "16 WEEKS · HYBRID" },
];

const clientLogos = [
  { name: "Yenepoya University", image: "/images/client-yenepoya-university.png" },
  { name: "Philips Healthcare", image: "/images/client-philips-healthcare.png" },
  { name: "Kenya Civil Aviation Authority", image: "/images/client-kenya-civil-aviation-authority.png" },
  { name: "Water Engineers", image: "/images/client-water-engineers.png" },
  { name: "Trip Planners", image: "/images/client-trip-planners.png" },
  { name: "Skyline", image: "/images/client-skyline.png" },
  { name: "HSNC Board", image: "/images/client-hsnc-board.png" },
  { name: "Signify", image: "/images/client-signify.png" },
];

const optimizedImage = (src: string, width = 900, quality = 76) => `/.netlify/images?url=${src}&w=${width}&q=${quality}`;

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState(false);
  const [program, setProgram] = useState("");

  useEffect(() => {
    if (!menuOpen) return;
    document.body.classList.add("mobile-nav-open");
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.classList.remove("mobile-nav-open");
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setFormError(false);
    const form=e.currentTarget;
    const data=new FormData(form);
    data.append("Lead source","Main website homepage");
    data.append("_subject","New homepage L&D training enquiry");
    data.append("_template","table");
    data.append("_captcha","false");
    try{
      const response=await fetch("https://formsubmit.co/ajax/courses@entrepot.ae",{method:"POST",headers:{Accept:"application/json"},body:data});
      if(!response.ok)throw new Error("Submission failed");
      form.reset();setProgram("");setSent(true);
    }catch{setFormError(true)}finally{setSending(false)}
  }

  return (
    <main>
      <header className={menuOpen ? "nav-shell mobile-menu-open" : "nav-shell"}>
        <a href="#top" className="brand" aria-label="Entrepôt home">
          <img src="/entrepot-logo-transparent.png" alt="Entrepôt Training Institute" />
        </a>
        <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="home-navigation">
          <span/><span/>
        </button>
        <nav id="home-navigation" className={menuOpen ? "open" : ""} aria-label="Main navigation" onClick={(event) => { if ((event.target as HTMLElement).closest("a, .enquiry-lead-button")) setMenuOpen(false); }}>
          <AboutMenu/>
          <ProgramMenu/>
          <CorporateMenu/>
          <InsightsMenu/>
          <a href="/contact" onClick={() => setMenuOpen(false)}>Contact Us</a>
          <CAMSRegistrationLeadButton/>
          <a href="/student-registration" className="register-nav-link" onClick={() => setMenuOpen(false)}>Register Now</a>
          <div className="nav-socials"><InstagramLink/><LinkedInLink/><YouTubeLink/><FacebookLink/><WhatsAppLink/></div>
          <EnquiryLeadButton/>
        </nav>
      </header>

      <section id="top" className="hero">
        <div className="hero-photo" aria-hidden="true"/>
        <div className="hero-orb orb-one"/><div className="hero-orb orb-two"/>
        <div className="hero-content">
          <p className="eyebrow"><i/> Corporate learning for ambitious organisations</p>
          <h1 className="hero-career-title">
            Turn workforce capability into<br/>
            <em>business performance.</em>
          </h1>
          <p className="hero-copy">Customised, practitioner-led training for L&amp;D leaders who need learning aligned to business priorities, relevant to work and credible with stakeholders.</p>
          <div className="hero-actions">
            <a href="#contact" className="btn-gold">Request a tailored recommendation <span>↗</span></a>
            <a href="/customised-corporate-training" className="text-link">Explore corporate solutions <span>→</span></a>
          </div>
        </div>
        <div className="hero-note">
          <span>EST.</span><strong>2010</strong><small>Part of Entrepôt Group</small>
        </div>
        <div className="scroll-mark"><span>SCROLL</span><i/></div>
      </section>

      <section id="about" className="manifesto section-pad">
        <div className="section-kicker">01 / Built for L&amp;D leaders</div>
        <div className="manifesto-grid">
          <h2>A learning partner<br/><em>your stakeholders can trust.</em></h2>
          <div>
            <p className="lead">Bring us the business priority. We help you turn it into a focused learning response for the people who must deliver it.</p>
            <p>Entrepôt combines practitioner expertise, relevant application and flexible delivery to help L&amp;D teams build credible programmes around real capability gaps—not generic course requests.</p>
            <div className="stats">
              <div><strong>Aligned</strong><span>To your business priority</span></div>
              <div><strong>Applied</strong><span>To the realities of work</span></div>
              <div><strong>Adaptable</strong><span>To teams and locations</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="client-proof section-pad" aria-labelledby="client-proof-title">
        <div className="client-proof-copy">
          <div className="section-kicker">Selected organisations</div>
          <h2 id="client-proof-title">Learning delivered.<br/><em>Confidence earned.</em></h2>
          <p>Selected organisations where ETI has successfully delivered professional learning—across education, healthcare, aviation, engineering and travel.</p>
        </div>
        <div className="client-logo-grid">
          {clientLogos.map((client,index) => <figure key={client.name}><span>{String(index+1).padStart(2,"0")}</span><img src={client.image} alt={client.name} loading="lazy" decoding="async"/><figcaption>{client.name}</figcaption></figure>)}
        </div>
      </section>

      <section id="programs" className="programs section-pad">
        <div className="section-head">
          <div><div className="section-kicker light">02 / Capability priorities</div><h2>Start with what your<br/><em>business needs next.</em></h2></div>
          <p>Explore high-impact learning areas or brief us on the capability gap you need to address across your organisation.</p>
        </div>
        <div className="program-list">
          {programs.map((item) => (
            <article key={item.no}>
              <img className="program-thumb" src={optimizedImage(item.image, 720)} alt="" loading="lazy" decoding="async"/>
              <span className="number">{item.no}</span>
              <div className="program-title"><h3>{item.title}</h3><small>{item.meta}</small></div>
              <p>{item.text}</p>
              <a className="program-arrow" href={`/programs/${item.slug}`} aria-label={`View ${item.title}`}>↗</a>
            </article>
          ))}
        </div>
      </section>

      <section id="method" className="method section-pad">
        <div className="method-card">
          <div className="section-kicker">03 / From brief to application</div>
          <h2>A clearer route from need to impact.</h2>
          <p>Our approach keeps the programme connected to the business priority, learner context and workplace outcome it was designed to support.</p>
          <div className="method-steps">
            <div><span>01</span><h3>Diagnose</h3><p>Clarify the priority, audience, capability gap and the evidence of success stakeholders need.</p></div>
            <div><span>02</span><h3>Design</h3><p>Shape content, cases, activities and delivery around your organisation and operating context.</p></div>
            <div><span>03</span><h3>Deliver</h3><p>Create practical learning that builds confidence and supports application beyond the classroom.</p></div>
          </div>
        </div>
        <blockquote>“Learning earns its place when people can use it—and the business can see why it matters.”<cite>— The Entrepôt approach</cite></blockquote>
      </section>

      <section id="accreditations" className="accreditations section-pad">
        <div className="accreditations-head">
          <div>
            <div className="section-kicker">04 / Quality signals</div>
            <h2>Confidence backed by<br/><em>credible standards.</em></h2>
          </div>
          <p>ETI&apos;s quality standards and professional affiliations help L&amp;D teams choose a learning partner with recognised regional and international connections.</p>
        </div>
        <div className="accreditation-grid">
          <article>
            <span>01</span>
            <div className="accreditation-logo"><img src={optimizedImage("/images/accreditation-iso-9001-transparent.png", 420)} alt="IAF ISO 9001:2015 certification logo" loading="lazy" decoding="async"/></div>
            <p>ISO 9001:2015</p>
          </article>
          <article>
            <span>02</span>
            <div className="accreditation-logo"><img src={optimizedImage("/images/affiliation-dubai-knowledge-transparent.png", 520)} alt="Dubai Knowledge logo" loading="lazy" decoding="async"/></div>
            <p>Dubai Knowledge</p>
          </article>
          <article>
            <span>03</span>
            <div className="accreditation-logo"><img src={optimizedImage("/images/accreditation-cpd-transparent.png", 420)} alt="CPD Standards Office accredited course logo" loading="lazy" decoding="async"/></div>
            <p>CPD Standards Office</p>
          </article>
          <article>
            <span>04</span>
            <div className="accreditation-logo"><img src={optimizedImage("/images/affiliation-cilt-transparent.png", 620)} alt="The Chartered Institute of Logistics and Transport logo" loading="lazy" decoding="async"/></div>
            <p>Chartered Institute of Logistics &amp; Transport</p>
          </article>
          <article>
            <span>05</span>
            <div className="accreditation-logo"><img src={optimizedImage("/images/affiliation-ifpsm-transparent.png", 640)} alt="International Federation of Purchasing and Supply Management logo" loading="lazy" decoding="async"/></div>
            <p>International Federation of Purchasing &amp; Supply Management</p>
          </article>
        </div>
      </section>

      <section id="awards" className="awards-recognition section-pad">
        <div className="awards-heading">
          <div>
            <div className="section-kicker">05 / Partnerships &amp; recognition</div>
            <h2>A learning partner built<br/><em>for lasting value.</em></h2>
          </div>
          <p>Explore the partnerships, acknowledgements and milestones that reflect ETI&apos;s commitment to rigorous, practical professional learning.</p>
        </div>
        <div className="awards-stage">
          <article>
            <span className="award-index">01</span>
            <figure className="award-photo award-photo-partnership"><img src={optimizedImage("/images/award-yenepoya-partnership.jpg", 760)} alt="Entrepôt representatives and Yenepoya University leaders marking an academic partnership" loading="lazy" decoding="async"/></figure>
            <div><small>Academic Partnership</small><h3>Collaboration that expands opportunity.</h3><p>A partnership milestone with Yenepoya University, connecting professional learning with academic collaboration.</p></div>
          </article>
          <article>
            <span className="award-index">02</span>
            <figure className="award-photo"><img src={optimizedImage("/images/award-institutional-excellence.png", 760)} alt="Gold recognition trophy in an elegant ceremonial setting" loading="lazy" decoding="async"/></figure>
            <div><small>Institutional Excellence</small><h3>Standards that inspire confidence.</h3><p>Recognition of the quality, consistency and professional rigour behind every ETI learning experience.</p></div>
          </article>
          <article>
            <span className="award-index">03</span>
            <figure className="award-photo"><img src={optimizedImage("/images/award-learner-impact.png", 760)} alt="Professional learner receiving a completion certificate" loading="lazy" decoding="async"/></figure>
            <div><small>Learner Impact</small><h3>Progress that creates momentum.</h3><p>Acknowledging outcomes that help learners build capability, confidence and meaningful career value.</p></div>
          </article>
        </div>
        <p className="awards-note">Verified award titles, awarding bodies and dates will be added as the recognition portfolio is published.</p>
        <a className="awards-page-link" href="/awards-recognition">Explore Awards &amp; Recognition <span>↗</span></a>
      </section>

      <section id="testimonials" className="home-testimonials section-pad">
        <div className="home-testimonials-image" aria-hidden="true"/>
        <div className="home-testimonials-copy">
          <div className="section-kicker light">06 / Learner experience</div>
          <h2>Practical learning your<br/><em>people will value.</em></h2>
          <p>See what learners and organisations say about Entrepôt&apos;s relevance, practitioner expertise and professional learning experience.</p>
          <div className="home-testimonial-quote"><span>“</span><blockquote>Learning designed to build confidence, strengthen capability and support visible workplace application.</blockquote></div>
          <a className="btn-gold" href="/testimonials">Explore Testimonials <span>↗</span></a>
        </div>
      </section>

      <section id="contact" className="contact section-pad">
        <div className="contact-copy">
          <div className="section-kicker light">07 / Share your learning brief</div>
          <h2>Turn your next priority<br/>into a <em>practical plan.</em></h2>
          <p>Tell us what your organisation needs to strengthen. An ETI corporate learning specialist will help you identify a relevant programme, delivery format and next step.</p>
          <a href="mailto:courses@entrepot.ae">courses@entrepot.ae <span>↗</span></a>
        </div>
        {sent ? (
          <div className="success"><span>✓</span><h3>Your training brief is with us.</h3><p>Our corporate learning team will review your requirements and contact you to discuss the right next step.</p><button onClick={() => setSent(false)}>Send another enquiry</button></div>
        ) : (
          <form onSubmit={submit}>
            <label>Full name<input required name="name" autoComplete="name" placeholder="Your name" /></label>
            <label>Work email<input required type="email" name="email" autoComplete="email" placeholder="you@company.com" /></label>
            <label>Organisation<input required name="organisation" autoComplete="organization" placeholder="Company name" /></label>
            <label>Priority learning area
              <select required name="interest" value={program} onChange={(e) => setProgram(e.target.value)}>
                <option value="">Select a priority area</option><option>Customised corporate training</option>{programs.map(p => <option key={p.no}>{p.title}</option>)}<option>Other / Not sure yet</option>
              </select>
            </label>
            <label>What should this training help your people achieve?<textarea name="message" placeholder="Audience, capability gap, business objective or preferred delivery format" rows={3}/></label>
            {formError&&<p className="form-error" role="alert">We couldn&apos;t send your enquiry. Please email courses@entrepot.ae directly.</p>}
            <button className="btn-gold" type="submit" disabled={sending}>{sending?"Sending…":"Request a tailored recommendation"} <span>↗</span></button>
            <small>No generic mailing lists. Your details are used only to respond to this training enquiry.</small>
          </form>
        )}
      </section>

      <SiteFooter/>
    </main>
  );
}
