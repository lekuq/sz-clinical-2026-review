import { useState } from 'react'
import { Clock3, Send } from 'lucide-react'
import { ExamPalette } from '@/components/ExamPalette'
import { BANK_CONFIG, QUESTION_MAP } from '@/config/bank'
import { useExam } from '@/hooks/useExam'
import type { Question } from '@/types/question'
import ExamResultPage from './ExamResultPage'

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export default function ExamPage() {
  const { session, remaining, loading, start, selectAnswer, submit } = useExam()
  const [currentIndex, setCurrentIndex] = useState(0)
  const questions: Question[] = session?.questionIds.map((questionId) => QUESTION_MAP.get(questionId)).filter((question): question is Question => Boolean(question)) ?? []
  const safeIndex = Math.min(currentIndex, Math.max(0, questions.length - 1))
  const currentQuestion = questions[safeIndex]

  if (loading) return <p className="text-sm text-slate-500">正在读取考试记录…</p>

  if (!session) {
    return (
      <section className="mx-auto max-w-2xl space-y-5">
        <div className="rounded-3xl bg-gradient-to-br from-teal-800 to-slate-900 p-6 text-white shadow-lg md:p-8">
          <h1 className="text-2xl font-bold">模拟考试</h1>
          <p className="mt-2 text-sm leading-6 text-teal-50">
            从题库随机抽取 {BANK_CONFIG.examQuestionCount} 道单选题，考试时间 {BANK_CONFIG.examDurationMinutes} 分钟，满分 100 分，{BANK_CONFIG.passScore} 分及格。
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-600 shadow-sm">
          <p>考试中不显示答案和解析，可以前后切题和修改答案。</p>
          <p>时间到后系统自动交卷；交卷后显示全部答案和解析，答错题目进入错题集。</p>
        </div>
        <button
          type="button"
          className="h-13 w-full rounded-xl bg-teal-700 py-3 font-semibold text-white"
          onClick={() => void start()}
        >
          开始考试
        </button>
      </section>
    )
  }

  if (session.submittedAt) {
    return <ExamResultPage session={session} questions={questions} />
  }

  if (!currentQuestion) return <p className="text-sm text-rose-600">考试题目缺失，请重新开始考试。</p>

  const selected = session.answers[currentQuestion.id] ?? []

  return (
    <section className="mx-auto max-w-3xl space-y-4">
      <div className="sticky top-16 z-20 flex items-center justify-between rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur">
        <div className="flex items-center gap-2 font-mono text-lg font-bold text-teal-800">
          <Clock3 className="h-5 w-5" />
          {formatTime(remaining)}
        </div>
        <p className="text-sm text-slate-500">已答 {Object.values(session.answers).filter((answer) => answer.length > 0).length} / {session.questionIds.length}</p>
        <button
          type="button"
          className="flex h-10 items-center gap-1.5 rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white"
          onClick={() => {
            const unanswered = session.questionIds.length - Object.values(session.answers).filter((answer) => answer.length > 0).length
            if (window.confirm(`确定交卷吗？当前还有 ${unanswered} 道未答题。`)) void submit()
          }}
        >
          <Send className="h-4 w-4" />
          交卷
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
        <p className="text-sm text-slate-500">第 {safeIndex + 1} / {session.questionIds.length} 题</p>
        <h1 className="mt-3 text-base font-semibold leading-7 md:text-lg">{currentQuestion.stem}</h1>

        <div className="mt-5 space-y-3">
          {currentQuestion.options.map((option) => {
            const active = selected.includes(option.key)
            return (
              <button
                key={option.key}
                type="button"
                className={`flex min-h-12 w-full items-start gap-3 rounded-xl border-2 px-4 py-3 text-left transition ${
                  active ? 'border-teal-600 bg-teal-50' : 'border-slate-200 bg-white hover:border-teal-300'
                }`}
                onClick={() => void selectAnswer(currentQuestion.id, [option.key])}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-current text-sm font-bold">
                  {option.key}
                </span>
                <span className="pt-0.5 leading-6">{option.text}</span>
              </button>
            )
          })}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            className="h-12 rounded-xl border border-slate-300 bg-white font-semibold disabled:opacity-40"
            disabled={safeIndex === 0}
            onClick={() => setCurrentIndex(Math.max(0, safeIndex - 1))}
          >
            上一题
          </button>
          <button
            type="button"
            className="h-12 rounded-xl bg-teal-700 font-semibold text-white disabled:opacity-40"
            disabled={safeIndex === session.questionIds.length - 1}
            onClick={() => setCurrentIndex(Math.min(session.questionIds.length - 1, safeIndex + 1))}
          >
            下一题
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-sm font-semibold">答题卡</p>
        <ExamPalette
          questionIds={session.questionIds}
          currentId={currentQuestion.id}
          answers={session.answers}
          onSelect={(questionId) => {
            const index = session.questionIds.indexOf(questionId)
            if (index >= 0) setCurrentIndex(index)
          }}
        />
      </div>
    </section>
  )
}



