import type { SearchResult } from '@/lib/search'
import type { Question } from '@/types/question'

interface SearchResultsProps {
  results: SearchResult[]
  onSelect: (question: Question) => void
}

export function SearchResults({ results, onSelect }: SearchResultsProps) {
  return (
    <div className="space-y-3">
      {results.map((result) => (
        <button
          key={result.question.id}
          type="button"
          className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-teal-300"
          onClick={() => onSelect(result.question)}
        >
          <p className="font-semibold leading-6">{result.question.stem}</p>
          <p className="mt-2 text-xs text-slate-500">命中：{result.matchedFields.join('、') || '题库'}</p>
          <p className="mt-2 line-clamp-2 text-sm text-slate-600">
            {result.question.options.map((option) => `${option.key}. ${option.text}`).join('　')}
          </p>
        </button>
      ))}
    </div>
  )
}
