export const MAX_SEND_TEXT_LENGTH = 4000

export type SendTextValidation =
  | { readonly ok: true; readonly text: string }
  | { readonly ok: false; readonly reason: 'empty' | 'tooLong' }

const countCodePoints = (text: string): number => [...text].length

export const truncateSendText = (text: string): string => {
  if (countCodePoints(text) <= MAX_SEND_TEXT_LENGTH) {
    return text
  }
  return Array.from(text).slice(0, MAX_SEND_TEXT_LENGTH).join('')
}

export const validateSendText = (text: string): SendTextValidation => {
  if (text.trim().length === 0) {
    return { ok: false, reason: 'empty' }
  }
  if (countCodePoints(text) > MAX_SEND_TEXT_LENGTH) {
    return { ok: false, reason: 'tooLong' }
  }
  return { ok: true, text }
}
