import type { GreenApiHistoryItem, GreenApiNotificationEnvelope } from '../types'

export type MessageDirection = 'incoming' | 'outgoing'

export type MessageDeliveryStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed'

export type Message = {
  readonly id: string
  readonly chatId: string
  readonly direction: MessageDirection
  readonly text: string
  readonly timestamp: number
  readonly status: MessageDeliveryStatus | null
}

export type NotificationEvent =
  | {
      readonly kind: 'message'
      readonly message: Message
      readonly chatFallback: NotificationChatFallback | null
    }
  | {
      readonly kind: 'status'
      readonly idMessage: string
      readonly chatId: string
      readonly status: MessageDeliveryStatus
      readonly timestamp: number
    }
  | { readonly kind: 'ignored' }

export type MessageNotificationEvent = Extract<NotificationEvent, { readonly kind: 'message' }>

export type StatusNotificationEvent = Extract<NotificationEvent, { readonly kind: 'status' }>

const HISTORY_DIRECTIONS: ReadonlySet<string> = new Set(['incoming', 'outgoing'])

const outgoingStatus = (raw: string | undefined): MessageDeliveryStatus => {
  switch (raw) {
    case 'sent':
    case 'delivered':
    case 'read':
    case 'failed':
      return raw
    case 'noAccount':
    case 'notInGroup':
    case 'suspended':
    case 'yellowCard':
      return 'failed'
    default:
      return 'failed'
  }
}

const historyText = (raw: GreenApiHistoryItem): string | null => {
  if (typeof raw.textMessage === 'string' && raw.textMessage.length > 0) {
    return raw.textMessage
  }
  const extended = raw.extendedTextMessage?.text
  return typeof extended === 'string' && extended.length > 0 ? extended : null
}

export function mapHistoryMessage(raw: GreenApiHistoryItem): Message | null {
  const id = raw.idMessage
  const chatId = raw.chatId
  const timestamp = raw.timestamp
  if (id === undefined || chatId === undefined || timestamp === undefined) {
    return null
  }
  if (raw.isDeleted === true) {
    return null
  }
  if (raw.type === undefined || !HISTORY_DIRECTIONS.has(raw.type)) {
    return null
  }
  const text = historyText(raw)
  if (text === null) {
    return null
  }
  return {
    id,
    chatId,
    direction: raw.type === 'incoming' ? 'incoming' : 'outgoing',
    text,
    timestamp: timestamp * 1000,
    status:
      raw.type === 'outgoing' && raw.statusMessage !== undefined
        ? outgoingStatus(raw.statusMessage)
        : null,
  }
}

const isNotificationEnvelope = (
  value: GreenApiNotificationEnvelope | null | undefined,
): value is GreenApiNotificationEnvelope =>
  value !== null && value !== undefined && typeof value === 'object'

const webhookText = (envelope: GreenApiNotificationEnvelope): string | null => {
  const data = envelope.messageData
  if (data === undefined) {
    return null
  }
  const text = data.textMessageData?.textMessage
  return typeof text === 'string' && text.length > 0 ? text : null
}

export function mapNotification(
  envelope: GreenApiNotificationEnvelope | null | undefined,
): NotificationEvent {
  if (!isNotificationEnvelope(envelope)) {
    return { kind: 'ignored' }
  }
  const typeWebhook = envelope.typeWebhook
  const timestamp = envelope.timestamp
  const idMessage = envelope.idMessage
  if (typeWebhook === undefined || idMessage === undefined || timestamp === undefined) {
    return { kind: 'ignored' }
  }
  if (typeWebhook === 'outgoingMessageStatus') {
    const chatId = envelope.chatId
    const status = envelope.status
    if (chatId === undefined || status === undefined) {
      return { kind: 'ignored' }
    }
    const deliveryStatus = outgoingStatus(status)
    return {
      kind: 'status',
      idMessage,
      chatId,
      status: deliveryStatus,
      timestamp: timestamp * 1000,
    }
  }
  if (
    typeWebhook !== 'incomingMessageReceived' &&
    typeWebhook !== 'outgoingMessageReceived' &&
    typeWebhook !== 'outgoingAPIMessageReceived'
  ) {
    return { kind: 'ignored' }
  }
  const chatId = envelope.senderData?.chatId
  if (chatId === undefined) {
    return { kind: 'ignored' }
  }
  const text = webhookText(envelope)
  if (text === null) {
    return { kind: 'ignored' }
  }
  return {
    kind: 'message',
    message: {
      id: idMessage,
      chatId,
      direction: typeWebhook === 'incomingMessageReceived' ? 'incoming' : 'outgoing',
      text,
      timestamp: timestamp * 1000,
      status: typeWebhook === 'incomingMessageReceived' ? null : 'sent',
    },
    chatFallback: notificationChatFallback(envelope),
  }
}

export type NotificationChatFallback = {
  readonly chatId: string
  readonly name: string
}

export const notificationChatFallback = (
  envelope: GreenApiNotificationEnvelope,
): NotificationChatFallback | null => {
  const chatId = envelope.senderData?.chatId
  if (chatId === undefined) {
    return null
  }
  return {
    chatId,
    name:
      envelope.senderData?.chatName ??
      envelope.senderData?.senderName ??
      envelope.senderData?.sender ??
      chatId,
  }
}
