import { beforeEach, expect, test } from 'vitest'
import { createRepository, resetBankData } from './db'

beforeEach(async () => {
  await resetBankData('bank-a')
  await resetBankData('bank-b')
})

test('stores settings independently per bank', async () => {
  const a = createRepository('bank-a')
  const b = createRepository('bank-b')
  await a.saveSettings({
    schemaVersion: 1,
    fontSize: 'large',
    wrongRemovalRule: 'once',
    explanationExpanded: true,
    autoNextAfterCorrect: false,
  })

  expect((await b.getSettings()).fontSize).toBe('medium')
})

test('persists a wrong record', async () => {
  const repo = createRepository('bank-a')
  await repo.saveWrongRecord({
    questionId: '1',
    wrongCount: 1,
    consecutiveCorrect: 0,
    lastWrongAt: 100,
  })

  expect((await repo.getWrongRecords()).get('1')?.wrongCount).toBe(1)
})
