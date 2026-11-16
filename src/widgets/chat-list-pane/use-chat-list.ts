import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useRef } from 'react'
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
  signal: AbortSignal,
): Promise<void> => {
  for (const chatId of chatIds) {
    if (signal.aborted) {
      return
    }
    if (!useChatsStore.getState().claimPreviewAttempt(chatId, credentials, signal)) {
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
        { priority: 'user', signal, coalesce: false },
      )
      if (useSessionStore.getState().credentials !== credentials) {
        continue
      }
      const latest = previewFromHistory(history)
      if (latest !== null) {
        useChatsStore.getState().applyPreviewBackfill({ message: latest })
        useChatsStore.getState().discardPreviewAttempt(chatId, signal)
      }
    } catch {
      useChatsStore.getState().discardPreviewAttempt(chatId, signal)
    }
  }
}

type PreviewPass = {
  readonly controller: AbortController
}

export const useChatPreviewHydration = (visibleChatIds: readonly string[]): void => {
  const credentials = useSessionStore((state) => state.credentials)
  const livePasses = useRef<PreviewPass[]>([])
  const lastWindowKey = useRef<string>('')

  const stopAllPasses = useCallback((): void => {
    for (const pass of livePasses.current) {
      pass.controller.abort()
    }
    livePasses.current = []
  }, [])

  useEffect(() => {
    return () => {
      stopAllPasses()
    }
  }, [stopAllPasses])

  useEffect(() => {
    if (credentials === null || visibleChatIds.length === 0) {
      stopAllPasses()
      lastWindowKey.current = ''
      return
    }
    const windowKey = visibleChatIds.join('\u0000')
    if (windowKey !== lastWindowKey.current) {
      stopAllPasses()
    }
    lastWindowKey.current = windowKey
    const survived = livePasses.current.filter((pass) => !pass.controller.signal.aborted)
    const pass: PreviewPass = { controller: new AbortController() }
    livePasses.current = [...survived, pass]
    void hydrateVisiblePreviews(credentials, visibleChatIds, pass.controller.signal).catch(
      () => undefined,
    )
  }, [credentials, visibleChatIds, stopAllPasses])
}

export type ChatListHydration = {
  readonly loading: boolean
}

export const useChatListHydration = (): ChatListHydration => {
  const credentials = useSessionStore((state) => state.credentials)
  const sessionId = useSessionStore((state) => state.sessionId)
  const connected = credentials !== null
  const query = useQuery({
    queryKey: ['chat-list', sessionId],
    queryFn: async (): Promise<readonly Chat[]> => {
      const started = useSessionStore.getState()
      if (started.credentials === null) {
        return []
      }
      const credentials = started.credentials
      const startedSessionId = started.sessionId
      const items = await getChats(credentials, { coalesce: false })
      const current = useSessionStore.getState()
      if (current.credentials !== credentials || current.sessionId !== startedSessionId) {
        return []
      }
      return items.map(mapChatListItem).filter((chat): chat is Chat => chat !== null)
    },
    enabled: connected,
    staleTime: LIST_STALE_TIME_MS,
  })
  useEffect(() => {
    if (query.data !== undefined) {
      useChatsStore.getState().upsertChats(query.data)
    }
  }, [query.data])
  return { loading: connected && query.isPending }
}
