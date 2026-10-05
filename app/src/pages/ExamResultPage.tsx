import { CheckCircle2, XCircle } from 'lucide-react'
import type { ExamSession } from '@/types/persistence'
import type { Question } from '@/types/question'

interface ExamResultPageProps {
  session: ExamSession
  questions: Question[]
}

export default function ExamResultPage({ session, questions }: ExamResultPageProps) {
  const questionMap = new Map(questions.map((question) => [question.id, question]))
  const examQuestions = session.questionIds
    .map((questionId) => questionMap.get(questionId))
    .filter((question): question is Question => Boolean(question))
  const correctCount = examQuestions.filter((question) => {
    const selected = session.answers[question.id] ?? []
    return selected.length === question.answer.length && selected.every((answer) => question.answer.includes(answer))
  }).length

  return (
    <section className="space-y-5">
      <div className={`rounded-3xl p-6 text-white shadow-lg ${session.passed ? 'bg-gradient-to-br from-emerald-700 to-teal-800' : 'bg-gradient-to-br from-rose-700 to-slate-900'}`}>
        <p className="text-sm text-white/80">模拟考试结果</p>
        <div className="mt-3 flex items-end gap-3">
          <span className="text-5xl font-bold">{session.score ?? 0}</span>
          <span className="pb-1 text-white/80">分</span>
        </div>
        <p className="mt-3 text-lg font-semibold">{session.passed ? '考试通过' : '暂未通过，继续复习'}</p>
        <p className="mt-2 text-sm text-white/80">
          答对 {correctCount} / {examQuestions.length} 题，及格线 60 分
        </p>
      </div>

      <div className="space-y-4">
        {examQuestions.map((question, index) => {
          const selected = session.answers[question.id] ?? []
          const correct = selected.length === question.answer.length && selected.every((answer) => question.answer.includes(answer))
          return (
            <article key={question.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                {correct ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                ) : (
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-500">第 {index + 1} 题</p>
                  <h2 className="mt-1 font-semibold leading-7">{question.stem}</h2>
                </div>
              </div>

              <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                <p className="rounded-xl bg-slate-50 px-4 py-3">
                  你的答案：<strong>{selected.length ? selected.join('、') : '未作答'}</strong>
                </p>
                <p className="rounded-xl bg-emerald-50 px-4 py-3 text-emerald-900">
                  正确答案：<strong>{question.answer.join('、')}</strong>
                </p>
              </div>

              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                <strong>解析：</strong>
                {question.explanation}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
