import { useCallback, useEffect, useRef, useState } from 'react'
import { BANK_CONFIG, QUESTIONS } from '@/config/bank'
import { createRepository } from '@/lib/db'
import {
  createExamSession,
  isExamExpired,
  remainingSeconds,
  scoreExam,
  submitExam,
  updateExamAnswer,
} from '@/lib/domain/exam'
import { applyWrongAnswer } from '@/lib/domain/progress'
import { useRepository } from './useRepository'
import type { Question } from '@/types/question'
import type { ExamSession } from '@/types/persistence'

interface UseExamOptions {
  questions?: Question[]
  repository?: ReturnType<typeof createRepository>
  now?: () => number
  durationMinutes?: number
  questionCount?: number
  passScore?: number
  random?: () => number
}

export function useExam(options: UseExamOptions = {}) {
  const defaultRepository = useRepository()
  const repository = options.repository ?? defaultRepository
  const questions = options.questions ?? QUESTIONS
  const nowRef = useRef(options.now ?? Date.now)
  const randomRef = useRef(options.random ?? Math.random)
  const getNow = useCallback(() => nowRef.current(), [])

  const durationMinutes = options.durationMinutes ?? BANK_CONFIG.examDurationMinutes
  const questionCount = options.questionCount ?? BANK_CONFIG.examQuestionCount
  const passScore = options.passScore ?? BANK_CONFIG.passScore

  useEffect(() => {
    nowRef.current = options.now ?? Date.now
    randomRef.current = options.random ?? Math.random
  }, [options.now, options.random])

  const [session, setSession] = useState<ExamSession>()
  const [remaining, setRemaining] = useState(durationMinutes * 60)
  const [loading, setLoading] = useState(true)

  const persistSubmitted = useCallback(
    async (submitted: ExamSession) => {
      const examQuestions = submitted.questionIds
        .map((questionId) => questions.find((question) => question.id === questionId))
        .filter((question): question is Question => Boolean(question))
      const result = scoreExam(examQuestions, submitted.answers, passScore)
      const wrongBook = await repository.getWrongRecords()
      const submittedAt = submitted.submittedAt ?? getNow()

      for (const questionId of result.wrongIds) {
        const nextWrong = applyWrongAnswer(questionId, wrongBook.get(questionId), submittedAt)
        wrongBook.set(questionId, nextWrong)
        await repository.saveWrongRecord(nextWrong)
      }
      await repository.saveExamSession(submitted)
    },
    [getNow, passScore, questions, repository],
  )

  useEffect(() => {
    let cancelled = false
    repository
      .getExamSessions()
      .then(async (sessions) => {
        const active = sessions.find((item) => !item.submittedAt)
        if (!active || cancelled) return
        if (isExamExpired(active, getNow())) {
          const submitted = submitExam(active, questions, passScore, getNow())
          await persistSubmitted(submitted)
          if (!cancelled) setSession(submitted)
        } else {
          setSession(active)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [getNow, passScore, persistSubmitted, questions, repository])

  const start = useCallback(async () => {
    const next = createExamSession(questions, getNow(), durationMinutes, questionCount, randomRef.current)
    setSession(next)
    setRemaining(durationMinutes * 60)
    await repository.saveExamSession(next)
  }, [durationMinutes, getNow, questionCount, questions, repository])

  const selectAnswer = useCallback(
    async (questionId: string, answer: string[]) => {
      if (!session || session.submittedAt) return
      const next = updateExamAnswer(session, questionId, answer)
      setSession(next)
      await repository.saveExamSession(next)
    },
    [repository, session],
  )

  const submit = useCallback(async () => {
    if (!session || session.submittedAt) return
    const submitted = submitExam(session, questions, passScore, getNow())
    setSession(submitted)
    await persistSubmitted(submitted)
  }, [getNow, passScore, persistSubmitted, questions, session])

  const checkTime = useCallback(async () => {
    if (!session || session.submittedAt) return
    const seconds = remainingSeconds(session.endsAt, getNow())
    setRemaining(seconds)
    if (seconds <= 0) await submit()
  }, [getNow, session, submit])

  useEffect(() => {
    if (!session || session.submittedAt) return
    const timer = window.setInterval(() => void checkTime(), 1000)
    return () => window.clearInterval(timer)
  }, [checkTime, session])

  return {
    session,
    remaining,
    loading,
    start,
    selectAnswer,
    submit,
    checkTime,
  }
}


