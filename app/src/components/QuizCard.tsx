import { useState } from 'react'
import type { Question } from '../types'
import { CheckCircle2, XCircle, Lightbulb, ChevronRight } from 'lucide-react'

interface Props {
  question: Question
  index: number
  total: number
  isWrongPractice?: boolean
  onResult: (correct: boolean) => void
  onNext: () => void
  isLast: boolean
}

export default function QuizCard({ question, index, total, isWrongPractice, onResult, onNext, isLast }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  const correct = confirmed && selected === question.answer

  const handleConfirm = () => {
    if (!selected || confirmed) return
    setConfirmed(true)
    onResult(selected === question.answer)
  }

  const handleNext = () => {
    setSelected(null)
    setConfirmed(false)
    onNext()
  }

  const optionStyle = (key: string) => {
    const base =
      'w-full text-left flex items-start gap-3 rounded-xl border-2 px-4 py-3.5 min-h-[52px] transition-colors select-none'
    if (!confirmed) {
      return selected === key
        ? `${base} border-blue-500 bg-blue-50 text-blue-900`
        : `${base} border-slate-200 bg-white hover:border-blue-300 active:border-blue-400`
    }
    if (key === question.answer) return `${base} border-emerald-500 bg-emerald-50 text-emerald-900`
    if (key === selected) return `${base} border-rose-500 bg-rose-50 text-rose-900`
    return `${base} border-slate-200 bg-white opacity-60`
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span className="font-medium">
          第 <span className="text-blue-600 font-bold">{index + 1}</span> / {total} 题
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs">题号 {question.id}</span>
      </div>

      <h2 className="text-base md:text-lg font-semibold leading-relaxed text-slate-900">{question.stem}</h2>

      <div className="flex flex-col gap-2.5">
        {question.options.map((opt) => (
          <button
            key={opt.key}
            className={optionStyle(opt.key)}
            onClick={() => !confirmed && setSelected(opt.key)}
            disabled={confirmed}
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
                confirmed && opt.key === question.answer
                  ? 'border-emerald-500 bg-emerald-500 text-white'
                  : confirmed && opt.key === selected
                    ? 'border-rose-500 bg-rose-500 text-white'
                    : selected === opt.key
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-slate-300 text-slate-500'
              }`}
            >
              {opt.key}
            </span>
            <span className="leading-snug pt-0.5">{opt.text}</span>
          </button>
        ))}
      </div>

      {!confirmed ? (
        <button
          onClick={handleConfirm}
          disabled={!selected}
          className="mt-1 h-12 rounded-xl bg-blue-600 text-white font-semibold text-base disabled:opacity-40 disabled:cursor-not-allowed active:bg-blue-700 transition-colors"
        >
          确认答案
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          <div
            className={`flex items-center gap-2 rounded-xl px-4 py-3 font-semibold ${
              correct ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}
          >
            {correct ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
            {correct ? '回答正确！' : `回答错误，正确答案：${question.answer}`}
            {!correct && isWrongPractice && <span className="ml-auto text-xs font-normal">已保留在错题集</span>}
            {!correct && !isWrongPractice && <span className="ml-auto text-xs font-normal">已加入错题集</span>}
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="mb-1.5 flex items-center gap-1.5 font-semibold text-amber-800">
              <Lightbulb className="h-4 w-4" />
              解析
            </div>
            <p className="text-sm leading-relaxed text-amber-900">{question.explanation}</p>
          </div>

          <button
            onClick={handleNext}
            className="h-12 rounded-xl bg-blue-600 text-white font-semibold text-base active:bg-blue-700 transition-colors flex items-center justify-center gap-1"
          >
            {isLast ? '完成本轮' : '下一题'}
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  )
}
