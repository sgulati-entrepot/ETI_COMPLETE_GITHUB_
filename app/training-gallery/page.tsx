import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../components";
import { optimizedBackground, optimizedImage } from "../image";
import TestimonialVideoGallery from "../TestimonialVideoGallery";

export const metadata: Metadata = {
  title: "Training Gallery | Entrepôt Training Institute",
  description: "Explore the professional learning environments, specialist disciplines and collaborative experiences that shape training at Entrepôt Training Institute.",
};

const gallery = [
  { title: "Aviation & Ground Operations", category: "Specialist Training", image: "/images/airport-ramp-services-hero.jpg", alt: "Airport ground operations and aviation training environment", caption: "Industry-relevant learning grounded in operational standards and safety." },
  { title: "Academic Partnerships", category: "Learning Community", image: "/images/award-yenepoya-partnership.jpg", alt: "Entrepôt representatives with academic partnership leaders", caption: "Professional relationships that widen access to meaningful learning." },
];

const airTransportationPhotos = [
  { image: "/images/training-air-transportation-graduates.jpeg", alt: "Graduates and facilitators celebrating completion of the Air Transportation Handling programme" },
  { image: "/images/training-air-transportation-certificate-01.jpeg", alt: "Air Transportation Handling graduate receiving her completion certificate" },
  { image: "/images/training-air-transportation-certificate-02.jpeg", alt: "Air Transportation Handling graduate presented with her certificate" },
  { image: "/images/training-air-transportation-certificate-03.jpeg", alt: "Graduate celebrating successful Air Transportation Handling course completion" },
  { image: "/images/training-air-transportation-certificate-04.jpeg", alt: "Air Transportation Handling graduate holding her completion certificate" },
  { image: "/images/training-air-transportation-graduates-wide.jpeg", alt: "Overseas Air Transportation Handling batch with Entrepôt facilitators" },
];

const airComplaintsPhotos = [
  { image: "/images/training-air-complaints-graduates.jpeg", alt: "Air Transportation Complaints Handling graduates with facilitators and corporate representatives" },
  { image: "/images/training-air-complaints-facilitation-01.jpeg", alt: "Entrepôt facilitator presenting during the Air Transportation Complaints Handling programme" },
  { image: "/images/training-air-complaints-facilitation-02.jpeg", alt: "Facilitator leading an Air Transportation Complaints Handling learning session" },
  { image: "/images/training-air-complaints-celebration.jpeg", alt: "Graduate and programme team celebrating successful course completion" },
  { image: "/images/training-air-complaints-certificate.jpeg", alt: "Air Transportation Complaints Handling graduate receiving her completion certificate" },
  { image: "/images/training-air-complaints-cohort.jpeg", alt: "Overseas Air Transportation Complaints Handling cohort and programme facilitators" },
];

const cffpBatchPhotos = [
  { image: "/images/training-cffp-55-certificate-01.jpeg", alt: "CFFP Batch No. 55 graduate receiving her Certificate of Achievement" },
  { image: "/images/training-cffp-55-presentation.jpeg", alt: "CFFP Batch No. 55 programme completion presentation" },
  { image: "/images/training-cffp-55-certificate-02.jpeg", alt: "CFFP Batch No. 55 graduate presented with his Certificate of Achievement" },
  { image: "/images/training-cffp-55-certificate-03.jpeg", alt: "Certified Freight Forwarding Professional graduate with her certificate" },
  { image: "/images/training-cffp-55-completion.jpeg", alt: "CFFP Batch No. 55 learners and Entrepôt representatives celebrating completion" },
];

const airFacilitationPhotos = [
  { image: "/images/training-air-facilitation-cohort-outdoor.jpeg", alt: "Overseas Facilitation in Air Transportation Handling cohort with Entrepôt facilitators" },
  { image: "/images/training-air-facilitation-session-01.jpeg", alt: "Facilitator teaching the key pillars of air transportation facilitation" },
  { image: "/images/training-air-facilitation-session-02.jpeg", alt: "Interactive Air Transportation Handling facilitation session" },
  { image: "/images/training-air-facilitation-cohort-indoor.jpeg", alt: "Air Transportation Handling learners and programme facilitators" },
  { image: "/images/training-air-facilitation-group.jpeg", alt: "Programme participants celebrating the overseas learning experience" },
  { image: "/images/training-air-facilitation-certificate.jpeg", alt: "Facilitation in Air Transportation Handling graduate receiving his certificate" },
  { image: "/images/training-air-facilitation-completion.jpeg", alt: "Air Transportation Handling graduates celebrating programme completion" },
];

