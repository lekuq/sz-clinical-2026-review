import { readFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const appDir = resolve(root, 'app')
const args = process.argv.slice(2)
const bankIndex = args.indexOf('--bank')
const requestedBank = bankIndex >= 0 ? args[bankIndex + 1] : undefined

const config = JSON.parse(await readFile(resolve(appDir, 'src/generated/bank.json'), 'utf8'))
const questions = JSON.parse(await readFile(resolve(appDir, 'src/generated/questions.json'), 'utf8'))

if (requestedBank && requestedBank !== config.bankId) {
  console.error(`Requested bank ${requestedBank} does not match generated bank ${config.bankId}`)
  process.exit(1)
}

const errors = []
if (questions.length !== config.questionCount) errors.push(`Expected ${config.questionCount} questions, got ${questions.length}`)
for (const [index, question] of questions.entries()) {
  if (!question.explanation?.trim()) errors.push(`Question ${index + 1} has no explanation`)
  if (!question.answer?.every((answer) => question.options?.some((option) => option.key === answer))) {
    errors.push(`Question ${index + 1} has an invalid answer`)
  }
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log(`Building ${config.bankId} v${config.version} with ${questions.length} questions`)
const result = spawnSync('npm', ['run', 'build'], {
  cwd: appDir,
  stdio: 'inherit',
  shell: process.platform === 'win32',
})
if (result.error) {
  console.error(result.error)
  process.exit(1)
}
process.exit(result.status ?? 1)

