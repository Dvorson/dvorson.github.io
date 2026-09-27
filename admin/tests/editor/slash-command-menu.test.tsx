import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import SlashCommandMenu from '../../src/components/editor/SlashCommandMenu'

function setup() {
  const commands = {
    addHeading: jest.fn(),
    addBulletList: jest.fn(),
    addOrderedList: jest.fn(),
    addQuote: jest.fn(),
    addCodeBlock: jest.fn(),
    insertTable: jest.fn(),
    insertImage: jest.fn(),
    insertVideo: jest.fn<(src: string) => boolean>(),
    insertMath: jest.fn(),
  }
  // The editor runs the command it gets back; mirror that here.
  const onCommand = jest.fn((command: () => void) => command())
  const onClose = jest.fn()
  render(<SlashCommandMenu position={{ x: 0, y: 0 }} onCommand={onCommand} onClose={onClose} commands={commands} />)
  return { commands, onCommand, onClose }
}

const titles = () => screen.getAllByTestId(/^slash-menu-/).map((el) => el.querySelector('.font-medium')?.textContent)

describe('SlashCommandMenu', () => {
  let user: ReturnType<typeof userEvent.setup>
  beforeEach(() => {
    user = userEvent.setup()
  })

  it('lists every block type the editor supports', () => {
    setup()
    expect(titles()).toEqual([
      'Text', 'Heading 1', 'Heading 2', 'Heading 3', 'Bullet List', 'Numbered List',
      'Quote', 'Code Block', 'Table', 'Image', 'Video', 'Math equation',
    ])
  })

  it('filters by title or keyword as the user types', async () => {
    setup()
    await user.keyboard('tab')
    expect(titles()).toEqual(['Table'])
    expect(screen.getByText(/Filter:/)).toHaveTextContent('Filter: “tab”')

    await user.keyboard('{Backspace}{Backspace}{Backspace}youtube')
    expect(titles()).toEqual(['Video'])
  })

  it('shows an empty state when nothing matches', async () => {
    setup()
    await user.keyboard('zzz')
    expect(screen.getByText('No commands found')).toBeInTheDocument()
  })

  it('runs the highlighted command on Enter', async () => {
    const { commands } = setup()
    await user.keyboard('{ArrowDown}{Enter}')
    expect(commands.addHeading).toHaveBeenCalledWith(1)
  })

  it('resets the highlight to the first match when the filter changes', async () => {
    const { commands } = setup()
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}list{Enter}')
    expect(commands.addBulletList).toHaveBeenCalled()
    expect(commands.addOrderedList).not.toHaveBeenCalled()
  })

  it('runs a command on click', async () => {
    const { commands } = setup()
    await user.click(screen.getByText('Table'))
    expect(commands.insertTable).toHaveBeenCalled()
  })

  it('closes on Escape and on a click outside', async () => {
    const { onClose } = setup()
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
    fireEvent.mouseDown(document.body)
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('tells the user when a video URL cannot be embedded', async () => {
    const { commands } = setup()
    jest.spyOn(window, 'prompt').mockReturnValue('https://vimeo.com/76979871')
    const alert = jest.spyOn(window, 'alert').mockImplementation(() => {})
    commands.insertVideo.mockReturnValue(false)

    await user.click(screen.getByText('Video'))

    expect(commands.insertVideo).toHaveBeenCalledWith('https://vimeo.com/76979871')
    expect(alert).toHaveBeenCalledWith('Only YouTube links can be embedded')
  })
})
