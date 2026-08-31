"use client";
/* eslint-disable @next/next/no-html-link-for-pages */

import { FormEvent, useEffect, useState } from "react";
import { AboutMenu, CorporateMenu, EnquiryLeadButton, FacebookLink, InstagramLink, InsightsMenu, LinkedInLink, ProgramMenu, SiteFooter, WhatsAppLink, YouTubeLink } from "./components";

const programs = [
  { no: "01", slug: "leadership-management", title: "Leadership & Management", image:"/images/course-leadership.png", text: "Build decisive leaders who inspire teams, navigate change and deliver measurable outcomes.", meta: "12 WEEKS · HYBRID" },
  { no: "02", slug: "professional-excellence", title: "Professional Excellence", image:"/images/course-professional-excellence.png", text: "Master communication, executive presence and the practical skills that distinguish exceptional professionals.", meta: "8 WEEKS · IN-PERSON" },
  { no: "03", slug: "business-entrepreneurship", title: "Business & Entrepreneurship", image:"/images/course-entrepreneurship.png", text: "Turn ambitious ideas into resilient ventures through strategy, finance and market-led execution.", meta: "16 WEEKS · HYBRID" },
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
    data.append("_subject","New website programme enquiry");
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
          <a href="/student-registration" className="register-nav-link" onClick={() => setMenuOpen(false)}>Register Now</a>
          <div className="nav-socials"><InstagramLink/><LinkedInLink/><YouTubeLink/><FacebookLink/><WhatsAppLink/></div>
          <EnquiryLeadButton/>
        </nav>
      </header>

      <section id="top" className="hero">
        <div className="hero-photo" aria-hidden="true"/>
        <div className="hero-orb orb-one"/><div className="hero-orb orb-two"/>
        <div className="hero-content">
          <p className="eyebrow"><i/> Gateway to Excellence</p>
          <h1 className="hero-career-title">
            Practical Training That Builds Skills,<br/>
            Advances Careers and <em>Strengthens Organizations.</em>
          </h1>
          <p className="hero-copy">Elevated learning experiences designed for professionals who are ready to lead with clarity, confidence and purpose.</p>
          <div className="hero-actions">
            <a href="/programs" className="btn-gold">Explore programs <span>↗</span></a>
            <a href="#about" className="text-link">Discover our story <span>→</span></a>
          </div>
        </div>
        <div className="hero-note">
          <span>EST.</span><strong>2010</strong><small>Part of Entrepôt Group</small>
        </div>
        <div className="scroll-mark"><span>SCROLL</span><i/></div>
      </section>

      <section id="about" className="manifesto section-pad">
        <div className="section-kicker">01 / Our Philosophy</div>
        <div className="manifesto-grid">
          <h2>Education that<br/><em>moves you forward.</em></h2>
          <div>
            <p className="lead">We believe real learning changes more than what you know. It changes how you think, decide and lead.</p>
            <p>Entrepôt Training Institute brings together experienced practitioners, rigorous thinking and immersive learning to create development that stays with you long after the programme ends.</p>
            <div className="stats">
              <div><strong>Expert</strong><span>Practitioner-led learning</span></div>
              <div><strong>Applied</strong><span>Built for the real world</span></div>
              <div><strong>Personal</strong><span>Designed around growth</span></div>
            </div>
          </div>
        </div>
      </section>

      <section id="programs" className="programs section-pad">
        <div className="section-head">
          <div><div className="section-kicker light">02 / Signature Programs</div><h2>Choose your next<br/><em>chapter.</em></h2></div>
          <p>Focused programs. Lasting capability. Each journey is designed to turn insight into confident action.</p>
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
          <div className="section-kicker">03 / The Entrepôt Method</div>
          <h2>Learning, refined.</h2>
          <p>Our method creates space to question, practise and grow—connecting expert guidance with the realities of your work.</p>
          <div className="method-steps">
            <div><span>01</span><h3>Discover</h3><p>Clarify your goals and unlock a deeper understanding of where you are.</p></div>
            <div><span>02</span><h3>Develop</h3><p>Build capability through insight, practice and meaningful feedback.</p></div>
            <div><span>03</span><h3>Deliver</h3><p>Apply what you learn with confidence and create visible impact.</p></div>
          </div>
        </div>
        <blockquote>“The beautiful thing about learning is that no one can take it away from you.”<cite>— B.B. King</cite></blockquote>
      </section>

      <section id="accreditations" className="accreditations section-pad">
        <div className="accreditations-head">
          <div>
            <div className="section-kicker">04 / Accreditations &amp; Affiliations</div>
            <h2>Standards recognised.<br/><em>Connections that matter.</em></h2>
          </div>
          <p>Our quality standards and professional affiliations connect ETI with respected international and regional learning networks.</p>
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
            <div className="section-kicker">05 / Awards &amp; Recognition</div>
            <h2>Excellence,<br/><em>recognised.</em></h2>
          </div>
          <p>A dedicated showcase for verified honours, industry acknowledgements and milestones that reflect ETI&apos;s commitment to purposeful, career-focused learning.</p>
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
          <div className="section-kicker light">06 / Testimonials</div>
          <h2>Experiences that<br/><em>move people forward.</em></h2>
          <p>Discover what learners and organisations value about Entrepôt&apos;s practical, expert-led development programmes.</p>
          <div className="home-testimonial-quote"><span>“</span><blockquote>Learning that builds confidence, strengthens capability and creates visible workplace value.</blockquote></div>
          <a className="btn-gold" href="/testimonials">Explore Testimonials <span>↗</span></a>
        </div>
      </section>

      <section id="contact" className="contact section-pad">
        <div className="contact-copy">
          <div className="section-kicker light">07 / Begin Your Journey</div>
          <h2>Your next level<br/>starts <em>here.</em></h2>
          <p>Tell us where you want to go. Our programme advisors will help you find the learning experience that fits.</p>
          <a href="mailto:courses@entrepot.ae">courses@entrepot.ae <span>↗</span></a>
        </div>
        {sent ? (
          <div className="success"><span>✓</span><h3>Thank you.</h3><p>Your enquiry has been received. Our programme team will be in touch shortly.</p><button onClick={() => setSent(false)}>Send another enquiry</button></div>
        ) : (
          <form onSubmit={submit}>
            <label>Full name<input required name="name" placeholder="Your name" /></label>
            <label>Email address<input required type="email" name="email" placeholder="you@company.com" /></label>
            <label>I&apos;m interested in
              <select required value={program} onChange={(e) => setProgram(e.target.value)}>
                <option value="">Select a program</option>{programs.map(p => <option key={p.no}>{p.title}</option>)}<option>Corporate training</option>
              </select>
            </label>
            <label>Tell us about your goals<textarea name="message" placeholder="What would you like to achieve?" rows={3}/></label>
            {formError&&<p className="form-error" role="alert">We couldn&apos;t send your enquiry. Please email courses@entrepot.ae directly.</p>}
            <button className="btn-gold" type="submit" disabled={sending}>{sending?"Sending…":"Submit enquiry"} <span>↗</span></button>
          </form>
        )}
      </section>

      <SiteFooter/>
    </main>
  );
}
