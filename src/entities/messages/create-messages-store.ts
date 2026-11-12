import { create } from 'zustand'
import type {
  ApiError,
  ChatHistoryArgs,
  GreenApiCredentials,
  GreenApiHistoryItem,
  Message,
  MessageDeliveryStatus,
  MessageNotificationEvent,
  StatusNotificationEvent,
} from '@/shared/api/greenapi'
import { mapHistoryMessage } from '@/shared/api/greenapi'
import { type KeyValueStore, readJson, writeJson } from '@/shared/lib/storage'
import type { HistoryPhase, SendFailure } from './types'

const MESSAGES_STORAGE_KEY = 'green-api-messenger:messages:v1'

export const DEFAULT_CAPACITY_PER_CHAT = 200

export interface MessagesGateway {
  getChatHistory(
    credentials: GreenApiCredentials,
    args: ChatHistoryArgs,
  ): Promise<GreenApiHistoryItem[]>
}

export interface MessagesStoreDeps {
  readonly gateway: MessagesGateway
  readonly now: () => number
  readonly storage: KeyValueStore
  readonly capacityPerChat: number
}

export interface MessagesState {
  readonly byChat: Record<string, readonly Message[]>
  readonly history: Record<string, HistoryPhase>
  readonly failedSend: SendFailure | null
  appendPending(chatId: string, text: string): string
  reconcileSent(chatId: string, pendingId: string, idMessage: string): boolean
  markSendFailed(chatId: string, pendingId: string, error: ApiError): void
  applyMessageEvent(event: MessageNotificationEvent): boolean
  applyStatusEvent(event: StatusNotificationEvent): boolean
  loadChatHistory(chatId: string, credentials: GreenApiCredentials): Promise<HistoryPhase>
  clear(): void
}

const STATUS_RANK: Readonly<Record<string, number>> = {
  pending: 0,
  sent: 1,
  delivered: 2,
  read: 3,
}

const compareMessages = (a: Message, b: Message): number =>
  a.timestamp - b.timestamp || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)

const rankOf = (status: MessageDeliveryStatus | null): number =>
  status === null ? 0 : (STATUS_RANK[status] ?? 0)

const canEscalate = (
  current: MessageDeliveryStatus | null,
  next: MessageDeliveryStatus,
): boolean => (next === 'failed' ? true : rankOf(next) > rankOf(current))

const mergeMessages = (
  existing: readonly Message[],
  additions: readonly Message[],
): readonly Message[] | null => {
  const byId = new Map<string, Message>()
  for (const message of existing) {
    byId.set(message.id, message)
  }
  let changed = false
  for (const addition of additions) {
    if (byId.has(addition.id)) {
      continue
    }
    byId.set(addition.id, addition)
    changed = true
  }
  if (!changed) {
    return null
  }
  return [...byId.values()].sort(compareMessages)
}

const isMessageValue = (value: unknown): value is Message => {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const message = value as Record<string, unknown>
  return (
    typeof message.id === 'string' &&
    typeof message.chatId === 'string' &&
    (message.direction === 'incoming' || message.direction === 'outgoing') &&
    typeof message.text === 'string' &&
    typeof message.timestamp === 'number' &&
    Number.isFinite(message.timestamp) &&
    (message.status === null ||
      message.status === 'pending' ||
      message.status === 'sent' ||
      message.status === 'delivered' ||
      message.status === 'read' ||
      message.status === 'failed')
  )
}

interface PersistedMessages {
  readonly version: number
  readonly chats: unknown
  readonly history: unknown
}

const loadPersistedChats = (storage: KeyValueStore): Record<string, readonly Message[]> => {
  const value = readJson<PersistedMessages>(storage, MESSAGES_STORAGE_KEY)
  if (
    typeof value !== 'object' ||
    value === null ||
    typeof value.chats !== 'object' ||
    value.chats === null
  ) {
    return {}
  }
  const result: Record<string, readonly Message[]> = {}
  for (const [chatId, entries] of Object.entries(value.chats)) {
    if (!Array.isArray(entries)) {
      continue
    }
    const messages = entries
      .filter(isMessageValue)
      .filter((message) => message.status !== 'pending')
      .sort(compareMessages)
    result[chatId] = messages
  }
  return result
}

const loadPersistedHistory = (storage: KeyValueStore): Record<string, HistoryPhase> => {
  const value = readJson<PersistedMessages>(storage, MESSAGES_STORAGE_KEY)
  if (
    typeof value !== 'object' ||
    value === null ||
    typeof value.history !== 'object' ||
    value.history === null
  ) {
    return {}
  }
  const result: Record<string, HistoryPhase> = {}
  for (const [chatId, phase] of Object.entries(value.history)) {
    if (phase === 'ready') {
      result[chatId] = 'ready'
    }
  }
  return result
}

