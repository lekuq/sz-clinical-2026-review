# 医学题库 PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有单页刷题初版重构为可离线使用、按题库独立部署的响应式 PWA，首发发布 2026 深圳医师定期考核临床类别 500 题题库。

**Architecture:** 使用 React + TypeScript + Vite 构建纯静态应用，每个 `bankId` 单独构建并部署到独立 Cloudflare Pages 免费网址。题库和搜索索引在构建时生成，学习进度、错题、设置和考试记录写入按题库隔离的 IndexedDB；应用不包含后端、账号、激活码或跨设备同步。

**Tech Stack:** React 19、TypeScript、Vite、Tailwind CSS、React Router、IndexedDB（idb）、Fuse.js、Vitest、React Testing Library、fake-indexeddb、vite-plugin-pwa、Cloudflare Pages。

**Spec:** `docs/superpowers/specs/2026-10-05-medical-question-bank-pwa-design.md`

## Global Constraints

- 零应用后端：客户端不得请求业务 API、登录服务、云数据库或云函数。
- 每个题库使用唯一 `bankId`，独立网址和独立 IndexedDB 数据库，买家界面不得提供题库切换。
- 首发仅完整支持单选题；题型枚举保留 `multiple`、`judge`、`case`，但对应作答界面不在首发范围。
- 学习数据只保存在当前浏览器设备，不实现账号和同步。
- 背题模式不写入错题集；做题模式和模拟考试答错时写入。
- 模拟考试为随机 100 道不重复单选题、60 分钟、100 分制、60 分及格、到时自动交卷。
- 智能搜题只检索题干、选项和正确答案，不检索解析。
- 错题移出规则为 `once`、`threeTimes`、`manual`，默认 `threeTimes`。
- 所有买家页面必须标注“AI 辅助解析，仅供复习参考”。
- 发布账户和网址归卖家所有；发布凭据不得进入 Git 或客户端构建产物。
- 首发题库 `bankId` 固定为 `sz-clinical-2026`。

---

### Task 1: 提取初版并建立可测试工程

**Files:**
- Create: `app/`（从 `Kimi_Agent_医学题库App方案.zip` 的 `app/` 目录提取）
- Modify: `app/package.json`
- Create: `app/vitest.config.ts`
- Create: `app/src/test/setup.ts`
- Modify: `app/src/App.tsx`
- Modify: `app/src/App.css`

**Interfaces:**
- Consumes: 无。
- Produces: `npm run test` 可运行 Vitest；`npm run build` 可构建 React 应用；后续任务使用 `@/` 路径别名。

- [x] **Step 1: 提取初版并确认基线**

```powershell
Expand-Archive -LiteralPath '.\Kimi_Agent_医学题库App方案.zip' -DestinationPath '.\_extract' -Force
Move-Item -LiteralPath '.\_extract\app' -Destination '.\app'
Remove-Item -LiteralPath '.\_extract' -Recurse -Force
npm install
npm run build
```

预期：`app/dist` 生成，初版构建通过。

- [x] **Step 2: 添加测试依赖和脚本**

在 `app/package.json` 中加入：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "fake-indexeddb": "^6.2.4",
    "jsdom": "^27.0.0",
    "vitest": "^4.0.0"
  }
}
```

执行 `npm install`。

- [x] **Step 3: 写最小测试配置和 smoke test**

创建 `app/vitest.config.ts`：

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
})
```

创建 `app/src/test/setup.ts`：

```ts
import '@testing-library/jest-dom/vitest'
import 'fake-indexeddb/auto'
```

创建 `app/src/App.test.tsx`：

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from './App'

