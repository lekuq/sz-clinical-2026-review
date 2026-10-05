import { expect, test } from 'vitest'
import { applyAnswerResult, applyCorrectAnswer, applyWrongAnswer } from './progress'

test('updates answer progress from the previous state', () => {
  const next = applyAnswerResult(undefined, '1', false, 100)
  expect(next).toEqual({
    questionId: '1',
    answered: true,
    lastCorrect: false,
    correctCount: 0,
    wrongCount: 1,
    lastAnsweredAt: 100,
  })
})

test('removes a wrong question after one correct answer', () => {
  const record = { questionId: '1', wrongCount: 1, consecutiveCorrect: 0, lastWrongAt: 1 }
  expect(applyCorrectAnswer(record, 'once', 2)).toBeUndefined()
})

test('removes after three consecutive correct answers', () => {
  const first = applyCorrectAnswer(
    { questionId: '1', wrongCount: 1, consecutiveCorrect: 0, lastWrongAt: 1 },
    'threeTimes',
    2,
  )
  const second = applyCorrectAnswer(first!, 'threeTimes', 3)
  expect(applyCorrectAnswer(second!, 'threeTimes', 4)).toBeUndefined()
})

test('wrong answer resets consecutive correct count', () => {
  const record = applyWrongAnswer(
    '1',
    { questionId: '1', wrongCount: 1, consecutiveCorrect: 2, lastWrongAt: 1 },
    5,
  )
  expect(record.consecutiveCorrect).toBe(0)
  expect(record.wrongCount).toBe(2)
})

test('creates a wrong record with the question id', () => {
  expect(applyWrongAnswer('9', undefined, 10).questionId).toBe('9')
})
