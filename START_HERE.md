# Start here — website source code

This repository contains the complete Entrepôt Training Institute website.

## Where is the HTML?

This is a **Next.js App Router** website. Next.js stores editable page markup in React/TypeScript files (`.tsx`) and generates HTML during the build. It does not use one handwritten `index.html` as its source.

The homepage source is:

```text
app/page.tsx
app/HomeClient.tsx
```

The shared header, Programs dropdown, footer and course page layouts are in:

```text
app/components.tsx
```

The complete stylesheet is:

```text
app/globals.css
```

Individual website pages are under:

```text
app/about/
app/programs/
app/corporate-training/
app/contact/
app/awards-recognition/
app/student-registration/
```

Generated browser-readable HTML examples are included under `HTML_REFERENCE/`. They are provided only to make the rendered HTML easy to inspect. Edit the `.tsx` source files—not the generated HTML.

## Uploading to GitHub

Do **not** upload this ZIP as a single repository file.

1. Extract the ZIP.
2. Open the `ETI_GITHUB_SOURCE_CODE` folder.
3. Upload everything inside it to the root of your GitHub repository.
4. The repository root must show `app`, `public`, `package.json`, `netlify.toml` and `README.md`.

For a repository of this size, GitHub Desktop is more reliable than GitHub's browser uploader.

