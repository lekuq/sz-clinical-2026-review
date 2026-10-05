import { useMemo, useState } from 'react'
import questionsData from '../questions.json'
import type { Question, WrongBook, DoneMap } from '../types'
import {
  loadWrongBook, addWrong, removeWrong,
  loadDone, recordDone, loadPosition, savePosition,
} from '../lib/store'
import QuizCard from '../components/QuizCard'
import { BookOpenCheck, RotateCcw, ListOrdered, Shuffle, Trash2, Trophy, BookMarked, GraduationCap } from 'lucide-react'

const QUESTIONS = questionsData as Question[]
const TOTAL = QUESTIONS.length
const PAGE_SIZE = 20

type Tab = 'quiz' | 'wrong'
type Mode = 'sequential' | 'random'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function Home() {
  const [tab, setTab] = useState<Tab>('quiz')
  const [wrongBook, setWrongBook] = useState<WrongBook>(loadWrongBook)
  const [done, setDone] = useState<DoneMap>(loadDone)

  // 做题模块状态
  const [mode, setMode] = useState<Mode>('sequential')
  const [started, setStarted] = useState(false)
  const [queue, setQueue] = useState<Question[]>([])
  const [pos, setPos] = useState(0)
  const [finished, setFinished] = useState(false)
  const [sessionCorrect, setSessionCorrect] = useState(0)
  const [sessionAnswered, setSessionAnswered] = useState(0)

  // 错题集状态
  const [wrongSort, setWrongSort] = useState<'count' | 'recent'>('count')
  const [wrongPractice, setWrongPractice] = useState(false)
  const [wrongQueue, setWrongQueue] = useState<Question[]>([])
  const [wrongPos, setWrongPos] = useState(0)
  const [wrongFinished, setWrongFinished] = useState(false)
  const [wrongPage, setWrongPage] = useState(0)

  const doneCount = Object.keys(done).length
  const correctCount = Object.values(done).filter((d) => d.correct).length
  const wrongCount = Object.keys(wrongBook).length

  const startQuiz = (m: Mode) => {
    const q = m === 'random' ? shuffle(QUESTIONS) : QUESTIONS
    setMode(m)
    setQueue(q)
    const startPos = m === 'sequential' ? Math.min(loadPosition(), TOTAL - 1) : 0
    setPos(startPos)
    setStarted(true)
    setFinished(false)
    setSessionCorrect(0)
    setSessionAnswered(0)
  }

  const handleResult = (q: Question, correct: boolean) => {
    setSessionAnswered((n) => n + 1)
    if (correct) setSessionCorrect((n) => n + 1)
    setDone((d) => recordDone(d, q.id, correct))
    if (!correct) {
      setWrongBook((b) => addWrong(b, q.id))
    }
  }

  const handleNext = () => {
    if (pos + 1 >= queue.length) {
      setFinished(true)
      if (mode === 'sequential') savePosition(0)
    } else {
      const np = pos + 1
      setPos(np)
      if (mode === 'sequential') savePosition(np)
      window.scrollTo({ top: 0 })
    }
  }

  const startWrongPractice = () => {
    const ids = Object.keys(wrongBook).map(Number)
    const qs = shuffle(QUESTIONS.filter((q) => ids.includes(q.id)))
    setWrongQueue(qs)
    setWrongPos(0)
    setWrongPractice(true)
    setWrongFinished(false)
  }

  const handleWrongResult = (q: Question, correct: boolean) => {
    if (correct) {
      // 重练答对，自动移出错题集
      setWrongBook((b) => removeWrong(b, q.id))
    } else {
      setWrongBook((b) => addWrong(b, q.id))
    }
  }

  const handleWrongNext = () => {
    if (wrongPos + 1 >= wrongQueue.length) {
      setWrongFinished(true)
    } else {
      setWrongPos(wrongPos + 1)
      window.scrollTo({ top: 0 })
    }
  }

  const sortedWrongIds = useMemo(() => {
    const ids = Object.keys(wrongBook).map(Number)
    if (wrongSort === 'count') return ids.sort((a, b) => wrongBook[b].count - wrongBook[a].count)
    return ids.sort((a, b) => wrongBook[b].lastWrongAt - wrongBook[a].lastWrongAt)
  }, [wrongBook, wrongSort])

  const pagedWrongIds = sortedWrongIds.slice(wrongPage * PAGE_SIZE, (wrongPage + 1) * PAGE_SIZE)
  const wrongPages = Math.ceil(sortedWrongIds.length / PAGE_SIZE)
  const qMap = useMemo(() => new Map(QUESTIONS.map((q) => [q.id, q])), [])

  const statChip = (label: string, value: string | number, color: string) => (
    <div className={`flex flex-col items-center rounded-xl px-3 py-2 ${color}`}>
      <span className="text-lg font-bold leading-tight">{value}</span>
      <span className="text-xs opacity-80">{label}</span>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 顶部 */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-blue-600" />
          <div className="min-w-0">
            <h1 className="font-bold text-slate-900 leading-tight">医考通</h1>
            <p className="text-xs text-slate-500 truncate">2026 深圳医师定期考核 · 临床类别 500 题</p>
          </div>
          <div className="ml-auto text-xs text-slate-500 whitespace-nowrap">
            进度 {doneCount}/{TOTAL}
          </div>
        </div>
        {/* 进度条 */}
        <div className="h-1 bg-slate-100">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all"
            style={{ width: `${(doneCount / TOTAL) * 100}%` }}
          />
        </div>
      </header>

      {/* 主体 */}
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-4 pb-24">
        {tab === 'quiz' && (
          <>
            {!started ? (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-4 gap-2">
                  {statChip('总题数', TOTAL, 'bg-blue-50 text-blue-700')}
                  {statChip('已做', doneCount, 'bg-slate-100 text-slate-700')}
                  {statChip('正确率', doneCount ? `${Math.round((correctCount / doneCount) * 100)}%` : '—', 'bg-emerald-50 text-emerald-700')}
                  {statChip('错题', wrongCount, 'bg-rose-50 text-rose-700')}
                </div>

                <div className="rounded-2xl bg-white border border-slate-200 p-5 flex flex-col gap-4">
                  <h2 className="font-bold text-lg text-slate-900">开始做题</h2>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    选择答案后点击「确认」，立即判断对错并显示正确答案与解析。答错的题目会自动收入错题集，进度自动保存。
                  </p>
                  <button
                    onClick={() => startQuiz('sequential')}
                    className="h-13 py-3.5 rounded-xl bg-blue-600 text-white font-semibold flex items-center justify-center gap-2 active:bg-blue-700"
                  >
                    <ListOrdered className="h-5 w-5" />
                    顺序刷题{loadPosition() > 0 && loadPosition() < TOTAL ? `（从第 ${loadPosition() + 1} 题继续）` : ''}
                  </button>
                  <button
                    onClick={() => startQuiz('random')}
                    className="h-13 py-3.5 rounded-xl bg-white border-2 border-blue-600 text-blue-600 font-semibold flex items-center justify-center gap-2 active:bg-blue-50"
                  >
                    <Shuffle className="h-5 w-5" />
                    随机刷题
                  </button>
                  {doneCount > 0 && (
                    <button
                      onClick={() => {
                        if (confirm('确定要清空全部做题进度和统计吗？错题集不受影响。')) {
                          localStorage.removeItem('ykt_done_v1')
                          localStorage.removeItem('ykt_position_v1')
                          setDone({})
                        }
                      }}
                      className="text-xs text-slate-400 underline self-center"
                    >
                      清空做题进度
                    </button>
                  )}
                </div>
              </div>
            ) : finished ? (
              <div className="rounded-2xl bg-white border border-slate-200 p-8 flex flex-col items-center gap-4 text-center">
                <Trophy className="h-14 w-14 text-amber-500" />
                <h2 className="font-bold text-xl text-slate-900">本轮完成！</h2>
                <p className="text-slate-600">
                  本轮答题 {sessionAnswered} 题，答对{' '}
                  <span className="font-bold text-emerald-600">{sessionCorrect}</span> 题，正确率{' '}
                  <span className="font-bold text-blue-600">
                    {sessionAnswered ? Math.round((sessionCorrect / sessionAnswered) * 100) : 0}%
                  </span>
                </p>
                <div className="flex flex-col gap-2 w-full">
                  <button
                    onClick={() => startQuiz(mode)}
                    className="py-3 rounded-xl bg-blue-600 text-white font-semibold flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" /> 再来一轮
                  </button>
                  <button
                    onClick={() => setStarted(false)}
                    className="py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold"
                  >
                    返回首页
                  </button>
                  {wrongCount > 0 && (
                    <button
                      onClick={() => { setTab('wrong') }}
                      className="py-3 rounded-xl bg-rose-50 text-rose-600 font-semibold"
                    >
                      去攻克错题（{wrongCount}）
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <QuizCard
                key={queue[pos].id}
                question={queue[pos]}
                index={pos}
                total={queue.length}
                onResult={(c) => handleResult(queue[pos], c)}
                onNext={handleNext}
                isLast={pos + 1 >= queue.length}
              />
            )}
          </>
        )}

        {tab === 'wrong' && (
          <>
            {wrongPractice ? (
              wrongFinished ? (
                <div className="rounded-2xl bg-white border border-slate-200 p-8 flex flex-col items-center gap-4 text-center">
                  <BookOpenCheck className="h-14 w-14 text-emerald-500" />
                  <h2 className="font-bold text-xl text-slate-900">错题重练完成！</h2>
                  <p className="text-slate-600">重练中答对的题目已自动移出错题集，还剩 {wrongCount} 道错题。</p>
                  <div className="flex flex-col gap-2 w-full">
                    {wrongCount > 0 && (
                      <button onClick={startWrongPractice} className="py-3 rounded-xl bg-rose-600 text-white font-semibold">
                        继续重练剩余错题
                      </button>
                    )}
                    <button
                      onClick={() => setWrongPractice(false)}
                      className="py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold"
                    >
                      返回错题集
                    </button>
                  </div>
                </div>
              ) : (
                <QuizCard
                  key={wrongQueue[wrongPos].id}
                  question={wrongQueue[wrongPos]}
                  index={wrongPos}
                  total={wrongQueue.length}
                  isWrongPractice
                  onResult={(c) => handleWrongResult(wrongQueue[wrongPos], c)}
                  onNext={handleWrongNext}
                  isLast={wrongPos + 1 >= wrongQueue.length}
                />
              )
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                    <BookMarked className="h-5 w-5 text-rose-500" />
                    错题集（{wrongCount}）
                  </h2>
                  {wrongCount > 0 && (
                    <div className="flex gap-1 text-xs">
                      <button
                        onClick={() => { setWrongSort('count'); setWrongPage(0) }}
                        className={`px-2.5 py-1.5 rounded-lg ${wrongSort === 'count' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                      >
                        按错误次数
                      </button>
                      <button
                        onClick={() => { setWrongSort('recent'); setWrongPage(0) }}
                        className={`px-2.5 py-1.5 rounded-lg ${wrongSort === 'recent' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                      >
                        按最近答错
                      </button>
                    </div>
                  )}
                </div>

                {wrongCount === 0 ? (
                  <div className="rounded-2xl bg-white border border-slate-200 p-10 text-center text-slate-500">
                    <Trophy className="h-12 w-12 mx-auto mb-3 text-amber-400" />
                    太棒了，暂时没有错题！去做题吧～
                  </div>
                ) : (
                  <>
                    <button
                      onClick={startWrongPractice}
                      className="py-3.5 rounded-xl bg-rose-600 text-white font-semibold flex items-center justify-center gap-2 active:bg-rose-700"
                    >
                      <RotateCcw className="h-5 w-5" />
                      错题重练（答对自动移出）
                    </button>

                    <div className="flex flex-col gap-3">
                      {pagedWrongIds.map((id) => {
                        const q = qMap.get(id)!
                        const rec = wrongBook[id]
                        return (
                          <details key={id} className="rounded-xl bg-white border border-slate-200 overflow-hidden group">
                            <summary className="cursor-pointer list-none p-4 flex items-start gap-2">
                              <span className="mt-0.5 shrink-0 rounded-md bg-rose-100 text-rose-700 text-xs font-bold px-1.5 py-0.5">
                                错{rec.count}次
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-slate-900 leading-snug">
                                  {q.id}. {q.stem}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">点击展开详情 · 正确答案 {q.answer}</p>
                              </div>
                            </summary>
                            <div className="px-4 pb-4 flex flex-col gap-2 border-t border-slate-100 pt-3">
                              {q.options.map((o) => (
                                <div
                                  key={o.key}
                                  className={`text-sm rounded-lg px-3 py-2 ${
                                    o.key === q.answer ? 'bg-emerald-50 text-emerald-800 font-medium' : 'text-slate-600'
                                  }`}
                                >
                                  {o.key}. {o.text}
                                </div>
                              ))}
                              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900 leading-relaxed">
                                <span className="font-semibold">解析：</span>
                                {q.explanation}
                              </div>
                              <button
                                onClick={() => setWrongBook((b) => removeWrong(b, id))}
                                className="self-end flex items-center gap-1 text-xs text-slate-400 hover:text-rose-500"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> 移出错题集
                              </button>
                            </div>
                          </details>
                        )
                      })}
                    </div>

                    {wrongPages > 1 && (
                      <div className="flex items-center justify-center gap-3 text-sm">
                        <button
                          disabled={wrongPage === 0}
                          onClick={() => setWrongPage(wrongPage - 1)}
                          className="px-4 py-2 rounded-lg bg-white border border-slate-200 disabled:opacity-40"
                        >
                          上一页
                        </button>
                        <span className="text-slate-500">{wrongPage + 1} / {wrongPages}</span>
                        <button
                          disabled={wrongPage + 1 >= wrongPages}
                          onClick={() => setWrongPage(wrongPage + 1)}
                          className="px-4 py-2 rounded-lg bg-white border border-slate-200 disabled:opacity-40"
                        >
                          下一页
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* 底部 Tab 导航 */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-slate-200"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="mx-auto max-w-2xl grid grid-cols-2">
          <button
            onClick={() => setTab('quiz')}
            className={`flex flex-col items-center gap-0.5 py-2.5 min-h-[52px] ${
              tab === 'quiz' ? 'text-blue-600' : 'text-slate-400'
            }`}
          >
            <BookOpenCheck className="h-5 w-5" />
            <span className="text-xs font-medium">做题</span>
          </button>
          <button
            onClick={() => setTab('wrong')}
            className={`relative flex flex-col items-center gap-0.5 py-2.5 min-h-[52px] ${
              tab === 'wrong' ? 'text-rose-600' : 'text-slate-400'
            }`}
          >
            <BookMarked className="h-5 w-5" />
            <span className="text-xs font-medium">错题集</span>
            {wrongCount > 0 && (
              <span className="absolute top-1.5 right-[calc(50%-24px)] rounded-full bg-rose-500 text-white text-[10px] font-bold px-1.5 min-w-[18px] text-center">
                {wrongCount}
              </span>
            )}
          </button>
        </div>
      </nav>
    </div>
  )
}
