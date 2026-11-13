import { notifications } from '@mantine/notifications'
import { useChatsStore } from '@/entities/chats'
import { selectChatMessageById, useMessagesStore } from '@/entities/messages'
import { useSessionStore } from '@/entities/session'
import { ApiError, sendMessage } from '@/shared/api/greenapi'
import { i18n } from '@/shared/config'

export type SendTextOutcome =
  | { readonly ok: true; readonly idMessage: string }
  | { readonly ok: false; readonly error: ApiError }

const showSendFailureToast = (): void => {
  notifications.show({
    color: 'red',
    message: i18n.chat.sendFailed,
    withCloseButton: true,
  })
}

const mirrorPreview = (chatId: string, messageId: string): void => {
  const latest = selectChatMessageById(useMessagesStore.getState(), chatId, messageId)
  if (latest === null) {
    return
  }
  useChatsStore.getState().applyNewMessage({ message: latest, fallbackName: null })
}

export const sendChatText = async (chatId: string, text: string): Promise<SendTextOutcome> => {
  const credentials = useSessionStore.getState().credentials
  if (credentials === null) {
    const error = new ApiError('The session is disconnected', { kind: 'status', status: null })
    showSendFailureToast()
    return { ok: false, error }
  }
  const pendingId = useMessagesStore.getState().appendPending(chatId, text)
  try {
    const result = await sendMessage(credentials, { chatId, text })
    if (result.idMessage === undefined) {
      throw new ApiError('sendMessage returned no message id', { kind: 'malformed' })
    }
    useMessagesStore.getState().reconcileSent(chatId, pendingId, result.idMessage)
    mirrorPreview(chatId, result.idMessage)
    return { ok: true, idMessage: result.idMessage }
  } catch (reason) {
    const error = reason instanceof ApiError ? reason : ApiError.network(reason)
    useMessagesStore.getState().markSendFailed(chatId, pendingId, error)
    mirrorPreview(chatId, pendingId)
    showSendFailureToast()
    return { ok: false, error }
  }
}
