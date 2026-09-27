// Prints the built /cv page to dist/cv.pdf so the downloadable CV never
// drifts from the page. Runs after `astro build`.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
};

async function resolveFile(urlPath) {
  const path = normalize(join(DIST, decodeURIComponent(urlPath)));
  if (!path.startsWith(DIST)) return null;
  const info = await stat(path).catch(() => null);
  if (info?.isDirectory()) return join(path, 'index.html');
  return info ? path : null;
}

const server = createServer(async (req, res) => {
  const file = await resolveFile(new URL(req.url, 'http://localhost').pathname);
  if (!file) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
  res.end(await readFile(file));
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  // Web fonts come from Google Fonts; wait for them so the PDF matches the page.
  await page.goto(`http://127.0.0.1:${port}/cv/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({
    path: join(DIST, 'cv.pdf'),
    format: 'Letter',
    printBackground: false,
    margin: { top: '0.4in', bottom: '0.4in', left: '0.5in', right: '0.5in' },
  });
  console.log('Generated dist/cv.pdf');
} finally {
  await browser.close();
  server.close();
}
