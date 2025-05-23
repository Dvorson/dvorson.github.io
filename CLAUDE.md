# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a **dual-app personal site** with two independent applications:

- **`site/`** - Astro static site generator (public CV/blog)
- **`admin/`** - Deno Fresh local admin interface (content management)

The workflow: Local admin → writes posts to `site/src/posts/` → commits to git → GitHub Actions rebuilds static site to `docs/` → serves via GitHub Pages.

## Common Commands

### Site Development (Astro)
```bash
cd site
npm install
npm run dev     # Dev server at http://localhost:4321
npm run build   # Build static site to ../docs/
npm run test    # Run Playwright tests
```

### Admin Development (Deno Fresh)
```bash
cd admin
deno task dev      # Dev server at http://localhost:8000
deno task test     # Run tests with coverage
deno task coverage # Generate coverage report
deno task build    # Build admin app
```

## Technology Stack

### Frontend Site (`site/`)
- **Astro 4.5.0** - Static site generator
- **Tailwind CSS 3.3.2** - Styling framework  
- **Playwright** - Testing framework
- Builds to `../docs` for GitHub Pages deployment

### Admin Interface (`admin/`)
- **Deno Fresh 1.7.3** - Server-side framework
- **Preact 10.22.0** - React-compatible library
- **TipTap v2.3.0** - Rich text editor with table/LaTeX support
- **Tailwind CSS 3.4.1** - Styling
- **Testing-library + Happy-DOM** - Testing stack

## Key Directories

- `site/src/posts/` - Markdown blog posts (written by admin app)
- `site/src/data/cv.json` - CV data
- `admin/islands/` - Interactive Preact components
- `admin/routes/api/` - API endpoints for draft/publish functionality
- `docs/` - Generated static files for GitHub Pages (git-tracked)

## Development Patterns

### Content Management Flow
1. Admin app provides rich-text editing interface
2. Posts are saved as Markdown to `site/src/posts/`
3. Admin commits and pushes changes via git
4. GitHub Actions rebuilds site and deploys to Pages

### File Structure
- All posts must be in `site/src/posts/` directory
- Admin app has API routes at `/api/draft` and `/api/publish`
- Both apps use Tailwind CSS with separate configurations

### Testing
- Site: Playwright tests in `site/tests/`
- Admin: Deno testing framework in `admin/tests/`
- Both have separate test commands - run from respective directories

## Deployment
- Static site builds to `docs/` directory (tracked in git)
- GitHub Pages serves from `docs/` folder
- Admin runs locally only (not deployed)
- GitHub Actions handles automated rebuilds on push to main