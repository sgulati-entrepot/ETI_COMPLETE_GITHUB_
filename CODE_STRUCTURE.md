# Code structure

| Website area | Editable source |
| --- | --- |
| Homepage | `app/page.tsx`, `app/HomeClient.tsx` |
| Header and footer | `app/components.tsx` |
| Programs dropdown | `app/components.tsx` |
| Global design and responsive styles | `app/globals.css` |
| About Entrepôt | `app/about/page.tsx` |
| Trainers | `app/about/trainers/page.tsx` |
| Management | `app/about/management/page.tsx` |
| Programs catalogue | `app/programs/page.tsx` |
| Program details | `app/programs/[slug]/page.tsx`, `app/programs/program-data.json` |
| Corporate training | `app/corporate-training/page.tsx` |
| Corporate course pages | `app/corporate-training/courses/[category]/[course]/page.tsx` |
| Contact page and lead form | `app/contact/` |
| Student registration | `app/student-registration/` |
| Awards and recognition | `app/awards-recognition/page.tsx` |
| SEO and Meta Pixel | `app/layout.tsx`, `netlify/edge-functions/seo-meta.ts` |
| Images and brochures | `public/images/`, `public/brochures/` |
| Netlify deployment | `netlify.toml`, `netlify/` |

