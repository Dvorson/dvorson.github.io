# dvorson.github.io

Personal CV and blog site with dual-app architecture: Astro static site + Next.js admin interface.

## Architecture

This is a **dual-app personal site** with two independent applications:

- **`site/`** - Astro static site generator (public CV/blog)
- **`admin/`** - Next.js local admin interface (content management)

**Workflow**: Local admin → writes posts to `site/src/posts/` → commits to git → GitHub Actions rebuilds static site to `docs/` → serves via GitHub Pages.

## Technology Stack

### Frontend Site (`site/`)
- **Astro 4.5.0** - Static site generator
- **Tailwind CSS 3.3.2** - Styling framework  
- **Playwright** - Testing framework
- Builds to `../docs` for GitHub Pages deployment

### Admin Interface (`admin/`)
- **Next.js 14** - React framework
- **TipTap v2.3.0** - Rich text editor with table/LaTeX support
- **Tailwind CSS 3.4.1** - Styling
- **Jest + Testing Library** - Testing stack

## Quick Start

### Frontend Site
```bash
cd site
npm install
npm run dev     # Dev server at http://localhost:4321
npm run build   # Build static site to ../docs/
npm run test    # Run Playwright tests
```

### Admin Interface
```bash
cd admin
npm install
npm run dev     # Dev server at http://localhost:3000
npm run test    # Run Jest tests
npm run build   # Build admin app
```

## Key Features

### Content Management
- Rich-text editor with drag handles, tables, and LaTeX support
- Draft and publish workflow
- Automatic git commits and deployments
- Image and video embed support

### Site Features
- Responsive CV/portfolio display
- Blog with categories and tags
- Static site optimization
- GitHub Pages deployment

## Content Management Flow
1. Admin app provides rich-text editing interface
2. Posts are saved as Markdown to `site/src/posts/`
3. Admin commits and pushes changes via git
4. GitHub Actions rebuilds site and deploys to Pages

## Deployment
- Static site builds to `docs/` directory (tracked in git)
- GitHub Pages serves from `docs/` folder
- Admin runs locally only (not deployed)
- GitHub Actions handles automated rebuilds on push to main