test('renders the product title', () => {
  render(<MemoryRouter><App /></MemoryRouter>)
  expect(screen.getByText(/深圳医师定期考核/)).toBeInTheDocument()
})
```

- [x] **Step 4: 运行测试并验证基线**

```powershell
npm test
npm run build
```

预期：测试通过，构建通过。

- [x] **Step 5: 提交**

```powershell
git add app
git commit -m "chore: bootstrap app and test tooling"
```

### Task 2: 规范题库数据与构建校验

**Files:**
- Create: `app/src/types/question.ts`
- Create: `app/src/generated/bank.json`
- Create: `app/src/generated/questions.json`
- Create: `app/src/lib/bank.ts`
- Create: `app/src/lib/bank.test.ts`
- Create: `scripts/import-legacy-bank.mjs`
- Create: `scripts/validate-bank.mjs`
- Create: `scripts/validate-bank.test.ts`
- Modify: `app/package.json`

**Interfaces:**
- Consumes: 初版 `app/src/questions.json`。
- Produces: `Question`、`BankConfig`、`validateBank(config, questions): string[]`、`normalizeLegacyQuestions(raw): Question[]`。

- [x] **Step 1: 定义数据类型**

创建 `app/src/types/question.ts`：

```ts
export type QuestionType = 'single' | 'multiple' | 'judge' | 'case'

export interface QuestionOption {
  key: string
  text: string
}

export interface Question {
  id: string
  type: QuestionType
  stem: string
  options: QuestionOption[]
  answer: string[]
  answerText: string
  explanation: string
  explanationSource: 'provided' | 'ai' | 'edited'
  searchTerms: string[]
  revision: number
}

export interface BankConfig {
  bankId: string
  title: string
  version: string
  buildDate: string
  questionCount: number
  examQuestionCount: number
  examDurationMinutes: number
  passScore: number
  primaryType: QuestionType
  disclaimer: string
}
```

- [x] **Step 2: 写失败校验测试**

创建 `app/src/lib/bank.test.ts`：

```ts
import { describe, expect, test } from 'vitest'
import type { BankConfig, Question } from '@/types/question'
import { validateBank } from './bank'

const config: BankConfig = {
  bankId: 'sz-clinical-2026',
  title: '2026 深圳医师定期考核临床类别复习助手',
  version: '2026.10.05',
  buildDate: '2026-10-05T00:00:00.000Z',
  questionCount: 1,
  examQuestionCount: 100,
  examDurationMinutes: 60,
  passScore: 60,
  primaryType: 'single',
  disclaimer: 'AI 辅助解析，仅供复习参考',
}

const question: Question = {
  id: '1', type: 'single', stem: '示例题干',
  options: [{ key: 'A', text: '正确' }, { key: 'B', text: '错误' }],
  answer: ['A'], answerText: '正确', explanation: '示例解析',
  explanationSource: 'ai', searchTerms: [], revision: 1,
}

describe('validateBank', () => {
  test('accepts a valid bank', () => {
    expect(validateBank(config, [question])).toEqual([])
  })

  test('reports an answer that is not an option', () => {
    const invalid = { ...question, answer: ['C'] }
    expect(validateBank(config, [invalid])).toContain('第 1 题答案不存在于选项中')
  })
})
```

执行 `npm run test -- src/lib/bank.test.ts`，预期失败，因为 `validateBank` 尚未实现。

- [x] **Step 3: 实现校验与旧数据转换**

创建 `app/src/lib/bank.ts`：

```ts
import type { BankConfig, Question } from '@/types/question'