export function createMessagesStore(deps: MessagesStoreDeps) {
  const historyLoads = new Map<string, Promise<HistoryPhase>>()

  return create<MessagesState>()((set, get) => {
    const persist = (): void => {
      const { byChat, history } = get()
      const persistedChats: Record<string, readonly Message[]> = {}
      for (const [chatId, messages] of Object.entries(byChat)) {
        persistedChats[chatId] = messages.filter((message) => message.status !== 'pending')
      }
      const persistedHistory: Record<string, HistoryPhase> = {}
      for (const [chatId, phase] of Object.entries(history)) {
        if (phase === 'ready') {
          persistedHistory[chatId] = phase
        }
      }
      writeJson(deps.storage, MESSAGES_STORAGE_KEY, {
        version: 1,
        chats: persistedChats,
        history: persistedHistory,
      })
    }

    const commitChat = (chatId: string, messages: readonly Message[]): void => {
      const { byChat } = get()
      set({ byChat: { ...byChat, [chatId]: messages.slice(-deps.capacityPerChat) } })
      persist()
    }

    return {
      byChat: loadPersistedChats(deps.storage),
      history: loadPersistedHistory(deps.storage),
      failedSend: null,

      appendPending(chatId, text) {
        const pendingId = crypto.randomUUID()
        const { byChat } = get()
        const messages = byChat[chatId] ?? []
        const pending: Message = {
          id: pendingId,
          chatId,
          direction: 'outgoing',
          text,
          timestamp: deps.now(),
          status: 'pending',
        }
        commitChat(chatId, [...messages, pending].sort(compareMessages))
        return pendingId
      },

      reconcileSent(chatId, pendingId, idMessage) {
        const { byChat } = get()
        const messages = byChat[chatId] ?? []
        const index = messages.findIndex((message) => message.id === pendingId)
        if (index === -1) {
          return false
        }
        const alreadyReceived = messages.some((message) => message.id === idMessage)
        const next = alreadyReceived
          ? messages.filter((message) => message.id !== pendingId)
          : messages.map((message) =>
              message.id === pendingId
                ? { ...message, id: idMessage, status: 'sent' as const }
                : message,
            )
        commitChat(chatId, next)
        return true
      },

      markSendFailed(chatId, pendingId, error) {
        const { byChat } = get()
        const messages = byChat[chatId] ?? []
        const exists = messages.some((message) => message.id === pendingId)
        if (!exists) {
          return
        }
        set({
          failedSend: { chatId, pendingId, error },
          byChat: {
            ...byChat,
            [chatId]: messages.map((message) =>
              message.id === pendingId ? { ...message, status: 'failed' as const } : message,
            ),
          },
        })
        persist()
      },

      applyMessageEvent(event) {
        const { message } = event
        const { byChat } = get()
        const messages = byChat[message.chatId] ?? []
        const hasId = messages.some((candidate) => candidate.id === message.id)
        const pendingIndex = messages.findIndex(
          (candidate) =>
            candidate.status === 'pending' &&
            candidate.direction === 'outgoing' &&
            candidate.text === message.text,
        )
        if (hasId && pendingIndex === -1) {
          return false
        }
        if (pendingIndex >= 0 && !hasId) {
          const next = [...messages]
          next[pendingIndex] = message
          commitChat(message.chatId, next.sort(compareMessages))
          return true
        }
        const merged = mergeMessages(messages, [message])
        if (merged === null) {
          return false
        }
        commitChat(message.chatId, merged)
        return true
      },

      applyStatusEvent(event) {
        const { byChat } = get()
        const messages = byChat[event.chatId] ?? []
        const index = messages.findIndex((message) => message.id === event.idMessage)
        if (index === -1) {
          return false
        }
        const current = messages[index]
        if (current === undefined || current.direction !== 'outgoing') {
          return false
        }
        if (!canEscalate(current.status, event.status)) {
          return false
        }
        const next = [...messages]
        next[index] = { ...current, status: event.status }
        commitChat(event.chatId, next)
        return true
      },

      loadChatHistory(chatId, credentials) {
        const inFlight = historyLoads.get(chatId)
        if (inFlight !== undefined) {
          return inFlight
        }
        if (get().history[chatId] === 'ready') {
          return Promise.resolve('ready')
        }
        const load = (async (): Promise<HistoryPhase> => {
          const { history } = get()
          set({ history: { ...history, [chatId]: 'loading' } })
          try {
            const items = await deps.gateway.getChatHistory(credentials, {
              chatId,
              count: deps.capacityPerChat,
            })
            const mapped: Message[] = []
            for (const item of items) {
              const message = mapHistoryMessage(item)
              if (message !== null) {
                mapped.push(message)
              }
            }
            const { byChat } = get()
            const merged = mergeMessages(byChat[chatId] ?? [], mapped)
            set({
              byChat:
                merged === null
                  ? byChat
                  : { ...byChat, [chatId]: merged.slice(-deps.capacityPerChat) },
              history: { ...get().history, [chatId]: 'ready' },
            })
            persist()
            return 'ready'
          } catch {
            set({ history: { ...get().history, [chatId]: 'failed' } })
            return 'failed'
          } finally {
            historyLoads.delete(chatId)
          }
        })()
        historyLoads.set(chatId, load)
        return load
      },

      clear() {
        historyLoads.clear()
        deps.storage.remove(MESSAGES_STORAGE_KEY)
        set({ byChat: {}, history: {}, failedSend: null })
      },
    }
  })
}
