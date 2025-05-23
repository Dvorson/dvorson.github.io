import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from '@jest/globals'
import NotionEditor from '../../src/components/NotionEditor'

describe('Tables', () => {
  let mockOnChange: jest.Mock
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    mockOnChange = jest.fn()
    user = userEvent.setup()
  })

  it('should create table via slash command', async () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    await user.type(editor, '/table')
    
    await waitFor(() => {
      const tableOption = screen.getByText('Table')
      expect(tableOption).toBeInTheDocument()
    })
    
    const tableOption = screen.getByText('Table')
    await user.click(tableOption)
    
    await waitFor(() => {
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()
      
      // Should have default structure (3x3)
      const headers = screen.getAllByRole('columnheader')
      expect(headers).toHaveLength(3)
      
      const cells = screen.getAllByRole('cell')
      expect(cells).toHaveLength(6) // 2 rows × 3 columns
    })
  })

  it('should allow editing table cells', async () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    await user.type(editor, '/table')
    await user.click(screen.getByText('Table'))
    
    await waitFor(() => {
      const firstCell = screen.getAllByRole('columnheader')[0]
      expect(firstCell).toBeInTheDocument()
    })
    
    const firstCell = screen.getAllByRole('columnheader')[0]
    await user.click(firstCell)
    await user.type(firstCell, 'Header 1')
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.stringContaining('Header 1')
      )
    })
  })

  it('should add new rows to table', async () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    await user.type(editor, '/table')
    await user.click(screen.getByText('Table'))
    
    await waitFor(() => {
      const addRowButton = screen.getByTestId('add-row-button')
      expect(addRowButton).toBeInTheDocument()
    })
    
    const addRowButton = screen.getByTestId('add-row-button')
    await user.click(addRowButton)
    
    await waitFor(() => {
      const cells = screen.getAllByRole('cell')
      expect(cells).toHaveLength(9) // 3 rows × 3 columns
    })
  })

  it('should add new columns to table', async () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    await user.type(editor, '/table')
    await user.click(screen.getByText('Table'))
    
    await waitFor(() => {
      const addColumnButton = screen.getByTestId('add-column-button')
      expect(addColumnButton).toBeInTheDocument()
    })
    
    const addColumnButton = screen.getByTestId('add-column-button')
    await user.click(addColumnButton)
    
    await waitFor(() => {
      const headers = screen.getAllByRole('columnheader')
      expect(headers).toHaveLength(4)
      
      const cells = screen.getAllByRole('cell')
      expect(cells).toHaveLength(8) // 2 rows × 4 columns
    })
  })

  it('should delete table rows', async () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    await user.type(editor, '/table')
    await user.click(screen.getByText('Table'))
    
    // Add a row first
    await user.click(screen.getByTestId('add-row-button'))
    
    await waitFor(() => {
      const deleteRowButton = screen.getAllByTestId('delete-row-button')[0]
      expect(deleteRowButton).toBeInTheDocument()
    })
    
    const deleteRowButton = screen.getAllByTestId('delete-row-button')[0]
    await user.click(deleteRowButton)
    
    await waitFor(() => {
      const cells = screen.getAllByRole('cell')
      expect(cells).toHaveLength(6) // Back to 2 rows × 3 columns
    })
  })

  it('should delete table columns', async () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    await user.type(editor, '/table')
    await user.click(screen.getByText('Table'))
    
    await waitFor(() => {
      const deleteColumnButton = screen.getAllByTestId('delete-column-button')[0]
      expect(deleteColumnButton).toBeInTheDocument()
    })
    
    const deleteColumnButton = screen.getAllByTestId('delete-column-button')[0]
    await user.click(deleteColumnButton)
    
    await waitFor(() => {
      const headers = screen.getAllByRole('columnheader')
      expect(headers).toHaveLength(2)
      
      const cells = screen.getAllByRole('cell')
      expect(cells).toHaveLength(4) // 2 rows × 2 columns
    })
  })

  it('should navigate between table cells with keyboard', async () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    await user.type(editor, '/table')
    await user.click(screen.getByText('Table'))
    
    await waitFor(() => {
      const firstHeader = screen.getAllByRole('columnheader')[0]
      expect(firstHeader).toBeInTheDocument()
    })
    
    const firstHeader = screen.getAllByRole('columnheader')[0]
    await user.click(firstHeader)
    
    // Navigate with Tab
    await user.keyboard('{Tab}')
    
    await waitFor(() => {
      const secondHeader = screen.getAllByRole('columnheader')[1]
      expect(secondHeader).toHaveFocus()
    })
    
    // Navigate with Arrow keys
    await user.keyboard('{ArrowDown}')
    
    await waitFor(() => {
      const cellBelow = screen.getAllByRole('cell')[1]
      expect(cellBelow).toHaveFocus()
    })
  })

  it('should support table header styling', async () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    await user.type(editor, '/table')
    await user.click(screen.getByText('Table'))
    
    await waitFor(() => {
      const table = screen.getByRole('table')
      const headers = screen.getAllByRole('columnheader')
      
      headers.forEach(header => {
        expect(header).toHaveClass('table-header')
      })
    })
  })

  it('should export table as markdown', async () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    await user.type(editor, '/table')
    await user.click(screen.getByText('Table'))
    
    // Add content to cells
    const firstHeader = screen.getAllByRole('columnheader')[0]
    await user.click(firstHeader)
    await user.type(firstHeader, 'Name')
    
    const secondHeader = screen.getAllByRole('columnheader')[1]
    await user.click(secondHeader)
    await user.type(secondHeader, 'Age')
    
    const firstCell = screen.getAllByRole('cell')[0]
    await user.click(firstCell)
    await user.type(firstCell, 'John')
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.stringMatching(/\|.*Name.*\|.*Age.*\|/)
      )
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.stringMatching(/\|.*John.*\|/)
      )
    })
  })

  it('should handle table resize operations', async () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    await user.type(editor, '/table')
    await user.click(screen.getByText('Table'))
    
    await waitFor(() => {
      const resizeHandle = screen.getByTestId('column-resize-handle')
      expect(resizeHandle).toBeInTheDocument()
    })
    
    const resizeHandle = screen.getByTestId('column-resize-handle')
    fireEvent.mouseDown(resizeHandle, { clientX: 100 })
    fireEvent.mouseMove(resizeHandle, { clientX: 150 })
    fireEvent.mouseUp(resizeHandle)
    
    await waitFor(() => {
      const firstColumn = screen.getAllByRole('columnheader')[0]
      expect(firstColumn).toHaveStyle('width: 150px')
    })
  })

  it('should support table sorting by column', async () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    await user.type(editor, '/table')
    await user.click(screen.getByText('Table'))
    
    // Add sortable data
    const firstCell = screen.getAllByRole('cell')[0]
    await user.click(firstCell)
    await user.type(firstCell, 'Zebra')
    
    const secondRowFirstCell = screen.getAllByRole('cell')[3]
    await user.click(secondRowFirstCell)
    await user.type(secondRowFirstCell, 'Apple')
    
    // Click sort button on header
    const sortButton = screen.getAllByTestId('sort-column-button')[0]
    await user.click(sortButton)
    
    await waitFor(() => {
      const cells = screen.getAllByRole('cell')
      expect(cells[0]).toHaveTextContent('Apple')
      expect(cells[3]).toHaveTextContent('Zebra')
    })
  })
})