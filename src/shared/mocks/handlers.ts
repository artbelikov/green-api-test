import { delay, type HttpHandler, HttpResponse, http } from 'msw'
import type { GreenApiHistoryItem, GreenApiNotificationEnvelope } from '@/shared/api/greenapi'

const INVALID_TOKEN = 'invalid-token'

const DEFAULT_SETTINGS: Readonly<Record<string, string>> = {
  wid: '79000000000@c.us',
  instanceStartAt: '1762930000',
  incomingWebhook: 'no',
  outgoingMessageWebhook: 'no',
  outgoingAPIMessageWebhook: 'no',
  outgoingWebhook: 'no',
  stateWebhook: 'no',
  editedMessageWebhook: 'no',
  deletedMessageWebhook: 'no',
  webhookUrl: '',
}

type QueuedReceipt = {
  readonly receiptId: number
  readonly body: GreenApiNotificationEnvelope
}

export type MockMessage = {
  readonly idMessage: string
  readonly chatId: string
  readonly direction: 'incoming' | 'outgoing'
  readonly text: string
  readonly timestamp: number
}

export type MockChat = {
  readonly chatId: string
  readonly name: string
  readonly type: string
  readonly username?: string
  readonly phoneNumber?: string
}

const AUTO_REPLY_TEXT = 'Mock reply — just checking the flow works.'
const AUTO_REPLY_DELAY_MS = 1_200
const RECEIVE_POLL_TICK_MS = 150

const historyEntriesFor = (chatId: string): GreenApiHistoryItem[] =>
  mockGateway.messages
    .filter((message) => message.chatId === chatId)
    .sort((a, b) => b.timestamp - a.timestamp)
    .map((message) => ({
      type: message.direction,
      idMessage: message.idMessage,
      timestamp: Math.floor(message.timestamp / 1000),
      typeMessage: 'textMessage',
      chatId: message.chatId,
      textMessage: message.text,
      ...(message.direction === 'outgoing' ? { statusMessage: 'sent' } : {}),
    }))

const messageEnvelope = (message: MockMessage): GreenApiNotificationEnvelope => {
  const chatName = message.direction === 'incoming' ? message.chatId : null
  return {
    typeWebhook:
      message.direction === 'incoming' ? 'incomingMessageReceived' : 'outgoingMessageReceived',
    timestamp: Math.floor(message.timestamp / 1000),
    idMessage: message.idMessage,
    senderData:
      chatName === null ? { chatId: message.chatId } : { chatId: message.chatId, chatName },
    messageData: {
      typeMessage: 'textMessage',
      textMessageData: { textMessage: message.text },
    },
  }
}

export const mockGateway = {
  settings: { ...DEFAULT_SETTINGS },
  receipts: [] as QueuedReceipt[],
  messages: [] as MockMessage[],
  chats: [] as MockChat[],
  autoReplyEnabled: true,
  pollOutage: false,
  invalidate: false,
  deliverNotification(envelope: GreenApiNotificationEnvelope): number {
    const receiptId = mockGateway.nextReceiptId
    mockGateway.nextReceiptId += 1
    mockGateway.receipts.push({ receiptId, body: envelope })
    return receiptId
  },
  nextReceiptId: 1,
  nextMessageId: 1,
  ensureChat(chatId: string, name: string, username?: string): void {
    if (!mockGateway.chats.some((chat) => chat.chatId === chatId)) {
      mockGateway.chats.push({ chatId, name, type: 'user', ...(username ? { username } : {}) })
    }
  },
  reset(): void {
    mockGateway.settings = { ...DEFAULT_SETTINGS }
    mockGateway.receipts = []
    mockGateway.messages = []
    mockGateway.chats = []
    mockGateway.autoReplyEnabled = true
    mockGateway.pollOutage = false
    mockGateway.invalidate = false
    mockGateway.nextReceiptId = 1
    mockGateway.nextMessageId = 1
  },
}

const ensureChat = (chatId: string, name: string): void => {
  mockGateway.ensureChat(chatId, name)
}

const endpoint = (method: string): RegExp =>
  new RegExp(`^https?://[^/]+/waInstance[^/]+/${method}/[^/?]+`)

const tokenFrom = (url: string): string =>
  url.match(/\/waInstance[^/]+\/[^/]+\/([^/?]+)/)?.[1] ?? ''

const unauthorized = () => new HttpResponse('Unauthorized', { status: 401 })

const DEMO_CONTACT_CHAT_ID = '79991234567'

