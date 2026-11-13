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
  | 'emptyChatId'
  | 'notConnected'
  | 'resolveFailed'
  | 'statusError'
  | 'networkError'
  | 'timeoutError'
  | 'rateLimited'

export type NewChatResult =
  | { readonly ok: true; readonly chatId: string }
  | { readonly ok: false; readonly code: NewChatErrorCode }

export interface NewChatDraft {
  readonly phone: string
  readonly chatId: string
}

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

export async function createNewChat(draft: NewChatDraft): Promise<NewChatResult> {
  const trimmedChatId = draft.chatId.trim()
  const nicknameTarget = trimmedChatId.startsWith('@')
  let target: string
  let displayName: string
  if (trimmedChatId.length > 0) {
    target = trimmedChatId
    displayName = trimmedChatId
  } else {
    const normalized = normalizePhone(draft.phone)
    if (!normalized.ok) {
      return { ok: false, code: normalized.error.code }
    }
    target = normalized.chatId
    displayName = normalized.chatId.split('@')[0] ?? normalized.chatId
  }
  const credentials = useSessionStore.getState().credentials
  if (credentials === null) {
    return { ok: false, code: 'notConnected' }
  }
  try {
    const profile = await getContactInfo(credentials, target)
    if (nicknameTarget && (profile.chatId === undefined || profile.chatId === target)) {
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
