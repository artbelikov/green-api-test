import type { Message } from '@/shared/api/greenapi'
import type { MessagesState } from './create-messages-store'

const EMPTY_MESSAGES: readonly Message[] = []

const caches = new WeakMap<MessagesState, Map<string, readonly Message[]>>()

export const selectChatMessages = (state: MessagesState, chatId: string): readonly Message[] => {
  let cache = caches.get(state)
  if (cache === undefined) {
    cache = new Map()
    caches.set(state, cache)
  }
  const cached = cache.get(chatId)
  if (cached !== undefined) {
    return cached
  }
  const messages = state.byChat[chatId] ?? EMPTY_MESSAGES
  cache.set(chatId, messages)
  return messages
}

export const selectChatMessageById = (
  state: MessagesState,
  chatId: string,
  messageId: string,
): Message | null =>
  (state.byChat[chatId] ?? []).find((message) => message.id === messageId) ?? null

export const selectLastChatMessage = (state: MessagesState, chatId: string): Message | null => {
  const messages = selectChatMessages(state, chatId)
  return messages.length === 0 ? null : (messages[messages.length - 1] ?? null)
}

export const selectIsHistoryReady = (state: MessagesState, chatId: string): boolean =>
  state.history[chatId] === 'ready'
