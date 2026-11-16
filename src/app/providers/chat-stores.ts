import { notifications } from '@mantine/notifications'
import { useChatsStore } from '@/entities/chats'
import { useMessagesStore } from '@/entities/messages'
import { useSessionStore } from '@/entities/session'
import { getNotificationEngine, type NotificationEngineEvent } from '@/shared/api/greenapi'

const TOAST_PREVIEW_LIMIT = 120
const RECONNECTING_AFTER_CONSECUTIVE_FAILURES = 2

const toastPreviewOf = (text: string): string =>
  text.length > TOAST_PREVIEW_LIMIT ? `${text.slice(0, TOAST_PREVIEW_LIMIT)}…` : text

const chatNameForToast = (chatId: string): string =>
  useChatsStore.getState().summaries.find((summary) => summary.id === chatId)?.name ?? chatId

let consecutivePollFailures = 0

const showBackgroundMessageToast = (chatId: string, text: string): void => {
  notifications.show({
    title: chatNameForToast(chatId),
    message: toastPreviewOf(text),
    withCloseButton: true,
  })
}

const applyEngineEvent = (event: NotificationEngineEvent): void => {
  if (event.kind === 'message') {
    useChatsStore.getState().applyNewMessage({
      message: event.message,
      fallbackName: event.chatFallback?.name ?? null,
    })
    const applied = useMessagesStore.getState().applyMessageEvent(event)
    if (!applied) {
      return
    }
    const { activeChatId } = useChatsStore.getState()
    if (activeChatId !== event.message.chatId && event.message.direction === 'incoming') {
      showBackgroundMessageToast(event.message.chatId, event.message.text)
    }
    return
  }
  if (event.kind === 'status') {
    useChatsStore.getState().applyStatusUpdate({
      idMessage: event.idMessage,
      status: event.status,
    })
    useMessagesStore.getState().applyStatusEvent(event)
    return
  }
  if (event.kind === 'pollFailed') {
    consecutivePollFailures += 1
    if (consecutivePollFailures >= RECONNECTING_AFTER_CONSECUTIVE_FAILURES) {
      useSessionStore.getState().setReconnecting(true)
    }
    return
  }
  if (event.kind === 'pollRecovered') {
    consecutivePollFailures = 0
    useSessionStore.getState().setReconnecting(false)
    return
  }
  consecutivePollFailures = 0
  useSessionStore.getState().disconnect()
}

export function bindChatStores(): () => void {
  consecutivePollFailures = 0
  const engine = getNotificationEngine()
  const engineUnsubscribe = engine.subscribe(applyEngineEvent)
  const sessionUnsubscribe = useSessionStore.subscribe((state, previous) => {
    if (state.status === 'disconnected' && previous.status !== 'disconnected') {
      useChatsStore.getState().clear()
      useMessagesStore.getState().clear()
    }
    if (state.bootstrapPhase === 'done' && previous.bootstrapPhase === 'settling') {
      useMessagesStore.getState().resetEmptyHistoryPhases()
      const { activeChatId } = useChatsStore.getState()
      if (
        activeChatId !== null &&
        useMessagesStore.getState().history[activeChatId] === undefined
      ) {
        const { credentials } = useSessionStore.getState()
        if (credentials !== null) {
          void useMessagesStore.getState().loadChatHistory(activeChatId, credentials)
        }
      }
    }
  })
  return () => {
    engineUnsubscribe()
    sessionUnsubscribe()
  }
}
