import type { Question } from '@/types/question'
import type { ExamSession } from '@/types/persistence'

export interface ExamScore {
  correctCount: number
  wrongIds: string[]
  score: number
  passed: boolean
}

export function sampleExamQuestions(
  questions: Question[],
  count: number,
  random: () => number = Math.random,
): Question[] {
  const singleQuestions = questions.filter((question) => question.type === 'single')
  if (singleQuestions.length < count) {
    throw new Error(`单选题不足 ${count} 道`)
  }

  const pool = [...singleQuestions]
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    const current = pool[index]
    pool[index] = pool[swapIndex]
    pool[swapIndex] = current
  }
  return pool.slice(0, count)
}

export function createExamSession(
  questions: Question[],
  now: number,
  durationMinutes: number,
  questionCount: number,
  random: () => number = Math.random,
): ExamSession {
  const sampled = sampleExamQuestions(questions, questionCount, random)
  return {
    id: `exam-${now}-${sampled[0]?.id ?? 'empty'}`,
    startedAt: now,
    endsAt: now + durationMinutes * 60 * 1000,
    questionIds: sampled.map((question) => question.id),
    answers: {},
  }
}

export function updateExamAnswer(
  session: ExamSession,
  questionId: string,
  answer: string[],
): ExamSession {
  return {
    ...session,
    answers: {
      ...session.answers,
      [questionId]: [...answer],
    },
  }
}

export function scoreExam(
  questions: Question[],
  answers: Record<string, string[]>,
  passScore: number,
): ExamScore {
  const wrongIds: string[] = []
  let correctCount = 0

  for (const question of questions) {
    const selected = [...(answers[question.id] ?? [])].sort()
    const expected = [...question.answer].sort()
    const correct = selected.length === expected.length && selected.every((value, index) => value === expected[index])
    if (correct) correctCount += 1
    else wrongIds.push(question.id)
  }

  const score = questions.length === 0 ? 0 : Math.round((correctCount / questions.length) * 100)
  return {
    correctCount,
    wrongIds,
    score,
    passed: score >= passScore,
  }
}

export function submitExam(
  session: ExamSession,
  questions: Question[],
  passScore: number,
  now: number,
): ExamSession {
  const score = scoreExam(questions, session.answers, passScore)
  return {
    ...session,
    submittedAt: now,
    score: score.score,
    passed: score.passed,
  }
}

export function isExamExpired(session: ExamSession, now: number): boolean {
  return now >= session.endsAt
}

export function remainingSeconds(endsAt: number, now: number): number {
  return Math.max(0, Math.ceil((endsAt - now) / 1000))
}