export function validateBank(config: BankConfig, questions: Question[]): string[] {
  const errors: string[] = []
  if (questions.length !== config.questionCount) errors.push('题目数量与配置不一致')
  questions.forEach((q, index) => {
    const label = `第 ${index + 1} 题`
    if (!q.stem.trim()) errors.push(`${label}题干为空`)
    if (q.options.length < 2) errors.push(`${label}选项不足`)
    if (!q.answer.length) errors.push(`${label}答案为空`)
    if (q.answer.some((answer) => !q.options.some((option) => option.key === answer))) {
      errors.push(`${label}答案不存在于选项中`)
    }
    if (!q.explanation.trim()) errors.push(`${label}解析为空`)
  })
  return errors
}
```

创建 `scripts/import-legacy-bank.mjs`：读取 `app/src/questions.json`，将数字 ID 转字符串、`answer` 转数组、写入 `app/src/generated/questions.json`，并写入固定配置 `app/src/generated/bank.json`。脚本必须输出题目数量、空解析数量和答案越界数量。

创建 `scripts/validate-bank.mjs`：读取生成文件，使用与 `validateBank` 相同规则校验，发现错误时以非零状态退出。

- [x] **Step 4: 运行转换、测试和构建校验**

```powershell
node scripts/import-legacy-bank.mjs
node scripts/validate-bank.mjs
npm run test -- src/lib/bank.test.ts
npm run build
```

预期：生成 500 道题，无空解析、无答案越界，测试和构建通过。

- [x] **Step 5: 提交**

```powershell
git add app/src/types app/src/generated app/src/lib/bank.ts app/src/lib/bank.test.ts scripts
git commit -m "feat: add canonical bank data and validation"
```

### Task 3: IndexedDB 持久化与题库隔离

**Files:**
- Create: `app/src/types/persistence.ts`
- Create: `app/src/lib/db.ts`
- Create: `app/src/lib/db.test.ts`
- Modify: `app/package.json`

**Interfaces:**
- Consumes: `BankConfig`。
- Produces: `openBankDatabase(bankId): Promise<IDBPDatabase<MedQuizDb>>`、`createRepository(bankId)`、`resetBankData(bankId)`。

- [x] **Step 1: 定义持久化类型**

创建 `app/src/types/persistence.ts`：

```ts
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
```

- [x] **Step 2: 写隔离和默认设置失败测试**

创建 `app/src/lib/db.test.ts`：

```ts
import { beforeEach, expect, test } from 'vitest'
import { createRepository, resetBankData } from './db'

beforeEach(async () => {
  await resetBankData('bank-a')
  await resetBankData('bank-b')
})

test('stores settings independently per bank', async () => {
  const a = createRepository('bank-a')
  const b = createRepository('bank-b')
  await a.saveSettings({ schemaVersion: 1, fontSize: 'large', wrongRemovalRule: 'once', explanationExpanded: true, autoNextAfterCorrect: false })
  expect((await b.getSettings()).fontSize).toBe('medium')
})

test('persists a wrong record', async () => {
  const repo = createRepository('bank-a')
  await repo.saveWrongRecord({ questionId: '1', wrongCount: 1, consecutiveCorrect: 0, lastWrongAt: 100 })
  expect((await repo.getWrongRecords()).get('1')?.wrongCount).toBe(1)
})
```

执行测试，预期失败，因为仓储尚未实现。

- [x] **Step 3: 实现数据库与仓储**

使用 `idb` 创建数据库 `medquiz__${bankId}__v1`，对象仓库为 `settings`、`progress`、`wrongBook`、`examSessions`、`studySessions`。实现 `DEFAULT_SETTINGS`、`createRepository`、`resetBankData`，所有键均使用字符串题号。

- [x] **Step 4: 运行测试、构建并检查多数据库**

```powershell
npm run test -- src/lib/db.test.ts
npm run build
```

预期：两个测试均通过，数据库名包含各自 `bankId`。

- [x] **Step 5: 提交**

```powershell
git add app/src/types/persistence.ts app/src/lib/db.ts app/src/lib/db.test.ts app/package.json app/package-lock.json
git commit -m "feat: add isolated IndexedDB persistence"
```

### Task 4: 进度、错题策略与考试纯函数

**Files:**
- Create: `app/src/lib/domain/progress.ts`
- Create: `app/src/lib/domain/progress.test.ts`
- Create: `app/src/lib/domain/exam.ts`
- Create: `app/src/lib/domain/exam.test.ts`

**Interfaces:**
- Consumes: `Question`、`QuestionProgress`、`WrongRecord`、`ExamSession`。
- Produces: `applyAnswerResult`、`applyWrongAnswer`、`applyCorrectAnswer`、`sampleExamQuestions`、`scoreExam`、`remainingSeconds`。

- [x] **Step 1: 写错题规则失败测试**

```ts
import { expect, test } from 'vitest'
import { applyCorrectAnswer, applyWrongAnswer } from './progress'

