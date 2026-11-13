export const MAX_SEND_TEXT_LENGTH = 4000

export type SendTextValidation =
  | { readonly ok: true; readonly text: string }
  | { readonly ok: false; readonly reason: 'empty' | 'tooLong' }

export const validateSendText = (text: string): SendTextValidation => {
  if (text.trim().length === 0) {
    return { ok: false, reason: 'empty' }
  }
  const charCount = [...text].length
  if (charCount > MAX_SEND_TEXT_LENGTH) {
    return { ok: false, reason: 'tooLong' }
  }
  return { ok: true, text }
}
