"use client";

const testimonialVideos = [
  { title: "A learner's perspective", video: "/videos/eti-testimonial-01.mp4", poster: "/videos/eti-testimonial-01.jpg" },
  { title: "Focused participation", video: "/videos/eti-testimonial-02.mp4", poster: "/videos/eti-testimonial-02.jpg" },
  { title: "Expert facilitation", video: "/videos/eti-testimonial-03.mp4", poster: "/videos/eti-testimonial-03.jpg" },
  { title: "Learning in action", video: "/videos/eti-testimonial-04.mp4", poster: "/videos/eti-testimonial-04.jpg" },
  { title: "A participant's reflection", video: "/videos/eti-testimonial-05.mp4", poster: "/videos/eti-testimonial-05.jpg" },
];

type Props = {
  context: "home" | "testimonials" | "gallery" | "corporate";
};

export default function TestimonialVideoGallery({ context }: Props) {
  const titleId = `${context}-testimonial-videos-title`;

  return <section className={`testimonial-video-showcase testimonial-video-showcase-${context}`} aria-labelledby={titleId}>
    <div className="testimonial-video-head">
      <div>
        <span>Learner voices / Training in action</span>
        <h2 id={titleId}>Hear the experience.<br/><em>See the learning.</em></h2>
      </div>
      <p>Real reflections and moments from Entrepôt learning experiences—capturing engaged participation, practitioner-led facilitation and the confidence that grows through practical training.</p>
    </div>
    <div className="testimonial-video-grid">
      {testimonialVideos.map((item, index) => <figure className="testimonial-video-card" key={item.video}>
        <div>
          <video controls playsInline preload="none" poster={item.poster} aria-label={`${item.title} video`}>
            <source src={item.video} type="video/mp4"/>
            Your browser does not support embedded video.
          </video>
        </div>
        <figcaption><span>{String(index + 1).padStart(2, "0")}</span><strong>{item.title}</strong></figcaption>
      </figure>)}
    </div>
  </section>;
}
