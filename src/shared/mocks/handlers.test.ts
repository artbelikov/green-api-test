import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { handlers, mockGateway } from './handlers'

const BASE = 'https://gateway.test/waInstance110100200'
const TOKEN = 'token-1'

const server = setupServer(...handlers)

beforeAll(() => {
  server.listen({ onUnhandledFrame: 'error' })
})

afterEach(() => {
  server.resetHandlers()
  mockGateway.reset()
})

afterAll(() => {
  server.close()
})

describe('mock gateway handlers', () => {
  it('authorizes any non-invalid token for getStateInstance', async () => {
    const response = await fetch(`${BASE}/getStateInstance/${TOKEN}`)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ stateInstance: 'authorized' })
  })

  it('rejects invalid tokens with 401 on every method', async () => {
    const stateResponse = await fetch(`${BASE}/getStateInstance/invalid-token`)
    const settingsResponse = await fetch(`${BASE}/getSettings/invalid-token`)
    const applyResponse = await fetch(`${BASE}/setSettings/invalid-token`, {
      method: 'POST',
      body: JSON.stringify({ incomingWebhook: 'yes' }),
    })
    const contactResponse = await fetch(`${BASE}/getContactInfo/invalid-token`, {
      method: 'POST',
      body: JSON.stringify({ chatId: '79991234567' }),
    })

    expect(stateResponse.status).toBe(401)
    expect(settingsResponse.status).toBe(401)
    expect(applyResponse.status).toBe(401)
    expect(contactResponse.status).toBe(401)
  })

  it('serves webhook settings and applies setSettings patches in memory', async () => {
    const initial = (await (await fetch(`${BASE}/getSettings/${TOKEN}`)).json()) as Record<
      string,
      string
    >
    expect(initial.incomingWebhook).toBe('no')
    expect(initial.webhookUrl).toBe('')

    const applyResponse = await fetch(`${BASE}/setSettings/${TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ incomingWebhook: 'yes', outgoingWebhook: 'yes' }),
    })
    expect(applyResponse.status).toBe(200)

    const updated = (await (await fetch(`${BASE}/getSettings/${TOKEN}`)).json()) as Record<
      string,
      string
    >
    expect(updated.incomingWebhook).toBe('yes')
    expect(updated.outgoingWebhook).toBe('yes')
    expect(updated.outgoingMessageWebhook).toBe('no')
    expect(updated.webhookUrl).toBe('')
  })

  it('resolves the demo contact and returns an empty profile otherwise', async () => {
    const known = await (
      await fetch(`${BASE}/getContactInfo/${TOKEN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: '79991234567@c.us' }),
      })
    ).json()
    expect(known).toMatchObject({ chatId: '79991234567', name: 'Demo Contact' })

    const unknown = await (
      await fetch(`${BASE}/getContactInfo/${TOKEN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: '70000000000@c.us' }),
      })
    ).json()
    expect(unknown).toEqual({ chatId: '70000000000@c.us' })
  })

  it('resets settings state back to the defaults', async () => {
    await fetch(`${BASE}/setSettings/${TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ incomingWebhook: 'yes' }),
    })
    mockGateway.reset()

    const settings = (await (await fetch(`${BASE}/getSettings/${TOKEN}`)).json()) as Record<
      string,
      string
    >
    expect(settings.incomingWebhook).toBe('no')
  })
})
