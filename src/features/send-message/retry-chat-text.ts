import { selectChatMessageById, useMessagesStore } from '@/entities/messages'
import { validateSendText } from './lib/validate-send-text'
import { type SendTextOutcome, sendChatText } from './send-chat-text'

export const retryChatText = async (
  chatId: string,
  messageId: string,
): Promise<SendTextOutcome | null> => {
  const state = useMessagesStore.getState()
  const message = selectChatMessageById(state, chatId, messageId)
  if (message === null || message.direction !== 'outgoing' || message.status !== 'failed') {
    return null
  }
  const validation = validateSendText(message.text)
  if (!validation.ok) {
    return null
  }
  useMessagesStore.getState().dropMessage(chatId, messageId)
  return sendChatText(chatId, validation.text)
}
