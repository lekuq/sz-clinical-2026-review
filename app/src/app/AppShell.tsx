import type { ReactNode } from 'react'
import { NavLink } from 'react-router'
import { BookOpenCheck, Home, Search, UserRound } from 'lucide-react'
import { BANK_CONFIG } from '@/config/bank'

const navigation = [
  { to: '/', label: '首页', icon: Home, end: true },
  { to: '/study', label: '刷题', icon: BookOpenCheck, end: false },
  { to: '/search', label: '搜题', icon: Search, end: false },
  { to: '/settings', label: '我的', icon: UserRound, end: false },
]

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur md:pl-64">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 md:px-8">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold md:text-base">{BANK_CONFIG.title}</p>
            <p className="text-xs text-slate-500">AI 辅助解析，仅供复习参考</p>
          </div>
        </div>
      </header>

      <aside className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white md:inset-y-0 md:left-0 md:right-auto md:w-64 md:border-r md:border-t-0">
        <div className="hidden h-20 items-center border-b border-slate-200 px-6 md:flex">
          <div>
            <p className="text-base font-bold">临床刷题助手</p>
            <p className="mt-1 text-xs text-slate-500">{BANK_CONFIG.version}</p>
          </div>
        </div>
        <nav aria-label="主导航" className="grid h-16 grid-cols-4 md:flex md:h-auto md:flex-col md:gap-2 md:p-4">
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors md:h-12 md:flex-row md:justify-start md:gap-3 md:rounded-xl md:px-4 md:text-sm ${
                  isActive ? 'text-teal-700 md:bg-teal-50' : 'text-slate-500 hover:text-slate-900 md:hover:bg-slate-100'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-6xl px-4 pb-24 pt-5 md:pl-72 md:pr-8 md:pb-10 md:pt-8">
        {children}
      </main>
    </div>
  )
}
