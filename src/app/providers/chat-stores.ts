import { useChatsStore } from '@/entities/chats'
import { useMessagesStore } from '@/entities/messages'
import { useSessionStore } from '@/entities/session'
import { getNotificationEngine, type NotificationEngineEvent } from '@/shared/api/greenapi'

const applyEngineEvent = (event: NotificationEngineEvent): void => {
  if (event.kind === 'message') {
    const applied = useMessagesStore.getState().applyMessageEvent(event)
    if (applied) {
      useChatsStore.getState().applyNewMessage({
        message: event.message,
        fallbackName: event.chatFallback?.name ?? null,
      })
    }
    return
  }
  if (event.kind === 'status') {
    const applied = useMessagesStore.getState().applyStatusEvent(event)
    if (applied) {
      useChatsStore.getState().applyStatusUpdate({
        idMessage: event.idMessage,
        status: event.status,
      })
    }
    return
  }
  useSessionStore.getState().disconnect()
}

export function bindChatStores(): () => void {
  const engine = getNotificationEngine()
  const engineUnsubscribe = engine.subscribe(applyEngineEvent)
  const sessionUnsubscribe = useSessionStore.subscribe((state, previous) => {
    if (state.status === 'disconnected' && previous.status !== 'disconnected') {
      useChatsStore.getState().clear()
      useMessagesStore.getState().clear()
    }
  })
  return () => {
    engineUnsubscribe()
    sessionUnsubscribe()
  }
}