test('removes a wrong question after one correct answer', () => {
  const record = { questionId: '1', wrongCount: 1, consecutiveCorrect: 0, lastWrongAt: 1 }
  expect(applyCorrectAnswer(record, 'once', 2)).toBeUndefined()
})

test('removes after three consecutive correct answers', () => {
  const first = applyCorrectAnswer({ questionId: '1', wrongCount: 1, consecutiveCorrect: 0, lastWrongAt: 1 }, 'threeTimes', 2)
  const second = applyCorrectAnswer(first!, 'threeTimes', 3)
  expect(applyCorrectAnswer(second!, 'threeTimes', 4)).toBeUndefined()
})

test('wrong answer resets consecutive correct count', () => {
  const record = applyWrongAnswer({ questionId: '1', wrongCount: 1, consecutiveCorrect: 2, lastWrongAt: 1 }, 5)
  expect(record.consecutiveCorrect).toBe(0)
  expect(record.wrongCount).toBe(2)
})
```

- [x] **Step 2: 写考试逻辑失败测试**

```ts
import { expect, test } from 'vitest'
import type { Question } from '@/types/question'
import { remainingSeconds, sampleExamQuestions, scoreExam } from './exam'

const questions: Question[] = ['1','2','3'].map((id) => ({
  id, type: 'single', stem: id, options: [{ key: 'A', text: 'A' }, { key: 'B', text: 'B' }],
  answer: ['A'], answerText: 'A', explanation: '解析', explanationSource: 'ai', searchTerms: [], revision: 1,
}))

test('samples unique questions', () => {
  const sample = sampleExamQuestions(questions, 2)
  expect(new Set(sample.map((q) => q.id)).size).toBe(2)
})

test('scores and identifies wrong questions', () => {
  const result = scoreExam(questions, { '1': ['A'], '2': ['B'] }, 60)
  expect(result.correctCount).toBe(1)
  expect(result.score).toBe(33)
  expect(result.wrongIds).toEqual(['2'])
  expect(result.passed).toBe(false)
})

test('never returns negative time', () => {
  expect(remainingSeconds(1000, 2000)).toBe(0)
})
```

- [x] **Step 3: 实现纯函数并运行失败测试**

实现所有函数，保持无 React 和 IndexedDB 依赖。`sampleExamQuestions` 在题量不足时抛出 `Error('单选题不足 100 道')`。执行：

```powershell
npm run test -- src/lib/domain/progress.test.ts src/lib/domain/exam.test.ts
```

预期：全部失败后实现，再全部通过。

- [x] **Step 4: 运行全部测试**

```powershell
npm test
npm run build
```

预期：通过。

- [x] **Step 5: 提交**

```powershell
git add app/src/lib/domain
git commit -m "feat: add progress wrong-book and exam domain logic"
```

### Task 5: 本地智能搜索

**Files:**
- Create: `app/src/lib/search.ts`
- Create: `app/src/lib/search.test.ts`
- Modify: `app/package.json`

**Interfaces:**
- Consumes: `Question[]`。
- Produces: `normalizeSearchText`、`createSearchIndex`、`searchQuestions(index, query): SearchResult[]`。

- [x] **Step 1: 安装 Fuse.js 并写失败测试**

```powershell
npm install fuse.js
```

创建 `app/src/lib/search.test.ts`：

```ts
import { expect, test } from 'vitest'
import type { Question } from '@/types/question'
import { createSearchIndex, normalizeSearchText, searchQuestions } from './search'

const questions: Question[] = [
  {
    id: '1', type: 'single', stem: '高血压患者的饮食干预', options: [{ key: 'A', text: '限制钠盐' }, { key: 'B', text: '增加饮酒' }],
    answer: ['A'], answerText: '限制钠盐', explanation: '应限制钠盐', explanationSource: 'ai', searchTerms: ['血压高', '减盐'], revision: 1,
  },
]

