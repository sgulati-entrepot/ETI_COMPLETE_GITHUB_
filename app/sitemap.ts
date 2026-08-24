import type { MetadataRoute } from "next";
import corporateCourses from "./corporate-training/course-data.json";
import programmes from "./programs/program-data.json";

const siteUrl = "https://www.etiworld.ae";

const staticPages = [
  "",
  "/about",
  "/about/management",
  "/about/sales-force",
  "/about/trainers",
  "/awards-recognition",
  "/blog",
  "/blog/customized-training-programs",
  "/blog/emotional-intelligence-vs-ai",
  "/blog/humanitarian-cargo",
  "/blog/power-bi-advanced-excel",
  "/blog/resilience-in-the-skies",
  "/blog/supply-chain-seat-at-the-table",
  "/blog/transformational-leaders",
  "/careers",
  "/contact",
  "/corporate-training",
  "/programs",
  "/programs/business-entrepreneurship",
  "/programs/certified-international-supply-manager",
  "/programs/certified-management-accountant",
  "/programs/certified-procurement-international-manager",
  "/programs/certified-procurement-international-professional",
  "/programs/leadership-management",
  "/programs/pro-training",
  "/programs/professional-excellence",
  "/student-registration",
  "/students-club",
  "/terms-and-policies",
  "/testimonials",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const programmePages = programmes.map(({ slug }) => `/programs/${slug}`);
  const corporatePages = corporateCourses.map(
    ({ categorySlug, slug }) => `/corporate-training/courses/${categorySlug}/${slug}`,
  );
  const paths = [...new Set([...staticPages, ...programmePages, ...corporatePages])];

  return paths.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path.startsWith("/blog") ? "monthly" : "weekly",
    priority: path === "" ? 1 : path === "/programs" || path === "/corporate-training" ? 0.9 : 0.7,
  }));
}
