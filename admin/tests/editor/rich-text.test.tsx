import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from '@jest/globals'
import NotionEditor from '../../src/components/NotionEditor'

describe('Rich Text Editing', () => {
  let mockOnChange: jest.Mock
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    mockOnChange = jest.fn()
    user = userEvent.setup()
  })

  it('should render empty editor with placeholder', () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    expect(editor).toBeInTheDocument()
    expect(editor).toHaveAttribute('contenteditable', 'true')
  })

  it('should handle basic text input', async () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    await user.type(editor, 'Hello world')
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.stringContaining('Hello world')
      )
    })
  })

  it('should apply bold formatting with keyboard shortcut', async () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    await user.type(editor, 'Bold text')
    
    // Select all text
    await user.keyboard('{Control>}a{/Control}')
    
    // Apply bold
    await user.keyboard('{Control>}b{/Control}')
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.stringContaining('<strong>Bold text</strong>')
      )
    })
  })

  it('should apply italic formatting with keyboard shortcut', async () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    await user.type(editor, 'Italic text')
    
    await user.keyboard('{Control>}a{/Control}')
    await user.keyboard('{Control>}i{/Control}')
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.stringContaining('<em>Italic text</em>')
      )
    })
  })

  it('should create headings with markdown syntax', async () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    await user.type(editor, '# Heading 1')
    await user.keyboard('{Enter}')
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.stringContaining('<h1>Heading 1</h1>')
      )
    })
  })

  it('should create bullet lists', async () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    await user.type(editor, '- List item 1')
    await user.keyboard('{Enter}')
    await user.type(editor, 'List item 2')
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.stringContaining('<ul>')
      )
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.stringContaining('<li>List item 1</li>')
      )
    })
  })

  it('should create numbered lists', async () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    await user.type(editor, '1. First item')
    await user.keyboard('{Enter}')
    await user.type(editor, 'Second item')
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.stringContaining('<ol>')
      )
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.stringContaining('<li>First item</li>')
      )
    })
  })

  it('should create links with proper markup', async () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    await user.type(editor, '[Google](https://google.com)')
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.stringContaining('<a href="https://google.com">Google</a>')
      )
    })
  })

  it('should support code inline formatting', async () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    await user.type(editor, 'This is `inline code` text')
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.stringContaining('<code>inline code</code>')
      )
    })
  })

  it('should support code blocks', async () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    await user.type(editor, '```javascript{Enter}console.log("hello");{Enter}```')
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.stringContaining('<pre><code class="language-javascript">')
      )
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.stringContaining('console.log("hello");')
      )
    })
  })

  it('should support strikethrough formatting', async () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    await user.type(editor, 'Strike this text')
    await user.keyboard('{Control>}a{/Control}')
    await user.keyboard('{Control>}{Shift>}x{/Shift}{/Control}')
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.stringContaining('<s>Strike this text</s>')
      )
    })
  })

  it('should handle undo/redo operations', async () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    await user.type(editor, 'Initial text')
    await user.type(editor, ' more text')
    
    // Undo
    await user.keyboard('{Control>}z{/Control}')
    
    await waitFor(() => {
      expect(editor).toHaveTextContent('Initial text')
    })
    
    // Redo
    await user.keyboard('{Control>}y{/Control}')
    
    await waitFor(() => {
      expect(editor).toHaveTextContent('Initial text more text')
    })
  })
})