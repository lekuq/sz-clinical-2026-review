import bankData from '@/generated/bank.json'
import questionsData from '@/generated/questions.json'
import { createSearchIndex } from '@/lib/search'
import type { BankConfig, Question } from '@/types/question'

export const BANK_CONFIG = bankData as BankConfig
export const QUESTIONS = questionsData as Question[]
export const QUESTION_MAP = new Map(QUESTIONS.map((question) => [question.id, question]))
export const SEARCH_INDEX = createSearchIndex(QUESTIONS)