test('normalizes spaces and punctuation', () => {
  expect(normalizeSearchText(' 高 血 压，患者 ')).toBe('高血压患者')
})

test('finds a typo by search terms', () => {
  expect(searchQuestions(createSearchIndex(questions), '血压过高')[0]?.question.id).toBe('1')
})

test('does not search explanation', () => {
  expect(searchQuestions(createSearchIndex(questions), '饮酒是否应该增加')).toHaveLength(1)
})
```

- [x] **Step 2: 运行测试验证失败**

```powershell
npm run test -- src/lib/search.test.ts
```

- [x] **Step 3: 实现搜索索引**

搜索文档字段仅为 `stem`、`optionText`、`answerText`、`searchTerms`，绝不添加 `explanation`。使用 Fuse.js，权重为题干 0.45、选项 0.25、答案 0.2、搜索词 0.1，阈值 0.35；结果返回 `question`、`matchedFields` 和 `score`。

- [x] **Step 4: 运行测试和构建**

```powershell
npm run test -- src/lib/search.test.ts
npm run build
```

预期：忽略空格和标点、错别字和近义词用例通过。

- [x] **Step 5: 提交**

```powershell
git add app/src/lib/search.ts app/src/lib/search.test.ts app/package.json app/package-lock.json
git commit -m "feat: add local fuzzy question search"
```

### Task 6: 应用外壳、响应式导航与设置

**Files:**
- Create: `app/src/app/AppShell.tsx`
- Create: `app/src/app/AppShell.test.tsx`
- Create: `app/src/hooks/useRepository.ts`
- Create: `app/src/hooks/useSettings.ts`
- Create: `app/src/pages/SettingsPage.tsx`
- Modify: `app/src/App.tsx`
- Modify: `app/src/index.css`

**Interfaces:**
- Consumes: `BankConfig`、`createRepository`、`UserSettings`。
- Produces: 路由 `/`、`/study`、`/exam`、`/wrong`、`/search`、`/settings`；`useSettings()` 返回设置和保存函数。

- [x] **Step 1: 写导航与设置页面测试**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { AppShell } from './AppShell'

test('shows all primary navigation entries', () => {
  render(<MemoryRouter><AppShell><div>内容</div></AppShell></MemoryRouter>)
  expect(screen.getByRole('link', { name: '首页' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: '刷题' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: '搜题' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: '我的' })).toBeInTheDocument()
})
```

- [x] **Step 2: 运行测试验证失败**

```powershell
npm run test -- src/app/AppShell.test.tsx
```

- [x] **Step 3: 实现外壳、设置与路由**

实现手机底部导航、平板/桌面左侧导航和内容容器；设置页面包含字号、错题规则、解析展开、自动跳题、版本、免责声明和清除数据。所有设置变更调用 IndexedDB 仓储。

- [x] **Step 4: 运行测试、构建并验证响应式宽度**

```powershell
npm run test -- src/app/AppShell.test.tsx
npm run build
```

预期：导航测试通过，360px、768px、1024px 宽度无横向滚动。

- [x] **Step 5: 提交**

```powershell
git add app/src/app app/src/hooks app/src/pages/SettingsPage.tsx app/src/App.tsx app/src/index.css
git commit -m "feat: add responsive shell and settings"
```

### Task 7: 背题与做题模式

**Files:**
- Create: `app/src/components/QuestionView.tsx`
- Create: `app/src/components/QuestionView.test.tsx`
- Create: `app/src/pages/StudyPage.tsx`
- Create: `app/src/lib/study-session.ts`
- Create: `app/src/lib/study-session.test.ts`
- Delete: `app/src/components/QuizCard.tsx`
- Modify: `app/src/pages/Home.tsx`

**Interfaces:**
- Consumes: `Question`、`QuestionProgress`、`applyAnswerResult`、`applyWrongAnswer`。
- Produces: `buildStudyQueue`、`moveStudyPosition`、`QuestionView` 组件。

- [x] **Step 1: 写队列和错题联动失败测试**

