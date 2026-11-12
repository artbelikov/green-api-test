import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { useSessionStore } from '@/entities/session'
import {
  type GreenApiCredentials,
  getNotificationEngine,
  stopNotificationEngine,
} from '@/shared/api/greenapi'
import { bindNotificationEngineToSession } from './notification-engine'

const CREDENTIALS: GreenApiCredentials = {
  apiUrl: 'https://gateway.test',
  idInstance: '110100200',
  apiTokenInstance: 'token-1',
}

const base = `${CREDENTIALS.apiUrl}/waInstance${CREDENTIALS.idInstance}`

const server = setupServer()

beforeAll(() => {
  server.listen({ onUnhandledFrame: 'error' })
})

afterEach(async () => {
  server.resetHandlers()
  useSessionStore.getState().disconnect()
  await stopNotificationEngine()
})

afterAll(() => {
  server.close()
})

const registerPollingHandlers = (): { calls: () => number } => {
  let calls = 0
  server.use(
    http.get(`${base}/receiveNotification/${CREDENTIALS.apiTokenInstance}`, () => {
      calls += 1
      return HttpResponse.json(null)
    }),
    http.delete(`${base}/deleteNotification/${CREDENTIALS.apiTokenInstance}/1`, () =>
      HttpResponse.json({ result: true, reason: '' }),
    ),
  )
  return { calls: () => calls }
}

describe('bindNotificationEngineToSession', () => {
  it('does not poll while the session is disconnected', async () => {
    const { calls } = registerPollingHandlers()
    const unbind = bindNotificationEngineToSession()

    await new Promise((resolve) => setTimeout(resolve, 30))
    expect(calls()).toBe(0)
    expect(getNotificationEngine()).toBeDefined()

    unbind()
  })

  it('starts polling when the session reaches connected and stops on disconnect', async () => {
    const { calls } = registerPollingHandlers()
    const unbind = bindNotificationEngineToSession()
    expect(calls()).toBe(0)

    useSessionStore.setState({ credentials: CREDENTIALS, status: 'connected' })
    await vi.waitFor(() => {
      expect(calls()).toBeGreaterThan(0)
    })

    useSessionStore.setState({ credentials: null, status: 'disconnected' })
    const frozenCalls = calls()
    await new Promise((resolve) => setTimeout(resolve, 40))
    expect(calls()).toBe(frozenCalls)

    unbind()
  })

  it('starts the engine immediately when bound to an already-connected session', async () => {
    const { calls } = registerPollingHandlers()

    useSessionStore.setState({ credentials: CREDENTIALS, status: 'connected' })
    const unbind = bindNotificationEngineToSession()

    await vi.waitFor(() => {
      expect(calls()).toBeGreaterThan(0)
    })

    unbind()
    const frozenCalls = calls()
    await new Promise((resolve) => setTimeout(resolve, 40))
    expect(calls()).toBe(frozenCalls)
  })

  it('unbinding stops the loop even while the session stays connected', async () => {
    const { calls } = registerPollingHandlers()

    useSessionStore.setState({ credentials: CREDENTIALS, status: 'connected' })
    const unbind = bindNotificationEngineToSession()
    await vi.waitFor(() => {
      expect(calls()).toBeGreaterThan(0)
    })

    unbind()
    const frozenCalls = calls()
    await new Promise((resolve) => setTimeout(resolve, 40))
    expect(calls()).toBe(frozenCalls)
  })

  it('rebinding after a disconnect resumes polling with the new session', async () => {
    const { calls } = registerPollingHandlers()

    useSessionStore.setState({ credentials: CREDENTIALS, status: 'connected' })
    const firstUnbind = bindNotificationEngineToSession()
    await vi.waitFor(() => {
      expect(calls()).toBeGreaterThan(0)
    })
    firstUnbind()
    const frozen = calls()
    await new Promise((resolve) => setTimeout(resolve, 40))
    expect(calls()).toBe(frozen)

    useSessionStore.setState({ credentials: null, status: 'disconnected' })
    const secondUnbind = bindNotificationEngineToSession()
    useSessionStore.setState({ credentials: CREDENTIALS, status: 'connected' })
    await vi.waitFor(() => {
      expect(calls()).toBeGreaterThan(frozen)
    })
    secondUnbind()
  })
})
