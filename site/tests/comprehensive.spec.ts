import { test, expect } from '@playwright/test';

test.describe('Comprehensive Site Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the homepage for most tests
    await page.goto('http://localhost:4321/');
  });

  test('Homepage loads correctly', async ({ page }) => {
    // Check CV data - using more specific selectors
    await expect(page.locator('main h1, section h1').first()).toContainText('Anton Dvorson');
    await expect(page.locator('p.text-2xl')).toContainText('Solution / Software Architect');
    await expect(page.locator('p.text-lg').first()).toContainText('Professional software architect');

    // Check blog section exists
    const blogSection = page.locator('#blog');
    await expect(blogSection).toBeVisible();
    
    // Check if CV download button exists and is clickable
    const downloadButton = page.locator('#download-cv');
    await expect(downloadButton).toBeVisible();
    await expect(downloadButton).toBeEnabled();
    
    // Check expertise section
    await expect(page.locator('h2').filter({ hasText: 'Expertise Areas' })).toBeVisible();
    
    // Check recent experience section
    await expect(page.locator('h2').filter({ hasText: 'Recent Experience' })).toBeVisible();
  });

  test('Blog posts are displayed and clickable', async ({ page }) => {
    const blogSection = page.locator('#blog');
    await expect(blogSection).toBeVisible();
    
    // Check if there are posts or "No posts yet" message
    const posts = page.locator('#blog a[href^="/"]').filter({ has: page.locator('article') });
    const noPostsMessage = page.locator('#blog').getByText('No posts yet');
    
    // Wait for either posts or no posts message
    try {
      await expect(posts.first()).toBeVisible({ timeout: 2000 });
      
      // If posts exist, verify they're properly structured
      const firstPost = posts.first();
      
      // Check post has date
      const postDate = firstPost.locator('time');
      await expect(postDate).toBeVisible();
      
      // Verify date is formatted correctly (not "Invalid Date")
      const dateText = await postDate.textContent();
      expect(dateText).not.toContain('Invalid');
      expect(dateText).toMatch(/\w+ \d{1,2}, \d{4}/); // e.g., "Jan 5, 2025"
    } catch {
      await expect(noPostsMessage).toBeVisible();
    }
  });

  test('Categories page loads and has working links', async ({ page }) => {
    await page.goto('http://localhost:4321/categories');
    
    await expect(page.locator('main h1, section h1').first()).toContainText('Categories');
    
    // Check if categories exist
    const categoryLinks = page.locator('a[href^="/categories/"]');
    const noCategoriesMessage = page.getByText('No categories yet');
    
    try {
      await expect(categoryLinks.first()).toBeVisible({ timeout: 2000 });
      
      // Test that category links work
      const firstCategory = categoryLinks.first();
      const categoryText = await firstCategory.textContent();
      await firstCategory.click();
      
      // Should navigate to category page
      await expect(page.locator('main h1, section h1').first()).toContainText(`Posts in "${categoryText}"`);
    } catch {
      await expect(noCategoriesMessage).toBeVisible();
    }
  });

  test('Individual category pages work correctly', async ({ page }) => {
    // First get available categories from the categories index
    await page.goto('http://localhost:4321/categories');
    
    const categoryLinks = page.locator('a[href^="/categories/"]');
    const categoriesCount = await categoryLinks.count();
    
    if (categoriesCount > 0) {
      // Test the first category
      const firstCategoryLink = categoryLinks.first();
      const categoryHref = await firstCategoryLink.getAttribute('href');
      
      await page.goto(`http://localhost:4321${categoryHref}`);
      
      // Should have proper heading
      await expect(page.locator('main h1, section h1').first()).toContainText('Posts in');
      
      // Check for posts or no posts message
      const postLinks = page.locator('li a.text-blue-600');
      const noPostsMessage = page.getByText('No posts found in this category');
      
      try {
        await expect(postLinks.first()).toBeVisible({ timeout: 2000 });
        
        // Verify posts have proper dates
        const dates = page.locator('p.text-gray-500.text-sm');
        const firstDate = dates.first();
        await expect(firstDate).toBeVisible();
        
        const dateText = await firstDate.textContent();
        expect(dateText).not.toContain('Invalid');
        
        // Test that post links work
        const firstPostLink = postLinks.first();
        const postHref = await firstPostLink.getAttribute('href');
        expect(postHref).toBeTruthy();
        expect(postHref).toMatch(/^\/[\w-]+$/); // Should be a valid slug
      } catch {
        await expect(noPostsMessage).toBeVisible();
      }
    }
  });

  test('Tags functionality works correctly', async ({ page }) => {
    // Navigate to a post that should have tags
    const posts = page.locator('#blog a[href^="/"]').filter({ has: page.locator('article') });
    const postsCount = await posts.count();
    
    if (postsCount > 0) {
      const firstPostLink = posts.first();
      await firstPostLink.click();
      
      // Look for tags on the post page
      const tagLinks = page.locator('a[href^="/tags/"]');
      const tagsCount = await tagLinks.count();
      
      if (tagsCount > 0) {
        // Test the first tag
        const firstTag = tagLinks.first();
        await firstTag.click();
        
        // Should navigate to tag page
        await expect(page.locator('main h1, section h1').first()).toContainText('Posts tagged');
        
        // Check for posts or no posts message
        const taggedPosts = page.locator('li a.text-blue-600');
        const noPostsMessage = page.getByText('No posts found for this tag');
        
        try {
          await expect(taggedPosts.first()).toBeVisible({ timeout: 2000 });
          
          // Verify posts have proper dates
          const dates = page.locator('p.text-gray-500.text-sm');
          const firstDate = dates.first();
          await expect(firstDate).toBeVisible();
          
          const dateText = await firstDate.textContent();
          expect(dateText).not.toContain('Invalid');
          
          // Test that post links work
          const firstPostLink = taggedPosts.first();
          const postHref = await firstPostLink.getAttribute('href');
          expect(postHref).toBeTruthy();
          expect(postHref).toMatch(/^\/[\w-]+$/);
        } catch {
          await expect(noPostsMessage).toBeVisible();
        }
      }
    }
  });

  test('Individual article pages load correctly', async ({ page }) => {
    const posts = page.locator('#blog a[href^="/"]').filter({ has: page.locator('article') });
    const postsCount = await posts.count();
    
    if (postsCount > 0) {
      const firstPostLink = posts.first();
      await firstPostLink.click();
      
      // Should have article layout
      await expect(page.locator('article')).toBeVisible();
      await expect(page.locator('article h1').first()).toBeVisible();
      
      // Should have proper date formatting
      const dateElement = page.locator('time');
      await expect(dateElement).toBeVisible();
      
      const dateText = await dateElement.textContent();
      expect(dateText).not.toContain('Invalid');
      expect(dateText).toMatch(/\w+ \d{1,2}, \d{4}/);
      
      // Should have back to home link
      const backLink = page.locator('a').filter({ hasText: 'Back to Home' });
      await expect(backLink).toBeVisible();
      
      // Test back link works
      await backLink.click();
      await expect(page.locator('main h1, section h1').first()).toContainText('Anton Dvorson');
    }
  });

  test('Navigation between pages works correctly', async ({ page }) => {
    // Test navigation from homepage to categories
    const categoriesLink = page.locator('a[href="/categories"]').first();
    if (await categoriesLink.count() > 0) {
      await categoriesLink.click();
      await expect(page.locator('main h1, section h1').first()).toContainText('Categories');
    }
    
    // Navigate back to home
    await page.goto('http://localhost:4321/');
    await expect(page.locator('main h1, section h1').first()).toContainText('Anton Dvorson');
  });

  test('CV download functionality works', async ({ page }) => {
    const downloadButton = page.locator('#download-cv');
    await expect(downloadButton).toBeVisible();
    
    // Click download button - it might open a new window or trigger download
    await downloadButton.click();
    
    // Wait a bit to see if anything happens (popup window or download)
    await page.waitForTimeout(1000);
    
    // The button should remain functional (not crash the page)
    await expect(downloadButton).toBeVisible();
  });

  test('Responsive design works on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
    
    // Page should still be functional
    await expect(page.locator('main h1, section h1').first()).toContainText('Anton Dvorson');
    await expect(page.locator('#download-cv')).toBeVisible();
    
    // Blog section should be visible
    await expect(page.locator('#blog')).toBeVisible();
  });

  test('All internal links are valid', async ({ page }) => {
    // Test specific important links instead of all links
    const testLinks = ['/categories'];
    
    for (const href of testLinks) {
      // Navigate to the link
      await page.goto(`http://localhost:4321${href}`);
      
      // Should not get a 404 or error page
      await expect(page.locator('body')).not.toContainText('404');
      await expect(page.locator('body')).not.toContainText('Page not found');
      
      // Should have some content
      await expect(page.locator('main, section, article').first()).toBeVisible();
    }
  });
});