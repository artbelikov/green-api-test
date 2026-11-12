import { describe, expect, it } from 'vitest'
import { normalizePhone } from './phone'

describe('normalizePhone', () => {
  it('normalizes supported RU/KZ input formats into the phone@c.us chat id', () => {
    const supportedCases: ReadonlyArray<readonly [string, string]> = [
      ['79161234567', '79161234567@c.us'],
      ['+79161234567', '79161234567@c.us'],
      ['89161234567', '79161234567@c.us'],
      ['+7 916 123 45 67', '79161234567@c.us'],
      ['8 (916) 123-45-67', '79161234567@c.us'],
      ['77770001234', '77770001234@c.us'],
      ['+77770001234', '77770001234@c.us'],
    ]
    for (const [input, expectedChatId] of supportedCases) {
      expect(normalizePhone(input)).toEqual({ ok: true, chatId: expectedChatId })
    }
  })

  it('rejects empty and malformed input', () => {
    const malformedCases: ReadonlyArray<readonly [string, string]> = [
      ['', 'empty'],
      ['   ', 'empty'],
      ['7916123456', 'notANumber'],
      ['9161234567', 'notANumber'],
      ['7916', 'notANumber'],
      ['891612345678', 'notANumber'],
      ['abc', 'notANumber'],
      ['+7abc1234567', 'notANumber'],
      ['+9161234567', 'notANumber'],
    ]
    for (const [input, expectedCode] of malformedCases) {
      expect(normalizePhone(input)).toEqual({ ok: false, error: { code: expectedCode } })
    }
  })

  it('rejects non-RU/KZ regions such as Belarus 375 numbers with a dedicated code', () => {
    for (const input of ['375291234567', '+375291234567']) {
      expect(normalizePhone(input)).toEqual({ ok: false, error: { code: 'unsupportedRegion' } })
    }
  })
})
