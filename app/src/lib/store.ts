import type { WrongBook, DoneMap } from '../types'

const WRONG_KEY = 'ykt_wrongbook_v1'
const DONE_KEY = 'ykt_done_v1'
const POS_KEY = 'ykt_position_v1'

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore
  }
}

export function loadWrongBook(): WrongBook {
  return read<WrongBook>(WRONG_KEY, {})
}

export function saveWrongBook(book: WrongBook) {
  write(WRONG_KEY, book)
}

export function addWrong(book: WrongBook, id: number): WrongBook {
  const prev = book[id]
  const next: WrongBook = {
    ...book,
    [id]: { count: (prev?.count ?? 0) + 1, lastWrongAt: Date.now() },
  }
  saveWrongBook(next)
  return next
}

export function removeWrong(book: WrongBook, id: number): WrongBook {
  const next = { ...book }
  delete next[id]
  saveWrongBook(next)
  return next
}

export function loadDone(): DoneMap {
  return read<DoneMap>(DONE_KEY, {})
}

export function recordDone(done: DoneMap, id: number, correct: boolean): DoneMap {
  const next: DoneMap = { ...done, [id]: { correct, at: Date.now() } }
  write(DONE_KEY, next)
  return next
}

export function loadPosition(): number {
  return read<number>(POS_KEY, 0)
}

export function savePosition(pos: number) {
  write(POS_KEY, pos)
}