export const handlers: HttpHandler[] = [
  http.get(endpoint('getStateInstance'), ({ request }) => {
    if (tokenFrom(request.url) === INVALID_TOKEN) {
      return unauthorized()
    }
    return HttpResponse.json({ stateInstance: 'authorized' })
  }),
  http.get(endpoint('getSettings'), ({ request }) => {
    if (tokenFrom(request.url) === INVALID_TOKEN) {
      return unauthorized()
    }
    return HttpResponse.json(mockGateway.settings)
  }),
  http.post(endpoint('setSettings'), async ({ request }) => {
    if (tokenFrom(request.url) === INVALID_TOKEN) {
      return unauthorized()
    }
    const patch = (await request.json()) as Record<string, string>
    mockGateway.settings = { ...mockGateway.settings, ...patch }
    return HttpResponse.json({})
  }),
  http.post(endpoint('getContactInfo'), async ({ request }) => {
    if (tokenFrom(request.url) === INVALID_TOKEN) {
      return unauthorized()
    }
    const body = (await request.json()) as { chatId?: string }
    const chatId = typeof body.chatId === 'string' ? body.chatId : ''
    if (chatId.slice(1) === 'demo_contact') {
      ensureChat(DEMO_CONTACT_CHAT_ID, 'Demo Contact')
      return HttpResponse.json({
        chatId: DEMO_CONTACT_CHAT_ID,
        name: 'Demo Contact',
        username: 'demo_contact',
        chatType: 'user',
        lastSeen: 'recently',
      })
    }
    if (chatId.startsWith(DEMO_CONTACT_CHAT_ID)) {
      ensureChat(DEMO_CONTACT_CHAT_ID, 'Demo Contact')
      return HttpResponse.json({
        chatId: DEMO_CONTACT_CHAT_ID,
        name: 'Demo Contact',
        username: 'demo_contact',
        chatType: 'user',
        lastSeen: 'recently',
      })
    }
    return HttpResponse.json({ chatId })
  }),
  http.get(endpoint('getChats'), ({ request }) => {
    if (tokenFrom(request.url) === INVALID_TOKEN) {
      return unauthorized()
    }
    return HttpResponse.json(mockGateway.chats)
  }),
  http.get(endpoint('getContacts'), ({ request }) => {
    if (tokenFrom(request.url) === INVALID_TOKEN) {
      return unauthorized()
    }
    return HttpResponse.json(
      mockGateway.chats.map((chat) => ({
        id: chat.chatId,
        name: chat.username ?? chat.name,
        type: chat.type,
      })),
    )
  }),
  http.post(endpoint('getAvatar'), ({ request }) => {
    if (tokenFrom(request.url) === INVALID_TOKEN) {
      return unauthorized()
    }
    return HttpResponse.json({ urlAvatar: '', available: false })
  }),
  http.post(endpoint('sendMessage'), async ({ request }) => {
    if (tokenFrom(request.url) === INVALID_TOKEN) {
      return unauthorized()
    }
    const body = (await request.json()) as { chatId?: string; message?: string }
    const chatId = typeof body.chatId === 'string' ? body.chatId : null
    const message = typeof body.message === 'string' ? body.message : null
    if (chatId === null || message === null) {
      return new HttpResponse('Bad request', { status: 400 })
    }
    ensureChat(chatId, chatId)
    const idMessage = `mock-${mockGateway.nextMessageId}`
    mockGateway.nextMessageId += 1
    const timestamp = Date.now()
    mockGateway.messages.push({
      idMessage,
      chatId,
      direction: 'outgoing',
      text: message,
      timestamp,
    })
    mockGateway.deliverNotification(
      messageEnvelope({
        idMessage,
        chatId,
        direction: 'outgoing',
        text: message,
        timestamp,
      }),
    )
    if (mockGateway.autoReplyEnabled) {
      const nextMessageId = mockGateway.nextMessageId
      mockGateway.nextMessageId += 1
      void delay(AUTO_REPLY_DELAY_MS).then(() => {
        const reply: MockMessage = {
          idMessage: `mock-${nextMessageId}`,
          chatId,
          direction: 'incoming',
          text: AUTO_REPLY_TEXT,
          timestamp: Date.now(),
        }
        mockGateway.messages.push(reply)
        mockGateway.deliverNotification(messageEnvelope(reply))
      })
    }
    return HttpResponse.json({ idMessage })
  }),
  http.post(endpoint('getChatHistory'), async ({ request }) => {
    if (tokenFrom(request.url) === INVALID_TOKEN) {
      return unauthorized()
    }
    const body = (await request.json()) as { chatId?: string }
    const chatId = typeof body.chatId === 'string' ? body.chatId : ''
    return HttpResponse.json(historyEntriesFor(chatId))
  }),
  http.post(endpoint('readChat'), ({ request }) => {
    if (tokenFrom(request.url) === INVALID_TOKEN) {
      return unauthorized()
    }
    return HttpResponse.json({ setRead: true })
  }),
  http.get(endpoint('receiveNotification'), async ({ request }) => {
    if (tokenFrom(request.url) === INVALID_TOKEN || mockGateway.invalidate) {
      return unauthorized()
    }
    const receiveTimeoutSeconds = Number(new URL(request.url).searchParams.get('receiveTimeout'))
    const waitSeconds = Number.isFinite(receiveTimeoutSeconds) ? receiveTimeoutSeconds : 25
    const deadline = Date.now() + Math.min(waitSeconds, 60) * 1000
    while (Date.now() < deadline) {
      if (mockGateway.pollOutage) {
        return new HttpResponse('Poll outage', { status: 500 })
      }
      const oldest = mockGateway.receipts[0]
      if (oldest !== undefined) {
        return HttpResponse.json({ receiptId: oldest.receiptId, body: oldest.body })
      }
      await delay(RECEIVE_POLL_TICK_MS)
    }
    return HttpResponse.json(null)
  }),
  http.delete(endpoint('deleteNotification'), ({ request }) => {
    if (tokenFrom(request.url) === INVALID_TOKEN) {
      return unauthorized()
    }
    const receiptId = Number(request.url.match(/\/deleteNotification\/[^/]+\/(\d+)/)?.[1])
    const index = mockGateway.receipts.findIndex((receipt) => receipt.receiptId === receiptId)
    if (!Number.isFinite(receiptId) || index === -1) {
      return HttpResponse.json({ result: false, reason: 'Notification not found' })
    }
    mockGateway.receipts.splice(index, 1)
    return HttpResponse.json({ result: true, reason: '' })
  }),
]
