import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const config = JSON.parse(await readFile(resolve(root, 'app/src/generated/bank.json'), 'utf8'))
const questions = JSON.parse(await readFile(resolve(root, 'app/src/generated/questions.json'), 'utf8'))
const errors = []
const warnings = []

if (questions.length !== config.questionCount) {
  errors.push(`题目数量 ${questions.length} 与配置 ${config.questionCount} 不一致`)
}

const ids = new Set()
for (const [index, question] of questions.entries()) {
  const label = `第 ${index + 1} 题`
  if (!question.id || ids.has(question.id)) errors.push(`${label} ID 为空或重复`)
  ids.add(question.id)
  if (!question.stem?.trim()) errors.push(`${label}题干为空`)
  if (!Array.isArray(question.options) || question.options.length < 2) errors.push(`${label}选项不足`)
  if (!Array.isArray(question.answer) || question.answer.length === 0) errors.push(`${label}答案为空`)
  if (question.answer?.some((answer) => !question.options?.some((option) => option.key === answer))) {
    errors.push(`${label}答案不存在于选项中`)
  }
  if (!question.explanation?.trim()) errors.push(`${label}解析为空`)
}

const byStem = new Map()
for (const question of questions) {
  const key = question.stem.replace(/\s+/g, '').trim()
  const group = byStem.get(key) ?? []
  group.push(question)
  byStem.set(key, group)
}

for (const group of byStem.values()) {
  if (group.length < 2) continue
  const signatures = new Set(group.map((question) => JSON.stringify({ options: question.options, answer: question.answer })))
  if (signatures.size === 1) {
    warnings.push(`发现 ${group.length} 道完全重复题，可考虑合并：${group[0].stem}`)
  } else {
    warnings.push(`发现 ${group.length} 道同题干但答案或选项不同的题，请人工确认：${group[0].stem}`)
  }
}

for (const warning of warnings) console.warn(`WARN: ${warning}`)
for (const error of errors) console.error(`ERROR: ${error}`)

if (errors.length > 0) process.exit(1)
console.log(`Validated ${questions.length} questions with ${warnings.length} warning(s)`)
