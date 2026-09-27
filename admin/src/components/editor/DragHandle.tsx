'use client'

import { useState, useEffect } from 'react'
import { Editor } from '@tiptap/react'
import { GripVertical } from 'lucide-react'

interface DragHandleProps {
  editor: Editor
}

/**
 * Moves the top-level block at `fromIndex` so it ends up before the block
 * currently at `toIndex` (or at the end when `toIndex` equals the block count).
 */
export function moveTopLevelBlock(editor: Editor, fromIndex: number, toIndex: number): boolean {
  const { doc } = editor.state
  if (fromIndex === toIndex || fromIndex === toIndex - 1) return false
  if (fromIndex < 0 || fromIndex >= doc.childCount || toIndex < 0 || toIndex > doc.childCount) return false

  const offsets: number[] = []
  doc.forEach((_node, offset) => offsets.push(offset))
  offsets.push(doc.content.size)

  const node = doc.child(fromIndex)
  const from = offsets[fromIndex]
  const target = offsets[toIndex]
  const tr = editor.state.tr.delete(from, from + node.nodeSize)
  tr.insert(target > from ? target - node.nodeSize : target, node)
  editor.view.dispatch(tr)
  return true
}

export default function DragHandle({ editor }: DragHandleProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [blocks, setBlocks] = useState<HTMLElement[]>([])

  useEffect(() => {
    const editorElement = editor.view.dom as HTMLElement
    // Only direct children are blocks; paragraphs inside lists or tables move with their parent.
    const updateBlocks = () => setBlocks(Array.from(editorElement.children) as HTMLElement[])

    const handleMouseMove = (e: MouseEvent) => {
      const block = (e.target as HTMLElement).closest('.ProseMirror > *')
      setHoveredIndex(block ? Array.prototype.indexOf.call(editorElement.children, block) : null)
    }
    const handleMouseLeave = () => setHoveredIndex(null)

    editorElement.addEventListener('mousemove', handleMouseMove)
    editorElement.addEventListener('mouseleave', handleMouseLeave)
    editor.on('update', updateBlocks)
    updateBlocks()

    return () => {
      editorElement.removeEventListener('mousemove', handleMouseMove)
      editorElement.removeEventListener('mouseleave', handleMouseLeave)
      editor.off('update', updateBlocks)
    }
  }, [editor])

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault()
    if (draggedIndex !== null) moveTopLevelBlock(editor, draggedIndex, toIndex)
    setDraggedIndex(null)
    editor.commands.focus()
  }

  const editorRect = editor.view.dom.getBoundingClientRect()
  const containerRect = (editor.view.dom.closest('.relative') as HTMLElement | null)?.getBoundingClientRect() ?? editorRect

  return (
    <>
      {blocks.map((block, index) => {
        if (!block.textContent?.trim()) return null
        const rect = block.getBoundingClientRect()
        return (
          <div
            key={`handle-${index}`}
            className={`drag-handle fixed flex items-center justify-center w-6 h-6 bg-gray-100 border border-gray-200 rounded cursor-grab active:cursor-grabbing hover:bg-gray-200 transition-colors z-10 ${
              index === hoveredIndex ? 'opacity-100' : 'opacity-0 hover:opacity-100'
            }`}
            style={{ left: containerRect.left - 32, top: rect.top + rect.height / 2 - 12 }}
            draggable
            onDragStart={(e) => {
              setDraggedIndex(index)
              e.dataTransfer.effectAllowed = 'move'
            }}
            onDragEnd={() => setDraggedIndex(null)}
            data-testid="drag-handle"
            aria-label={`Drag block ${index + 1}`}
          >
            <GripVertical className="w-3 h-3 text-gray-400" />
          </div>
        )
      })}

      {/* One drop zone above each block, plus one after the last block. */}
      {[...blocks, null].map((block, index) => {
        const top = block ? block.getBoundingClientRect().top - 4 : editorRect.bottom - 4
        return (
          <div
            key={`drop-${index}`}
            className="drop-zone fixed h-2 bg-transparent hover:bg-blue-200 transition-colors"
            style={{ left: editorRect.left, top, width: editorRect.width, zIndex: 5 }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, index)}
            data-testid="drop-zone"
          />
        )
      })}
    </>
  )
}
