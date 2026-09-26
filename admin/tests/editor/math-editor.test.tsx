import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, jest } from '@jest/globals'
import MathEditor from '../../src/components/editor/MathEditor'

function setup() {
  const onMathInsert = jest.fn()
  const user = userEvent.setup()
  render(<MathEditor onMathInsert={onMathInsert} />)
  return { onMathInsert, user, input: screen.getByTestId('math-input') }
}

describe('MathEditor', () => {
  it('inserts a block formula by default and clears the input', async () => {
    const { onMathInsert, user, input } = setup()
    await user.type(input, 'E = mc^2')
    await user.click(screen.getByText('Insert Formula'))
    expect(onMathInsert).toHaveBeenCalledWith('E = mc^2', false)
    expect(input).toHaveValue('')
  })

  it('inserts inline when Inline is selected', async () => {
    const { onMathInsert, user, input } = setup()
    await user.click(screen.getByLabelText('Inline'))
    await user.type(input, 'x')
    await user.click(screen.getByText('Insert Formula'))
    expect(onMathInsert).toHaveBeenCalledWith('x', true)
  })

  it('shows a readable preview', async () => {
    const { user, input } = setup()
    // user-event treats braces as key descriptors, so paste the LaTeX instead.
    await user.click(input)
    await user.paste('\\alpha + \\beta')
    expect(screen.getByTestId('math-preview')).toHaveTextContent('α + β')
  })

  it('accepts every preset, including commands like \\pm and \\lim', async () => {
    const { onMathInsert, user } = setup()
    for (const name of ['Quadratic Formula', 'Derivative', 'Matrix']) {
      await user.click(screen.getByText(name))
      await user.click(screen.getByText('Insert Formula'))
    }
    expect(onMathInsert).toHaveBeenCalledTimes(3)
    expect(screen.queryByTestId('math-error')).not.toBeInTheDocument()
  })

  it('blocks insertion of empty input and mismatched braces', async () => {
    const { onMathInsert, user, input } = setup()
    const insert = screen.getByRole('button', { name: 'Insert Formula' })
    expect(insert).toBeDisabled()

    await user.click(input)
    await user.paste('\\frac{1}{2')
    expect(screen.getByTestId('math-error')).toHaveTextContent('Mismatched braces')
    expect(insert).toBeDisabled()

    await user.paste('}')
    expect(screen.queryByTestId('math-error')).not.toBeInTheDocument()
    expect(insert).toBeEnabled()
    expect(onMathInsert).not.toHaveBeenCalled()
  })
})
