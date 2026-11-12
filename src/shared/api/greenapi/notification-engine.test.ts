import { delay, HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { deleteNotification, receiveNotification } from './facades'
import { ApiError, type GreenApiCredentials } from './http-client'
import {
  createNotificationEngine,
  getNotificationEngine,
  NOTIFICATION_ENGINE_HIDDEN_DISPATCH_INTERVAL_MS,
  NOTIFICATION_ENGINE_INITIAL_BACKOFF_MS,
  NOTIFICATION_ENGINE_MAX_BACKOFF_MS,
  NOTIFICATION_ENGINE_RECEIVE_TIMEOUT_SECONDS,
  type NotificationEngine,
  type NotificationEngineEvent,
  type NotificationEngineGateway,
  type NotificationScheduler,
  type NotificationVisibility,
  stopNotificationEngine,
} from './notification-engine'
import type { GreenApiNotificationEnvelope, ReceivedNotification } from './types'

const CREDENTIALS: GreenApiCredentials = {
  apiUrl: 'https://gateway.test',
  idInstance: '110100200',
  apiTokenInstance: 'token-1',
}

const OTHER_CREDENTIALS: GreenApiCredentials = {
  apiUrl: CREDENTIALS.apiUrl,
  idInstance: '110100201',
  apiTokenInstance: 'token-2',
}

const base = `${CREDENTIALS.apiUrl}/waInstance${CREDENTIALS.idInstance}`

const settle = async (rounds = 8): Promise<void> => {
  for (let index = 0; index < rounds; index += 1) {
    await Promise.resolve()
  }
}

const incomingEnvelope = (
  id: string,
  text: string,
  chatId = '79001234567',
): GreenApiNotificationEnvelope => ({
  typeWebhook: 'incomingMessageReceived',
  idMessage: id,
  timestamp: 1_700_000_000,
  senderData: { chatId },
  messageData: { typeMessage: 'textMessage', textMessageData: { textMessage: text } },
})

type ReceiveStep =
  | { readonly kind: 'null' }
  | { readonly kind: 'fail'; readonly error: unknown }
  | {
      readonly kind: 'deliver'
      readonly receiptId: number
      readonly body: GreenApiNotificationEnvelope | null
    }
  | { readonly kind: 'block' }

class FakeNotificationGateway implements NotificationEngineGateway {
  receiveCalls = 0
  readonly acknowledgeCalls: number[] = []

  readonly #steps: ReceiveStep[]
  readonly #activity: string[]
  readonly #blockedRejects: Array<(reason: unknown) => void> = []

  constructor(steps: ReceiveStep[] = [], activity: string[] = []) {
    this.#steps = [...steps]
    this.#activity = activity
  }

  async receiveNotification(
    _credentials: GreenApiCredentials,
    _receiveTimeoutSeconds: number,
    options?: { readonly signal?: AbortSignal },
  ): Promise<ReceivedNotification | null> {
    this.receiveCalls += 1
    const step = this.#steps.shift() ?? ({ kind: 'block' } as ReceiveStep)
    if (step.kind === 'null') {
      return null
    }
    if (step.kind === 'fail') {
      throw step.error
    }
    if (step.kind === 'deliver') {
      return { receiptId: step.receiptId, body: step.body }
    }
    return new Promise((_resolve, reject) => {
      const signal = options?.signal
      this.#blockedRejects.push(reject)
      signal?.addEventListener(
        'abort',
        () => reject(new ApiError('Request aborted', { kind: 'aborted' })),
        { once: true },
      )
    })
  }

  async deleteNotification(
    _credentials: GreenApiCredentials,
    receiptId: number,
  ): Promise<{ result: boolean; reason: string }> {
    this.acknowledgeCalls.push(receiptId)
    this.#activity.push(`ack:${receiptId}`)
    return { result: true, reason: '' }
  }
}

class ManualScheduler implements NotificationScheduler {
  readonly tasks: Array<{ delayMs: number; run: () => void; canceled: boolean }> = []

  schedule(delayMs: number, run: () => void): () => void {
    const task = { delayMs, run, canceled: false }
    this.tasks.push(task)
    return () => {
      task.canceled = true
    }
  }

  flushNext(): void {
    const task = this.tasks.find((candidate) => !candidate.canceled)
    if (task === undefined) {
      throw new Error('scheduler has no pending tasks')
    }
    const index = this.tasks.indexOf(task)
    this.tasks.splice(index, 1)
    task.run()
  }

  pendingDelays(): number[] {
    return this.tasks.filter((task) => !task.canceled).map((task) => task.delayMs)
  }
}

describe('notification engine constants', () => {
  it('pins the long-poll contract values', () => {
    expect(NOTIFICATION_ENGINE_RECEIVE_TIMEOUT_SECONDS).toBe(25)
    expect(NOTIFICATION_ENGINE_INITIAL_BACKOFF_MS).toBe(1_000)
    expect(NOTIFICATION_ENGINE_MAX_BACKOFF_MS).toBe(30_000)
    expect(NOTIFICATION_ENGINE_HIDDEN_DISPATCH_INTERVAL_MS).toBe(1_000)
  })
})

describe('notification engine lifecycle', () => {
  it('starts a single poll loop for repeated starts with the same session', async () => {
    const gateway = new FakeNotificationGateway()
    const engine = createNotificationEngine({ gateway })

    engine.start(CREDENTIALS)
    engine.start(CREDENTIALS)
    engine.start(CREDENTIALS)
    await settle()

    expect(gateway.receiveCalls).toBe(1)

    await engine.stop()
    expect(gateway.receiveCalls).toBe(1)
  })

  it('restarts the loop when a different session starts while running', async () => {
    const gateway = new FakeNotificationGateway([{ kind: 'block' }, { kind: 'block' }])
    const engine = createNotificationEngine({ gateway })

    engine.start(CREDENTIALS)
    await settle()
    engine.start(OTHER_CREDENTIALS)
    await vi.waitFor(() => {
      expect(gateway.receiveCalls).toBe(2)
    })

    await engine.stop()
    expect(gateway.receiveCalls).toBe(2)
  })

  it('stops immediately when never started', async () => {
    const engine = createNotificationEngine({ gateway: new FakeNotificationGateway() })
    await expect(engine.stop()).resolves.toBeUndefined()
  })

  it('resolves blocked receives through the abort contract on stop', async () => {
    const gateway = new FakeNotificationGateway()
    const engine = createNotificationEngine({ gateway })
    engine.start(CREDENTIALS)
    await settle()

    await engine.stop()

    expect(gateway.receiveCalls).toBe(1)
  })

  it('keeps subscribers removable', async () => {
    const engine = createNotificationEngine({ gateway: new FakeNotificationGateway() })
    const events: NotificationEngineEvent[] = []
    const unsubscribe = engine.subscribe((event) => {
      events.push(event)
    })
    unsubscribe()
    engine.start(CREDENTIALS)
    await settle()
    await engine.stop()
    expect(events).toEqual([])
  })

  it('exposes one session-keyed singleton', async () => {
    expect(getNotificationEngine()).toBe(getNotificationEngine())
    await expect(stopNotificationEngine()).resolves.toBeUndefined()
  })
})

describe('notification engine poll cycle', () => {
  it('re-polls immediately after a null long-poll timeout without scheduling timers', async () => {
    const gateway = new FakeNotificationGateway([
      { kind: 'null' },
      { kind: 'null' },
      { kind: 'block' },
    ])
    const scheduler = new ManualScheduler()
    const engine = createNotificationEngine({ gateway, scheduler })

    engine.start(CREDENTIALS)
    await vi.waitFor(() => {
      expect(gateway.receiveCalls).toBe(3)
    })
    expect(scheduler.pendingDelays()).toEqual([])

    await engine.stop()
  })

  it('applies and acknowledges notifications in FIFO order with ack strictly after apply', async () => {
    const activity: string[] = []
    const gateway = new FakeNotificationGateway(
      [
        { kind: 'deliver', receiptId: 7, body: incomingEnvelope('m1', 'one') },
        { kind: 'deliver', receiptId: 8, body: incomingEnvelope('m2', 'two') },
        { kind: 'block' },
      ],
      activity,
    )
    const engine = createNotificationEngine({ gateway })
    const unsubscribe = engine.subscribe((event) => {
      if (event.kind === 'message') {
        activity.push(`apply:${event.message.id}`)
      }
    })

    engine.start(CREDENTIALS)
    await vi.waitFor(() => {
      expect(gateway.receiveCalls).toBe(3)
    })
    await engine.stop()
    unsubscribe()

    expect(activity).toEqual(['apply:m1', 'ack:7', 'apply:m2', 'ack:8'])
  })

  it('acks and skips envelopes the mapper ignores', async () => {
    const activity: string[] = []
    const gateway = new FakeNotificationGateway(
      [
        { kind: 'deliver', receiptId: 4, body: null },
        {
          kind: 'deliver',
          receiptId: 9,
          body: { typeWebhook: 'stateInstanceChanged', timestamp: 1_700_000_000 },
        },
        { kind: 'block' },
      ],
      activity,
    )
    const skipped: string[] = []
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation((message: unknown) => {
      if (typeof message === 'string' && message.startsWith('[notifications] webhook skipped')) {
        skipped.push(message)
      }
    })
    const engine = createNotificationEngine({ gateway })
    const unsubscribe = engine.subscribe((event) => {
      activity.push(`apply:${JSON.stringify(event)}`)
    })

    engine.start(CREDENTIALS)
    await vi.waitFor(() => {
      expect(gateway.receiveCalls).toBe(3)
    })
    await engine.stop()
    unsubscribe()
    consoleSpy.mockRestore()

    expect(activity).toEqual(['ack:4', 'ack:9'])
    expect(skipped).toEqual(['[notifications] webhook skipped: stateInstanceChanged'])
  })
})

describe('notification engine failure handling', () => {
  const networkFailure = ApiError.network(new Error('offline'))

  it('backs off 1s→cap on failures and resets to 1s after a success', async () => {
    const gateway = new FakeNotificationGateway([
      { kind: 'fail', error: networkFailure },
      { kind: 'fail', error: networkFailure },
      { kind: 'deliver', receiptId: 5, body: incomingEnvelope('m1', 'hello') },
      { kind: 'fail', error: networkFailure },
      { kind: 'block' },
    ])
    const scheduler = new ManualScheduler()
    const events: NotificationEngineEvent[] = []
    const engine = createNotificationEngine({
      gateway,
      scheduler,
      initialBackoffMs: 1_000,
      maxBackoffMs: 3_000,
    })
    const unsubscribe = engine.subscribe((event) => {
      events.push(event)
    })

    engine.start(CREDENTIALS)
    await vi.waitFor(() => {
      expect(scheduler.pendingDelays()).toEqual([1_000])
    })

    scheduler.flushNext()
    await vi.waitFor(() => {
      expect(scheduler.pendingDelays()).toEqual([2_000])
    })

    scheduler.flushNext()
    await vi.waitFor(() => {
      expect(scheduler.pendingDelays()).toEqual([1_000])
    })

    await engine.stop()
    unsubscribe()

    const retrySequence = events.map((event) =>
      event.kind === 'pollFailed' ? event.retryInMs : event.kind,
    )
    expect(retrySequence).toEqual([1_000, 2_000, 'message', 1_000])
    const firstFailure = events[0]
    expect(firstFailure?.kind).toBe('pollFailed')
    if (firstFailure?.kind === 'pollFailed') {
      expect(firstFailure.retryInMs).toBe(1_000)
      expect(firstFailure.error.kind).toBe('network')
    }
    expect(gateway.acknowledgeCalls).toEqual([5])
  })

  it('caps the backoff at the configured maximum', async () => {
    const failures = Array.from({ length: 4 }, () => ({
      kind: 'fail' as const,
      error: networkFailure,
    }))
    const gateway = new FakeNotificationGateway([...failures, { kind: 'block' }])
    const scheduler = new ManualScheduler()
    const events: NotificationEngineEvent[] = []
    const engine = createNotificationEngine({
      gateway,
      scheduler,
      initialBackoffMs: 1_000,
      maxBackoffMs: 3_000,
    })
    const unsubscribe = engine.subscribe((event) => {
      events.push(event)
    })

    engine.start(CREDENTIALS)
    for (let round = 0; round < 4; round += 1) {
      await vi.waitFor(() => {
        expect(scheduler.pendingDelays().length).toBeGreaterThan(0)
      })
      scheduler.flushNext()
    }
    await vi.waitFor(() => {
      expect(gateway.receiveCalls).toBe(5)
    })

    const retries = events
      .filter(
        (event): event is Extract<NotificationEngineEvent, { kind: 'pollFailed' }> =>
          event.kind === 'pollFailed',
      )
      .map((event) => event.retryInMs)
    expect(retries).toEqual([1_000, 2_000, 3_000, 3_000])

    await engine.stop()
    unsubscribe()
  })

  it('cancels the pending backoff and stops the loop when disconnected mid-backoff', async () => {
    const gateway = new FakeNotificationGateway([{ kind: 'fail', error: networkFailure }])
    const scheduler = new ManualScheduler()
    const engine = createNotificationEngine({ gateway, scheduler })

    engine.start(CREDENTIALS)
    await vi.waitFor(() => {
      expect(scheduler.pendingDelays()).toEqual([1_000])
    })

    await engine.stop()

    expect(scheduler.pendingDelays()).toEqual([])
    expect(gateway.receiveCalls).toBe(1)
  })

  it('emits sessionInvalidated and halts on 401 without further polling', async () => {
    const gateway = new FakeNotificationGateway([
      { kind: 'fail', error: new ApiError('Unauthorized', { kind: 'status', status: 401 }) },
      { kind: 'block' },
    ])
    const events: NotificationEngineEvent[] = []
    const engine = createNotificationEngine({ gateway })
    const unsubscribe = engine.subscribe((event) => {
      events.push(event)
    })

    engine.start(CREDENTIALS)
    await settle()
    expect(events).toEqual([{ kind: 'sessionInvalidated' }])
    expect(gateway.receiveCalls).toBe(1)

    engine.start(CREDENTIALS)
    await vi.waitFor(() => {
      expect(gateway.receiveCalls).toBe(2)
    })

    await engine.stop()
    unsubscribe()
  })

  it('treats 403 as an invalidated session as well', async () => {
    const gateway = new FakeNotificationGateway([
      { kind: 'fail', error: new ApiError('Forbidden', { kind: 'status', status: 403 }) },
    ])
    const events: NotificationEngineEvent[] = []
    const engine = createNotificationEngine({ gateway })
    const unsubscribe = engine.subscribe((event) => {
      events.push(event)
    })

    engine.start(CREDENTIALS)
    await settle()
    expect(events).toEqual([{ kind: 'sessionInvalidated' }])

    await engine.stop()
    unsubscribe()
  })
})

describe('notification engine visibility handling', () => {
  interface VisibilityHarness {
    setVisibility(value: NotificationVisibility): void
    notifyVisibilityChange(): void
  }

  const createVisibilityHarness = (): VisibilityHarness & {
    visibility: () => NotificationVisibility
    onVisibilityChange: (listener: () => void) => () => void
  } => {
    let value: NotificationVisibility = 'visible'
    const listeners: Array<() => void> = []
    return {
      visibility: () => value,
      onVisibilityChange: (listener) => {
        listeners.push(listener)
        return () => {
          const index = listeners.indexOf(listener)
          if (index >= 0) {
            listeners.splice(index, 1)
          }
        }
      },
      setVisibility(next) {
        value = next
      },
      notifyVisibilityChange() {
        for (const listener of [...listeners]) {
          listener()
        }
      },
    }
  }

  it('queues and throttles dispatch to one flush per interval while hidden', async () => {
    const activity: string[] = []
    const gateway = new FakeNotificationGateway(
      [
        { kind: 'deliver', receiptId: 1, body: incomingEnvelope('m1', 'one') },
        { kind: 'deliver', receiptId: 2, body: incomingEnvelope('m2', 'two') },
        { kind: 'block' },
      ],
      activity,
    )
    const scheduler = new ManualScheduler()
    const visibility = createVisibilityHarness()
    visibility.setVisibility('hidden')
    const events: NotificationEngineEvent[] = []
    const engine = createNotificationEngine({
      gateway,
      scheduler,
      visibility: visibility.visibility,
      onVisibilityChange: visibility.onVisibilityChange,
      hiddenDispatchIntervalMs: 1_500,
    })
    const unsubscribe = engine.subscribe((event) => {
      events.push(event)
      if (event.kind === 'message') {
        activity.push(`apply:${event.message.id}`)
      }
    })

    engine.start(CREDENTIALS)
    await vi.waitFor(() => {
      expect(scheduler.pendingDelays()).toEqual([1_500])
    })
    expect(events).toEqual([])

    scheduler.flushNext()
    await vi.waitFor(() => {
      expect(
        events.map((event) => (event.kind === 'message' ? event.message.id : event.kind)),
      ).toEqual(['m1'])
    })

    scheduler.flushNext()
    await vi.waitFor(() => {
      expect(gateway.receiveCalls).toBe(3)
    })
    await engine.stop()
    unsubscribe()

    expect(
      events.map((event) => (event.kind === 'message' ? event.message.id : event.kind)),
    ).toEqual(['m1', 'm2'])
    expect(gateway.acknowledgeCalls).toEqual([1, 2])
    expect(activity).toEqual(['apply:m1', 'ack:1', 'apply:m2', 'ack:2'])
  })

  it('flushes queued notifications immediately when the document becomes visible again', async () => {
    const activity: string[] = []
    const gateway = new FakeNotificationGateway(
      [{ kind: 'deliver', receiptId: 1, body: incomingEnvelope('m1', 'one') }, { kind: 'block' }],
      activity,
    )
    const scheduler = new ManualScheduler()
    const visibility = createVisibilityHarness()
    visibility.setVisibility('hidden')
    const events: NotificationEngineEvent[] = []
    const engine = createNotificationEngine({
      gateway,
      scheduler,
      visibility: visibility.visibility,
      onVisibilityChange: visibility.onVisibilityChange,
    })
    const unsubscribe = engine.subscribe((event) => {
      events.push(event)
    })

    engine.start(CREDENTIALS)
    await vi.waitFor(() => {
      expect(scheduler.pendingDelays()).toEqual([1_000])
    })

    visibility.setVisibility('visible')
    visibility.notifyVisibilityChange()
    await vi.waitFor(() => {
      expect(gateway.receiveCalls).toBe(2)
    })
    await engine.stop()
    unsubscribe()

    expect(
      events.map((event) => (event.kind === 'message' ? event.message.id : event.kind)),
    ).toEqual(['m1'])
    expect(scheduler.pendingDelays()).toEqual([])
    expect(activity).toEqual(['ack:1'])
  })

  it('dispatches inline without timers while visible', async () => {
    const gateway = new FakeNotificationGateway([
      { kind: 'deliver', receiptId: 1, body: incomingEnvelope('m1', 'one') },
      { kind: 'block' },
    ])
    const scheduler = new ManualScheduler()
    const events: NotificationEngineEvent[] = []
    const engine = createNotificationEngine({ gateway, scheduler })
    const unsubscribe = engine.subscribe((event) => {
      events.push(event)
    })

    engine.start(CREDENTIALS)
    await vi.waitFor(() => {
      expect(gateway.receiveCalls).toBe(2)
    })
    expect(
      events.map((event) => (event.kind === 'message' ? event.message.id : event.kind)),
    ).toEqual(['m1'])
    expect(scheduler.pendingDelays()).toEqual([])

    await engine.stop()
    unsubscribe()
  })

  it('drops queued hidden notifications on stop without dispatch or ack', async () => {
    const gateway = new FakeNotificationGateway([
      { kind: 'deliver', receiptId: 3, body: incomingEnvelope('m3', 'three') },
      { kind: 'block' },
    ])
    const scheduler = new ManualScheduler()
    const visibility = createVisibilityHarness()
    visibility.setVisibility('hidden')
    const events: NotificationEngineEvent[] = []
    const engine = createNotificationEngine({
      gateway,
      scheduler,
      visibility: visibility.visibility,
      onVisibilityChange: visibility.onVisibilityChange,
    })
    const unsubscribe = engine.subscribe((event) => {
      events.push(event)
    })

    engine.start(CREDENTIALS)
    await vi.waitFor(() => {
      expect(scheduler.pendingDelays()).toEqual([1_000])
    })

    await engine.stop()

    expect(events).toEqual([])
    expect(gateway.acknowledgeCalls).toEqual([])
    unsubscribe()
  })
})

const engineServer = setupServer()

beforeAll(() => {
  engineServer.listen({ onUnhandledFrame: 'error' })
})

afterEach(() => {
  engineServer.resetHandlers()
})

afterAll(() => {
  engineServer.close()
})

describe('notification engine over the real facade gateway (MSW)', () => {
  const realGateway: NotificationEngineGateway = { receiveNotification, deleteNotification }

  it('long-polls with receiveTimeout=25, drains the queue FIFO and acks after apply', async () => {
    const queue: Array<{ receiptId: number; body: GreenApiNotificationEnvelope }> = [
      { receiptId: 11, body: incomingEnvelope('m1', 'first', '79111111111') },
      { receiptId: 12, body: incomingEnvelope('m2', 'second', '79111111111') },
    ]
    const activity: string[] = []
    const receiveUrls: string[] = []
    const deleteUrls: string[] = []
    engineServer.use(
      http.get(`${base}/receiveNotification/${CREDENTIALS.apiTokenInstance}`, ({ request }) => {
        receiveUrls.push(request.url)
        const oldest = queue[0]
        if (oldest === undefined) {
          return delay(60_000).then(() => HttpResponse.json(null))
        }
        return HttpResponse.json({ receiptId: oldest.receiptId, body: oldest.body })
      }),
      http.delete(
        new RegExp(`^${base}/deleteNotification/${CREDENTIALS.apiTokenInstance}/\\d+$`),
        ({ request }) => {
          deleteUrls.push(request.url)
          const receiptId = Number(request.url.match(/(\d+)$/)?.[1])
          activity.push(`ack:${receiptId}`)
          const index = queue.findIndex((item) => item.receiptId === receiptId)
          if (index >= 0) {
            queue.splice(index, 1)
          }
          return HttpResponse.json({ result: true, reason: '' })
        },
      ),
    )
    const engine: NotificationEngine = createNotificationEngine({ gateway: realGateway })
    const unsubscribe = engine.subscribe((event) => {
      if (event.kind === 'message') {
        activity.push(`apply:${event.message.id}`)
      }
    })

    engine.start(CREDENTIALS)
    await vi.waitFor(() => {
      expect(activity).toEqual(['apply:m1', 'ack:11', 'apply:m2', 'ack:12'])
    })
    await vi.waitFor(() => {
      expect(receiveUrls.length).toBeGreaterThanOrEqual(3)
    })
    await engine.stop()
    unsubscribe()

    expect(receiveUrls.length).toBeGreaterThanOrEqual(3)
    expect(receiveUrls.every((url) => url.includes('receiveTimeout=25'))).toBe(true)
    expect(deleteUrls).toEqual([
      `${base}/deleteNotification/${CREDENTIALS.apiTokenInstance}/11`,
      `${base}/deleteNotification/${CREDENTIALS.apiTokenInstance}/12`,
    ])
  })

  it('keeps exactly one receiveNotification in flight across poll cycles', async () => {
    let active = 0
    let maxActive = 0
    let calls = 0
    engineServer.use(
      http.get(`${base}/receiveNotification/${CREDENTIALS.apiTokenInstance}`, async () => {
        calls += 1
        active += 1
        maxActive = Math.max(maxActive, active)
        await delay(25)
        active -= 1
        return HttpResponse.json(null)
      }),
    )
    const engine = createNotificationEngine({ gateway: realGateway })

    engine.start(CREDENTIALS)
    await vi.waitFor(() => {
      expect(calls).toBeGreaterThanOrEqual(3)
    })
    await engine.stop()

    expect(maxActive).toBe(1)
  })

  it('emits sessionInvalidated on 401 and stops polling', async () => {
    let calls = 0
    engineServer.use(
      http.get(`${base}/receiveNotification/${CREDENTIALS.apiTokenInstance}`, () => {
        calls += 1
        return new HttpResponse('Unauthorized', { status: 401 })
      }),
    )
    const events: NotificationEngineEvent[] = []
    const engine = createNotificationEngine({ gateway: realGateway })
    const unsubscribe = engine.subscribe((event) => {
      events.push(event)
    })

    engine.start(CREDENTIALS)
    await vi.waitFor(() => {
      expect(events).toEqual([{ kind: 'sessionInvalidated' }])
    })
    expect(calls).toBe(1)

    await engine.stop()
    expect(calls).toBe(1)
    unsubscribe()
  })

  it('backs off on server errors and recovers with a queued notification', async () => {
    let calls = 0
    engineServer.use(
      http.get(`${base}/receiveNotification/${CREDENTIALS.apiTokenInstance}`, () => {
        calls += 1
        if (calls <= 2) {
          return new HttpResponse('boom', { status: 500 })
        }
        if (calls === 3) {
          return HttpResponse.json({
            receiptId: 4,
            body: incomingEnvelope('m9', 'recovered', '79222222222'),
          })
        }
        return delay(60_000).then(() => HttpResponse.json(null))
      }),
      http.delete(
        new RegExp(`^${base}/deleteNotification/${CREDENTIALS.apiTokenInstance}/\\d+$`),
        () => HttpResponse.json({ result: true, reason: '' }),
      ),
    )
    const events: NotificationEngineEvent[] = []
    const engine = createNotificationEngine({
      gateway: realGateway,
      initialBackoffMs: 5,
      maxBackoffMs: 10,
    })
    const unsubscribe = engine.subscribe((event) => {
      events.push(event)
    })

    engine.start(CREDENTIALS)
    await vi.waitFor(() => {
      expect(events.some((event) => event.kind === 'message' && event.message.id === 'm9')).toBe(
        true,
      )
    })
    await engine.stop()
    unsubscribe()

    expect(calls).toBeGreaterThanOrEqual(4)
    expect(events.filter((event) => event.kind === 'pollFailed')).toHaveLength(2)
  })
})
