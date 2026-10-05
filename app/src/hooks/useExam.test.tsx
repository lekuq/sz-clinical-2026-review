import { act, renderHook } from '@testing-library/react'
import { beforeEach } from 'vitest'
import { createRepository, resetBankData } from '@/lib/db'
import type { Question } from '@/types/question'
import { useExam } from './useExam'

const questions: Question[] = [
  {
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
  },
]

beforeEach(async () => {
  await resetBankData('exam-test')
})

test('starts, answers and submits an exam', async () => {
  const repository = createRepository('exam-test')
  const { result } = renderHook(() =>
    useExam({ questions, repository, questionCount: 1, durationMinutes: 60, passScore: 60, now: () => 1000 }),
  )

  await act(async () => {
    await result.current.start()
  })
  expect(result.current.session?.questionIds).toEqual(['1'])

  await act(async () => {
    await result.current.selectAnswer('1', ['A'])
  })
  await act(async () => {
    await result.current.submit()
  })

  expect(result.current.session?.score).toBe(100)
  expect(result.current.session?.passed).toBe(true)
})

test('submits automatically when time expires', async () => {
  let now = 1000
  const repository = createRepository('exam-test')
  const { result } = renderHook(() =>
    useExam({ questions, repository, questionCount: 1, durationMinutes: 1, passScore: 60, now: () => now }),
  )

  await act(async () => {
    await result.current.start()
  })

  now = 61_000
  await act(async () => {
    await result.current.checkTime()
  })

  expect(result.current.session?.submittedAt).toBe(61_000)
})
