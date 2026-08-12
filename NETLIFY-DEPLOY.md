# Deploy Entrepôt Training Institute to Netlify

This package is configured for Netlify's official Next.js runtime.

## Recommended: deploy from Git

1. Extract the ZIP and push its contents to a GitHub, GitLab or Bitbucket repository.
2. In Netlify, choose **Add new site** and import that repository.
3. Netlify will read `netlify.toml` automatically. Keep these values:
   - Build command: `npm run build:netlify`
   - Publish directory: `.next`
   - Base directory: leave blank
4. Deploy the site.

Do not set the publish directory to `.`. The included configuration fixes the previous error where the publish directory was the same as the site base directory.

## Contact and brochure forms

The current enquiry forms send submissions to `courses@entrepot.ae` through FormSubmit. The first live submission may trigger a confirmation email from FormSubmit; confirm it once to activate delivery.
