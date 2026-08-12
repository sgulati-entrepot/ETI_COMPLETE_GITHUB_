# ETI Next.js SEO backend

The SEO dashboard is available at `/admin/seo` after the project is deployed to Netlify.

## One-time Netlify setup

1. Deploy this repository to Netlify using the included `netlify.toml`.
2. In **Project configuration → Identity**, enable Netlify Identity.
3. Change registration to **Invite only**.
4. Invite the authorised administrator from the Identity users page.
5. Add the environment variable `SEO_ADMIN_EMAIL` with that administrator's email address.
6. Redeploy once after adding the environment variable.

No database provisioning is required. SEO settings are stored persistently in the site-scoped Netlify Blobs store named `eti-seo`.

## What the dashboard controls

- SEO titles and meta descriptions for any route
- Canonical URLs, index/noindex and Open Graph metadata
- JSON-LD structured data
- Site-wide Meta Pixel and Google Analytics IDs
- Permanent and temporary redirects

The Netlify Edge Function applies saved settings to rendered HTML on every request, so changes do not require a code deployment.
