# dvorson.github.io

Personal site: CV, case studies, and writing. Served at <https://dvorson.github.io>.

## Layout

| Path | What it is |
|---|---|
| `site/` | Astro 5 static site. Deployed to GitHub Pages by `.github/workflows/deploy.yml`. |
| `admin/` | Local-only Next.js editor that writes Markdown posts into `site/src/posts/` and commits them. |

## Site

```bash
cd site
npm install
npm run dev      # http://localhost:4321
npm run build    # OG images → astro build → dist/cv.pdf
npm test         # Playwright against the built site (run the build first)
```

- **Posts** are an Astro content collection in `site/src/posts/*.md`, served at `/blog/<file-name>`.
  Front-matter is validated by `site/src/content.config.ts`; an unknown or missing field fails the build.
- **CV and case studies** live in `site/src/data/cv.json` and `site/src/data/services.json`,
  validated by `site/src/lib/data.ts`. CV durations are computed from `start`/`end` at build time.
- **Redirects** for retired URLs are declared in `site/astro.config.mjs`.
- **OG images** (`public/og/`) and the **CV PDF** (`dist/cv.pdf`) are generated during the build and are not committed.

## Admin

```bash
cd admin
npm install
npm run dev          # http://localhost:3001
npm run lint
npm run type-check
npx jest             # unit and API tests
npx playwright test  # real-browser editor tests (writes to a temp dir, not ../site)
```

Publishing writes `site/src/posts/<slug>.md` and runs `git add/commit/push` for that file and any
images it references. Uploaded images go to `site/public/img/posts/`. Set `POSTS_DIR` and `IMAGES_DIR`
to write somewhere else (the tests do this).

## Deployment

Every push to `master` builds the site, runs the site and admin test suites, and deploys
`site/dist` with GitHub Pages Actions. A weekly scheduled run keeps build-time values current.
