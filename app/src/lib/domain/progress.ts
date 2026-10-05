import type { QuestionProgress, WrongRecord, UserSettings } from '@/types/persistence'

export function applyAnswerResult(
  previous: QuestionProgress | undefined,
  questionId: string,
  correct: boolean,
  now: number,
): QuestionProgress {
  return {
    questionId,
    answered: true,
    lastCorrect: correct,
    correctCount: (previous?.correctCount ?? 0) + (correct ? 1 : 0),
    wrongCount: (previous?.wrongCount ?? 0) + (correct ? 0 : 1),
    lastAnsweredAt: now,
  }
}

export function applyWrongAnswer(questionId: string, record: WrongRecord | undefined, now: number): WrongRecord {
  return {
    questionId,
    wrongCount: (record?.wrongCount ?? 0) + 1,
    consecutiveCorrect: 0,
    lastWrongAt: now,
  }
}

export function applyCorrectAnswer(
  record: WrongRecord | undefined,
  rule: UserSettings['wrongRemovalRule'],
  _now: number,
): WrongRecord | undefined {
  if (!record) return undefined
  if (rule === 'once') return undefined

  const consecutiveCorrect = record.consecutiveCorrect + 1
  if (rule === 'threeTimes' && consecutiveCorrect >= 3) return undefined

  return { ...record, consecutiveCorrect }
}

