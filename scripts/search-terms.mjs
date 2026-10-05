const synonymGroups = [
  ['高血压', '血压高', '血压过高'],
  ['心肌梗死', '心梗'],
  ['脑梗死', '脑梗'],
  ['抗菌药物', '抗生素'],
  ['糖尿病', '血糖高'],
  ['首选', '首先选择'],
  ['禁用', '不宜使用', '禁止使用'],
  ['最常见', '最多见'],
  ['呼吸困难', '气促'],
  ['恶心呕吐', '恶心、呕吐'],
  ['血常规', '全血细胞计数'],
  ['肝功能', '肝脏功能'],
  ['肾功能', '肾脏功能'],
]

function cleanTerm(value) {
  return value.replace(/[^\p{Script=Han}A-Za-z0-9]/gu, '').trim()
}

export function buildSearchTerms(question) {
  const sourceText = [question.stem, ...question.options.map((option) => option.text), question.answerText ?? ''].join(' ')
  const terms = new Set()

  for (const chunk of sourceText.split(/[，。；：、！？（）()\s的及和或与]/u)) {
    const term = cleanTerm(chunk)
    if (term.length >= 2 && term.length <= 12) terms.add(term)

    if (term.length > 12) {
      terms.add(term.slice(0, 6))
      terms.add(term.slice(-6))
    }
  }

  for (const group of synonymGroups) {
    if (group.some((word) => sourceText.includes(word))) {
      group.forEach((word) => terms.add(word))
    }
  }

  return [...terms].filter((term) => !/^[A-Ea-e]$/.test(term)).slice(0, 20)
}
