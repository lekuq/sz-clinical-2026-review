import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { useNavigate } from 'react-router'
import { SearchResults } from '@/components/SearchResults'
import { SEARCH_INDEX } from '@/config/bank'
import { searchQuestions, type SearchResult } from '@/lib/search'

export default function SearchPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])

  useEffect(() => {
    const normalized = query.trim()
    if (!normalized) return
    const timer = window.setTimeout(() => {
      setResults(searchQuestions(SEARCH_INDEX, normalized))
    }, 220)
    return () => window.clearTimeout(timer)
  }, [query])

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">智能搜题</h1>
        <p className="mt-1 text-sm text-slate-500">搜索题干、选项和正确答案；不搜索解析。</p>
      </div>

      <label className="relative block">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setResults([])
          }}
          placeholder="输入题干关键词、选项或答案"
          className="h-13 w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-base shadow-sm outline-none focus:border-teal-500"
        />
      </label>

      {query.trim() && (
        <p className="text-sm text-slate-500">{results.length ? `找到 ${results.length} 道相关题目` : '没有找到匹配题目，可以尝试更短的关键词。'}</p>
      )}

      {results.length > 0 && (
        <SearchResults
          results={results}
          onSelect={(question) => navigate(`/study?mode=back&question=${question.id}`)}
        />
      )}

      {!query.trim() && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm leading-6 text-slate-500">
          支持忽略空格和标点、常见错别字和有限近义表达。搜索结果可直接跳转到题目解析。
        </div>
      )}
    </section>
  )
}

