import { expect, test } from 'vitest'
import type { Question } from '@/types/question'
import { buildStudyQueue, moveStudyPosition } from './study-session'

const questions: Question[] = ['1', '2'].map((id) => ({
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

test('builds a sequential queue', () => {
  expect(buildStudyQueue(questions, 'sequential').map((question) => question.id)).toEqual(['1', '2'])
})

test('builds a random queue without losing questions', () => {
  expect(buildStudyQueue(questions, 'random', () => 0).map((question) => question.id)).toEqual(['2', '1'])
})

test('does not move past the final question', () => {
  expect(moveStudyPosition(1, 2, 1)).toBe(1)
})
