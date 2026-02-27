import { test, expect } from '@playwright/test';

test('Homepage has CV data and blog post', async ({ page }) => {
  await page.goto('http://localhost:4321/');

  // Check CV data
  await expect(page.locator('h1').first()).toContainText('Your business has an AI problem. I solve it.');
  await expect(page.locator('p.text-xl')).toContainText('I build AI agents, knowledge graphs, and intelligent platforms that actually ship to production');
  await expect(page.locator('p.text-sm').first()).toContainText('12+ years. Fortune-500 retail, telecom, media. Production AI systems.');

  // Check blog post exists or "No posts yet" message
  const blogSection = page.locator('#blog');
  await expect(blogSection).toBeVisible();
});