import { expect, test } from 'vitest'
import type { Question } from '@/types/question'
import { remainingSeconds, sampleExamQuestions, scoreExam } from './exam'

const questions: Question[] = ['1', '2', '3'].map((id) => ({
  id,
  type: 'single',
  stem: id,
  options: [
    { key: 'A', text: 'A' },
    { key: 'B', text: 'B' },
  ],
  answer: ['A'],
  answerText: 'A',
  explanation: '解析',
  explanationSource: 'ai',
  searchTerms: [],
  revision: 1,
}))

test('samples unique questions', () => {
  const sample = sampleExamQuestions(questions, 2, () => 0)
  expect(new Set(sample.map((question) => question.id)).size).toBe(2)
})

test('scores and identifies wrong questions', () => {
  const result = scoreExam(questions, { '1': ['A'], '2': ['B'] }, 60)
  expect(result.correctCount).toBe(1)
  expect(result.score).toBe(33)
  expect(result.wrongIds).toEqual(['2', '3'])
  expect(result.passed).toBe(false)
})

test('never returns negative time', () => {
  expect(remainingSeconds(1000, 2000)).toBe(0)
})
