import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'public', 'og');

// Ensure output directory exists
mkdirSync(OUT_DIR, { recursive: true });

// Load a system font for text rendering
// Use Inter from Google Fonts (bundled as base64 would be too large)
// Instead, we'll fetch it or use a local fallback
let fontData;
try {
  // Try to load Inter font from node_modules or local
  const fontPath = join(__dirname, 'Inter-Bold.ttf');
  if (existsSync(fontPath)) {
    fontData = readFileSync(fontPath);
  } else {
    // Download Inter Bold
    const res = await fetch('https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZhrib2Bg-4.ttf');
    fontData = Buffer.from(await res.arrayBuffer());
    writeFileSync(fontPath, fontData);
  }
} catch (e) {
  console.error('Could not load font, using fallback approach');
  process.exit(1);
}

let fontDataRegular;
try {
  const fontPathRegular = join(__dirname, 'Inter-Regular.ttf');
  if (existsSync(fontPathRegular)) {
    fontDataRegular = readFileSync(fontPathRegular);
  } else {
    const res = await fetch('https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYMZhrib2Bg-4.ttf');
    fontDataRegular = Buffer.from(await res.arrayBuffer());
    writeFileSync(fontPathRegular, fontDataRegular);
  }
} catch (e) {
  fontDataRegular = fontData;
}

// Color schemes per section
const themes = {
  home: { bg1: '#1e3a5f', bg2: '#0f1b2d', accent: '#3b82f6' },
  solutions: { bg1: '#1a365d', bg2: '#1e1b4b', accent: '#6366f1' },
  'case-studies': { bg1: '#134e4a', bg2: '#0f2d2a', accent: '#14b8a6' },
  blog: { bg1: '#1e293b', bg2: '#0f172a', accent: '#3b82f6' },
  pricing: { bg1: '#312e81', bg2: '#1e1b4b', accent: '#818cf8' },
  ai: { bg1: '#1e3a5f', bg2: '#312e81', accent: '#60a5fa' },
  cv: { bg1: '#1f2937', bg2: '#111827', accent: '#6b7280' },
  default: { bg1: '#1e293b', bg2: '#0f172a', accent: '#3b82f6' }
};

function getTheme(section) {
  return themes[section] || themes.default;
}

