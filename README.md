# Entrepôt Training Institute Website

Production website for Entrepôt Training Institute, built with Next.js and the App Router.

> New to Next.js? Open [`START_HERE.md`](START_HERE.md). The editable website is in `app/`, and generated browser-readable HTML is provided in `HTML_REFERENCE/` for verification.

## Requirements

- Node.js 22
- npm 10 or newer

## Local development

```bash
npm ci
npm run dev:netlify
```

Open `http://localhost:3000`.

## Production build

```bash
npm run build:netlify
```

## Deploy to Netlify

1. Create a new GitHub repository.
2. Extract this package and upload the **contents of the extracted folder** to the repository root.
3. In Netlify, choose **Add new site → Import an existing project**.
4. Select the GitHub repository.
5. Leave the base directory blank and deploy.

Netlify reads the included `netlify.toml` automatically:

- Build command: `npm run build:netlify`
- Publish directory: `.next`
- Node.js: 22

Do not set the publish directory to the repository root.

## Project structure

- `app/` — pages, layouts, components, forms and styles
- `public/images/` — website imagery
- `public/brochures/` — downloadable programme brochures
- `netlify/functions/` — serverless endpoints
- `netlify.toml` — Netlify build and security configuration

## Content and enquiries

Programme enquiry and contact submissions are configured for `courses@entrepot.ae`. The Meta Pixel ID and page-level SEO metadata are included in the application.

## Maintenance

- Keep secrets in Netlify environment variables; never commit `.env` files.
- Work on a feature branch and open a pull request before merging into `main`.
- Run `npm run build:netlify` before publishing substantial changes.
