import { useQuery } from '@tanstack/react-query'
import { useChatsStore } from '@/entities/chats'
import { useSessionStore } from '@/entities/session'
import { type Chat, getChats, mapChatListItem } from '@/shared/api/greenapi'

const LIST_STALE_TIME_MS = 30_000

export interface ChatListHydration {
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
      const chats = items.map(mapChatListItem).filter((chat): chat is Chat => chat !== null)
      useChatsStore.getState().upsertChats(chats)
      return true
    },
    enabled: connected,
    staleTime: LIST_STALE_TIME_MS,
  })
  return { loading: connected && query.isPending }
}
