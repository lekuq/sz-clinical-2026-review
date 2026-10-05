import { expect, test } from 'vitest'
import type { Question } from '@/types/question'
import { createSearchIndex, normalizeSearchText, searchQuestions } from './search'

const questions: Question[] = [
  {
    id: '1',
    type: 'single',
    stem: '高血压患者的饮食干预',
    options: [
      { key: 'A', text: '限制钠盐' },
      { key: 'B', text: '增加饮酒' },
    ],
    answer: ['A'],
    answerText: '限制钠盐',
    explanation: '该选项有助于控制血压',
    explanationSource: 'ai',
    searchTerms: ['血压高', '减盐'],
    revision: 1,
  },
]

test('normalizes spaces and punctuation', () => {
  expect(normalizeSearchText(' 高 血 压，患者 ')).toBe('高血压患者')
})

test('finds a typo by search terms', () => {
  expect(searchQuestions(createSearchIndex(questions), '血压过高')[0]?.question.id).toBe('1')
})

test('does not search explanation', () => {
  expect(searchQuestions(createSearchIndex(questions), '控制血压')).toHaveLength(0)
})
