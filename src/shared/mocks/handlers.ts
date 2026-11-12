import { type HttpHandler, HttpResponse, http } from 'msw'

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

export const mockGateway = {
  settings: { ...DEFAULT_SETTINGS },
  reset(): void {
    mockGateway.settings = { ...DEFAULT_SETTINGS }
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
]
