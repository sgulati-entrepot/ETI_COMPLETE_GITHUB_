import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../components";
import { optimizedBackground, optimizedImage } from "../image";

export const metadata: Metadata = {
  title: "Training Gallery | Entrepôt Training Institute",
  description: "Explore the professional learning environments, specialist disciplines and collaborative experiences that shape training at Entrepôt Training Institute.",
};

const gallery = [
  { title: "Leadership in Action", category: "Leadership & Management", image: "/images/course-leadership.png", alt: "Facilitator leading a professional leadership session", caption: "Thoughtful facilitation that turns leadership ideas into practical judgement." },
  { title: "Communication with Impact", category: "Professional Skills", image: "/images/program-public-speaking.png", alt: "Professional presenting to an engaged audience", caption: "Building the confidence to communicate clearly, influence and connect." },
  { title: "Collaborative Learning", category: "Learning Experience", image: "/images/course-professional-excellence.png", alt: "Professionals participating in a collaborative learning session", caption: "Engaging learning designed around discussion, reflection and application." },
  { title: "Corporate Capability", category: "Customised Training", image: "/images/corporate-training-hero.png", alt: "Facilitator working with a professional corporate team", caption: "Focused programmes shaped around the priorities of teams and organisations." },
  { title: "Business & Entrepreneurship", category: "Commercial Capability", image: "/images/course-entrepreneurship.png", alt: "Professionals collaborating during a practical business workshop", caption: "Collaborative environments where ideas become stronger commercial decisions." },
  { title: "AI & Digital Skills", category: "Future-Ready Learning", image: "/images/ai-generalist-hero-v2.jpg", alt: "Team learning practical artificial intelligence and digital skills", caption: "Practical digital capability for professionals navigating a changing workplace." },
  { title: "Aviation & Ground Operations", category: "Specialist Training", image: "/images/airport-ramp-services-hero.jpg", alt: "Airport ground operations and aviation training environment", caption: "Industry-relevant learning grounded in operational standards and safety." },
  { title: "Academic Partnerships", category: "Learning Community", image: "/images/award-yenepoya-partnership.jpg", alt: "Entrepôt representatives with academic partnership leaders", caption: "Professional relationships that widen access to meaningful learning." },
];

export default function TrainingGalleryPage() {
  return <main className="training-gallery-page">
    <SiteHeader/>
    <section className="training-gallery-hero" style={{ backgroundImage: `${optimizedBackground("/images/program-public-speaking.png", 1920, 80)}` }}>
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
