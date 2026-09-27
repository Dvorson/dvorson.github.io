'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
// Mathematics extension not available, will implement custom math support
import Image from '@tiptap/extension-image'
import Youtube from '@tiptap/extension-youtube'
import { useEffect, useRef, useState } from 'react'
import SlashCommandMenu from './editor/SlashCommandMenu'
import DragHandle from './editor/DragHandle'
import MathEditor from './editor/MathEditor'

interface NotionEditorProps {
  initialContent?: string
  onChange?: (content: string) => void
}

// Keys the slash menu handles itself while it is open. ProseMirror sees keydown
// before the menu's document listener, so the editor must ignore these or it
// would also move the cursor or insert a newline.
const SLASH_MENU_KEYS = new Set(['ArrowUp', 'ArrowDown', 'Enter', 'Escape'])

export const editorExtensions = [
  StarterKit.configure({
    history: {
      depth: 100,
    },
    paragraph: {
      HTMLAttributes: {
        'data-node-type': 'paragraph',
      },
    },
    heading: {
      HTMLAttributes: {
        'data-node-type': 'heading',
      },
    },
    bulletList: {
      HTMLAttributes: {
        'data-node-type': 'bulletList',
      },
    },
    orderedList: {
      HTMLAttributes: {
        'data-node-type': 'orderedList',
      },
    },
    blockquote: {
      HTMLAttributes: {
        'data-node-type': 'blockquote',
      },
    },
    codeBlock: {
      HTMLAttributes: {
        'data-node-type': 'codeBlock',
      },
    },
  }),
  Table.configure({
    resizable: true,
    HTMLAttributes: {
      'data-node-type': 'table',
    },
  }),
  TableRow.configure({
    HTMLAttributes: {
      'data-node-type': 'tableRow',
    },
  }),
  TableHeader.configure({
    HTMLAttributes: {
      'data-node-type': 'tableHeader',
    },
  }),
  TableCell.configure({
    HTMLAttributes: {
      'data-node-type': 'tableCell',
    },
  }),
  // Math extension will be added later
  Image.configure({
    HTMLAttributes: {
      class: 'editor-image',
      'data-node-type': 'image',
    },
  }),
  Youtube.configure({
    controls: false,
    nocookie: true,
  }),
]

/** Whether the slash menu may open at the cursor: block start or after whitespace. */
export function canOpenSlashMenu(textBeforeCursorInBlock: string): boolean {
  return textBeforeCursorInBlock === '' || /\s$/.test(textBeforeCursorInBlock)
}

/**
 * LaTeX as editor content. The site renders \( \) and \[ \] at build time and
 * ignores dollar signs, which posts also use for money. Inserting a text node
 * rather than an HTML string keeps formulas like `a < b` intact.
 */
export function mathContent(latex: string, inline: boolean) {
  const text = inline ? `\\(${latex}\\)` : `\\[${latex}\\]`
  return inline
    ? { type: 'text', text }
    : { type: 'paragraph', content: [{ type: 'text', text }] }
}

export default function NotionEditor({ initialContent = '', onChange }: NotionEditorProps) {
  const [showSlashMenu, setShowSlashMenu] = useState(false)
  const [slashMenuPosition, setSlashMenuPosition] = useState({ x: 0, y: 0 })
  // editorProps are created once, so handlers read the open state through a ref.
  const slashMenuOpen = useRef(false)
  useEffect(() => {
    slashMenuOpen.current = showSlashMenu
  }, [showSlashMenu])

  const editor = useEditor({
    immediatelyRender: false,
    extensions: editorExtensions,
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'notion-editor prose prose-lg max-w-none p-4 focus:outline-none',
        'data-testid': 'notion-editor',
        role: 'textbox',
        'aria-label': 'Post content editor',
      },
      handleKeyDown: (view, event) => {
        if (slashMenuOpen.current && SLASH_MENU_KEYS.has(event.key)) {
          return true
        }

        if (event.key === '/') {
          const { $from } = view.state.selection
          const textBefore = $from.parent.textBetween(0, $from.parentOffset)

          if (canOpenSlashMenu(textBefore)) {
            // Schedule menu show after the slash is inserted
            setTimeout(() => {
              const coords = view.coordsAtPos(view.state.selection.from)
              setSlashMenuPosition({ x: coords.left, y: coords.bottom })
              setShowSlashMenu(true)
            }, 0)
          }
          return false // Allow the slash to be inserted
        }

        return false
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange?.(html)
    },
  })

  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent)
    }
  }, [editor, initialContent])

  const handleSlashCommand = (command: () => void) => {
    setShowSlashMenu(false)
    if (editor) {
      // Find and remove the slash character that triggered the menu
      const { state } = editor
      const { from } = state.selection
      const beforeText = state.doc.textBetween(Math.max(0, from - 10), from)
      const slashIndex = beforeText.lastIndexOf('/')
      
      if (slashIndex !== -1) {
        const slashPos = from - (beforeText.length - slashIndex)
        editor.commands.deleteRange({ from: slashPos, to: from })
      }
      
      // Execute the command
      command()
    }
  }

  const insertTable = () => {
    editor?.commands.insertTable({ rows: 3, cols: 3, withHeaderRow: true })
  }

  const insertImage = (src: string, alt: string) => {
    editor?.commands.setImage({ src, alt })
  }

  // Only YouTube has an editor node; anything else would be dropped by the
  // schema, so report it instead of pretending it was embedded.
  const insertVideo = (src: string): boolean => {
    return editor?.commands.setYoutubeVideo({ src }) ?? false
  }

  const insertMath = (latex: string, inline = false) => {
    editor?.commands.insertContent(mathContent(latex, inline))
  }

  const addHeading = (level: 1 | 2 | 3) => {
    editor?.commands.setHeading({ level })
  }

  const addBulletList = () => {
    editor?.commands.toggleBulletList()
  }

  const addOrderedList = () => {
    editor?.commands.toggleOrderedList()
  }

  const addQuote = () => {
    editor?.commands.toggleBlockquote()
  }

  const addCodeBlock = () => {
    editor?.commands.toggleCodeBlock()
  }

  if (!editor) {
    return <div className="p-4 text-gray-500">Loading editor...</div>
  }

  return (
    <div className="relative">
      <div className="relative">
        <EditorContent editor={editor} />
        
        {/* Drag Handle */}
        <DragHandle editor={editor} />
        
        {/* Slash Command Menu */}
        {showSlashMenu && (
          <SlashCommandMenu
            position={slashMenuPosition}
            onCommand={handleSlashCommand}
            onClose={() => setShowSlashMenu(false)}
            commands={{
              addHeading,
              addBulletList,
              addOrderedList,
              addQuote,
              addCodeBlock,
              insertTable,
              insertImage,
              insertVideo,
              insertMath,
            }}
          />
        )}
      </div>
      
      <MathEditor onMathInsert={insertMath} />
    </div>
  )
}