```ts
import { expect, test } from 'vitest'
import { buildStudyQueue, moveStudyPosition } from './study-session'

test('builds a sequential queue', () => {
  expect(buildStudyQueue(['1', '2'], 'sequential', () => 0).map((q) => q)).toEqual(['1', '2'])
})

test('does not move past the final question', () => {
  expect(moveStudyPosition(1, 2, 1)).toBe(1)
})
```

- [x] **Step 2: 写背题与做题组件测试**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuestionView } from './QuestionView'

const question = {
  id: '1', type: 'single' as const, stem: '示例题干',
  options: [{ key: 'A', text: '正确' }, { key: 'B', text: '错误' }],
  answer: ['A'], answerText: '正确', explanation: '示例解析',
  explanationSource: 'ai' as const, searchTerms: [], revision: 1,
}

test('back mode shows answer and explanation immediately', () => {
  render(<QuestionView question={question} mode="back" onConfirm={() => {}} />)
  expect(screen.getByText('正确答案：A')).toBeVisible()
  expect(screen.getByText('示例解析')).toBeVisible()
})

test('practice mode hides explanation before confirmation', () => {
  render(<QuestionView question={question} mode="practice" onConfirm={() => {}} />)
  expect(screen.queryByText('示例解析')).not.toBeInTheDocument()
})
```

- [x] **Step 3: 实现模式与状态**

实现顺序/随机队列、恢复位置、上一题和下一题。做题模式选中后点击“确认答案”，答错调用错题写库，答对按当前规则更新错题。背题模式直接显示正确答案与解析，不写错题。

- [x] **Step 4: 运行测试、构建和手动抽查**

```powershell
npm run test -- src/lib/study-session.test.ts src/components/QuestionView.test.tsx
npm run build
```

预期：通过；手动打开本地页面抽查 3 道题的选项和解析。

- [x] **Step 5: 提交**

```powershell
git add app/src/components/QuestionView.tsx app/src/components/QuestionView.test.tsx app/src/pages/StudyPage.tsx app/src/lib/study-session.ts app/src/lib/study-session.test.ts app/src/pages/Home.tsx app/src/components/QuizCard.tsx
git commit -m "feat: add back-study and practice modes"
```

### Task 8: 模拟考试流程

**Files:**
- Create: `app/src/pages/ExamPage.tsx`
- Create: `app/src/pages/ExamResultPage.tsx`
- Create: `app/src/components/ExamPalette.tsx`
- Create: `app/src/components/ExamPalette.test.tsx`
- Create: `app/src/hooks/useExam.ts`

**Interfaces:**
- Consumes: `sampleExamQuestions`、`scoreExam`、`remainingSeconds`、`ExamSession`。
- Produces: `useExam()`，包含开始、恢复、选择答案、交卷和自动交卷。

- [x] **Step 1: 写重置计时和自动交卷失败测试**

```tsx
import { renderHook, act } from '@testing-library/react'
import { useExam } from './useExam'

