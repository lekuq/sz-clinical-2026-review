export interface QuestionProgress {
  questionId: string
  answered: boolean
  lastCorrect: boolean
  correctCount: number
  wrongCount: number
  lastAnsweredAt: number
}

export interface WrongRecord {
  questionId: string
  wrongCount: number
  consecutiveCorrect: number
  lastWrongAt: number
}

export interface ExamSession {
  id: string
  startedAt: number
  endsAt: number
  submittedAt?: number
  questionIds: string[]
  answers: Record<string, string[]>
  score?: number
  passed?: boolean
}

export interface UserSettings {
  schemaVersion: number
  fontSize: 'small' | 'medium' | 'large'
  wrongRemovalRule: 'once' | 'threeTimes' | 'manual'
  explanationExpanded: boolean
  autoNextAfterCorrect: boolean
}

export interface StudyPosition {
  mode: 'study' | 'practice' | 'wrong'
  questionId: string
  updatedAt: number
}
