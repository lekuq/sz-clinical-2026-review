import { useSettings } from '@/hooks/useSettings'
import { useRepository } from '@/hooks/useRepository'
import { BANK_CONFIG, QUESTIONS } from '@/config/bank'

export default function SettingsPage() {
  const { settings, loading, updateSettings } = useSettings()
  const repository = useRepository()

  const clearAll = async () => {
    if (!window.confirm('确定清除当前设备上的全部学习进度、错题和考试记录吗？')) return
    await repository.clearAll()
    window.location.reload()
  }

  if (loading) return <p className="text-sm text-slate-500">正在读取设置…</p>

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">设置</h1>
        <p className="mt-1 text-sm text-slate-500">学习数据仅保存在当前设备，不会自动同步。</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="block text-sm font-semibold" htmlFor="font-size">题目字号</label>
        <select
          id="font-size"
          className="mt-3 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm"
          value={settings.fontSize}
          onChange={(event) => updateSettings({ fontSize: event.target.value as typeof settings.fontSize })}
        >
          <option value="small">小</option>
          <option value="medium">中</option>
          <option value="large">大</option>
        </select>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="block text-sm font-semibold" htmlFor="wrong-rule">错题移出规则</label>
        <select
          id="wrong-rule"
          className="mt-3 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm"
          value={settings.wrongRemovalRule}
          onChange={(event) => updateSettings({ wrongRemovalRule: event.target.value as typeof settings.wrongRemovalRule })}
        >
          <option value="once">答对一次后移出</option>
          <option value="threeTimes">连续答对三次后移出</option>
          <option value="manual">只能手动移出</option>
        </select>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="flex items-center justify-between gap-4 text-sm font-medium">
          <span>背题模式默认展开解析</span>
          <input
            type="checkbox"
            checked={settings.explanationExpanded}
            onChange={(event) => updateSettings({ explanationExpanded: event.target.checked })}
          />
        </label>
        <label className="flex items-center justify-between gap-4 text-sm font-medium">
          <span>做题答对后自动跳下一题</span>
          <input
            type="checkbox"
            checked={settings.autoNextAfterCorrect}
            onChange={(event) => updateSettings({ autoNextAfterCorrect: event.target.checked })}
          />
        </label>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
        <p>题库版本：{BANK_CONFIG.version}</p>
        <p className="mt-1">题目数量：{QUESTIONS.length} 道</p>
        <p className="mt-3 text-xs leading-5 text-slate-500">{BANK_CONFIG.disclaimer}</p>
      </div>

      <button
        type="button"
        className="h-12 w-full rounded-xl border border-rose-200 bg-rose-50 font-semibold text-rose-700"
        onClick={clearAll}
      >
        清除本机数据
      </button>
    </section>
  )
}
