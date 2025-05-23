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
import { useEffect, useState } from 'react'
import SlashCommandMenu from './editor/SlashCommandMenu'
import DragHandle from './editor/DragHandle'
import ImageUpload from './editor/ImageUpload'
import VideoEmbed from './editor/VideoEmbed'
import MathEditor from './editor/MathEditor'

interface NotionEditorProps {
  initialContent?: string
  onChange?: (content: string) => void
}

export default function NotionEditor({ initialContent = '', onChange }: NotionEditorProps) {
  const [showSlashMenu, setShowSlashMenu] = useState(false)
  const [slashMenuPosition, setSlashMenuPosition] = useState({ x: 0, y: 0 })

  const editor = useEditor({
    extensions: [
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
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'notion-editor prose prose-lg max-w-none p-4 focus:outline-none',
        'data-testid': 'notion-editor',
        role: 'textbox',
        'aria-label': 'Post content editor',
      },
      handleKeyDown: (view, event) => {
        // Handle slash command trigger
        if (event.key === '/') {
          const { state } = view
          const { selection } = state
          const { from } = selection
          
          // Check if we're at the start of a line or after whitespace
          const beforeText = state.doc.textBetween(Math.max(0, from - 10), from)
          const isValidPosition = from === 0 || beforeText.match(/[\n\s]$/)
          
          if (isValidPosition) {
            // Schedule menu show after the slash is inserted
            setTimeout(() => {
              const coords = view.coordsAtPos(view.state.selection.from)
              setSlashMenuPosition({ x: coords.left, y: coords.bottom })
              setShowSlashMenu(true)
            }, 0)
          }
          return false // Allow the slash to be inserted
        }
        
        // Hide slash menu on Escape
        if (event.key === 'Escape' && showSlashMenu) {
          setShowSlashMenu(false)
          return true
        }
        
        return false
      },
      handleTextInput: (view, from, to, text) => {
        // Hide slash menu when typing other characters
        if (showSlashMenu && text !== '/') {
          setShowSlashMenu(false)
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

  const insertVideo = (src: string) => {
    if (src.includes('youtube.com') || src.includes('youtu.be')) {
      editor?.commands.setYoutubeVideo({ src })
    } else {
      // For other video types, insert as HTML
      editor?.commands.insertContent(`
        <video controls style="max-width: 100%;">
          <source src="${src}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      `)
    }
  }

  const insertMath = (latex: string, inline = false) => {
    if (inline) {
      editor?.commands.insertContent(`$${latex}$`)
    } else {
      editor?.commands.insertContent(`$$${latex}$$`)
    }
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
      
      {/* Hidden components for file uploads */}
      <ImageUpload onImageUpload={insertImage} />
      <VideoEmbed onVideoEmbed={insertVideo} />
      <MathEditor onMathInsert={insertMath} />
    </div>
  )
}