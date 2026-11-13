export type PhoneErrorCode = 'empty' | 'notANumber' | 'unsupportedRegion'

export interface PhoneNormalizationError {
  readonly code: PhoneErrorCode
}

export type PhoneNormalizationResult =
  | { readonly ok: true; readonly chatId: string }
  | { readonly ok: false; readonly error: PhoneNormalizationError }

const SUPPORTED_PHONE_PATTERN = /^7\d{10}$/

const PHONE_SEPARATORS = /[\s\-()+]/g

const phoneToChatId = (digits: string): string => `${digits}@c.us`

export function normalizePhone(raw: string): PhoneNormalizationResult {
  const trimmed = raw.trim()
  if (trimmed.length === 0) {
    return { ok: false, error: { code: 'empty' } }
  }
  const compacted = trimmed.replace(PHONE_SEPARATORS, '')
  if (!/^\d+$/.test(compacted)) {
    return { ok: false, error: { code: 'notANumber' } }
  }
  if (compacted.startsWith('375')) {
    return { ok: false, error: { code: 'unsupportedRegion' } }
  }
  const digits = compacted.startsWith('8') ? `7${compacted.slice(1)}` : compacted
  if (!SUPPORTED_PHONE_PATTERN.test(digits)) {
    return { ok: false, error: { code: 'notANumber' } }
  }
  return { ok: true, chatId: phoneToChatId(digits) }
}
