import { useChatsStore } from '@/entities/chats'
import { useSessionStore } from '@/entities/session'
import { openChat } from '@/features/open-chat'
import {
  ApiError,
  getContactInfo,
  mapContactInfo,
  normalizePhone,
  type PhoneErrorCode,
} from '@/shared/api/greenapi'

export type NewChatErrorCode =
  | PhoneErrorCode
  | 'notConnected'
  | 'resolveFailed'
  | 'statusError'
  | 'networkError'
  | 'timeoutError'
  | 'rateLimited'

export type NewChatResult =
  | { readonly ok: true; readonly chatId: string }
  | { readonly ok: false; readonly code: NewChatErrorCode }

export type NewChatDraft = {
  readonly phone: string
  readonly chatId: string
}

const NAME_LIKE_TARGET_PATTERN = /^@?\p{L}[\p{L}\p{N}_.]*$/u
const DIGIT_ONLY_PATTERN = /^\d+$/

const mapApiError = (error: unknown): NewChatErrorCode => {
  if (!(error instanceof ApiError)) {
    return 'statusError'
  }
  if (error.kind === 'network') {
    return 'networkError'
  }
  if (error.kind === 'timeout') {
    return 'timeoutError'
  }
  if (error.kind === 'status' && error.status === 429) {
    return 'rateLimited'
  }
  return 'statusError'
}

const resolveTarget = async (
  target: string,
  displayName: string,
  verbatimAllowed: boolean,
): Promise<NewChatResult> => {
  const credentials = useSessionStore.getState().credentials
  if (credentials === null) {
    return { ok: false, code: 'notConnected' }
  }
  try {
    const profile = await getContactInfo(credentials, target)
    if (!verbatimAllowed && (profile.chatId === undefined || profile.chatId === target)) {
      return { ok: false, code: 'resolveFailed' }
    }
    const chat = mapContactInfo(profile, { chatId: target, name: displayName })
    if (chat.id.length === 0) {
      return { ok: false, code: 'resolveFailed' }
    }
    useChatsStore.getState().upsertChats([chat])
    void openChat(chat.id)
    return { ok: true, chatId: chat.id }
  } catch (error) {
    return { ok: false, code: mapApiError(error) }
  }
}

export async function createNewChat(draft: NewChatDraft): Promise<NewChatResult> {
  const trimmedChatId = draft.chatId.trim()
  if (trimmedChatId.length > 0) {
    return resolveTarget(
      trimmedChatId,
      trimmedChatId,
      !NAME_LIKE_TARGET_PATTERN.test(trimmedChatId),
    )
  }
  const normalized = normalizePhone(draft.phone)
  if (normalized.ok) {
    return resolveTarget(
      normalized.chatId,
      normalized.chatId.split('@')[0] ?? normalized.chatId,
      true,
    )
  }
  if (normalized.error.code === 'notANumber' && DIGIT_ONLY_PATTERN.test(draft.phone.trim())) {
    const bareId = draft.phone.trim()
    return resolveTarget(bareId, bareId, true)
  }
  return { ok: false, code: normalized.error.code }
}
