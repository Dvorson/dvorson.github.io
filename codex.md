# Codex Session Notes

## Current State
- **site/**: Astro + Tailwind CSS static CV and blog site with:
  - Astro config building to `docs/`.
  - Tailwind CSS integration (via Vite plugin/Tailwind CLI) and custom keyframes for animations.
  - `src/data/cv.json` placeholder data.
  - Homepage and blog index at `src/pages/*.astro`.
  - `src/posts/` for Markdown content.
- **admin/**: Deno Fresh local admin interface stub:
  - TipTap v2 editor island for a Notion-like experience.
  - API routes to save drafts and publish posts (writes Markdown and commits/pushes via Git).
- **CI/CD**: `.github/workflows/deploy.yml` to build `site/` → `docs/` and deploy via GitHub Pages.

## Known Issue
- The `@astrojs/tailwind` integration specified in `site/package.json` is deprecated.
  Use the Tailwind CSS Vite plugin or `tailwindcss` via PostCSS plugin for Astro v4.

## Project Goal
Deliver a modern, simple CV and blog:
- Static website on GitHub Pages powered by Astro + Tailwind CSS.  
- Local Deno Fresh admin app for writing rich-text blog posts (tables, LaTeX, etc.).  
- Posts authored locally are stored as Markdown, committed, and pushed; CI/CD handles site rebuild and deployment.

## Implementation Plan
1. **Populate and Validate CV Data**  
   - Fill out `site/src/data/cv.json`.  
2. **Fix Tailwind Integration**  
   - Replace deprecated `@astrojs/tailwind` with Tailwind CSS plugin for Vite or PostCSS as per Astro docs.  
3. **Enhance Design & Animations**  
   - Tailor CSS in `site/src/styles/global.css`; refine animations.  
4. **Write & Test Blog Posts**  
   - Use admin app to save and publish posts; verify static generation in `docs/`.  
5. **Add Tag/Category Support**  
   - Implement dynamic collections or page generation in Astro.  
6. **Improve Admin UX**  
   - Add preview, error handling, and draft management in the Deno Fresh app.

---  
_End of Session. Next steps in the following session._