// Generate OG image SVG using satori
async function generateOGImage(title, subtitle, section, filename) {
  const theme = getTheme(section);

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 70px',
          background: `linear-gradient(135deg, ${theme.bg1} 0%, ${theme.bg2} 100%)`,
          fontFamily: 'Inter',
          position: 'relative',
          overflow: 'hidden',
        },
        children: [
          // Decorative circle
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: '-80px',
                right: '-80px',
                width: '300px',
                height: '300px',
                borderRadius: '50%',
                background: theme.accent,
                opacity: 0.08,
              },
            },
          },
          // Another decorative element
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                bottom: '-40px',
                left: '-40px',
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: theme.accent,
                opacity: 0.05,
              },
            },
          },
          // Section label
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      width: '4px',
                      height: '24px',
                      background: theme.accent,
                      borderRadius: '2px',
                    },
                  },
                },
                {
                  type: 'span',
                  props: {
                    style: {
                      color: theme.accent,
                      fontSize: '18px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '3px',
                    },
                    children: subtitle || 'Anton Dvorson',
                  },
                },
              ],
            },
          },
          // Title
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                flex: 1,
                justifyContent: 'center',
              },
              children: [
                {
                  type: 'h1',
                  props: {
                    style: {
                      color: '#ffffff',
                      fontSize: title.length > 60 ? '36px' : title.length > 40 ? '42px' : '48px',
                      fontWeight: 700,
                      lineHeight: 1.2,
                      margin: 0,
                      maxWidth: '1000px',
                    },
                    children: title,
                  },
                },
              ],
            },
          },
          // Bottom bar: name + site
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: `1px solid rgba(255,255,255,0.1)`,
                paddingTop: '20px',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: {
                            width: '44px',
                            height: '44px',
                            borderRadius: '22px',
                            background: theme.accent,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            fontSize: '20px',
                            fontWeight: 700,
                          },
                          children: 'AD',
                        },
                      },
                      {
                        type: 'div',
                        props: {
                          style: {
                            display: 'flex',
                            flexDirection: 'column',
                          },
                          children: [
                            {
                              type: 'span',
                              props: {
                                style: {
                                  color: '#ffffff',
                                  fontSize: '16px',
                                  fontWeight: 700,
                                },
                                children: 'Anton Dvorson',
                              },
                            },
                            {
                              type: 'span',
                              props: {
                                style: {
                                  color: 'rgba(255,255,255,0.5)',
                                  fontSize: '14px',
                                  fontWeight: 400,
                                },
                                children: 'AI Solutions Architect',
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  type: 'span',
                  props: {
                    style: {
                      color: 'rgba(255,255,255,0.4)',
                      fontSize: '14px',
                      fontWeight: 400,
                    },
                    children: 'dvorson.github.io',
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Inter', data: fontData, weight: 700, style: 'normal' },
        { name: 'Inter', data: fontDataRegular, weight: 400, style: 'normal' },
      ],
    }
  );

  // Convert SVG to PNG
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  const outPath = join(OUT_DIR, `${filename}.png`);
  writeFileSync(outPath, pngBuffer);
  console.log(`  Generated: /og/${filename}.png`);
}

// Define all pages and their OG image configs
const pages = [
  // Homepage
  { title: 'Your business has an AI problem. I solve it.', subtitle: 'AI Solutions Architect', section: 'home', filename: 'home' },

  // Solutions
  { title: 'AI Solutions for Real Business Problems', subtitle: 'Solutions', section: 'solutions', filename: 'solutions' },
  { title: 'AI Agent & Agentic Platform Development', subtitle: 'Solutions', section: 'solutions', filename: 'solutions-ai-agents' },
  { title: 'GraphRAG & Knowledge Graph Intelligence', subtitle: 'Solutions', section: 'solutions', filename: 'solutions-graphrag' },
  { title: 'AI-Powered E-commerce Optimization', subtitle: 'Solutions', section: 'solutions', filename: 'solutions-ai-ecommerce' },
  { title: 'AI Strategy & Technical Leadership', subtitle: 'Solutions', section: 'solutions', filename: 'solutions-ai-strategy' },
  { title: 'LLM Integration & Custom AI Platforms', subtitle: 'Solutions', section: 'solutions', filename: 'solutions-llm-integration' },

  // Case Studies
  { title: 'Real Projects. Real Outcomes.', subtitle: 'Case Studies', section: 'case-studies', filename: 'case-studies' },
  { title: 'GenAI Enablement Platform for Enterprise Knowledge', subtitle: 'Case Study', section: 'case-studies', filename: 'cs-genai-enablement' },
  { title: 'GraphRAG Knowledge Base for Fortune-500', subtitle: 'Case Study', section: 'case-studies', filename: 'cs-graphrag-kb' },
  { title: 'Multi-Agent AI System for Telecom Operations', subtitle: 'Case Study', section: 'case-studies', filename: 'cs-multi-agent-telecom' },

  // Pricing
  { title: 'No surprises. Here\'s how I work and what it costs.', subtitle: 'Pricing', section: 'pricing', filename: 'pricing' },

  // CV
  { title: 'Anton Dvorson - AI Solutions Architect', subtitle: 'CV', section: 'cv', filename: 'cv' },

  // Blog posts
  { title: 'GraphRAG Implementation Guide: Knowledge Graph AI for Enterprise', subtitle: 'Blog', section: 'blog', filename: 'blog-graphrag-guide' },
  { title: 'Building Multi-Agent AI Systems: Architecture Patterns', subtitle: 'Blog', section: 'blog', filename: 'blog-multi-agent' },
  { title: 'AI Consulting Rates in Europe 2026', subtitle: 'Blog', section: 'blog', filename: 'blog-ai-rates' },
  { title: 'RAG vs GraphRAG vs Fine-Tuning: Decision Framework', subtitle: 'Blog', section: 'blog', filename: 'blog-rag-comparison' },
  { title: 'Enterprise Knowledge Base with Neo4j and LLM Agents', subtitle: 'Blog', section: 'blog', filename: 'blog-neo4j-kb' },
  { title: 'Langflow vs LangChain vs Custom: When to Use What', subtitle: 'Blog', section: 'blog', filename: 'blog-langflow-langchain' },
  { title: 'Headless Commerce + AI: Search and Personalization', subtitle: 'Blog', section: 'blog', filename: 'blog-headless-ai' },
  { title: 'The Real Cost of Building an AI Agent', subtitle: 'Blog', section: 'blog', filename: 'blog-ai-agent-cost' },
  { title: 'Top AI Consulting Firms in the Netherlands (2026)', subtitle: 'Blog', section: 'blog', filename: 'blog-ai-firms-nl' },
  { title: 'AI for E-commerce: 7 High-ROI Use Cases', subtitle: 'Blog', section: 'blog', filename: 'blog-ai-ecommerce' },
  { title: 'Why Your RAG Implementation Isn\'t Working', subtitle: 'Blog', section: 'blog', filename: 'blog-rag-fixes' },
  { title: 'Fractional AI Architect vs Consulting Agency', subtitle: 'Blog', section: 'blog', filename: 'blog-fractional-vs-agency' },
  // Original blog posts
  { title: 'Enterprise Software Architecture Patterns', subtitle: 'Blog', section: 'blog', filename: 'blog-sw-architecture' },
  { title: 'React & Node.js Performance Optimization', subtitle: 'Blog', section: 'blog', filename: 'blog-react-perf' },
  { title: 'AWS & Azure Cloud Infrastructure Guide', subtitle: 'Blog', section: 'blog', filename: 'blog-cloud-infra' },
  { title: 'Technical Leadership & Engineering Team Management', subtitle: 'Blog', section: 'blog', filename: 'blog-tech-leadership' },
  { title: 'E-commerce Platform Architecture Guide', subtitle: 'Blog', section: 'blog', filename: 'blog-ecommerce-arch' },

  // Blog index
  { title: 'Blog: AI Engineering & Technical Consulting', subtitle: 'Blog', section: 'blog', filename: 'blog' },
];

// Add AI matrix pages
const matrixData = JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'industry-matrix.json'), 'utf-8'));
for (const page of matrixData.pages) {
  const industry = matrixData.industries.find(i => i.id === page.industry);
  pages.push({
    title: page.title,
    subtitle: `AI for ${industry?.name || 'Industry'}`,
    section: 'ai',
    filename: `ai-${page.slug}`,
  });
}

console.log(`Generating ${pages.length} OG images...`);

for (const page of pages) {
  await generateOGImage(page.title, page.subtitle, page.section, page.filename);
}

console.log(`Done! Generated ${pages.length} OG images in public/og/`);
