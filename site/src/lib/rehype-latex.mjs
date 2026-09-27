import katex from 'katex'
import { fromHtml } from 'hast-util-from-html'
import { SKIP, visit } from 'unist-util-visit'

// Renders LaTeX written as \( inline \) or \[ display \] to KaTeX HTML at build
// time. Dollar delimiters are deliberately unsupported: posts talk about money,
// and "$394B and $5B" must stay text. The admin editor writes these delimiters.
const MATH = /\\\(([\s\S]+?)\\\)|\\\[([\s\S]+?)\\\]/g
const SKIP_TAGS = new Set(['code', 'pre', 'script', 'style', 'textarea'])

export default function rehypeLatex() {
  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || index === undefined) return
      if (parent.type === 'element' && SKIP_TAGS.has(parent.tagName)) return
      if (!node.value.includes('\\(') && !node.value.includes('\\[')) return

      const children = []
      let last = 0
      for (const match of node.value.matchAll(MATH)) {
        if (match.index > last) children.push({ type: 'text', value: node.value.slice(last, match.index) })
        const displayMode = match[2] !== undefined
        const html = katex.renderToString((match[1] ?? match[2]).trim(), { displayMode, throwOnError: false, output: 'htmlAndMathml' })
        children.push(...fromHtml(html, { fragment: true }).children)
        last = match.index + match[0].length
      }
      if (children.length === 0) return
      if (last < node.value.length) children.push({ type: 'text', value: node.value.slice(last) })

      parent.children.splice(index, 1, ...children)
      return [SKIP, index + children.length]
    })
  }
}
