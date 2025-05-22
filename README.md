 # dvorson.github.io

 This repository hosts my personal CV and blog, served via GitHub Pages, with a local admin interface for writing and publishing posts.

 ## Current State
 - Old React/Webpack/MUI code has been removed.
 - `site/` directory scaffolded with:
   - Astro configuration building to `docs/`.
   - Tailwind CSS integration with custom animations.
   - `src/data/cv.json` placeholder for CV data.
   - Homepage at `src/pages/index.astro`.
   - `src/posts/` directory for Markdown posts.
 - `admin/` directory scaffolded with:
   - Deno Fresh local app stub.
   - TipTap v2 editor island.
   - API routes for `/api/draft` and `/api/publish` to write Markdown and commit/push.
 - CI/CD workflow in `.github/workflows/deploy.yml` to build and deploy on push to `main`.

 ## Project Goal
 Provide a modern, simple, and stylish personal CV and blog site:
 - Static site served via `docs/` folder on GitHub Pages.
 - Local admin interface (Deno Fresh + TipTap) for writing rich-text blog posts with tables, LaTeX, etc.
 - Publishing posts via the admin triggers git commits and pushes; GitHub Actions rebuilds and deploys the site.

 ## Implementation Plan
 1. **Populate CV Data**  
    - Update `site/src/data/cv.json` with actual personal information, skills, and experience.
 2. **Styling and Animations**  
    - Customize global styles in `site/src/styles/global.css`.  
    - Refine animations in `tailwind.config.cjs`.
 3. **Blog Posts**  
    - Write and test the first post via the admin interface.  
    - Verify appearance on the blog index and individual post pages.
 4. **Tag and Category Pages**  
    - Extend Astro pages to support dynamic tag and category listings.
 5. **Continuous Improvement**  
    - Enhance admin UI, error handling, and preview features.  
    - Add additional integrations or plugins as needed.

 ## Local Development
 ### Public Site
 ```bash
 cd site
 npm install
 npm run dev  # http://localhost:3000
 ```

 ### Admin App
 ```bash
 cd admin
 deno run -A https://fresh.deno.dev .  # generate fresh manifest (one-time)
 deno task dev  # http://localhost:8000
 ```

 ## Deployment
 On push to `main`, GitHub Actions rebuilds the site into `docs/` and publishes to GitHub Pages.