const tarmacToAirPhotos = [
  { image: "/images/training-tarmac-to-air-classroom.jpeg", alt: "Tarmac to Air learners participating in a practical aviation classroom session" },
  { image: "/images/training-tarmac-to-air-facilitator-01.jpeg", alt: "Tarmac to Air facilitator presenting aviation, airport and travel pathways" },
  { image: "/images/training-tarmac-to-air-facilitator-02.jpeg", alt: "Tarmac to Air facilitator engaging learners during the aviation programme" },
  { image: "/images/training-tarmac-to-air-certificate-01.jpeg", alt: "Tarmac to Air learner receiving her Certificate of Participation" },
  { image: "/images/training-tarmac-to-air-certificate-02.jpeg", alt: "Tarmac to Air learner presented with his Certificate of Participation" },
  { image: "/images/training-tarmac-to-air-certificate-03.jpeg", alt: "Tarmac to Air learner celebrating successful programme completion" },
];

export default function TrainingGalleryPage() {
  return <main className="training-gallery-page">
    <SiteHeader/>
    <section className="training-gallery-hero" style={{ backgroundImage: `${optimizedBackground("/images/training-gallery-hero-v2.jpg", 1920, 82)}` }}>
      <div>
        <span>Training Gallery</span>
        <h1>Learning that feels<br/><em>alive.</em></h1>
        <p>Explore the environments, specialist disciplines and collaborative moments that shape the Entrepôt learning experience.</p>
      </div>
      <aside><span>01</span><p>Practical learning.<br/>Professional impact.</p></aside>
    </section>

    <section className="training-gallery-intro section-pad">
      <div className="section-kicker">A visual perspective</div>
      <div>
        <h2>Designed for participation.<br/><em>Built for application.</em></h2>
        <p>From executive development and communication to technology, aviation and business skills, each learning environment is designed to encourage confidence, participation and relevant workplace application.</p>
      </div>
    </section>

    <TestimonialVideoGallery context="gallery"/>

    <section className="training-gallery-feature section-pad" aria-labelledby="air-transportation-gallery-title">
      <div className="training-gallery-feature-head">
        <div>
          <span>Programme completion / Overseas delivery</span>
          <h2 id="air-transportation-gallery-title">Air Transportation<br/><em>Handling.</em></h2>
        </div>
        <div>
          <strong>Successfully completed</strong>
          <p>We are proud to have successfully completed an overseas batch of Air Transportation Handling for one of our esteemed corporate clients.</p>
        </div>
      </div>
      <div className="training-gallery-feature-grid">
        {airTransportationPhotos.map((photo, index) => <figure className={`training-gallery-feature-photo feature-photo-${index + 1}`} key={photo.image}>
          <img src={optimizedImage(photo.image, index === 0 || index === 5 ? 1200 : 720, 84)} alt={photo.alt} loading={index < 2 ? "eager" : "lazy"} decoding="async"/>
          <figcaption><span>{String(index + 1).padStart(2, "0")}</span>{index === 0 ? "Celebrating achievement" : index === 5 ? "The overseas cohort" : "Certificate presentation"}</figcaption>
        </figure>)}
      </div>
    </section>

    <section className="training-gallery-feature training-gallery-feature-light section-pad" aria-labelledby="air-complaints-gallery-title">
      <div className="training-gallery-feature-head">
        <div>
          <span>Programme completion / Overseas delivery</span>
          <h2 id="air-complaints-gallery-title">Air Transportation<br/><em>Complaints Handling.</em></h2>
        </div>
        <div>
          <strong>Successfully completed</strong>
          <p>We are proud to have successfully completed an overseas batch of Air Transportation Complaints Handling for one of our esteemed corporate clients.</p>
        </div>
      </div>
      <div className="training-gallery-feature-grid training-gallery-complaints-grid">
        {airComplaintsPhotos.map((photo, index) => <figure className={`training-gallery-feature-photo feature-photo-${index + 1}`} key={photo.image}>
          <img src={optimizedImage(photo.image, index === 0 || index === 5 ? 1200 : 720, 82)} alt={photo.alt} loading={index < 2 ? "eager" : "lazy"} decoding="async"/>
          <figcaption><span>{String(index + 1).padStart(2, "0")}</span>{index === 0 ? "Celebrating achievement" : index === 5 ? "The overseas cohort" : index < 3 ? "Learning in action" : "Programme completion"}</figcaption>
        </figure>)}
      </div>
    </section>

    <section className="training-gallery-feature section-pad" aria-labelledby="cffp-gallery-title">
      <div className="training-gallery-feature-head">
        <div>
          <span>Programme completion / Batch No. 55</span>
          <h2 id="cffp-gallery-title">Certified Freight Forwarding<br/><em>Professional.</em></h2>
        </div>
        <div>
          <strong>Successfully completed</strong>
          <p>We are proud to have successfully completed Batch No. 55 of the Certified Freight Forwarding Professional (CFFP) programme.</p>
        </div>
      </div>
      <div className="training-gallery-feature-grid training-gallery-cffp-grid">
        {cffpBatchPhotos.map((photo, index) => <figure className={`training-gallery-feature-photo feature-photo-${index + 1}`} key={photo.image}>
          <img src={optimizedImage(photo.image, index === 4 ? 1100 : 720, 84)} alt={photo.alt} loading={index < 2 ? "eager" : "lazy"} decoding="async"/>
          <figcaption><span>{String(index + 1).padStart(2, "0")}</span>{index === 4 ? "Celebrating Batch No. 55" : "Certificate presentation"}</figcaption>
        </figure>)}
      </div>
    </section>

    <section className="training-gallery-feature training-gallery-feature-light section-pad" aria-labelledby="air-facilitation-gallery-title">
      <div className="training-gallery-feature-head">
        <div>
          <span>Programme completion / Overseas delivery</span>
          <h2 id="air-facilitation-gallery-title">Facilitation in Air<br/><em>Transportation Handling.</em></h2>
        </div>
        <div>
          <strong>Successfully completed</strong>
          <p>We are proud to have successfully completed an overseas batch of Facilitation in Air Transportation Handling for one of our esteemed corporate clients.</p>
        </div>
      </div>
      <div className="training-gallery-feature-grid training-gallery-facilitation-grid">
        {airFacilitationPhotos.map((photo, index) => <figure className={`training-gallery-feature-photo feature-photo-${index + 1}`} key={photo.image}>
          <img src={optimizedImage(photo.image, index === 0 || index === 3 ? 1200 : 760, 82)} alt={photo.alt} loading={index < 2 ? "eager" : "lazy"} decoding="async"/>
          <figcaption><span>{String(index + 1).padStart(2, "0")}</span>{index === 0 ? "The overseas cohort" : index < 3 ? "Learning in action" : index < 5 ? "Collaborative learning" : "Programme completion"}</figcaption>
        </figure>)}
      </div>
    </section>

    <section className="training-gallery-feature section-pad" aria-labelledby="tarmac-to-air-gallery-title">
      <div className="training-gallery-feature-head">
        <div>
          <span>Programme completion / Aviation learning</span>
          <h2 id="tarmac-to-air-gallery-title">Tarmac<br/><em>to Air.</em></h2>
        </div>
        <div>
          <strong>Successfully completed</strong>
          <p>We are proud to have successfully completed a batch of the Tarmac to Air programme.</p>
        </div>
      </div>
      <div className="training-gallery-feature-grid training-gallery-tarmac-grid">
        {tarmacToAirPhotos.map((photo, index) => <figure className={`training-gallery-feature-photo feature-photo-${index + 1}`} key={photo.image}>
          <img src={optimizedImage(photo.image, index === 0 ? 1200 : 760, 84)} alt={photo.alt} loading={index < 2 ? "eager" : "lazy"} decoding="async"/>
          <figcaption><span>{String(index + 1).padStart(2, "0")}</span>{index === 0 ? "Learning in action" : index < 3 ? "Expert facilitation" : "Certificate presentation"}</figcaption>
        </figure>)}
      </div>
    </section>

    <section className="training-gallery-mosaic section-pad" aria-label="Entrepôt training gallery">
      {gallery.map((item, index) => <figure className={`training-gallery-card training-gallery-card-${index + 1}`} key={item.title}>
        <div><img src={optimizedImage(item.image, index === 0 || index === 3 ? 1400 : 900, 80)} alt={item.alt} loading={index < 2 ? "eager" : "lazy"} decoding="async"/></div>
        <figcaption>
          <span>{String(index + 1).padStart(2, "0")} / {item.category}</span>
          <h2>{item.title}</h2>
          <p>{item.caption}</p>
        </figcaption>
      </figure>)}
    </section>

    <section className="training-gallery-cta section-pad">
      <span>Build the next learning experience</span>
      <h2>Bring us the priority.<br/><em>We&apos;ll shape the programme.</em></h2>
      <div><a href="/contact" className="btn-gold">Discuss your training needs <b>↗</b></a><a href="/corporate-training">Explore corporate training <b>→</b></a></div>
    </section>
    <SiteFooter/>
  </main>;
}
