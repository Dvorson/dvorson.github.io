import { describe, it, expect, afterEach } from '@jest/globals'
import { Editor } from '@tiptap/react'
import { canOpenSlashMenu, editorExtensions, mathContent } from '../../src/components/NotionEditor'
import { moveTopLevelBlock } from '../../src/components/editor/DragHandle'

// These run the editor's real TipTap configuration headlessly, so they cover
// what the schema allows and what commands produce, without simulating typing.
let editor: Editor

function createEditor(content = '') {
  editor = new Editor({ extensions: editorExtensions, content })
  return editor
}

function topLevelText(e: Editor): string[] {
  const texts: string[] = []
  e.state.doc.forEach((node) => texts.push(node.textContent))
  return texts
}

afterEach(() => editor?.destroy())

describe('editor schema and commands', () => {
  it('produces headings, lists, quotes, and code blocks', () => {
    const e = createEditor('<p>Title</p>')
    e.commands.setHeading({ level: 2 })
    expect(e.getHTML()).toContain('<h2 data-node-type="heading">Title</h2>')

    e.commands.setContent('<p>Item</p>')
    e.commands.toggleBulletList()
    expect(e.getHTML()).toMatch(/<ul[^>]*><li><p[^>]*>Item<\/p><\/li><\/ul>/)

    e.commands.setContent('<p>Item</p>')
    e.commands.toggleOrderedList()
    expect(e.getHTML()).toMatch(/<ol[^>]*>/)

    e.commands.setContent('<p>Said</p>')
    e.commands.toggleBlockquote()
    expect(e.getHTML()).toMatch(/<blockquote[^>]*>/)

    e.commands.setContent('<p>const a = 1</p>')
    e.commands.toggleCodeBlock()
    expect(e.getHTML()).toMatch(/<pre[^>]*><code>const a = 1<\/code><\/pre>/)
  })

  it('applies inline marks to the selection', () => {
    const e = createEditor('<p>styled</p>')
    e.commands.selectAll()
    e.chain().toggleBold().toggleItalic().toggleStrike().run()
    const html = e.getHTML()
    expect(html).toContain('<strong>')
    expect(html).toContain('<em>')
    expect(html).toContain('<s>')
  })

  it('inserts a 3x3 table with a header row and edits its shape', () => {
    const e = createEditor('<p></p>')
    e.commands.insertTable({ rows: 3, cols: 3, withHeaderRow: true })

    const count = (selector: string) => e.view.dom.querySelectorAll(selector).length
    expect(count('tr')).toBe(3)
    expect(count('th')).toBe(3)
    expect(count('td')).toBe(6)

    e.commands.addRowAfter()
    expect(count('tr')).toBe(4)
    e.commands.addColumnAfter()
    expect(count('tr:first-child > *')).toBe(4)
    e.commands.deleteRow()
    expect(count('tr')).toBe(3)
    e.commands.deleteColumn()
    expect(count('tr:first-child > *')).toBe(3)
  })

  it('keeps uploaded image paths and alt text', () => {
    const e = createEditor('<p></p>')
    e.commands.setImage({ src: '/img/posts/chart-abc123.png', alt: 'Chart' })
    expect(e.getHTML()).toContain('src="/img/posts/chart-abc123.png"')
    expect(e.getHTML()).toContain('alt="Chart"')
  })

  it('embeds YouTube with the privacy-enhanced domain and rejects other URLs', () => {
    const e = createEditor('<p></p>')
    expect(e.commands.setYoutubeVideo({ src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' })).toBe(true)
    expect(e.getHTML()).toContain('youtube-nocookie.com/embed/dQw4w9WgXcQ')

    expect(e.commands.setYoutubeVideo({ src: 'https://vimeo.com/76979871' })).toBe(false)
  })

  it('undoes and redoes edits', () => {
    const e = createEditor('<p>one</p>')
    e.commands.insertContentAt(e.state.doc.content.size - 1, ' two')
    expect(e.getText()).toBe('one two')
    e.commands.undo()
    expect(e.getText()).toBe('one')
    e.commands.redo()
    expect(e.getText()).toBe('one two')
  })

  it('drops markup the schema does not know, such as raw video tags', () => {
    const e = createEditor('<video controls><source src="x.mp4"></video><p>kept</p>')
    expect(e.getHTML()).not.toContain('<video')
    expect(e.getText()).toContain('kept')
  })
})

describe('math content', () => {
  it('writes inline math with \\( \\) and keeps comparison operators as text', () => {
    const e = createEditor('<p>where</p>')
    e.commands.focus('end')
    e.commands.insertContent(mathContent('a < b', true))
    expect(e.getText()).toBe('where\\(a < b\\)')
    expect(e.getHTML()).toContain('\\(a &lt; b\\)')
  })

  it('writes display math as its own paragraph with \\[ \\]', () => {
    const e = createEditor('<p>intro</p>')
    e.commands.focus('end')
    e.commands.insertContent(mathContent('x^2', false))
    expect(topLevelText(e)).toContain('\\[x^2\\]')
  })
})

describe('slash menu trigger', () => {
  it('opens at the start of a block or after whitespace', () => {
    expect(canOpenSlashMenu('')).toBe(true)
    expect(canOpenSlashMenu('some text ')).toBe(true)
  })

  it('does not open in the middle of a word', () => {
    expect(canOpenSlashMenu('and/or')).toBe(false)
    expect(canOpenSlashMenu('http:')).toBe(false)
  })
})

describe('moveTopLevelBlock', () => {
  it('moves a block down past later blocks', () => {
    const e = createEditor('<p>A</p><p>B</p><p>C</p>')
    expect(moveTopLevelBlock(e, 0, 3)).toBe(true)
    expect(topLevelText(e)).toEqual(['B', 'C', 'A'])
  })

  it('moves a block up', () => {
    const e = createEditor('<p>A</p><p>B</p><p>C</p>')
    expect(moveTopLevelBlock(e, 2, 0)).toBe(true)
    expect(topLevelText(e)).toEqual(['C', 'A', 'B'])
  })

  it('moves a whole list as one block', () => {
    const e = createEditor('<p>A</p><ul><li><p>x</p></li><li><p>y</p></li></ul><p>B</p>')
    expect(moveTopLevelBlock(e, 1, 0)).toBe(true)
    expect(topLevelText(e)).toEqual(['xy', 'A', 'B'])
    expect(e.getHTML()).toMatch(/^<ul/)
  })

  it('ignores drops onto the block itself or just below it', () => {
    const e = createEditor('<p>A</p><p>B</p>')
    expect(moveTopLevelBlock(e, 0, 0)).toBe(false)
    expect(moveTopLevelBlock(e, 0, 1)).toBe(false)
    expect(moveTopLevelBlock(e, 5, 0)).toBe(false)
    expect(topLevelText(e)).toEqual(['A', 'B'])
  })
})
