import { test, expect } from '@playwright/test'
import { unified } from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeStringify from 'rehype-stringify'
import rehypeLatex from '../src/lib/rehype-latex.mjs'

// Pure transform tests; no browser page is used.
async function render(html: string): Promise<string> {
  const file = await unified().use(rehypeParse, { fragment: true }).use(rehypeLatex).use(rehypeStringify).process(html)
  return String(file)
}

test('renders inline and display LaTeX with KaTeX', async () => {
  const html = await render('<p>Energy \\(E = mc^2\\) holds.</p><p>\\[\\frac{a}{b}\\]</p>')
  expect(html).toContain('Energy <span class="katex">')
  expect(html).toContain(' holds.</p>')
  expect(html).toContain('class="katex-display"')
  expect(html).toContain('<annotation encoding="application/x-tex">\\frac{a}{b}</annotation>')
  expect(html).not.toContain('\\(')
})

test('keeps comparison operators from the admin editor intact', async () => {
  const html = await render('<p>\\(a &lt; b\\)</p>')
  expect(html).toContain('<annotation encoding="application/x-tex">a &#x3C; b</annotation>')
})

test('leaves dollar amounts alone', async () => {
  const input = '<p>Revenue was $394B and costs were $5B.</p>'
  expect(await render(input)).toBe(input)
})

test('does not touch code', async () => {
  const input = '<pre><code>printf("\\(x\\)")</code></pre><p><code>\\[y\\]</code></p>'
  expect(await render(input)).toBe(input)
})

test('shows invalid LaTeX as an error instead of failing the build', async () => {
  const html = await render('<p>\\(\\frac{1}\\)</p>')
  expect(html).toContain('katex-error')
})
