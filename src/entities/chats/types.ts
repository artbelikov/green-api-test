import type {
  ChatType,
  Message,
  MessageDeliveryStatus,
  MessageDirection,
} from '@/shared/api/greenapi'

export interface ChatLastMessagePreview {
  readonly id: string
  readonly text: string
  readonly direction: MessageDirection
  readonly status: MessageDeliveryStatus | null
  readonly timestamp: number
}

export interface ChatSummary {
  readonly id: string
  readonly name: string
  readonly type: ChatType
  readonly username: string | null
  readonly phone: string | null
  readonly unread: number
  readonly lastMessage: ChatLastMessagePreview | null
  readonly lastActivityAt: number
}

export interface ChatMessagePreviewInput {
  readonly message: Message
  readonly fallbackName: string | null
  readonly markUnread?: boolean
}

export interface ChatStatusUpdateInput {
  readonly idMessage: string
  readonly status: MessageDeliveryStatus
}
