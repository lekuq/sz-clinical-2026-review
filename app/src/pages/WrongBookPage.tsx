import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { WrongBookList } from '@/components/WrongBookList'
import { QUESTION_MAP } from '@/config/bank'
import { useRepository } from '@/hooks/useRepository'
import { useSettings } from '@/hooks/useSettings'
import type { WrongRecord } from '@/types/persistence'

export default function WrongBookPage() {
  const repository = useRepository()
  const navigate = useNavigate()
  const { settings, updateSettings } = useSettings()
  const [records, setRecords] = useState<Map<string, WrongRecord>>(new Map())
  const [sort, setSort] = useState<'recent' | 'count'>('recent')

  useEffect(() => {
    let cancelled = false
    repository.getWrongRecords().then((stored) => {
      if (!cancelled) setRecords(stored)
    })
    return () => {
      cancelled = true
    }
  }, [repository])

  const sorted = useMemo(() => {
    const list = [...records.values()]
    return sort === 'recent'
      ? list.sort((a, b) => b.lastWrongAt - a.lastWrongAt)
      : list.sort((a, b) => b.wrongCount - a.wrongCount)
  }, [records, sort])

  const removeRecord = async (questionId: string) => {
    await repository.deleteWrongRecord(questionId)
    const next = new Map(records)
    next.delete(questionId)
    setRecords(next)
  }

  const clearAll = async () => {
    if (!window.confirm('确定清空错题集吗？')) return
    await repository.clearWrongBook()
    setRecords(new Map())
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => navigate(-1)} aria-label="返回" className="rounded-xl border border-slate-200 bg-white p-2">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold">错题集</h1>
          <p className="text-sm text-slate-500">共 {records.size} 道错题，只保存在当前设备。</p>
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2">
        <label className="text-sm font-semibold">
          移出规则
          <select
            className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 font-normal"
            value={settings.wrongRemovalRule}
            onChange={(event) => updateSettings({ wrongRemovalRule: event.target.value as typeof settings.wrongRemovalRule })}
          >
            <option value="once">答对一次后移出</option>
            <option value="threeTimes">连续答对三次后移出</option>
            <option value="manual">只能手动移出</option>
          </select>
        </label>
        <label className="text-sm font-semibold">
          排序
          <select
            className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 font-normal"
            value={sort}
            onChange={(event) => setSort(event.target.value as typeof sort)}
          >
            <option value="recent">最近答错优先</option>
            <option value="count">累计答错次数优先</option>
          </select>
        </label>
      </div>

      {records.size > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="h-12 rounded-xl bg-teal-700 font-semibold text-white"
            onClick={() => navigate('/study?mode=practice&source=wrong')}
          >
            开始错题练习
          </button>
          <button
            type="button"
            className="flex h-12 items-center justify-center gap-1 rounded-xl border border-rose-200 bg-rose-50 font-semibold text-rose-700"
            onClick={() => void clearAll()}
          >
            <Trash2 className="h-4 w-4" />
            清空错题集
          </button>
        </div>
      )}

      {sorted.length ? (
        <WrongBookList
          records={sorted}
          questions={QUESTION_MAP}
          onPractice={(questionId) => navigate(`/study?mode=practice&question=${questionId}`)}
          onRemove={(questionId) => void removeRecord(questionId)}
        />
      ) : (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          暂无错题。做题或模拟考试中的错题会自动记录在这里。
        </p>
      )}
    </section>
  )
}
