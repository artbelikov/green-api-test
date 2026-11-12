import type { ChatsState } from './create-chats-store'
import type { ChatSummary } from './types'

export const selectChatSummary = (state: ChatsState, chatId: string): ChatSummary | null =>
  state.summaries.find((summary) => summary.id === chatId) ?? null

export const selectActiveChatSummary = (state: ChatsState): ChatSummary | null =>
  state.activeChatId === null ? null : selectChatSummary(state, state.activeChatId)

export const selectTotalUnread = (state: ChatsState): number =>
  state.summaries.reduce((total, summary) => total + summary.unread, 0)
