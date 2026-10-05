import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExamPalette } from './ExamPalette'

test('marks answered questions and selects a question', async () => {
  const user = userEvent.setup()
  const onSelect = vi.fn()
  render(
    <ExamPalette
      questionIds={['a', 'b', 'c']}
      currentId="b"
      answers={{ a: ['A'] }}
      onSelect={onSelect}
    />,
  )

  expect(screen.getByRole('button', { name: '第 1 题，已答' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: '第 3 题，未答' }))
  expect(onSelect).toHaveBeenCalledWith('c')
})
