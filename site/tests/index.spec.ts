import { test, expect } from '@playwright/test';

test('Homepage has CV data and blog post', async ({ page }) => {
  await page.goto('http://localhost:4321/');

  // Check CV data
  await expect(page.locator('h1').first()).toContainText('Anton Dvorson');
  await expect(page.locator('p.text-2xl')).toContainText('Solution / Software Architect');
  await expect(page.locator('p.text-lg').first()).toContainText('Professional software architect');

  // Check blog post exists or "No posts yet" message
  const blogSection = page.locator('#blog');
  await expect(blogSection).toBeVisible();
});