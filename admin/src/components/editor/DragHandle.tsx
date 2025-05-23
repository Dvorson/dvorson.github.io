'use client'

import { useState, useEffect } from 'react'
import { Editor } from '@tiptap/react'
import { GripVertical } from 'lucide-react'

interface DragHandleProps {
  editor: Editor
}

export default function DragHandle({ editor }: DragHandleProps) {
  const [hoveredBlock, setHoveredBlock] = useState<HTMLElement | null>(null)
  const [draggedBlock, setDraggedBlock] = useState<HTMLElement | null>(null)
  const [allBlocks, setAllBlocks] = useState<HTMLElement[]>([])

  useEffect(() => {
    if (!editor) return

    const editorElement = editor.view.dom as HTMLElement

    const updateBlocks = () => {
      const blocks = Array.from(editorElement.querySelectorAll('[data-node-type]')) as HTMLElement[]
      setAllBlocks(blocks)
    }

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const blockElement = target.closest('[data-node-type]') as HTMLElement
      
      if (blockElement && blockElement !== hoveredBlock) {
        setHoveredBlock(blockElement)
      }
    }

    const handleMouseLeave = () => {
      setHoveredBlock(null)
    }

    // Update blocks on editor update
    const handleEditorUpdate = () => {
      updateBlocks()
    }

    editorElement.addEventListener('mousemove', handleMouseMove)
    editorElement.addEventListener('mouseleave', handleMouseLeave)
    editor.on('update', handleEditorUpdate)

    // Initial block detection
    updateBlocks()

    return () => {
      editorElement.removeEventListener('mousemove', handleMouseMove)
      editorElement.removeEventListener('mouseleave', handleMouseLeave)
      editor.off('update', handleEditorUpdate)
    }
  }, [editor, hoveredBlock])

  const handleDragStart = (e: React.DragEvent, blockElement: HTMLElement) => {
    setDraggedBlock(blockElement)
    blockElement.classList.add('dragging')
    
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', blockElement.outerHTML)
  }

  const handleDragEnd = (blockElement: HTMLElement) => {
    setDraggedBlock(null)
    blockElement.classList.remove('dragging')
  }

  const handleDrop = (e: React.DragEvent, targetBlock: HTMLElement) => {
    e.preventDefault()
    
    if (!draggedBlock || draggedBlock === targetBlock) return

    try {
      const { state } = editor.view
      
      // Find positions in the document
      const draggedPos = editor.view.posAtDOM(draggedBlock, 0)
      const targetPos = editor.view.posAtDOM(targetBlock, 0)
      
      if (draggedPos >= 0 && targetPos >= 0) {
        // Get the nodes
        const draggedNode = state.doc.nodeAt(draggedPos)
        
        if (draggedNode) {
          const tr = state.tr
          
          // Cut the dragged node
          const draggedEndPos = draggedPos + draggedNode.nodeSize
          const nodeToMove = state.doc.slice(draggedPos, draggedEndPos)
          
          // Remove the original node
          tr.delete(draggedPos, draggedEndPos)
          
          // Calculate the new position after deletion
          const adjustedTargetPos = draggedPos < targetPos ? targetPos - draggedNode.nodeSize : targetPos
          
          // Insert the node at the new position
          tr.insert(adjustedTargetPos, nodeToMove.content)
          
          // Apply the transaction
          editor.view.dispatch(tr)
        }
      }
    } catch (error) {
      console.error('Error during drag and drop:', error)
    }
    
    editor.commands.focus()
  }

  const renderDragHandle = (blockElement: HTMLElement) => {
    const rect = blockElement.getBoundingClientRect()
    const editorRect = editor.view.dom.getBoundingClientRect()
    const editorContainer = editor.view.dom.closest('.relative') as HTMLElement
    const containerRect = editorContainer?.getBoundingClientRect() || editorRect

    return (
      <div
        className="drag-handle fixed flex items-center justify-center w-6 h-6 bg-gray-100 border border-gray-200 rounded cursor-grab active:cursor-grabbing hover:bg-gray-200 transition-colors z-10"
        style={{
          left: containerRect.left - 32,
          top: rect.top + rect.height / 2 - 12,
        }}
        draggable
        onDragStart={(e) => handleDragStart(e, blockElement)}
        onDragEnd={() => handleDragEnd(blockElement)}
        data-testid="drag-handle"
      >
        <GripVertical className="w-3 h-3 text-gray-400" />
      </div>
    )
  }

  const hasContent = (block: HTMLElement) => {
    const textContent = block.textContent?.trim()
    return textContent && textContent.length > 0
  }

  return (
    <>
      {/* Show drag handles for all blocks with content */}
      {allBlocks.filter(hasContent).map((blockElement, index) => {
        const isHovered = blockElement === hoveredBlock
        return (
          <div key={index} className={isHovered ? 'opacity-100' : 'opacity-0 hover:opacity-100'}>
            {renderDragHandle(blockElement)}
          </div>
        )
      })}
      
      {/* Drop zones for all blocks */}
      {allBlocks.map((block, index) => {
        const blockElement = block as HTMLElement
        const rect = blockElement.getBoundingClientRect()
        const editorRect = editor.view.dom.getBoundingClientRect()
        
        return (
          <div
            key={`drop-${index}`}
            className="drop-zone fixed w-full h-2 bg-transparent hover:bg-blue-200 transition-colors pointer-events-auto"
            style={{
              left: editorRect.left,
              top: rect.top - 4,
              width: editorRect.width,
              zIndex: 5,
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, blockElement)}
            data-testid="drop-zone"
          />
        )
      })}
    </>
  )
}