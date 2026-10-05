import type { BankConfig, Question } from '@/types/question'

export function validateBank(config: BankConfig, questions: Question[]): string[] {
  const errors: string[] = []

  if (!config.bankId.trim()) errors.push('题库 ID 为空')
  if (!config.title.trim()) errors.push('题库名称为空')
  if (questions.length !== config.questionCount) errors.push('题目数量与配置不一致')
  if (config.primaryType === 'single' && questions.length < config.examQuestionCount) {
    errors.push(`单选题不足 ${config.examQuestionCount} 道`)
  }

  const ids = new Set<string>()
  questions.forEach((question, index) => {
    const label = `第 ${index + 1} 题`
    if (!question.id.trim()) errors.push(`${label} ID 为空`)
    if (ids.has(question.id)) errors.push(`${label} ID 重复`)
    ids.add(question.id)
    if (!question.stem.trim()) errors.push(`${label}题干为空`)
    if (question.options.length < 2) errors.push(`${label}选项不足`)
    if (!question.answer.length) errors.push(`${label}答案为空`)
    if (question.answer.some((answer) => !question.options.some((option) => option.key === answer))) {
      errors.push(`${label}答案不存在于选项中`)
    }
    if (!question.explanation.trim()) errors.push(`${label}解析为空`)
  })

  return errors
}
