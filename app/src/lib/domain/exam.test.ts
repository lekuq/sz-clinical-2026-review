import { expect, test } from 'vitest'
import type { Question } from '@/types/question'
import {
  createExamSession,
  isExamExpired,
  remainingSeconds,
  sampleExamQuestions,
  scoreExam,
  submitExam,
  updateExamAnswer,
} from './exam'

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

test('creates a timed exam with the requested number of questions', () => {
  const session = createExamSession(questions, 1000, 60, 2, () => 0)
  expect(session.endsAt).toBe(3_601_000)
  expect(session.questionIds).toHaveLength(2)
  expect(session.answers).toEqual({})
})

test('updates an answer without mutating the session', () => {
  const session = createExamSession(questions, 1000, 60, 2, () => 0)
  const next = updateExamAnswer(session, session.questionIds[0], ['B'])
  expect(next.answers[session.questionIds[0]]).toEqual(['B'])
  expect(session.answers).toEqual({})
})

test('submits and scores an exam', () => {
  const session = createExamSession(questions, 1000, 60, 3, () => 0)
  const answered = updateExamAnswer(session, '1', ['A'])
  const submitted = submitExam(answered, questions, 60, 2000)
  expect(submitted.submittedAt).toBe(2000)
  expect(submitted.score).toBe(33)
  expect(submitted.passed).toBe(false)
})

test('detects an expired exam', () => {
  const session = createExamSession(questions, 1000, 1, 1, () => 0)
  expect(isExamExpired(session, session.endsAt)).toBe(true)
})
