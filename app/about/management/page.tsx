import {SiteFooter,SiteHeader} from "../../components";

export default function Management(){
  return <main>
    <SiteHeader/>
    <section className="people-hero" style={{backgroundImage:"linear-gradient(90deg,rgba(14,27,10,.97),rgba(14,27,10,.75) 56%,rgba(14,27,10,.18)),url('/images/course-leadership.png')"}}>
      <div>
        <div className="section-kicker light">About Us / Management</div>
        <h1>Stewardship for<br/><em>lasting impact.</em></h1>
        <p>Our management team sets the direction, standards and learning philosophy that guide every Entrepôt experience.</p>
      </div>
    </section>
    <section className="people-intro section-pad">
      <div><div className="section-kicker">Our leadership</div><h2>Quality with<br/>clear intent.</h2></div>
      <div><p className="lead">We believe professional learning should create visible value for people and organisations.</p><p>Management oversees programme quality, faculty standards and strategic partnerships while keeping learner outcomes at the centre. Through continuous review and improvement, we ensure our offer stays relevant, rigorous and responsive.</p></div>
    </section>
    <section className="management-profile section-pad" aria-labelledby="sajeev-gulati">
      <div className="management-portrait">
        <img src="/images/sajeev-gulati.jpg" alt="Sajeev Gulati, Chairman and Managing Director" decoding="async"/>
        <span>Executive Leadership</span>
      </div>
      <div className="management-profile-copy">
        <div className="section-kicker light">Chairman&apos;s Office</div>
        <span className="management-profile-index">01 / Leadership</span>
        <h2 id="sajeev-gulati">Sajeev<br/><em>Gulati</em></h2>
        <div className="management-role"><i/><p>Chairman &amp;<br/>Managing Director</p></div>
      </div>
    </section>
    <section className="management-profile management-profile-reverse management-profile-akriti section-pad" aria-labelledby="akriti-gulati">
      <div className="management-portrait">
        <img src="/images/akriti-gulati.jpg" alt="Akriti Gulati, Co-Founder and Director" decoding="async"/>
        <span>Executive Leadership</span>
      </div>
      <div className="management-profile-copy">
        <div className="section-kicker light">Director&apos;s Office</div>
        <span className="management-profile-index">02 / Leadership</span>
        <h2 id="akriti-gulati">Akriti<br/><em>Gulati</em></h2>
        <div className="management-role"><i/><p>Co-Founder &amp;<br/>Director</p></div>
      </div>
    </section>
    <section className="people-principles section-pad">
      <article><span>01</span><h3>Purpose</h3><p>A clear commitment to applied learning, professional growth and responsible impact.</p></article>
      <article><span>02</span><h3>Standards</h3><p>Strong governance across programme design, trainer selection and delivery quality.</p></article>
      <article><span>03</span><h3>Progress</h3><p>Continuous improvement informed by learner experience and changing workplace needs.</p></article>
    </section>
    <SiteFooter/>
  </main>
}
