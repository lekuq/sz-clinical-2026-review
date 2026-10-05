import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WrongBookList } from './WrongBookList'
import type { Question } from '@/types/question'

const question: Question = {
  id: '1',
  type: 'single',
  stem: '示例题干',
  options: [
    { key: 'A', text: '正确' },
    { key: 'B', text: '错误' },
  ],
  answer: ['A'],
  answerText: '正确',
  explanation: '示例解析',
  explanationSource: 'ai',
  searchTerms: [],
  revision: 1,
}

test('shows wrong count and supports manual removal', async () => {
  const user = userEvent.setup()
  const onRemove = vi.fn()
  render(
    <WrongBookList
      records={[{ questionId: '1', wrongCount: 2, consecutiveCorrect: 0, lastWrongAt: 1000 }]}
      questions={new Map([['1', question]])}
      onPractice={() => {}}
      onRemove={onRemove}
    />,
  )

  expect(screen.getByText('累计答错 2 次')).toBeVisible()
  await user.click(screen.getByRole('button', { name: '移出错题集' }))
  expect(onRemove).toHaveBeenCalledWith('1')
})
