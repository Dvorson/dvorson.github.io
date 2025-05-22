import { test, expect } from '@playwright/test';

test('Homepage has CV data and blog post', async ({ page }) => {
  await page.goto('http://localhost:4321/');

  // Check CV data
  await expect(page.locator('h1.text-4xl')).toContainText('Dmitry V.');
  await expect(page.locator('p.text-xl')).toContainText('Software Engineer');
  await expect(page.locator('p.mt-4')).toContainText('Experienced software engineer');

  // Check blog post title
  await expect(page.locator('a.text-blue-600')).toContainText('Hello World: First Blog Post');
});