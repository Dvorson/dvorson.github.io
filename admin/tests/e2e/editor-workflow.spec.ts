import { test, expect } from '@playwright/test'

test.describe('Editor Workflow E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should complete full blog post creation workflow', async ({ page }) => {
    // Fill in post metadata
    await page.fill('[data-testid="post-title"]', 'E2E Test Post')
    await page.fill('[data-testid="post-category"]', 'Testing')
    await page.fill('[data-testid="post-tags"]', 'e2e, playwright, testing')
    
    // Wait for editor to load
    await page.waitForSelector('[data-testid="notion-editor"]')
    
    // Add content to editor
    const editor = page.locator('[data-testid="notion-editor"]')
    await editor.click()
    await editor.type('# Welcome to E2E Testing')
    await editor.press('Enter')
    await editor.press('Enter')
    await editor.type('This is a comprehensive test of the blog editor.')
    
    // Add formatted text
    await editor.press('Enter')
    await editor.press('Enter')
    await editor.type('This text will be **bold** and this will be *italic*.')
    
    // Save as draft
    await page.click('[data-testid="save-draft-button"]')
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Draft saved')
  })

  test('should handle rich text formatting', async ({ page }) => {
    const editor = page.locator('[data-testid="notion-editor"]')
    await editor.click()
    
    // Test heading creation
    await editor.type('# Main Heading')
    await editor.press('Enter')
    await expect(page.locator('h1')).toContainText('Main Heading')
    
    // Test subheading
    await editor.type('## Sub Heading')
    await editor.press('Enter')
    await expect(page.locator('h2')).toContainText('Sub Heading')
    
    // Test bold text with keyboard shortcut
    await editor.type('Bold text test')
    await editor.press('Control+a')
    await editor.press('Control+b')
    await expect(page.locator('strong')).toContainText('Bold text test')
    
    // Test list creation
    await editor.press('End')
    await editor.press('Enter')
    await editor.type('- List item 1')
    await editor.press('Enter')
    await editor.type('List item 2')
    await expect(page.locator('ul li')).toHaveCount(2)
  })

  test('should create and edit tables', async ({ page }) => {
    const editor = page.locator('[data-testid="notion-editor"]')
    await editor.click()
    
    // Create table via slash command
    await editor.type('/table')
    await page.click('[data-testid="slash-menu-table"]')
    
    // Wait for table to appear
    await expect(page.locator('table')).toBeVisible()
    
    // Edit table cells
    const firstHeader = page.locator('th').first()
    await firstHeader.click()
    await firstHeader.fill('Name')
    
    const secondHeader = page.locator('th').nth(1)
    await secondHeader.click()
    await secondHeader.fill('Age')
    
    const firstCell = page.locator('td').first()
    await firstCell.click()
    await firstCell.fill('John')
    
    const secondCell = page.locator('td').nth(1)
    await secondCell.click()
    await secondCell.fill('25')
    
    // Verify table content
    await expect(page.locator('th').first()).toContainText('Name')
    await expect(page.locator('td').first()).toContainText('John')
  })

  test('should upload and display images', async ({ page }) => {
    const editor = page.locator('[data-testid="notion-editor"]')
    await editor.click()
    
    // Create image block via slash command
    await editor.type('/image')
    await page.click('[data-testid="slash-menu-image"]')
    
    // Upload image file
    const fileInput = page.locator('[data-testid="image-file-input"]')
    await fileInput.setInputFiles({
      name: 'test-image.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-data')
    })
    
    // Wait for image to be uploaded and displayed
    await expect(page.locator('[data-testid="uploaded-image"]')).toBeVisible()
    
    // Add image caption
    const captionInput = page.locator('[data-testid="image-caption"]')
    await captionInput.fill('Test image caption')
    await expect(captionInput).toHaveValue('Test image caption')
  })

  test('should handle drag and drop reordering', async ({ page }) => {
    const editor = page.locator('[data-testid="notion-editor"]')
    await editor.click()
    
    // Create multiple blocks
    await editor.type('First block')
    await editor.press('Enter')
    await editor.press('Enter')
    await editor.type('Second block')
    await editor.press('Enter')
    await editor.press('Enter')
    await editor.type('Third block')
    
    // Wait for drag handles to appear
    const dragHandles = page.locator('[data-testid="drag-handle"]')
    await expect(dragHandles).toHaveCount(3)
    
    // Perform drag and drop (move first block to last position)
    const firstHandle = dragHandles.first()
    const lastDropZone = page.locator('[data-testid="drop-zone"]').last()
    
    await firstHandle.hover()
    await firstHandle.dragTo(lastDropZone)
    
    // Verify reordering
    const blocks = page.locator('[data-block]')
    await expect(blocks.first()).toContainText('Second block')
    await expect(blocks.last()).toContainText('First block')
  })

  test('should create math equations', async ({ page }) => {
    const editor = page.locator('[data-testid="notion-editor"]')
    await editor.click()
    
    // Create math block via slash command
    await editor.type('/math')
    await page.click('[data-testid="slash-menu-math"]')
    
    // Enter LaTeX equation
    const mathInput = page.locator('[data-testid="math-input"]')
    await mathInput.fill('E = mc^2')
    
    // Verify math rendering
    await expect(page.locator('[data-testid="math-preview"]')).toBeVisible()
    await expect(page.locator('[data-testid="math-preview"]')).toContainText('E = mc²')
  })

  test('should embed videos', async ({ page }) => {
    const editor = page.locator('[data-testid="notion-editor"]')
    await editor.click()
    
    // Create video block via slash command
    await editor.type('/video')
    await page.click('[data-testid="slash-menu-video"]')
    
    // Enter YouTube URL
    const urlInput = page.locator('[data-testid="video-url-input"]')
    await urlInput.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    await urlInput.press('Enter')
    
    // Verify video embed
    await expect(page.locator('[data-testid="video-embed"]')).toBeVisible()
    await expect(page.locator('iframe[src*="youtube.com"]')).toBeVisible()
  })

  test('should handle undo/redo operations', async ({ page }) => {
    const editor = page.locator('[data-testid="notion-editor"]')
    await editor.click()
    
    // Type some text
    await editor.type('Original text')
    await editor.press('Enter')
    await editor.type('Additional text')
    
    // Undo last action
    await editor.press('Control+z')
    await expect(editor).toContainText('Original text')
    await expect(editor).not.toContainText('Additional text')
    
    // Redo
    await editor.press('Control+y')
    await expect(editor).toContainText('Additional text')
  })

  test('should publish post successfully', async ({ page }) => {
    // Fill in required fields
    await page.fill('[data-testid="post-title"]', 'Published E2E Post')
    await page.fill('[data-testid="post-category"]', 'Testing')
    await page.fill('[data-testid="post-tags"]', 'published, e2e')
    
    // Add content
    const editor = page.locator('[data-testid="notion-editor"]')
    await editor.click()
    await editor.type('# Published Post Content')
    await editor.press('Enter')
    await editor.type('This post will be published.')
    
    // Publish the post
    await page.click('[data-testid="publish-button"]')
    
    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Post published')
  })

  test('should validate required fields', async ({ page }) => {
    // Try to save without title
    const editor = page.locator('[data-testid="notion-editor"]')
    await editor.click()
    await editor.type('Content without title')
    
    await page.click('[data-testid="save-draft-button"]')
    
    // Verify error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Title is required')
  })

  test('should handle large content efficiently', async ({ page }) => {
    const editor = page.locator('[data-testid="notion-editor"]')
    await editor.click()
    
    // Add a large amount of content
    const largeText = 'Lorem ipsum '.repeat(1000)
    await editor.type(largeText)
    
    // Verify editor remains responsive
    await editor.press('Control+a')
    await editor.press('Control+b')
    
    // Should still be able to interact with the editor
    await expect(page.locator('strong')).toBeVisible()
    
    // Save the large content
    await page.fill('[data-testid="post-title"]', 'Large Content Test')
    await page.fill('[data-testid="post-category"]', 'Performance')
    await page.click('[data-testid="save-draft-button"]')
    
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
  })

  test('should support keyboard shortcuts', async ({ page }) => {
    const editor = page.locator('[data-testid="notion-editor"]')
    await editor.click()
    
    // Test various keyboard shortcuts
    await editor.type('Test text for shortcuts')
    
    // Select all and make bold
    await editor.press('Control+a')
    await editor.press('Control+b')
    await expect(page.locator('strong')).toContainText('Test text for shortcuts')
    
    // Undo bold
    await editor.press('Control+z')
    await expect(page.locator('strong')).not.toBeVisible()
    
    // Test italic
    await editor.press('Control+a')
    await editor.press('Control+i')
    await expect(page.locator('em')).toContainText('Test text for shortcuts')
  })
})