test('submits automatically when time expires', async () => {
  const { result } = renderHook(() => useExam({ now: () => 2000, durationMinutes: 1 }))
  await act(async () => { result.current.start([]) })
  expect(result.current.session?.submittedAt).toBeDefined()
})
```

- [x] **Step 2: 运行测试验证失败**

```powershell
npm run test -- src/hooks/useExam.test.tsx src/components/ExamPalette.test.tsx
```

- [x] **Step 3: 实现考试页面**

实现 60 分钟倒计时、答题卡、上一题/下一题、修改答案、主动交卷确认、到时自动交卷和刷新恢复。考试中不显示答案或解析。结果页逐题展示用户答案、正确答案和解析，并把错题写入错题集。

- [x] **Step 4: 运行测试并手动验证自动交卷**

```powershell
npm run test -- src/hooks/useExam.test.tsx src/components/ExamPalette.test.tsx
npm run build
```

预期：100 题随机、不重复；60 分及以上显示及格；到时自动交卷。

- [x] **Step 5: 提交**

```powershell
git add app/src/pages/ExamPage.tsx app/src/pages/ExamResultPage.tsx app/src/components/ExamPalette.tsx app/src/components/ExamPalette.test.tsx app/src/hooks/useExam.ts app/src/hooks/useExam.test.tsx
git commit -m "feat: add full simulation exam flow"
```

### Task 9: 错题集与智能搜题页面

**Files:**
- Create: `app/src/pages/WrongBookPage.tsx`
- Create: `app/src/components/WrongBookList.tsx`
- Create: `app/src/components/WrongBookList.test.tsx`
- Create: `app/src/pages/SearchPage.tsx`
- Create: `app/src/components/SearchResults.tsx`
- Create: `app/src/components/SearchResults.test.tsx`

**Interfaces:**
- Consumes: `WrongRecord[]`、`Question[]`、`createSearchIndex`、`searchQuestions`。
- Produces: 错题排序、单题移除、一键清空、错题复习入口和搜索结果跳转。

- [x] **Step 1: 写错题规则和搜索范围失败测试**

```tsx
import { render, screen } from '@testing-library/react'
import { WrongBookList } from './WrongBookList'

test('shows wrong count and last wrong time fields', () => {
  render(<WrongBookList records={[{ questionId: '1', wrongCount: 2, consecutiveCorrect: 0, lastWrongAt: 1000 }]} questions={new Map()} onPractice={() => {}} onRemove={() => {}} />)
  expect(screen.getByText('累计答错 2 次')).toBeVisible()
})
```

- [x] **Step 2: 运行测试验证失败**

```powershell
npm run test -- src/components/WrongBookList.test.tsx src/components/SearchResults.test.tsx
```

- [x] **Step 3: 实现页面**

错题集支持按最近答错和累计次数排序、规则切换、单题移除、清空和错题练习。搜题页支持防抖、空结果提示、命中字段标签和点击跳转。

- [x] **Step 4: 运行测试和构建**

```powershell
npm run test -- src/components/WrongBookList.test.tsx src/components/SearchResults.test.tsx
npm run build
```

- [x] **Step 5: 提交**

```powershell
git add app/src/pages/WrongBookPage.tsx app/src/components/WrongBookList.tsx app/src/components/WrongBookList.test.tsx app/src/pages/SearchPage.tsx app/src/components/SearchResults.tsx app/src/components/SearchResults.test.tsx
git commit -m "feat: add wrong-book and search pages"
```

### Task 10: PWA、离线缓存与题库独立构建

**Files:**
- Modify: `app/vite.config.ts`
- Modify: `app/src/main.tsx`
- Modify: `app/index.html`
- Modify: `app/src/generated/bank.json`
- Create: `app/public/icons/icon-192.png`
- Create: `app/public/icons/icon-512.png`
- Create: `app/src/hooks/useAppUpdate.ts`
- Create: `scripts/build-bank.mjs`
- Create: `scripts/build-bank.test.ts`
- Create: `docs/deployment.md`

**Interfaces:**
- Consumes: `bankId`、生成题库文件。
- Produces: 可安装 PWA、离线缓存、更新提示、`npm run build:bank -- --bank <id>`。

- [x] **Step 1: 安装 PWA 插件**

```powershell
npm install -D vite-plugin-pwa
```

- [x] **Step 2: 配置 Manifest 和 Service Worker**

在 `app/vite.config.ts` 中使用 `VitePWA`：

```ts
VitePWA({
  registerType: 'prompt',
  manifest: {
    name: '2026 深圳医师定期考核临床类别复习助手',
    short_name: '临床刷题助手',
    theme_color: '#0f766e',
    background_color: '#f8fafc',
    display: 'standalone',
    start_url: '/',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,json,png,svg,woff2}'],
    navigateFallback: '/index.html',
  },
})
```

- [x] **Step 3: 实现更新提示和构建脚本**

`useAppUpdate` 使用 `registerSW` 在发现新版本时显示提示，用户确认后调用 `updateSW(true)`。`scripts/build-bank.mjs` 校验 `bankId`、复制对应生成的题库文件、执行 `npm run build`，输出 `app/dist`。

- [x] **Step 4: 验证 PWA 与离线**

```powershell
npm run build
npx vite preview
```

使用浏览器开发者工具确认 Manifest、Service Worker 已注册；首次打开后切换 Offline，刷新仍能显示题库和作答。

- [x] **Step 5: 提交**

```powershell
git add app/vite.config.ts app/src/main.tsx app/index.html app/public/icons app/src/hooks/useAppUpdate.ts scripts/build-bank.mjs scripts/build-bank.test.ts docs/deployment.md app/package.json app/package-lock.json
git commit -m "feat: add offline PWA and bank-specific builds"
```

### Task 11: 首发内容、全量测试与发布准备

**Files:**
- Modify: `app/src/generated/questions.json`
- Modify: `app/src/generated/bank.json`
- Create: `docs/buyer-instructions.md`
- Create: `docs/listing-copy.md`
- Modify: `docs/deployment.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: 首发 500 题 Word、已有解析、构建产物。
- Produces: 首发生产版本、买家说明、闲鱼文案、部署步骤和验收记录。

