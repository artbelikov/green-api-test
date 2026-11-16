import { describe, expect, it } from 'vitest'
import { MAX_SEND_TEXT_LENGTH, truncateSendText, validateSendText } from './validate-send-text'

describe('validateSendText', () => {
  it('accepts ordinary text and keeps it untouched', () => {
    const result = validateSendText('Привет, это тестовое сообщение')

    expect(result).toEqual({ ok: true, text: 'Привет, это тестовое сообщение' })
  })

  it('rejects empty and whitespace-only text', () => {
    expect(validateSendText('')).toEqual({ ok: false, reason: 'empty' })
    expect(validateSendText('   \n\t ')).toEqual({ ok: false, reason: 'empty' })
  })

  it('accepts text at the limit and rejects longer text', () => {
    const atLimit = 'a'.repeat(MAX_SEND_TEXT_LENGTH)
    const overLimit = `${atLimit}a`

    expect(validateSendText(atLimit)).toEqual({ ok: true, text: atLimit })
    expect(validateSendText(overLimit)).toEqual({ ok: false, reason: 'tooLong' })
  })

  it('accepts UTF-8 emoji including multi-code-point sequences', () => {
    const result = validateSendText('Привет 👋🚀')

    expect(result).toEqual({ ok: true, text: 'Привет 👋🚀' })
    expect(validateSendText('🇷🇺👍🏽'.repeat(50))).toEqual({
      ok: true,
      text: '🇷🇺👍🏽'.repeat(50),
    })
  })

  it('counts emoji as single characters toward the limit', () => {
    const emoji = '🚀'
    const atLimit = emoji.repeat(MAX_SEND_TEXT_LENGTH)
    const overLimit = `${atLimit}${emoji}`

    expect(validateSendText(atLimit)).toEqual({ ok: true, text: atLimit })
    expect(validateSendText(overLimit)).toEqual({ ok: false, reason: 'tooLong' })
  })

  describe('truncateSendText', () => {
    it('keeps texts within the limit untouched', () => {
      const text = 'Привет 👋'
      expect(truncateSendText(text)).toBe(text)
    })

    it('cuts at the code-point limit without splitting surrogate pairs', () => {
      const emoji = '🚀'
      expect([...truncateSendText(emoji.repeat(MAX_SEND_TEXT_LENGTH + 1))]).toHaveLength(
        MAX_SEND_TEXT_LENGTH,
      )
      expect(truncateSendText(`${'a'.repeat(MAX_SEND_TEXT_LENGTH)}bc`)).toBe(
        'a'.repeat(MAX_SEND_TEXT_LENGTH),
      )
    })
  })
})
