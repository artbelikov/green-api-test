import { delay, type HttpHandler, HttpResponse, http } from 'msw'
import type { GreenApiNotificationEnvelope } from '@/shared/api/greenapi'

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

interface QueuedReceipt {
  readonly receiptId: number
  readonly body: GreenApiNotificationEnvelope
}

export const mockGateway = {
  settings: { ...DEFAULT_SETTINGS },
  receipts: [] as QueuedReceipt[],
  deliverNotification(envelope: GreenApiNotificationEnvelope): number {
    const receiptId = mockGateway.nextReceiptId
    mockGateway.nextReceiptId += 1
    mockGateway.receipts.push({ receiptId, body: envelope })
    return receiptId
  },
  nextReceiptId: 1,
  reset(): void {
    mockGateway.settings = { ...DEFAULT_SETTINGS }
    mockGateway.receipts = []
    mockGateway.nextReceiptId = 1
  },
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
    if (chatId.startsWith(DEMO_CONTACT_CHAT_ID)) {
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
  http.get(endpoint('receiveNotification'), ({ request }) => {
    if (tokenFrom(request.url) === INVALID_TOKEN) {
      return unauthorized()
    }
    const oldest = mockGateway.receipts[0]
    if (oldest !== undefined) {
      return HttpResponse.json({ receiptId: oldest.receiptId, body: oldest.body })
    }
    const receiveTimeoutSeconds = Number(new URL(request.url).searchParams.get('receiveTimeout'))
    const waitSeconds = Number.isFinite(receiveTimeoutSeconds) ? receiveTimeoutSeconds : 25
    return delay(Math.min(waitSeconds, 60) * 1000).then(() => HttpResponse.json(null))
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
