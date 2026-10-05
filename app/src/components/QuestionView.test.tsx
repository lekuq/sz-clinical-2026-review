import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuestionView } from './QuestionView'
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

test('back mode shows answer and explanation immediately', () => {
  render(<QuestionView question={question} mode="back" onConfirm={() => {}} />)
  expect(screen.getByText('正确答案：A')).toBeVisible()
  expect(screen.getByText('示例解析')).toBeVisible()
})

test('practice mode hides explanation before confirmation', () => {
  render(<QuestionView question={question} mode="practice" onConfirm={() => {}} />)
  expect(screen.queryByText('示例解析')).not.toBeInTheDocument()
})

test('practice mode reveals the answer after confirmation', async () => {
  const user = userEvent.setup()
  render(<QuestionView question={question} mode="practice" onConfirm={() => {}} />)

  await user.click(screen.getByRole('button', { name: /A.*正确/ }))
  await user.click(screen.getByRole('button', { name: '确认答案' }))

  expect(screen.getByText('回答正确')).toBeVisible()
  expect(screen.getByText('示例解析')).toBeVisible()
})

