import { useChatsStore } from '@/entities/chats'
import { selectIsHistoryReady, selectLastChatMessage, useMessagesStore } from '@/entities/messages'
import { useSessionStore } from '@/entities/session'
import { readChat } from '@/shared/api/greenapi'

const mirrorPreviewAfterHistory = (chatId: string): void => {
  const messages = useMessagesStore.getState()
  const latest = selectLastChatMessage(messages, chatId)
  if (latest === null) {
    return
  }
  const chats = useChatsStore.getState()
  const summary = chats.summaries.find((entry) => entry.id === chatId)
  if (
    summary?.lastMessage?.id === latest.id &&
    summary.lastMessage.status === latest.status &&
    summary.lastMessage.timestamp === latest.timestamp
  ) {
    return
  }
  chats.applyNewMessage({ message: latest, fallbackName: null })
}

export const openChat = async (chatId: string): Promise<void> => {
  const credentials = useSessionStore.getState().credentials
  if (credentials === null) {
    return
  }
  useChatsStore.getState().openChat(chatId)
  void readChat(credentials, chatId).catch(() => undefined)
  if (selectIsHistoryReady(useMessagesStore.getState(), chatId)) {
    return
  }
  await useMessagesStore.getState().loadChatHistory(chatId, credentials)
  mirrorPreviewAfterHistory(chatId)
}
