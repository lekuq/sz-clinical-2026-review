import test from 'node:test'
import assert from 'node:assert/strict'
import { buildSearchTerms } from './search-terms.mjs'

test('builds keyword and synonym terms without answer keys', () => {
  const terms = buildSearchTerms({
    stem: '高血压患者的饮食干预',
    options: [{ key: 'A', text: '限制钠盐' }, { key: 'B', text: '增加饮酒' }],
    answerText: '限制钠盐',
  })

  assert.ok(terms.includes('高血压患者'))
  assert.ok(terms.includes('限制钠盐'))
  assert.ok(terms.includes('血压高'))
  assert.ok(!terms.includes('A'))
})
