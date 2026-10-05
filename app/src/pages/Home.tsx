import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import {
  ArrowRight,
  BookOpenCheck,
  CircleHelp,
  ClipboardCheck,
  GraduationCap,
  Search,
  Settings,
  TriangleAlert,
} from 'lucide-react'
import { BANK_CONFIG, QUESTIONS } from '@/config/bank'
import { useRepository } from '@/hooks/useRepository'
import type { QuestionProgress, WrongRecord } from '@/types/persistence'

export default function Home() {
  const repository = useRepository()
  const [progress, setProgress] = useState<Map<string, QuestionProgress>>(new Map())
  const [wrongBook, setWrongBook] = useState<Map<string, WrongRecord>>(new Map())

  useEffect(() => {
    let cancelled = false
    Promise.all([repository.getProgress(), repository.getWrongRecords()]).then(([storedProgress, storedWrongBook]) => {
      if (cancelled) return
      setProgress(storedProgress)
      setWrongBook(storedWrongBook)
    })
    return () => {
      cancelled = true
    }
  }, [repository])

  const answeredCount = progress.size
  const correctCount = [...progress.values()].filter((item) => item.lastCorrect).length
  const accuracy = answeredCount === 0 ? 0 : Math.round((correctCount / answeredCount) * 100)

  const actions = [
    { to: '/study?mode=back', title: '背题模式', description: '直接看答案和解析', icon: BookOpenCheck },
    { to: '/study?mode=practice', title: '做题模式', description: '选择后立即判题', icon: CircleHelp },
    { to: '/exam', title: '模拟考试', description: '100 题 · 60 分钟', icon: ClipboardCheck },
    { to: '/wrong', title: '错题回顾', description: `${wrongBook.size} 道错题待复习`, icon: TriangleAlert },
    { to: '/search', title: '智能搜题', description: '按题干、选项和答案搜索', icon: Search },
    { to: '/settings', title: '设置', description: '学习规则与本机数据', icon: Settings },
  ]

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-teal-800 to-slate-900 p-6 text-white shadow-lg md:p-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="mb-3 flex items-center gap-2 text-teal-100">
              <GraduationCap className="h-5 w-5" />
              <span className="text-sm">2026 深圳临床类别</span>
            </div>
            <h1 className="text-2xl font-bold md:text-3xl">医考通</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-teal-50">
              {BANK_CONFIG.title}，共 {QUESTIONS.length} 道题。学习进度仅保存在当前设备。
            </p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-white/10 p-3 text-center">
            <p className="text-xl font-bold">{answeredCount}</p>
            <p className="text-xs text-teal-100">已作答</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3 text-center">
            <p className="text-xl font-bold">{accuracy}%</p>
            <p className="text-xs text-teal-100">正确率</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3 text-center">
            <p className="text-xl font-bold">{wrongBook.size}</p>
            <p className="text-xs text-teal-100">错题</p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map(({ to, title, description, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <Icon className="h-5 w-5" />
              </span>
              <ArrowRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-teal-600" />
            </div>
            <h2 className="mt-4 font-bold">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </Link>
        ))}
      </section>

      <p className="text-center text-xs text-slate-500">{BANK_CONFIG.disclaimer}</p>
    </div>
  )
}

