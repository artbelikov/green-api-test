import { create } from 'zustand'
import type { Chat, GreenApiCredentials, Message } from '@/shared/api/greenapi'
import { escalatesDeliveryStatus } from '@/shared/api/greenapi'
import {
  createPersistThrottle,
  type KeyValueStore,
  readJson,
  writeJson,
} from '@/shared/lib/storage'
import type {
  ChatLastMessagePreview,
  ChatMessagePreviewInput,
  ChatPreviewBackfillInput,
  ChatStatusUpdateInput,
  ChatSummary,
} from './types'

const CHATS_STORAGE_KEY = 'green-api-messenger:chats:v1'

export type ChatsStoreDeps = {
  readonly storage: KeyValueStore
}

export type ChatsState = {
  readonly summaries: readonly ChatSummary[]
  readonly activeChatId: string | null
  upsertChats(chats: readonly Chat[]): void
  applyNewMessage(input: ChatMessagePreviewInput): void
  applyPreviewBackfill(input: ChatPreviewBackfillInput): void
  applyStatusUpdate(update: ChatStatusUpdateInput): void
  openChat(chatId: string): void
  closeChat(): void
  claimPreviewAttempt(chatId: string, credentials: GreenApiCredentials): boolean
  discardPreviewAttempt(chatId: string): void
  clear(): void
}

const CHAT_TYPES: ReadonlySet<string> = new Set(['private', 'group', 'channel', 'unknown'])

const previewOf = (message: Message): ChatLastMessagePreview => ({
  id: message.id,
  text: message.text,
  direction: message.direction,
  status: message.status,
  timestamp: message.timestamp,
})

const compareSummaries = (a: ChatSummary, b: ChatSummary): number =>
  b.lastActivityAt - a.lastActivityAt || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)

const sortSummaries = (summaries: readonly ChatSummary[]): ChatSummary[] =>
  [...summaries].sort(compareSummaries)

const isPreviewValue = (value: unknown): value is ChatLastMessagePreview => {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const preview = value as Record<string, unknown>
  return (
    typeof preview.id === 'string' &&
    typeof preview.text === 'string' &&
    (preview.direction === 'incoming' || preview.direction === 'outgoing') &&
    (preview.status === null ||
      preview.status === 'pending' ||
      preview.status === 'sent' ||
      preview.status === 'delivered' ||
      preview.status === 'read' ||
      preview.status === 'failed') &&
    typeof preview.timestamp === 'number'
  )
}

const isSummaryValue = (value: unknown): value is ChatSummary => {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const summary = value as Record<string, unknown>
  return (
    typeof summary.id === 'string' &&
    typeof summary.name === 'string' &&
    typeof summary.type === 'string' &&
    CHAT_TYPES.has(summary.type) &&
    (summary.username === null || typeof summary.username === 'string') &&
    (summary.phone === null || typeof summary.phone === 'string') &&
    typeof summary.unread === 'number' &&
    Number.isFinite(summary.unread) &&
    summary.unread >= 0 &&
    (summary.lastMessage === null || isPreviewValue(summary.lastMessage)) &&
    typeof summary.lastActivityAt === 'number' &&
    Number.isFinite(summary.lastActivityAt)
  )
}

const loadPersistedSummaries = (storage: KeyValueStore): ChatSummary[] => {
  const value = readJson<unknown>(storage, CHATS_STORAGE_KEY)
  if (typeof value !== 'object' || value === null) {
    return []
  }
  const chats = (value as Record<string, unknown>).chats
  if (!Array.isArray(chats)) {
    return []
  }
  return chats.filter(isSummaryValue)
}

const isDerivedChatName = (summary: ChatSummary): boolean =>
  summary.name === summary.id || (summary.phone !== null && summary.name === summary.phone)

const nameForNewChat = (fallbackName: string | null, chatId: string): string =>
  fallbackName !== null && fallbackName.length > 0 ? fallbackName : chatId

const enrichName = (existing: ChatSummary, fallbackName: string | null): string => {
  if (!isDerivedChatName(existing)) {
    return existing.name
  }
  if (fallbackName === null || fallbackName.length === 0) {
    return existing.name
  }
  return fallbackName
}

