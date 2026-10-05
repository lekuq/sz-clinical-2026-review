import { deleteDB, openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type {
  ExamSession,
  QuestionProgress,
  StudyPosition,
  UserSettings,
  WrongRecord,
} from '@/types/persistence'

interface MedQuizDb extends DBSchema {
  settings: { key: string; value: UserSettings }
  progress: { key: string; value: QuestionProgress }
  wrongBook: { key: string; value: WrongRecord }
  examSessions: { key: string; value: ExamSession }
  studySessions: { key: string; value: StudyPosition }
}

export const DEFAULT_SETTINGS: UserSettings = {
  schemaVersion: 1,
  fontSize: 'medium',
  wrongRemovalRule: 'threeTimes',
  explanationExpanded: true,
  autoNextAfterCorrect: false,
}

const dbCache = new Map<string, Promise<IDBPDatabase<MedQuizDb>>>()

export function getBankDatabaseName(bankId: string) {
  return `medquiz__${bankId}__v1`
}

export function openBankDatabase(bankId: string): Promise<IDBPDatabase<MedQuizDb>> {
  const cached = dbCache.get(bankId)
  if (cached) return cached

  const promise = openDB<MedQuizDb>(getBankDatabaseName(bankId), 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings')
      if (!db.objectStoreNames.contains('progress')) db.createObjectStore('progress')
      if (!db.objectStoreNames.contains('wrongBook')) db.createObjectStore('wrongBook')
      if (!db.objectStoreNames.contains('examSessions')) db.createObjectStore('examSessions')
      if (!db.objectStoreNames.contains('studySessions')) db.createObjectStore('studySessions')
    },
  })

  dbCache.set(bankId, promise)
  return promise
}

export async function resetBankData(bankId: string) {
  const cached = dbCache.get(bankId)
  if (cached) {
    ;(await cached).close()
    dbCache.delete(bankId)
  }
  await deleteDB(getBankDatabaseName(bankId))
}

export function createRepository(bankId: string) {
  const database = openBankDatabase(bankId)

  return {
    async getSettings(): Promise<UserSettings> {
      return (await (await database).get('settings', 'default')) ?? { ...DEFAULT_SETTINGS }
    },
    async saveSettings(settings: UserSettings): Promise<void> {
      await (await database).put('settings', settings, 'default')
    },
    async getProgress(): Promise<Map<string, QuestionProgress>> {
      const rows = await (await database).getAll('progress')
      return new Map(rows.map((row) => [row.questionId, row]))
    },
    async saveProgress(progress: QuestionProgress): Promise<void> {
      await (await database).put('progress', progress, progress.questionId)
    },
    async getWrongRecords(): Promise<Map<string, WrongRecord>> {
      const rows = await (await database).getAll('wrongBook')
      return new Map(rows.map((row) => [row.questionId, row]))
    },
    async saveWrongRecord(record: WrongRecord): Promise<void> {
      await (await database).put('wrongBook', record, record.questionId)
    },
    async deleteWrongRecord(questionId: string): Promise<void> {
      await (await database).delete('wrongBook', questionId)
    },
    async clearWrongBook(): Promise<void> {
      await (await database).clear('wrongBook')
    },
    async getExamSessions(): Promise<ExamSession[]> {
      const sessions = await (await database).getAll('examSessions')
      return sessions.sort((a, b) => b.startedAt - a.startedAt)
    },
    async saveExamSession(session: ExamSession): Promise<void> {
      await (await database).put('examSessions', session, session.id)
    },
    async getStudyPosition(): Promise<StudyPosition | undefined> {
      return (await database).get('studySessions', 'current')
    },
    async saveStudyPosition(position: StudyPosition): Promise<void> {
      await (await database).put('studySessions', position, 'current')
    },
    async clearStudyPosition(): Promise<void> {
      await (await database).delete('studySessions', 'current')
    },
    async clearAll(): Promise<void> {
      const db = await database
      await Promise.all([
        db.clear('settings'),
        db.clear('progress'),
        db.clear('wrongBook'),
        db.clear('examSessions'),
        db.clear('studySessions'),
      ])
    },
  }
}
