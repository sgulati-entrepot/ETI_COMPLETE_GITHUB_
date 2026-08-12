import {SiteFooter,SiteHeader} from "../components";
import ContactLeadForm from "./ContactLeadForm";

const offices=[
  {city:"Dubai",region:"United Arab Emirates",address:"109, First Floor, Al Bannai Building, Plot No. 47, Al Nahda First, Dubai, United Arab Emirates",phones:[{label:"Mobile: +971 54 417 7480",href:"tel:+971544177480"},{label:"Landline: 04 342 3009",href:"tel:+97143423009"}],map:"https://www.google.com/maps?q=Al%20Bannai%20Building%20Al%20Nahda%20First%20Dubai&output=embed",open:"https://www.google.com/maps/search/?api=1&query=Al%20Bannai%20Building%20Al%20Nahda%20First%20Dubai"},
  {city:"Mumbai",region:"India",address:"910, 9th Floor, Hub Town Viva, Shankarwadi, Western Express Highway, Jogeshwari East, Mumbai 400 060",phones:[{label:"Phone: +91 99206 56666",href:"tel:+919920656666"}],map:"https://www.google.com/maps?q=Hubtown%20Viva%20Jogeshwari%20East%20Mumbai%20400060&output=embed",open:"https://www.google.com/maps/search/?api=1&query=Hubtown%20Viva%20Jogeshwari%20East%20Mumbai%20400060"}
];

export default function Contact(){
  return <main>
    <SiteHeader/>
    <section className="contact-page-hero">
      <div className="contact-page-hero-image" aria-hidden="true"/>
      <div className="contact-page-hero-copy">
        <div className="section-kicker light">Contact Us</div>
        <h1>Start a conversation.<br/><em>Shape what&apos;s next.</em></h1>
        <p>Speak with our programme team about professional certifications, corporate training or the right learning path for you.</p>
        <div className="contact-hero-actions">
          <a className="btn-gold" href="#lead-capture">Send an enquiry <span>↓</span></a>
          <a className="contact-instagram" href="https://www.instagram.com/entrepottraininginstitute/" target="_blank" rel="noopener noreferrer">Instagram @entrepottraininginstitute <span>↗</span></a>
        </div>
      </div>
    </section>
    <ContactLeadForm/>
    <section id="enquiry" className="contact-details section-pad">
      <div className="contact-details-head"><div className="section-kicker">Our offices</div><h2>Meet us in Dubai<br/>or Mumbai.</h2><p>For programme and corporate training enquiries, email <a href="mailto:courses@entrepot.ae">courses@entrepot.ae</a> or follow <a href="https://www.instagram.com/entrepottraininginstitute/" target="_blank" rel="noopener noreferrer">@entrepottraininginstitute</a>.</p></div>
      <div className="office-grid">{offices.map(o=><article className="office-card" key={o.city}><div className="office-card-copy"><span>{o.region}</span><h3>{o.city} Office</h3><address>{o.address}</address><div className="office-phones">{o.phones.map(p=><a href={p.href} key={p.href}>{p.label}</a>)}<a href="mailto:courses@entrepot.ae">courses@entrepot.ae</a><a href="https://www.instagram.com/entrepottraininginstitute/" target="_blank" rel="noopener noreferrer">@entrepottraininginstitute</a></div></div><iframe className="map-frame" title={`${o.city} office on Google Maps`} src={o.map} loading="lazy" referrerPolicy="no-referrer-when-downgrade"/><a className="map-link" href={o.open} target="_blank" rel="noreferrer">Open in Google Maps ↗</a></article>)}</div>
    </section>
    <SiteFooter/>
  </main>
}
