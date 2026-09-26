import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import rehypeRaw from 'rehype-raw';
import rehypeLatex from './src/lib/rehype-latex.mjs';

// URLs that existed before posts moved under /blog and the service pages were
// retired. GitHub Pages has no server-side redirects, so Astro emits
// meta-refresh pages for these; keep them so inbound links keep working.
const movedPosts = [
  'rag-vs-graphrag-vs-fine-tuning-decision-framework',
  'why-your-rag-implementation-not-working-fixes',
];
// Posts replaced by the case study write-up for the same project.
const postsReplacedByCaseStudies = {
  'enterprise-knowledge-base-neo4j-llm-agents': 'graphrag-knowledge-base',
  'graphrag-implementation-guide-enterprise-knowledge-base': 'graphrag-knowledge-base',
  'building-multi-agent-ai-systems-architecture-patterns': 'telecom-anomaly-detection',
  'langflow-vs-langchain-vs-custom-ai-agent-architecture': 'telecom-anomaly-detection',
};
const retiredPosts = [
  'ai-consulting-rates-europe-2026-pricing-guide',
  'fractional-ai-architect-vs-consulting-agency',
  'top-ai-consulting-firms-netherlands-2026',
  'real-cost-building-ai-agent-project-breakdowns',
  'ai-for-ecommerce-high-roi-use-cases',
  'headless-commerce-ai-search-personalization',
];
const retiredSolutions = ['ai-agents', 'graphrag', 'ai-ecommerce', 'ai-strategy', 'llm-integration'];
const retiredIndustryPages = ['ai-agents', 'graphrag', 'llm-integration'].flatMap((service) =>
  ['ecommerce', 'manufacturing', 'retail', 'telecom', 'financial-services'].map((industry) => `${service}-${industry}`)
);

const redirects = {
  ...Object.fromEntries(movedPosts.map((slug) => [`/${slug}`, `/blog/${slug}`])),
  ...Object.fromEntries(retiredPosts.map((slug) => [`/${slug}`, '/blog'])),
  ...Object.fromEntries(Object.entries(postsReplacedByCaseStudies).map(([slug, caseStudy]) => [`/${slug}`, `/case-studies/${caseStudy}`])),
  '/pricing': '/',
  '/projects': '/case-studies',
  '/solutions': '/case-studies',
  ...Object.fromEntries(retiredSolutions.map((slug) => [`/solutions/${slug}`, '/case-studies'])),
  ...Object.fromEntries(retiredIndustryPages.map((slug) => [`/ai/${slug}`, '/case-studies'])),
};

export default defineConfig({
  site: 'https://dvorson.github.io',
  base: '/',
  server: { port: 4321 },
  build: {
    outDir: './dist',
    format: 'directory'
  },
  redirects,
  markdown: {
    // Posts from the admin editor are HTML inside Markdown; rehype-raw turns that HTML
    // into nodes so the LaTeX plugin can see the text in it.
    rehypePlugins: [rehypeRaw, rehypeLatex],
  },
  vite: {
    css: {
      postcss: './postcss.config.cjs'
    }
  },
  integrations: [sitemap({
    filter: (page) => !Object.keys(redirects).some((from) => new URL(page).pathname.replace(/\/$/, '') === from),
  })]
});
