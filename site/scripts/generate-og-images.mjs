import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
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

// Color scheme: Rams + TE aesthetic — warm base, single accent
const themes = {
  home: { bg: '#fafaf8', text: '#0a0a0a', accent: '#ff5722', muted: '#9c9c96' },
  'case-studies': { bg: '#fafaf8', text: '#0a0a0a', accent: '#ff5722', muted: '#9c9c96' },
  blog: { bg: '#fafaf8', text: '#0a0a0a', accent: '#ff5722', muted: '#9c9c96' },
  cv: { bg: '#fafaf8', text: '#0a0a0a', accent: '#ff5722', muted: '#9c9c96' },
  default: { bg: '#fafaf8', text: '#0a0a0a', accent: '#ff5722', muted: '#9c9c96' }
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
          background: theme.bg,
          fontFamily: 'Inter',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: `4px solid ${theme.accent}`,
        },
        children: [
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
                      color: theme.text,
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
                borderTop: `1px solid #e4e4e0`,
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
                            background: theme.text,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: theme.bg,
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
                                  color: theme.text,
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
                                  color: theme.muted,
                                  fontSize: '14px',
                                  fontWeight: 400,
                                },
                                children: 'Software Architect & AI Engineer',
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
                      color: theme.muted,
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

// Pages are derived from site content so a new post or case study gets a
// card automatically. Output is gitignored and rebuilt on every build.
const pages = [
  { title: 'I design and build AI systems and the platforms they run on', subtitle: 'Anton Dvorson', section: 'home', filename: 'home' },
  { title: 'Case studies: knowledge graphs, agent systems, and platforms', subtitle: 'Case Studies', section: 'case-studies', filename: 'case-studies' },
  { title: 'Writing on AI system architecture', subtitle: 'Writing', section: 'blog', filename: 'blog' },
  { title: 'Anton Dvorson: Software Architect & AI Engineer', subtitle: 'CV', section: 'cv', filename: 'cv' },
];

const services = JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'services.json'), 'utf-8'));
for (const cs of services.caseStudies.filter((c) => c.hasFullPage)) {
  pages.push({ title: cs.title, subtitle: 'Case Study', section: 'case-studies', filename: `cs-${cs.slug}` });
}

const postsDir = join(ROOT, 'src', 'posts');
for (const file of readdirSync(postsDir).filter((f) => f.endsWith('.md'))) {
  const source = readFileSync(join(postsDir, file), 'utf-8');
  const frontmatter = source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
  if (/^draft:\s*true\s*$/m.test(frontmatter)) continue;
  const title = frontmatter.match(/^title:\s*"(.*)"\s*$/m)?.[1];
  if (!title) throw new Error(`${file}: missing title in front-matter`);
  pages.push({ title, subtitle: 'Writing', section: 'blog', filename: `blog-${file.replace(/\.md$/, '')}` });
}

console.log(`Generating ${pages.length} OG images...`);

for (const page of pages) {
  await generateOGImage(page.title, page.subtitle, page.section, page.filename);
}

console.log(`Done! Generated ${pages.length} OG images in public/og/`);
