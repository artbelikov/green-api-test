import type { ChatsState } from './create-chats-store'
import type { ChatSummary } from './types'

const selectChatSummary = (state: ChatsState, chatId: string): ChatSummary | null =>
  state.summaries.find((summary) => summary.id === chatId) ?? null

export const selectActiveChatSummary = (state: ChatsState): ChatSummary | null =>
  state.activeChatId === null ? null : selectChatSummary(state, state.activeChatId)
