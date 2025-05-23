import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from '@jest/globals'
import NotionEditor from '../../src/components/NotionEditor'

describe('Draggable Blocks', () => {
  let mockOnChange: jest.Mock
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    mockOnChange = jest.fn()
    user = userEvent.setup()
  })

  it('should render drag handles for blocks', async () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    await user.type(editor, 'First paragraph')
    await user.keyboard('{Enter}{Enter}')
    await user.type(editor, 'Second paragraph')
    
    await waitFor(() => {
      const dragHandles = screen.getAllByTestId('drag-handle')
      expect(dragHandles).toHaveLength(2)
    })
  })

  it('should show drag handle on hover', async () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    await user.type(editor, 'Hoverable paragraph')
    
    const paragraph = screen.getByText('Hoverable paragraph')
    await user.hover(paragraph)
    
    await waitFor(() => {
      const dragHandle = screen.getByTestId('drag-handle')
      expect(dragHandle).toBeVisible()
    })
  })

  it('should allow dragging blocks to reorder', async () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    await user.type(editor, 'Block 1')
    await user.keyboard('{Enter}{Enter}')
    await user.type(editor, 'Block 2')
    await user.keyboard('{Enter}{Enter}')
    await user.type(editor, 'Block 3')
    
    await waitFor(() => {
      const dragHandles = screen.getAllByTestId('drag-handle')
      expect(dragHandles).toHaveLength(3)
    })

    // Simulate drag and drop
    const firstHandle = screen.getAllByTestId('drag-handle')[0]
    const dropZone = screen.getAllByTestId('drop-zone')[2]
    
    fireEvent.dragStart(firstHandle)
    fireEvent.dragOver(dropZone)
    fireEvent.drop(dropZone)
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.stringContaining('Block 2')
      )
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.stringContaining('Block 3')
      )
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.stringContaining('Block 1')
      )
    })
  })

  it('should create new blocks with slash commands', async () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    await user.type(editor, '/')
    
    await waitFor(() => {
      const commandMenu = screen.getByTestId('slash-command-menu')
      expect(commandMenu).toBeInTheDocument()
    })

    const headingOption = screen.getByText('Heading 1')
    await user.click(headingOption)
    
    await waitFor(() => {
      expect(editor).toHaveAttribute('data-node-type', 'heading')
    })
  })

  it('should support block conversion via slash commands', async () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    await user.type(editor, 'Regular text')
    await user.type(editor, '/')
    
    const quoteOption = screen.getByText('Quote')
    await user.click(quoteOption)
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.stringContaining('<blockquote>Regular text</blockquote>')
      )
    })
  })

  it('should support block deletion with keyboard shortcuts', async () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    await user.type(editor, 'Block to delete')
    await user.keyboard('{Enter}{Enter}')
    await user.type(editor, 'Keep this block')
    
    // Select first block and delete
    await user.keyboard('{ArrowUp}{ArrowUp}')
    await user.keyboard('{Control>}a{/Control}')
    await user.keyboard('{Delete}')
    
    await waitFor(() => {
      expect(editor).not.toHaveTextContent('Block to delete')
      expect(editor).toHaveTextContent('Keep this block')
    })
  })

  it('should maintain focus after block operations', async () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    await user.type(editor, 'Test block')
    await user.type(editor, '/')
    
    const headingOption = screen.getByText('Heading 2')
    await user.click(headingOption)
    
    await waitFor(() => {
      expect(editor).toHaveFocus()
    })
  })

  it('should support block duplication', async () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    await user.type(editor, 'Block to duplicate')
    
    // Duplicate with keyboard shortcut
    await user.keyboard('{Control>}d{/Control}')
    
    await waitFor(() => {
      const blocks = screen.getAllByText('Block to duplicate')
      expect(blocks).toHaveLength(2)
    })
  })

  it('should show visual feedback during drag operations', async () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    await user.type(editor, 'Draggable block')
    
    const dragHandle = screen.getByTestId('drag-handle')
    fireEvent.dragStart(dragHandle)
    
    await waitFor(() => {
      const blockElement = screen.getByText('Draggable block').closest('[data-block]')
      expect(blockElement).toHaveClass('dragging')
    })
  })

  it('should prevent invalid drop operations', async () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    await user.type(editor, 'Block 1')
    await user.keyboard('{Enter}{Enter}')
    await user.type(editor, 'Block 2')
    
    const dragHandle = screen.getAllByTestId('drag-handle')[0]
    const invalidDropZone = screen.getByTestId('editor-toolbar')
    
    fireEvent.dragStart(dragHandle)
    fireEvent.dragOver(invalidDropZone)
    fireEvent.drop(invalidDropZone)
    
    // Should not trigger onChange with reordered content
    await waitFor(() => {
      expect(mockOnChange).not.toHaveBeenCalledWith(
        expect.stringMatching(/Block 2.*Block 1/)
      )
    })
  })
})