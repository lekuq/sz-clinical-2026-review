import Fuse from 'fuse.js'
import type { Question } from '@/types/question'

export interface SearchDocument {
  question: Question
  stem: string
  optionText: string
  answerText: string
  searchTerms: string
}

export interface SearchResult {
  question: Question
  matchedFields: string[]
  score: number
}

const fieldLabels: Record<keyof Omit<SearchDocument, 'question'>, string> = {
  stem: '题干',
  optionText: '选项',
  answerText: '答案',
  searchTerms: '近义词',
}

export function normalizeSearchText(text: string) {
  return text
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\s\p{P}\p{S}]/gu, '')
}

export function createSearchIndex(questions: Question[]) {
  const documents: SearchDocument[] = questions.map((question) => ({
    question,
    stem: normalizeSearchText(question.stem),
    optionText: normalizeSearchText(question.options.map((option) => option.text).join(' ')),
    answerText: normalizeSearchText(question.answerText || question.answer.join(' ')),
    searchTerms: normalizeSearchText(question.searchTerms.join(' ')),
  }))

  return new Fuse(documents, {
    includeScore: true,
    includeMatches: true,
    ignoreLocation: true,
    minMatchCharLength: 1,
    threshold: 0.35,
    keys: [
      { name: 'stem', weight: 0.45 },
      { name: 'optionText', weight: 0.25 },
      { name: 'answerText', weight: 0.2 },
      { name: 'searchTerms', weight: 0.1 },
    ],
  })
}

export function searchQuestions(
  index: Fuse<SearchDocument>,
  query: string,
  limit = 20,
): SearchResult[] {
  const normalized = normalizeSearchText(query)
  if (!normalized) return []

  return index.search(normalized, { limit }).map((result) => ({
    question: result.item.question,
    matchedFields: [
      ...new Set(
        (result.matches ?? [])
          .map((match) => fieldLabels[match.key as keyof typeof fieldLabels])
          .filter(Boolean),
      ),
    ],
    score: result.score ?? 0,
  }))
}
