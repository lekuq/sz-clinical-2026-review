import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildSearchTerms } from './search-terms.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const legacyPath = resolve(root, 'app/src/questions.json')
const outputDir = resolve(root, 'app/src/generated')
const questionsPath = resolve(outputDir, 'questions.json')
const bankPath = resolve(outputDir, 'bank.json')

const legacy = JSON.parse(await readFile(legacyPath, 'utf8'))

const questions = legacy.map((item) => {
  const answer = [String(item.answer)].filter(Boolean)
  const options = item.options.map((option) => ({
    key: String(option.key),
    text: String(option.text).trim(),
  }))
  const answerText = options
    .filter((option) => answer.includes(option.key))
    .map((option) => option.text)
    .join('；')
  const stem = String(item.stem).trim()

  return {
    id: String(item.id),
    type: 'single',
    stem,
    options,
    answer,
    answerText,
    explanation: String(item.explanation ?? '').trim(),
    explanationSource: 'ai',
    searchTerms: buildSearchTerms({ stem, options, answerText }),
    revision: 1,
  }
})

const bank = {
  bankId: 'sz-clinical-2026',
  title: '2026 深圳医师定期考核临床类别复习助手',
  version: '2026.10.05',
  buildDate: '2026-10-05T00:00:00.000Z',
  questionCount: questions.length,
  examQuestionCount: 100,
  examDurationMinutes: 60,
  passScore: 60,
  primaryType: 'single',
  disclaimer: 'AI 辅助解析，仅供复习参考',
}

await mkdir(outputDir, { recursive: true })
await writeFile(questionsPath, `${JSON.stringify(questions, null, 2)}\n`, 'utf8')
await writeFile(bankPath, `${JSON.stringify(bank, null, 2)}\n`, 'utf8')

const emptyExplanations = questions.filter((question) => !question.explanation).length
const invalidAnswers = questions.filter((question) => {
  return question.answer.some((answer) => !question.options.some((option) => option.key === answer))
}).length

console.log(`Generated ${questions.length} questions`)
console.log(`Empty explanations: ${emptyExplanations}`)
console.log(`Invalid answers: ${invalidAnswers}`)
