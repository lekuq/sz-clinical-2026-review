import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchResults } from './SearchResults'
import type { Question } from '@/types/question'

const question: Question = {
  id: '1',
  type: 'single',
  stem: '高血压患者的饮食干预',
  options: [
    { key: 'A', text: '限制钠盐' },
    { key: 'B', text: '增加饮酒' },
  ],
  answer: ['A'],
  answerText: '限制钠盐',
  explanation: '示例解析',
  explanationSource: 'ai',
  searchTerms: [],
  revision: 1,
}

test('shows matched fields and selects a result', async () => {
  const user = userEvent.setup()
  const onSelect = vi.fn()
  render(
    <SearchResults
      results={[{ question, matchedFields: ['题干', '答案'], score: 0.1 }]}
      onSelect={onSelect}
    />,
  )

  expect(screen.getByText('命中：题干、答案')).toBeVisible()
  await user.click(screen.getByRole('button', { name: /高血压患者的饮食干预/ }))
  expect(onSelect).toHaveBeenCalledWith(question)
})
