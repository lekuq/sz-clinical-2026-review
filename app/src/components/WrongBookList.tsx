import { Trash2 } from 'lucide-react'
import type { Question } from '@/types/question'
import type { WrongRecord } from '@/types/persistence'

interface WrongBookListProps {
  records: WrongRecord[]
  questions: Map<string, Question>
  onPractice: (questionId: string) => void
  onRemove: (questionId: string) => void
}

export function WrongBookList({ records, questions, onPractice, onRemove }: WrongBookListProps) {
  return (
    <div className="space-y-3">
      {records.map((record) => {
        const question = questions.get(record.questionId)
        if (!question) return null
        return (
          <article key={record.questionId} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="line-clamp-2 font-semibold leading-6">{question.stem}</p>
            <p className="mt-2 text-sm text-slate-500">累计答错 {record.wrongCount} 次</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className="h-10 flex-1 rounded-xl bg-teal-700 text-sm font-semibold text-white"
                onClick={() => onPractice(question.id)}
              >
                重做本题
              </button>
              <button
                type="button"
                className="flex h-10 items-center justify-center gap-1 rounded-xl border border-rose-200 px-4 text-sm font-semibold text-rose-700"
                onClick={() => onRemove(question.id)}
              >
                <Trash2 className="h-4 w-4" />
                移出错题集
              </button>
            </div>
          </article>
        )
      })}
    </div>
  )
}
