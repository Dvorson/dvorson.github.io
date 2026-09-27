import { test, expect, type Page } from '@playwright/test';

// Runs against the production build (`npm run build` first); see playwright.config.ts.

async function internalLinks(page: Page): Promise<string[]> {
  return page.$$eval('a[href^="/"]', (anchors) =>
    anchors.map((a) => a.getAttribute('href')!.split('#')[0]).filter(Boolean)
  );
}

test('homepage presents the engineer, not a service catalog', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('AI systems');
  await expect(page.getByRole('link', { name: 'Read the CV' })).toHaveAttribute('href', '/cv');

  const body = (await page.locator('main').innerText()).toLowerCase();
  for (const phrase of ['pricing', 'consulting', 'your business', 'readiness checklist', 'no pitch']) {
    expect(body, `homepage should not mention "${phrase}"`).not.toContain(phrase);
  }
});

test('every internal link on the site resolves', async ({ page, request }) => {
  const seen = new Set<string>(['/']);
  const queue = ['/'];
  const broken: string[] = [];

  while (queue.length) {
    const path = queue.shift()!;
    const response = await page.goto(path);
    if (!response || response.status() >= 400) {
      broken.push(path);
      continue;
    }
    for (const href of await internalLinks(page)) {
      if (seen.has(href)) continue;
      seen.add(href);
      if (/\.(pdf|png|jpg|svg)$/.test(href)) {
        const asset = await request.get(href);
        if (!asset.ok()) broken.push(href);
      } else {
        queue.push(href);
      }
    }
  }

  expect(broken, 'broken internal links').toEqual([]);
  expect(seen.size).toBeGreaterThan(20);
});

test('featured case studies link to detail pages', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator('a[href^="/case-studies/"]');
  expect(await cards.count()).toBeGreaterThanOrEqual(4);

  await page.goto('/case-studies/graphrag-knowledge-base');
  await expect(page.locator('h1')).toContainText('Knowledge Graph');
  await expect(page.getByText('The Challenge')).toBeVisible();
});

test('case study URLs do not expose client names', async ({ page }) => {
  await page.goto('/case-studies');
  const hrefs = await internalLinks(page);
  for (const href of hrefs) {
    expect(href).not.toMatch(/vodafone|postnl|jde/i);
  }
});

test('legacy URLs redirect to their new homes', async ({ page }) => {
  await page.goto('/rag-vs-graphrag-vs-fine-tuning-decision-framework');
  await expect(page).toHaveURL(/\/blog\/rag-vs-graphrag-vs-fine-tuning-decision-framework\/?$/);

  await page.goto('/pricing');
  await expect(page).toHaveURL(/\/$/);

  await page.goto('/solutions/graphrag');
  await expect(page).toHaveURL(/\/case-studies\/?$/);
});

test('blog post has a single h1 and article metadata', async ({ page }) => {
  await page.goto('/blog/why-your-rag-implementation-not-working-fixes');
  await expect(page.locator('h1')).toHaveCount(1);

  const schemas = await page.$$eval('script[type="application/ld+json"]', (nodes) =>
    nodes.map((n) => JSON.parse(n.textContent || '{}'))
  );
  expect(schemas.some((s) => s['@type'] === 'BlogPosting')).toBe(true);
  expect(JSON.stringify(schemas)).not.toContain('ProfessionalService');
});

test('CV shows computed durations and a downloadable PDF', async ({ page, request }) => {
  await page.goto('/cv');
  await expect(page.locator('h1')).toHaveText('Anton Dvorson');
  await expect(page.getByText(/Jan 2026 – Present \(\d+ (months?|years?)/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();

  const pdf = await request.get('/cv.pdf');
  expect(pdf.ok()).toBe(true);
  expect((await pdf.body()).subarray(0, 4).toString()).toBe('%PDF');
});

test('mobile layout has no horizontal scroll and the menu toggles', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);

  const toggle = page.getByRole('button', { name: 'Toggle menu' });
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#mobile-menu').getByRole('link', { name: 'Case Studies' })).toBeVisible();
});

test('reflow demo lays out text and keeps an accessible copy', async ({ page }) => {
  await page.goto('/');
  const demo = page.locator('[data-reflow-container]');
  await demo.scrollIntoViewIfNeeded();
  await expect(page.locator('.reflow-line').first()).toBeVisible();
  await expect(demo.locator('.sr-only')).toContainText('prototype');
});

test('unknown URLs get the site 404 page', async ({ page }) => {
  const response = await page.goto('/no-such-page');
  expect(response?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveText("This page doesn't exist.");
});

test('case studies carry a technical write-up without em dashes', async ({ page }) => {
  for (const slug of ['ai-stock-screener', 'graphrag-knowledge-base', 'telecom-anomaly-detection', 'multi-brand-storefront']) {
    await page.goto(`/case-studies/${slug}`)
    await expect(page.getByRole('heading', { name: 'How it was built' })).toBeVisible()
    const writeup = await page.locator('.prose').innerText()
    expect(writeup.length, slug).toBeGreaterThan(1500)
    expect(writeup, slug).not.toContain('—')
  }
})
