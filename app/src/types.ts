export interface Option {
  key: string
  text: string
}

export interface Question {
  id: number
  stem: string
  options: Option[]
  answer: string
  explanation: string
}

export interface WrongRecord {
  count: number // 累计答错次数
  lastWrongAt: number // 最近答错时间戳
}

// localStorage: 错题集
export type WrongBook = Record<number, WrongRecord>

// localStorage: Record<questionId, boolean> 是否答对过
export type DoneMap = Record<number, { correct: boolean; at: number }>