- [x] **Step 1: 审核并补齐首发解析**

用当前初版 `questions.json` 的 500 条解析生成规范化题库；对空解析、答案越界、重复题干和异常选项执行校验。重复题干只允许在答案和选项完全一致时合并，否则保留并标记。

- [x] **Step 2: 写买家说明和上架文案**

买家说明包含：固定网址、手机添加到主屏幕、进度仅保存在本机、清除浏览器数据影响、AI 解析免责声明。上架文案不使用官方合作、包过、原题和权威认证等表述。

- [x] **Step 3: 运行全量验证**

```powershell
npm test
npm run build
node scripts/validate-bank.mjs
```

预期：全部通过；500 题全部存在解析；无答案越界。

- [x] **Step 4: 执行浏览器验收**

依次检查 360px、390px、768px、1024px、1440px 宽度；验证背题、做题、100 题考试、60 分钟计时、自动交卷、错题规则、搜题和离线模式。记录结果到 `docs/deployment.md`。

- [x] **Step 5: 提交**

```powershell
git add app/src/generated docs/buyer-instructions.md docs/listing-copy.md docs/deployment.md README.md
git commit -m "release: prepare 2026 clinical question bank"
```

### Task 12: 部署到卖家 Cloudflare Pages

**Files:**
- Modify: `docs/deployment.md`

**Interfaces:**
- Consumes: `app/dist`、卖家 Cloudflare 账户授权。
- Produces: `https://sz-clinical-2026-review.pages.dev` 或首个可用的顺序后缀网址。

- [x] **Step 1: 登录卖家账户**

```powershell
npx wrangler login
```

由卖家在浏览器中完成 Cloudflare 授权，不提交任何令牌。

- [x] **Step 2: 创建或选择 Pages 项目**

```powershell
npx wrangler pages project create sz-clinical-2026-review --production-branch main
```

如果项目名已被占用，依次使用 `sz-clinical-2026-review-01`、`sz-clinical-2026-review-02`。

- [x] **Step 3: 部署生产版本**

```powershell
npx wrangler pages deploy app/dist --project-name sz-clinical-2026-review --branch main
```

- [x] **Step 4: 验证线上版本**

检查首页、500 题数量、搜题、模拟考试、刷新恢复和 Service Worker 更新；确认无网络请求发送作答数据。记录最终固定网址。

- [x] **Step 5: 提交部署记录**

```powershell
git add docs/deployment.md
git commit -m "docs: record production deployment"
```

---

## 计划自检

- 设计文档所有首发功能均有对应任务：背题、做题、考试、错题、搜题、设置、PWA、独立题库和售卖文档。
- 无占位任务或未定义接口。
- 数据模型统一使用字符串题号、`answer: string[]` 和 `answers: Record<string, string[]>`。
- 考试计分、计时、错题规则、搜索字段和存储隔离均使用纯函数或仓储接口测试。

