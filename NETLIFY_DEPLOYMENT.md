# Netlify deployment

This archive contains the complete Entrepôt Training Institute website source.

## Recommended: deploy through Git

1. Extract this ZIP and push its contents to a GitHub, GitLab, or Bitbucket repository.
2. In Netlify, choose **Add new site → Import an existing project** and select the repository.
3. Keep the base directory empty (repository root).
4. Netlify will read `netlify.toml` automatically:
   - Build command: `npm run build:netlify`
   - Publish directory: `.next`
   - Node.js: 22
5. Deploy the site.

Do not set the publish directory to the repository root. The included configuration prevents the earlier “publish directory cannot be the same as the base directory” error.

## Netlify CLI alternative

From the extracted project folder:

```bash
npm install
npx netlify login
npx netlify init
npx netlify deploy --build --prod
```

The website is a Next.js App Router project. Netlify automatically installs and uses its current Next.js runtime during deployment.
