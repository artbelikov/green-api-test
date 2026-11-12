import { describe, expect, it } from 'vitest'
import { i18n } from './i18n'

type UnknownRecord = Record<string, unknown>

const collectStrings = (node: UnknownRecord): string[] =>
  Object.values(node).flatMap((value) =>
    typeof value === 'string' ? [value] : collectStrings(value as UnknownRecord),
  )

describe('i18n', () => {
  it('defines every copy string as non-empty text', () => {
    expect(collectStrings(i18n).every((line) => line.trim().length > 0)).toBe(true)
  })
})
