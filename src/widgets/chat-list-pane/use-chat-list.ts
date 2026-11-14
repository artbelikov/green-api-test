import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useChatsStore } from '@/entities/chats'
import { useSessionStore } from '@/entities/session'
import {
  type Chat,
  type GreenApiCredentials,
  type GreenApiHistoryItem,
  getChatHistory,
  getChats,
  type Message,
  mapChatListItem,
  mapHistoryMessage,
} from '@/shared/api/greenapi'
import { i18n } from '@/shared/config'

const LIST_STALE_TIME_MS = 30_000
const PREVIEW_HISTORY_COUNT = 1

const MEDIA_PREVIEW_LABELS: ReadonlyArray<readonly [RegExp, string]> = [
  [/image/i, i18n.messenger.list.media.photo],
  [/videoMessage/i, i18n.messenger.list.media.videoMessage],
  [/video/i, i18n.messenger.list.media.video],
  [/audio/i, i18n.messenger.list.media.audio],
  [/voice/i, i18n.messenger.list.media.voiceMessage],
  [/document|file/i, i18n.messenger.list.media.document],
  [/sticker/i, i18n.messenger.list.media.sticker],
  [/contact/i, i18n.messenger.list.media.contact],
  [/location/i, i18n.messenger.list.media.location],
  [/poll/i, i18n.messenger.list.media.poll],
]

const previewLabelText = (typeMessage: string | undefined): string =>
  typeMessage === undefined
    ? i18n.messenger.list.media.other
    : (MEDIA_PREVIEW_LABELS.find(([pattern]) => pattern.test(typeMessage))?.[1] ??
      i18n.messenger.list.media.other)

const previewFromHistory = (history: readonly GreenApiHistoryItem[]): Message | null => {
  for (const item of history) {
    const mapped = mapHistoryMessage(item)
    if (mapped !== null) {
      return mapped
    }
    const { idMessage, chatId, timestamp } = item
    if (
      idMessage === undefined ||
      chatId === undefined ||
      timestamp === undefined ||
      item.isDeleted === true
    ) {
      continue
    }
    return {
      id: idMessage,
      chatId,
      direction: item.type === 'outgoing' ? 'outgoing' : 'incoming',
      text: previewLabelText(item.typeMessage),
      timestamp: timestamp * 1000,
      status: null,
    }
  }
  return null
}

const hydrateVisiblePreviews = async (
  credentials: GreenApiCredentials,
  chatIds: readonly string[],
): Promise<void> => {
  for (const chatId of chatIds) {
    if (!useChatsStore.getState().claimPreviewAttempt(chatId, credentials)) {
      continue
    }
    const summary = useChatsStore.getState().summaries.find((entry) => entry.id === chatId)
    if (summary?.lastMessage !== null || useSessionStore.getState().credentials !== credentials) {
      continue
    }
    try {
      const history = await getChatHistory(
        credentials,
        {
          chatId,
          count: PREVIEW_HISTORY_COUNT,
        },
        { priority: 'user' },
      )
      if (useSessionStore.getState().credentials !== credentials) {
        continue
      }
      const latest = previewFromHistory(history)
      if (latest !== null) {
        useChatsStore
          .getState()
          .applyNewMessage({ message: latest, fallbackName: null, markUnread: false })
      }
    } catch {
      useChatsStore.getState().discardPreviewAttempt(chatId)
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
