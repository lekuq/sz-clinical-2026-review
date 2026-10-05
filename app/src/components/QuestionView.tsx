import { useState } from 'react'
import { CheckCircle2, ChevronLeft, ChevronRight, Lightbulb, XCircle } from 'lucide-react'
import type { Question } from '@/types/question'

interface QuestionViewProps {
  question: Question
  mode: 'back' | 'practice'
  index?: number
  total?: number
  onConfirm?: (correct: boolean) => void
  onPrevious?: () => void
  onNext?: () => void
  isLast?: boolean
}

export function QuestionView({
  question,
  mode,
  index,
  total,
  onConfirm,
  onPrevious,
  onNext,
  isLast = false,
}: QuestionViewProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(mode === 'back')

  const correct = confirmed && selected !== null && question.answer.includes(selected)

  const handleConfirm = () => {
    if (!selected || confirmed) return
    const isCorrect = question.answer.includes(selected)
    setConfirmed(true)
    onConfirm?.(isCorrect)
  }

  const optionClass = (key: string) => {
    const base =
      'w-full min-h-12 rounded-xl border-2 px-4 py-3 text-left transition-colors flex items-start gap-3'
    if (!confirmed) {
      return selected === key
        ? `${base} border-teal-600 bg-teal-50 text-teal-950`
        : `${base} border-slate-200 bg-white hover:border-teal-300`
    }
    if (question.answer.includes(key)) return `${base} border-emerald-500 bg-emerald-50 text-emerald-950`
    if (selected === key) return `${base} border-rose-500 bg-rose-50 text-rose-950`
    return `${base} border-slate-200 bg-white opacity-60`
  }

  return (
    <article className="space-y-5">
      {(index !== undefined || total !== undefined) && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>第 {index !== undefined ? index + 1 : '-'} / {total ?? '-'} 题</span>
          <span>题目编号 {question.id}</span>
        </div>
      )}

      <h2 className="text-base font-semibold leading-7 text-slate-950 md:text-lg">{question.stem}</h2>

      <div className="space-y-3">
        {question.options.map((option) => (
          <button
            key={option.key}
            type="button"
            className={optionClass(option.key)}
            onClick={() => !confirmed && setSelected(option.key)}
            disabled={confirmed}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-current text-sm font-bold">
              {option.key}
            </span>
            <span className="pt-0.5 leading-6">{option.text}</span>
          </button>
        ))}
      </div>

      {mode === 'practice' && !confirmed && (
        <button
          type="button"
          disabled={!selected}
          className="h-12 w-full rounded-xl bg-teal-700 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          onClick={handleConfirm}
        >
          确认答案
        </button>
      )}

      {confirmed && (
        <div className="space-y-4">
          <div
            className={`flex items-center gap-2 rounded-xl px-4 py-3 font-semibold ${
              mode === 'back' || correct ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
            }`}
          >
            {mode === 'back' ? (
              <>正确答案：{question.answer.join('、')}</>
            ) : correct ? (
              <>
                <CheckCircle2 className="h-5 w-5" />
                回答正确
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5" />
                回答错误，正确答案：{question.answer.join('、')}
              </>
            )}
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="mb-2 flex items-center gap-2 font-semibold text-amber-900">
              <Lightbulb className="h-4 w-4" />
              解析
            </div>
            <p className="text-sm leading-6 text-amber-950">{question.explanation}</p>
            <p className="mt-3 text-xs text-amber-700">AI 辅助解析，仅供复习参考</p>
          </div>
        </div>
      )}

      {(onPrevious || onNext) && (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="flex h-12 items-center justify-center gap-1 rounded-xl border border-slate-300 bg-white font-semibold"
            onClick={onPrevious}
            disabled={!onPrevious}
          >
            <ChevronLeft className="h-5 w-5" />
            上一题
          </button>
          <button
            type="button"
            className="flex h-12 items-center justify-center gap-1 rounded-xl bg-teal-700 font-semibold text-white"
            onClick={onNext}
            disabled={!onNext}
          >
            {isLast ? '完成' : '下一题'}
            {!isLast && <ChevronRight className="h-5 w-5" />}
          </button>
        </div>
      )}
    </article>
  )
}
