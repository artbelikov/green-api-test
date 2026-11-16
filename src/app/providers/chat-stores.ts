import { notifications } from '@mantine/notifications'
import { useChatsStore } from '@/entities/chats'
import { useMessagesStore } from '@/entities/messages'
import { useSessionStore } from '@/entities/session'
import {
  getNotificationEngine,
  type Message,
  matchesMessage,
  type NotificationEngineEvent,
} from '@/shared/api/greenapi'

const TOAST_PREVIEW_LIMIT = 120
const RECONNECTING_AFTER_CONSECUTIVE_FAILURES = 2
const SUMMARY_APPLIED_MEMORY_LIMIT = 64

const toastPreviewOf = (text: string): string =>
  text.length > TOAST_PREVIEW_LIMIT ? `${text.slice(0, TOAST_PREVIEW_LIMIT)}…` : text

const chatNameForToast = (chatId: string): string =>
  useChatsStore.getState().summaries.find((summary) => summary.id === chatId)?.name ?? chatId

let consecutivePollFailures = 0

const summaryAppliedMemory: Message[] = []

const summaryAlreadyApplied = (message: Message): boolean =>
  summaryAppliedMemory.some(
    (applied) => applied.chatId === message.chatId && matchesMessage(applied, message),
  )

const rememberSummaryApplied = (message: Message): void => {
  summaryAppliedMemory.push(message)
  if (summaryAppliedMemory.length > SUMMARY_APPLIED_MEMORY_LIMIT) {
    summaryAppliedMemory.shift()
  }
}

const clearSummaryAppliedMemory = (): void => {
  summaryAppliedMemory.length = 0
}

const showBackgroundMessageToast = (chatId: string, text: string): void => {
  notifications.show({
    title: chatNameForToast(chatId),
    message: toastPreviewOf(text),
    withCloseButton: true,
  })
}

const applyEngineEvent = (event: NotificationEngineEvent): void => {
  if (
    (event.kind === 'message' || event.kind === 'status') &&
    useSessionStore.getState().status !== 'connected'
  ) {
    throw new Error('notification arrived while the session was disconnected')
  }
  if (event.kind === 'message') {
    const { message } = event
    const alreadyDelivered = useMessagesStore.getState().isDuplicateMessage(message)
    if (!alreadyDelivered && !summaryAlreadyApplied(message)) {
      useChatsStore.getState().applyNewMessage({
        message,
        fallbackName: event.chatFallback?.name ?? null,
      })
      rememberSummaryApplied(message)
    }
    const applied = useMessagesStore.getState().applyMessageEvent(event)
    if (!applied) {
      return
    }
    const { activeChatId } = useChatsStore.getState()
    if (activeChatId !== message.chatId && message.direction === 'incoming') {
      showBackgroundMessageToast(message.chatId, message.text)
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
  clearSummaryAppliedMemory()
  const engine = getNotificationEngine()
  const engineUnsubscribe = engine.subscribe(applyEngineEvent)
  const sessionUnsubscribe = useSessionStore.subscribe((state, previous) => {
    if (state.status === 'disconnected' && previous.status !== 'disconnected') {
      clearSummaryAppliedMemory()
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
