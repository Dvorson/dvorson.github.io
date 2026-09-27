import { test, expect, type Page } from '@playwright/test'
import fs from 'fs/promises'
import path from 'path'
import { E2E_IMAGES_DIR, E2E_POSTS_DIR, E2E_ROOT } from '../../playwright.config'

// Real-browser checks for behavior that jsdom cannot drive faithfully:
// ProseMirror input rules, keyboard routing, file choosers, and native drag and drop.

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
)

const editor = (page: Page) => page.getByTestId('notion-editor')
const slashMenu = (page: Page) => page.getByTestId('slash-command-menu')

test.beforeAll(async () => {
  await fs.rm(E2E_ROOT, { recursive: true, force: true })
})

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await editor(page).click()
})

test('markdown shortcuts create headings, lists, and bold text', async ({ page }) => {
  await page.keyboard.type('# Main heading')
  await page.keyboard.press('Enter')
  await page.keyboard.type('- first')
  await page.keyboard.press('Enter')
  await page.keyboard.type('second')
  await page.keyboard.press('Enter')
  await page.keyboard.press('Enter')
  await page.keyboard.type('some **bold** text')

  await expect(editor(page).locator('h1')).toHaveText('Main heading')
  await expect(editor(page).locator('ul > li')).toHaveCount(2)
  await expect(editor(page).locator('strong')).toHaveText('bold')
})

test('slash menu opens on an empty line and inserts a filtered command', async ({ page }) => {
  await page.keyboard.type('/')
  await expect(slashMenu(page)).toBeVisible()

  await page.keyboard.type('tab')
  await expect(slashMenu(page).getByTestId(/^slash-menu-/)).toHaveCount(1)
  await page.keyboard.press('Enter')

  await expect(slashMenu(page)).toBeHidden()
  await expect(editor(page).locator('table th')).toHaveCount(3)
  await expect(editor(page).locator('table td')).toHaveCount(6)
  await expect(editor(page)).not.toContainText('/tab')
})

test('arrow keys and Enter drive the menu, not the document', async ({ page }) => {
  await page.keyboard.type('/')
  await expect(slashMenu(page)).toBeVisible()
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')

  await expect(slashMenu(page)).toBeHidden()
  // Heading 1 was applied to the current line, and Enter did not add a new one.
  await expect(editor(page).locator('h1')).toHaveCount(1)
  await expect(editor(page).locator('> *')).toHaveCount(1)
})

test('Escape closes the menu and keeps the typed slash', async ({ page }) => {
  await page.keyboard.type('/')
  await expect(slashMenu(page)).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(slashMenu(page)).toBeHidden()
  await expect(editor(page)).toHaveText('/')
})

test('a slash inside a word does not open the menu', async ({ page }) => {
  await page.keyboard.type('and/or')
  await expect(slashMenu(page)).toBeHidden()
  await expect(editor(page)).toHaveText('and/or')
})

test('an image picked from the slash menu is uploaded into the site folder', async ({ page }) => {
  await page.keyboard.type('/image')
  const chooser = page.waitForEvent('filechooser')
  await page.keyboard.press('Enter')
  await (await chooser).setFiles({ name: 'chart.png', mimeType: 'image/png', buffer: PNG })

  const image = editor(page).locator('img')
  await expect(image).toHaveAttribute('src', /^\/img\/posts\/chart-[0-9a-f]{10}\.png$/)
  const src = await image.getAttribute('src')
  const stored = await fs.readFile(path.join(E2E_IMAGES_DIR, path.basename(src!)))
  expect(stored.equals(PNG)).toBe(true)
})

test('a block can be dragged above another by its handle', async ({ page }) => {
  for (const [i, word] of ['Alpha', 'Bravo', 'Charlie'].entries()) {
    if (i > 0) await page.keyboard.press('Enter')
    await page.keyboard.type(word)
  }
  const blocks = editor(page).locator('> p')
  await expect(blocks).toHaveText(['Alpha', 'Bravo', 'Charlie'])

  await blocks.nth(2).hover()
  await page.getByTestId('drag-handle').nth(2).dragTo(page.getByTestId('drop-zone').nth(0))

  await expect(blocks).toHaveText(['Charlie', 'Alpha', 'Bravo'])
})

test('publishing writes a post with the front-matter the site accepts', async ({ page }) => {
  const title = `E2E post ${Date.now()}`
  await page.getByTestId('post-title').fill(title)
  await page.getByTestId('post-description').fill('Written by the admin e2e test.')
  await page.getByTestId('post-category').fill('AI Engineering')
  await page.getByTestId('post-tags').fill('Testing, E2E')
  await editor(page).click()
  await page.keyboard.type('Body text.')
  await page.getByTestId('publish-button').click()

  await expect(page.getByTestId('success-message')).toBeVisible()
  const file = await fs.readFile(path.join(E2E_POSTS_DIR, `${title.toLowerCase().replace(/\s+/g, '-')}.md`), 'utf-8')
  expect(file).toMatch(/^---\ntitle: E2E post \d+\ndescription: Written by the admin e2e test\.\npubDate: '\d{4}-\d{2}-\d{2}'\ntags:\n  - Testing\n  - E2E\ncategories:\n  - AI Engineering\n---\n/)
  expect(file).toContain('Body text.')
})

test('publishing without a description is refused', async ({ page }) => {
  await page.getByTestId('post-title').fill('No description')
  await page.getByTestId('post-category').fill('AI Engineering')
  await editor(page).click()
  await page.keyboard.type('Body.')
  await page.getByTestId('publish-button').click()

  await expect(page.getByTestId('error-message')).toBeVisible()
})

test('the math editor inserts LaTeX with the delimiters the site renders', async ({ page }) => {
  await page.keyboard.type('Area is ')
  await page.getByLabel('Inline').check()
  await page.getByTestId('math-input').fill('\\pi r^2')
  await page.getByRole('button', { name: 'Insert Formula' }).click()

  await expect(editor(page)).toContainText('Area is \\(\\pi r^2\\)')
})