export function createChatsStore(deps: ChatsStoreDeps) {
  const persistedSummaries = loadPersistedSummaries(deps.storage)

  return create<ChatsState>()((set, get) => {
    const persistThrottle = createPersistThrottle(() => {
      writeJson(deps.storage, CHATS_STORAGE_KEY, { version: 1, chats: get().summaries })
    })

    const commit = (summaries: readonly ChatSummary[]): void => {
      const next = sortSummaries(summaries)
      set({ summaries: next })
      persistThrottle.schedule()
    }

    let previewAttemptSession: GreenApiCredentials | null = null
    const previewAttempts = new Set<string>()

    return {
      summaries: sortSummaries(persistedSummaries),
      activeChatId: null,

      upsertChats(chats) {
        if (chats.length === 0) {
          return
        }
        const { summaries } = get()
        const byId = new Map(summaries.map((summary) => [summary.id, summary]))
        for (const [index, chat] of chats.entries()) {
          const existing = byId.get(chat.id)
          if (existing === undefined) {
            byId.set(chat.id, {
              ...chat,
              name: chat.name.length > 0 ? chat.name : chat.id,
              unread: 0,
              lastMessage: null,
              lastActivityAt: -(index + 1),
            })
            continue
          }
          byId.set(chat.id, {
            ...existing,
            name: chat.name.length > 0 ? chat.name : existing.name,
            type: chat.type,
            username: chat.username,
            phone: chat.phone,
            lastActivityAt: existing.lastMessage === null ? -(index + 1) : existing.lastActivityAt,
          })
        }
        commit([...byId.values()])
      },

      applyNewMessage({ message, fallbackName, markUnread = true }) {
        const { summaries, activeChatId } = get()
        const existing = summaries.find((summary) => summary.id === message.chatId)
        if (
          existing !== undefined &&
          existing.lastMessage !== null &&
          message.timestamp < existing.lastMessage.timestamp
        ) {
          return
        }
        const unreadDelta =
          markUnread && message.direction === 'incoming' && activeChatId !== message.chatId ? 1 : 0
        const next: ChatSummary =
          existing === undefined
            ? {
                id: message.chatId,
                name: nameForNewChat(fallbackName, message.chatId),
                type: 'unknown',
                username: null,
                phone: null,
                unread: unreadDelta,
                lastMessage: previewOf(message),
                lastActivityAt: message.timestamp,
              }
            : {
                ...existing,
                name: enrichName(existing, fallbackName),
                unread: existing.unread + unreadDelta,
                lastMessage: previewOf(message),
                lastActivityAt: message.timestamp,
              }
        commit([next, ...summaries.filter((summary) => summary.id !== next.id)])
      },

      applyPreviewBackfill({ message }) {
        const { summaries } = get()
        const target = summaries.find((summary) => summary.id === message.chatId)
        if (target === undefined) {
          const tail: ChatSummary = {
            id: message.chatId,
            name: message.chatId,
            type: 'unknown',
            username: null,
            phone: null,
            unread: 0,
            lastMessage: previewOf(message),
            lastActivityAt: -(summaries.length + 1),
          }
          commit(sortSummaries([tail, ...summaries]))
          return
        }
        if (target.lastMessage !== null && message.timestamp < target.lastMessage.timestamp) {
          return
        }
        if (
          target.lastMessage?.id === message.id &&
          target.lastMessage.status === message.status &&
          target.lastMessage.timestamp === message.timestamp
        ) {
          return
        }
        commit(
          summaries.map((summary) =>
            summary.id === message.chatId
              ? { ...summary, lastMessage: previewOf(message) }
              : summary,
          ),
        )
      },

      applyStatusUpdate({ idMessage, status }) {
        const { summaries } = get()
        const target = summaries.find((summary) => summary.lastMessage?.id === idMessage)
        const currentStatus = target?.lastMessage?.status ?? null
        if (target === undefined || target.lastMessage === null || currentStatus === status) {
          return
        }
        if (!escalatesDeliveryStatus(currentStatus, status)) {
          return
        }
        const updated: ChatSummary = {
          ...target,
          lastMessage: { ...target.lastMessage, status },
        }
        commit([updated, ...summaries.filter((summary) => summary.id !== target.id)])
      },

      openChat(chatId) {
        const { summaries } = get()
        const exists = summaries.some((summary) => summary.id === chatId)
        if (!exists) {
          set({ activeChatId: chatId })
          return
        }
        const next = summaries.map((summary) =>
          summary.id === chatId && summary.unread > 0 ? { ...summary, unread: 0 } : summary,
        )
        const changedUnread = next.some((summary, index) => summary !== summaries[index])
        if (changedUnread) {
          set({ activeChatId: chatId, summaries: next })
          persistThrottle.schedule()
          return
        }
        set({ activeChatId: chatId, summaries })
      },

      closeChat() {
        set({ activeChatId: null })
      },

      claimPreviewAttempt(chatId, credentials) {
        if (previewAttemptSession !== credentials) {
          previewAttempts.clear()
          previewAttemptSession = credentials
        }
        if (previewAttempts.has(chatId)) {
          return false
        }
        previewAttempts.add(chatId)
        return true
      },

      discardPreviewAttempt(chatId) {
        previewAttempts.delete(chatId)
      },

      clear() {
        persistThrottle.cancel()
        deps.storage.remove(CHATS_STORAGE_KEY)
        previewAttempts.clear()
        previewAttemptSession = null
        set({ summaries: [], activeChatId: null })
      },
    }
  })
}
