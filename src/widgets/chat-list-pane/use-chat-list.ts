import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useChatsStore } from '@/entities/chats'
import { useSessionStore } from '@/entities/session'
import {
  type Chat,
  type GreenApiCredentials,
  getChatHistory,
  getChats,
  mapChatListItem,
  mapHistoryMessage,
} from '@/shared/api/greenapi'

const LIST_STALE_TIME_MS = 30_000
const PREVIEW_HISTORY_COUNT = 1

let previewCredentialsSession: GreenApiCredentials | null = null
const previewAttempts = new Set<string>()

const hydrateVisiblePreviews = async (
  credentials: GreenApiCredentials,
  chatIds: readonly string[],
): Promise<void> => {
  if (credentials !== previewCredentialsSession) {
    previewAttempts.clear()
    previewCredentialsSession = credentials
  }
  for (const chatId of chatIds) {
    if (previewAttempts.has(chatId)) {
      continue
    }
    const summary = useChatsStore.getState().summaries.find((entry) => entry.id === chatId)
    if (summary?.lastMessage !== null || useSessionStore.getState().credentials !== credentials) {
      continue
    }
    previewAttempts.add(chatId)
    try {
      const history = await getChatHistory(credentials, {
        chatId,
        count: PREVIEW_HISTORY_COUNT,
      })
      if (useSessionStore.getState().credentials !== credentials) {
        continue
      }
      const latest = history.map(mapHistoryMessage).find((message) => message !== null) ?? null
      if (latest !== null) {
        useChatsStore
          .getState()
          .applyNewMessage({ message: latest, fallbackName: null, markUnread: false })
      }
    } catch {
      previewAttempts.delete(chatId)
    }
  }
}

export const useChatPreviewHydration = (visibleChatIds: readonly string[]): void => {
  const credentials = useSessionStore((state) => state.credentials)
  useEffect(() => {
    if (credentials === null || visibleChatIds.length === 0) {
      return
    }
    void hydrateVisiblePreviews(credentials, visibleChatIds).catch(() => undefined)
  }, [credentials, visibleChatIds])
}

export type ChatListHydration = {
  readonly loading: boolean
}

export const useChatListHydration = (): ChatListHydration => {
  const connected = useSessionStore((state) => state.credentials !== null)
  const query = useQuery({
    queryKey: ['chat-list'],
    queryFn: async () => {
      const credentials = useSessionStore.getState().credentials
      if (credentials === null) {
        return false
      }
      const items = await getChats(credentials)
      if (useSessionStore.getState().credentials !== credentials) {
        return false
      }
      const chats = items.map(mapChatListItem).filter((chat): chat is Chat => chat !== null)
      useChatsStore.getState().upsertChats(chats)
      return true
    },
    enabled: connected,
    staleTime: LIST_STALE_TIME_MS,
  })
  return { loading: connected && query.isPending }
}
