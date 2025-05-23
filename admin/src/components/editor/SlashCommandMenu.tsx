'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Type, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Table, 
  Image, 
  Video, 
  Calculator,
  Hash,
  Heading1,
  Heading2,
  Heading3 
} from 'lucide-react'

interface SlashCommand {
  id: string
  title: string
  description: string
  icon: JSX.Element
  command: () => void
  keywords: string[]
}

interface SlashCommandMenuProps {
  position: { x: number; y: number }
  onCommand: (command: () => void) => void
  onClose: () => void
  commands: {
    addHeading: (level: 1 | 2 | 3) => void
    addBulletList: () => void
    addOrderedList: () => void
    addQuote: () => void
    addCodeBlock: () => void
    insertTable: () => void
    insertImage: (src: string, alt: string) => void
    insertVideo: (src: string) => void
    insertMath: (latex: string, inline?: boolean) => void
  }
}

export default function SlashCommandMenu({ 
  position, 
  onCommand, 
  onClose, 
  commands 
}: SlashCommandMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [filter, setFilter] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)

  const allCommands: SlashCommand[] = [
    {
      id: 'text',
      title: 'Text',
      description: 'Plain text paragraph',
      icon: <Type className="w-4 h-4" />,
      command: () => {},
      keywords: ['text', 'paragraph', 'p'],
    },
    {
      id: 'heading1',
      title: 'Heading 1',
      description: 'Large section heading',
      icon: <Heading1 className="w-4 h-4" />,
      command: () => commands.addHeading(1),
      keywords: ['heading', 'h1', 'title'],
    },
    {
      id: 'heading2',
      title: 'Heading 2',
      description: 'Medium section heading',
      icon: <Heading2 className="w-4 h-4" />,
      command: () => commands.addHeading(2),
      keywords: ['heading', 'h2', 'subtitle'],
    },
    {
      id: 'heading3',
      title: 'Heading 3',
      description: 'Small section heading',
      icon: <Heading3 className="w-4 h-4" />,
      command: () => commands.addHeading(3),
      keywords: ['heading', 'h3'],
    },
    {
      id: 'bulletlist',
      title: 'Bullet List',
      description: 'Unordered list with bullet points',
      icon: <List className="w-4 h-4" />,
      command: commands.addBulletList,
      keywords: ['list', 'bullet', 'ul', 'unordered'],
    },
    {
      id: 'numberedlist',
      title: 'Numbered List',
      description: 'Ordered list with numbers',
      icon: <ListOrdered className="w-4 h-4" />,
      command: commands.addOrderedList,
      keywords: ['list', 'numbered', 'ol', 'ordered'],
    },
    {
      id: 'quote',
      title: 'Quote',
      description: 'Quotation or callout block',
      icon: <Quote className="w-4 h-4" />,
      command: commands.addQuote,
      keywords: ['quote', 'blockquote', 'callout'],
    },
    {
      id: 'code',
      title: 'Code Block',
      description: 'Syntax highlighted code',
      icon: <Code className="w-4 h-4" />,
      command: commands.addCodeBlock,
      keywords: ['code', 'syntax', 'programming'],
    },
    {
      id: 'table',
      title: 'Table',
      description: 'Insert a table',
      icon: <Table className="w-4 h-4" />,
      command: commands.insertTable,
      keywords: ['table', 'grid', 'data'],
    },
    {
      id: 'image',
      title: 'Image',
      description: 'Upload or embed an image',
      icon: <Image className="w-4 h-4" />,
      command: () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0]
          if (file) {
            const url = URL.createObjectURL(file)
            commands.insertImage(url, file.name)
          }
        }
        input.click()
      },
      keywords: ['image', 'picture', 'photo'],
    },
    {
      id: 'video',
      title: 'Video',
      description: 'Embed a video',
      icon: <Video className="w-4 h-4" />,
      command: () => {
        const url = prompt('Enter video URL (YouTube, Vimeo, or direct link):')
        if (url) {
          commands.insertVideo(url)
        }
      },
      keywords: ['video', 'youtube', 'vimeo'],
    },
    {
      id: 'math',
      title: 'Math equation',
      description: 'LaTeX math formula',
      icon: <Calculator className="w-4 h-4" />,
      command: () => {
        const latex = prompt('Enter LaTeX formula:')
        if (latex) {
          commands.insertMath(latex, false)
        }
      },
      keywords: ['math', 'equation', 'formula', 'latex'],
    },
  ]

  const filteredCommands = allCommands.filter(command =>
    command.title.toLowerCase().includes(filter.toLowerCase()) ||
    command.keywords.some(keyword => keyword.includes(filter.toLowerCase()))
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const command = filteredCommands[selectedIndex]
        if (command) {
          onCommand(command.command)
        }
      } else if (e.key === 'Escape') {
        onClose()
      } else if (e.key.length === 1) {
        setFilter(prev => prev + e.key)
      } else if (e.key === 'Backspace') {
        setFilter(prev => prev.slice(0, -1))
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [filteredCommands, selectedIndex, onCommand, onClose])

  useEffect(() => {
    setSelectedIndex(0)
  }, [filter])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return (
    <div
      ref={menuRef}
      className="slash-command-menu fixed z-50 w-80 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
      style={{
        left: position.x,
        top: position.y + 10,
      }}
      data-testid="slash-command-menu"
    >
      {filter && (
        <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
          Filter: "{filter}"
        </div>
      )}
      
      {filteredCommands.map((command, index) => (
        <div
          key={command.id}
          className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
            index === selectedIndex 
              ? 'bg-blue-50 text-blue-900' 
              : 'hover:bg-gray-50'
          }`}
          onClick={() => onCommand(command.command)}
          data-testid={`slash-menu-${command.id}`}
        >
          <div className="flex-shrink-0 text-gray-400">
            {command.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900">
              {command.title}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {command.description}
            </div>
          </div>
        </div>
      ))}
      
      {filteredCommands.length === 0 && (
        <div className="px-4 py-3 text-sm text-gray-500 text-center">
          No commands found
        </div>
      )}
    </div>
  )
}