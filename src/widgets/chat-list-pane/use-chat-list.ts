import { useQuery } from '@tanstack/react-query'
import { useChatsStore } from '@/entities/chats'
import { useSessionStore } from '@/entities/session'
import {
  type Chat,
  getChatHistory,
  getChats,
  mapChatListItem,
  mapHistoryMessage,
} from '@/shared/api/greenapi'

const LIST_STALE_TIME_MS = 30_000
const PREVIEW_SWEEP_LIMIT = 30
const PREVIEW_SWEEP_COUNT = 1

const hydratePreviewsInBackground = async (
  credentials: NonNullable<ReturnType<typeof useSessionStore.getState>['credentials']>,
  chatIds: readonly string[],
): Promise<void> => {
  for (const chatId of chatIds) {
    const summary = useChatsStore.getState().summaries.find((entry) => entry.id === chatId)
    if (summary?.lastMessage !== null || useSessionStore.getState().credentials !== credentials) {
      continue
    }
    try {
      const history = await getChatHistory(credentials, { chatId, count: PREVIEW_SWEEP_COUNT })
      if (useSessionStore.getState().credentials !== credentials) {
        continue
      }
      const latest = history.map(mapHistoryMessage).find((message) => message !== null) ?? null
      if (latest !== null) {
        useChatsStore
          .getState()
          .applyNewMessage({ message: latest, fallbackName: null, markUnread: false })
      }
    } catch {}
  }
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
      void hydratePreviewsInBackground(
        credentials,
        chats.slice(0, PREVIEW_SWEEP_LIMIT).map((chat) => chat.id),
      ).catch(() => undefined)
      return true
    },
    enabled: connected,
    staleTime: LIST_STALE_TIME_MS,
  })
  return { loading: connected && query.isPending }
}
