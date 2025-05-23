import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from '@jest/globals'
import NotionEditor from '../../src/components/NotionEditor'

describe('Formulas and Math', () => {
  let mockOnChange: jest.Mock
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    mockOnChange = jest.fn()
    user = userEvent.setup()
  })

  it('should render inline math formulas', async () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    await user.type(editor, 'The formula $E = mc^2$ is famous')
    
    await waitFor(() => {
      const mathElement = screen.getByTestId('math-inline')
      expect(mathElement).toBeInTheDocument()
      expect(mathElement).toHaveTextContent('E = mc^2')
    })
  })

  it('should render block math formulas', async () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    await user.type(editor, '$$\\int_0^1 x^2 dx = \\frac{1}{3}$$')
    
    await waitFor(() => {
      const mathBlock = screen.getByTestId('math-block')
      expect(mathBlock).toBeInTheDocument()
      expect(mathBlock).toHaveTextContent('∫₀¹ x² dx = ⅓')
    })
  })

  it('should create math block via slash command', async () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    await user.type(editor, '/math')
    
    await waitFor(() => {
      const mathOption = screen.getByText('Math equation')
      expect(mathOption).toBeInTheDocument()
    })
    
    const mathOption = screen.getByText('Math equation')
    await user.click(mathOption)
    
    await waitFor(() => {
      const mathInput = screen.getByTestId('math-input')
      expect(mathInput).toBeInTheDocument()
      expect(mathInput).toHaveFocus()
    })
  })

  it('should allow editing math formulas', async () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    await user.type(editor, '/math')
    await user.click(screen.getByText('Math equation'))
    
    await waitFor(() => {
      const mathInput = screen.getByTestId('math-input')
      expect(mathInput).toBeInTheDocument()
    })
    
    const mathInput = screen.getByTestId('math-input')
    await user.type(mathInput, 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}')
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.stringContaining('x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}')
      )
    })
  })

  it('should show math preview while editing', async () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    await user.type(editor, '/math')
    await user.click(screen.getByText('Math equation'))
    
    await waitFor(() => {
      const mathInput = screen.getByTestId('math-input')
      expect(mathInput).toBeInTheDocument()
    })
    
    const mathInput = screen.getByTestId('math-input')
    await user.type(mathInput, '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}')
    
    await waitFor(() => {
      const preview = screen.getByTestId('math-preview')
      expect(preview).toBeInTheDocument()
      expect(preview).toHaveTextContent('∑ᵢ₌₁ⁿ i = n(n+1)/2')
    })
  })

  it('should handle invalid LaTeX syntax gracefully', async () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    await user.type(editor, '/math')
    await user.click(screen.getByText('Math equation'))
    
    await waitFor(() => {
      const mathInput = screen.getByTestId('math-input')
      expect(mathInput).toBeInTheDocument()
    })
    
    const mathInput = screen.getByTestId('math-input')
    await user.type(mathInput, '\\invalid{syntax}')
    
    await waitFor(() => {
      const errorMessage = screen.getByTestId('math-error')
      expect(errorMessage).toBeInTheDocument()
      expect(errorMessage).toHaveTextContent('Invalid LaTeX syntax')
    })
  })

  it('should support common math symbols and functions', async () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    
    const testCases = [
      { input: '\\alpha', expected: 'α' },
      { input: '\\beta', expected: 'β' },
      { input: '\\gamma', expected: 'γ' },
      { input: '\\sin(x)', expected: 'sin(x)' },
      { input: '\\cos(x)', expected: 'cos(x)' },
      { input: '\\tan(x)', expected: 'tan(x)' },
      { input: '\\log(x)', expected: 'log(x)' },
      { input: '\\sqrt{x}', expected: '√x' },
      { input: '\\infty', expected: '∞' },
    ]
    
    for (const { input, expected } of testCases) {
      await user.clear(editor)
      await user.type(editor, `$${input}$`)
      
      await waitFor(() => {
        const mathElement = screen.getByTestId('math-inline')
        expect(mathElement).toHaveTextContent(expected)
      })
    }
  })

  it('should support fractions and superscripts', async () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    await user.type(editor, '$\\frac{x^2}{y^3}$')
    
    await waitFor(() => {
      const mathElement = screen.getByTestId('math-inline')
      expect(mathElement).toHaveTextContent('x²/y³')
    })
  })

  it('should support matrices', async () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    await user.type(editor, '$$\\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix}$$')
    
    await waitFor(() => {
      const mathBlock = screen.getByTestId('math-block')
      expect(mathBlock).toBeInTheDocument()
      expect(mathBlock).toHaveTextContent('⎡1 2⎤⎣3 4⎦')
    })
  })

  it('should allow copying math formulas', async () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    await user.type(editor, '$E = mc^2$')
    
    await waitFor(() => {
      const mathElement = screen.getByTestId('math-inline')
      expect(mathElement).toBeInTheDocument()
    })
    
    const mathElement = screen.getByTestId('math-inline')
    await user.rightClick(mathElement)
    
    await waitFor(() => {
      const copyOption = screen.getByText('Copy LaTeX')
      expect(copyOption).toBeInTheDocument()
    })
    
    const copyOption = screen.getByText('Copy LaTeX')
    await user.click(copyOption)
    
    // Note: Actual clipboard testing would require additional setup
    expect(mockOnChange).toHaveBeenCalled()
  })

  it('should support equation numbering', async () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    await user.type(editor, '/math')
    await user.click(screen.getByText('Math equation'))
    
    await waitFor(() => {
      const mathInput = screen.getByTestId('math-input')
      expect(mathInput).toBeInTheDocument()
    })
    
    const mathInput = screen.getByTestId('math-input')
    await user.type(mathInput, 'E = mc^2')
    
    const numberToggle = screen.getByTestId('equation-number-toggle')
    await user.click(numberToggle)
    
    await waitFor(() => {
      const equationNumber = screen.getByTestId('equation-number')
      expect(equationNumber).toHaveTextContent('(1)')
    })
  })

  it('should support chemical formulas', async () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    await user.type(editor, '$\\ce{H2O}$')
    
    await waitFor(() => {
      const mathElement = screen.getByTestId('math-inline')
      expect(mathElement).toHaveTextContent('H₂O')
    })
  })

  it('should handle complex nested formulas', async () => {
    render(<NotionEditor onChange={mockOnChange} />)
    
    const editor = screen.getByTestId('notion-editor')
    await user.type(editor, '$$\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}$$')
    
    await waitFor(() => {
      const mathBlock = screen.getByTestId('math-block')
      expect(mathBlock).toBeInTheDocument()
      expect(mathBlock).toHaveTextContent('∑ₙ₌₁^∞ 1/n² = π²/6')
    })
  })
})