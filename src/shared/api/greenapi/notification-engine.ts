import { mapNotification, type NotificationEvent } from './domain/message'
import { deleteNotification, receiveNotification } from './facades'
import { ApiError, type GreenApiCredentials } from './http-client'
import type { GreenApiDeleteNotificationResult, ReceivedNotification } from './types'

export type NotificationVisibility = 'visible' | 'hidden'

export type DispatchableNotification = Exclude<NotificationEvent, { readonly kind: 'ignored' }>

export type NotificationEngineEvent =
  | DispatchableNotification
  | { readonly kind: 'sessionInvalidated' }
  | {
      readonly kind: 'pollFailed'
      readonly error: ApiError
      readonly retryInMs: number
    }
  | { readonly kind: 'pollRecovered' }

export type NotificationEngineListener = (event: NotificationEngineEvent) => void | Promise<void>

export interface NotificationScheduler {
  schedule(delayMs: number, run: () => void): () => void
}

export interface NotificationEngineGateway {
  receiveNotification(
    credentials: GreenApiCredentials,
    receiveTimeoutSeconds: number,
    options?: { readonly signal?: AbortSignal },
  ): Promise<ReceivedNotification | null>
  deleteNotification(
    credentials: GreenApiCredentials,
    receiptId: number,
    options?: { readonly signal?: AbortSignal },
  ): Promise<GreenApiDeleteNotificationResult>
}

export interface NotificationEngineDeps {
  readonly gateway: NotificationEngineGateway
  readonly scheduler?: NotificationScheduler
  readonly visibility?: () => NotificationVisibility
  readonly onVisibilityChange?: ((listener: () => void) => () => void) | undefined
  readonly receiveTimeoutSeconds?: number
  readonly initialBackoffMs?: number
  readonly maxBackoffMs?: number
  readonly hiddenDispatchIntervalMs?: number
}

export const NOTIFICATION_ENGINE_RECEIVE_TIMEOUT_SECONDS = 25
export const NOTIFICATION_ENGINE_INITIAL_BACKOFF_MS = 1_000
export const NOTIFICATION_ENGINE_MAX_BACKOFF_MS = 30_000
export const NOTIFICATION_ENGINE_HIDDEN_DISPATCH_INTERVAL_MS = 1_000

export interface NotificationEngine {
  start(credentials: GreenApiCredentials): void
  stop(): Promise<void>
  subscribe(listener: NotificationEngineListener): () => void
}

const timeoutScheduler: NotificationScheduler = {
  schedule: (delayMs, run) => {
    const timerId = setTimeout(run, delayMs)
    return () => clearTimeout(timerId)
  },
}

const browserVisibility = (): NotificationVisibility => {
  if (typeof document === 'undefined') {
    return 'visible'
  }
  return document.visibilityState === 'hidden' ? 'hidden' : 'visible'
}

const bindDocumentVisibilityListener = (listener: () => void): (() => void) => {
  if (typeof document === 'undefined') {
    return () => undefined
  }
  document.addEventListener('visibilitychange', listener)
  return () => document.removeEventListener('visibilitychange', listener)
}

const SESSION_INVALIDATED_STATUSES: ReadonlySet<number> = new Set([401, 403])

const isAbortedError = (error: unknown): boolean =>
  error instanceof ApiError && error.kind === 'aborted'

const isSessionInvalidError = (error: unknown): boolean =>
  error instanceof ApiError &&
  error.kind === 'status' &&
  error.status !== null &&
  SESSION_INVALIDATED_STATUSES.has(error.status)

const sameCredentials = (a: GreenApiCredentials, b: GreenApiCredentials): boolean =>
  a.apiUrl === b.apiUrl &&
  a.idInstance === b.idInstance &&
  a.apiTokenInstance === b.apiTokenInstance

const clear = (): void => undefined

interface PendingNotification {
  readonly receiptId: number
  readonly event: DispatchableNotification | null
  readonly resolveSettled: (() => void) | null
}

export function createNotificationEngine(deps: NotificationEngineDeps): NotificationEngine {
  const gateway = deps.gateway
  const scheduler = deps.scheduler ?? timeoutScheduler
  const currentVisibility = deps.visibility ?? browserVisibility
  const addVisibilityListener = deps.onVisibilityChange ?? bindDocumentVisibilityListener
  const receiveTimeoutSeconds =
    deps.receiveTimeoutSeconds ?? NOTIFICATION_ENGINE_RECEIVE_TIMEOUT_SECONDS
  const initialBackoffMs = deps.initialBackoffMs ?? NOTIFICATION_ENGINE_INITIAL_BACKOFF_MS
  const maxBackoffMs = Math.max(
    deps.maxBackoffMs ?? NOTIFICATION_ENGINE_MAX_BACKOFF_MS,
    initialBackoffMs,
  )
  const hiddenDispatchIntervalMs =
    deps.hiddenDispatchIntervalMs ?? NOTIFICATION_ENGINE_HIDDEN_DISPATCH_INTERVAL_MS

  const listeners = new Set<NotificationEngineListener>()
  const pending: PendingNotification[] = []

  let activeCredentials: GreenApiCredentials | null = null
  let controller: AbortController | null = null
  let running = false
  let loopSettled: Promise<void> = Promise.resolve()
  let lifecycleChain: Promise<void> = Promise.resolve()
  let flushScheduled = false
  let flushTimerCancel: (() => void) | null = null
  let detachVisibilityListener: (() => void) | null = null

  const isAborted = (): boolean => controller?.signal.aborted ?? true

  const emit = async (event: NotificationEngineEvent): Promise<void> => {
    const snapshot = [...listeners]
    await Promise.allSettled(
      snapshot.map((listener) => Promise.resolve().then(() => listener(event))),
    )
  }

  const ack = async (receiptId: number): Promise<void> => {
    const signal = controller?.signal
    if (activeCredentials === null || signal === undefined || signal.aborted) {
      return
    }
    try {
      await gateway.deleteNotification(activeCredentials, receiptId, { signal })
    } catch (error) {
      if (isAbortedError(error)) {
        return
      }
      console.warn(
        '[notifications] acknowledge failed — the notification will be redelivered',
        error,
      )
    }
  }

  const runFlush = (): Promise<void> => {
    const run = async (): Promise<void> => {
      while (!isAborted() && pending.length > 0) {
        const next = pending.shift()
        if (next === undefined) {
          break
        }
        try {
          if (next.event !== null) {
            await emit(next.event)
          }
          await ack(next.receiptId)
        } finally {
          next.resolveSettled?.()
        }
      }
    }
    const next = lifecycleChain.then(run, run)
    lifecycleChain = next.then(clear, clear)
    return next
  }

  const scheduleNextFlush = (): void => {
    if (flushScheduled || isAborted()) {
      return
    }
    flushScheduled = true
    const delayMs = currentVisibility() === 'hidden' ? hiddenDispatchIntervalMs : 0
    flushTimerCancel = scheduler.schedule(delayMs, () => {
      flushScheduled = false
      flushTimerCancel = null
      void runFlush()
    })
  }

  const drainPending = (): void => {
    while (pending.length > 0) {
      const entry = pending.shift()
      entry?.resolveSettled?.()
    }
  }

  const clearFlushTimer = (): void => {
    if (flushTimerCancel !== null) {
      flushTimerCancel()
      flushTimerCancel = null
    }
    flushScheduled = false
  }

  const detachVisibility = (): void => {
    if (detachVisibilityListener !== null) {
      detachVisibilityListener()
      detachVisibilityListener = null
    }
  }

  const attachVisibility = (): void => {
    if (detachVisibilityListener === null) {
      detachVisibilityListener = addVisibilityListener(() => {
        if (currentVisibility() === 'visible' && pending.length > 0 && !isAborted()) {
          clearFlushTimer()
          void runFlush()
        }
      })
    }
  }

  const waitBackoff = (delayMs: number, signal: AbortSignal): Promise<void> =>
    new Promise((resolve) => {
      let cancelTimer: (() => void) | null = null
      const finish = (): void => {
        signal.removeEventListener('abort', finish)
        cancelTimer?.()
        resolve()
      }
      signal.addEventListener('abort', finish, { once: true })
      cancelTimer = scheduler.schedule(delayMs, finish)
    })

  const admit = async (received: ReceivedNotification): Promise<void> => {
    if (isAborted()) {
      return
    }
    const mapped = mapNotification(received.body)
    let event: DispatchableNotification | null = null
    if (mapped.kind === 'ignored') {
      if (received.body !== null) {
        console.log(
          `[notifications] webhook skipped: ${received.body.typeWebhook ?? 'unknown type'}`,
        )
      }
    } else {
      event = mapped
    }
    if (currentVisibility() === 'visible') {
      if (event !== null) {
        await emit(event)
      }
      await ack(received.receiptId)
      return
    }
    await new Promise<void>((resolve) => {
      pending.push({ receiptId: received.receiptId, event, resolveSettled: resolve })
      scheduleNextFlush()
    })
  }

  const runLoop = async (signal: AbortSignal, credentials: GreenApiCredentials): Promise<void> => {
    try {
      let backoffMs = initialBackoffMs
      let degraded = false
      while (!signal.aborted) {
        let received: ReceivedNotification | null
        try {
          received = await gateway.receiveNotification(credentials, receiveTimeoutSeconds, {
            signal,
          })
        } catch (error) {
          if (signal.aborted || isAbortedError(error)) {
            return
          }
          if (isSessionInvalidError(error)) {
            await emit({ kind: 'sessionInvalidated' })
            return
          }
          const failure = error instanceof ApiError ? error : ApiError.network(error)
          degraded = true
          await emit({ kind: 'pollFailed', error: failure, retryInMs: backoffMs })
          await waitBackoff(backoffMs, signal)
          backoffMs = Math.min(backoffMs * 2, maxBackoffMs)
          continue
        }
        backoffMs = initialBackoffMs
        if (degraded) {
          degraded = false
          await emit({ kind: 'pollRecovered' })
        }
        if (received === null) {
          continue
        }
        await admit(received)
      }
    } catch (error) {
      console.error('[notifications] poll loop crashed', error)
    }
  }

  const halt = async (): Promise<void> => {
    controller?.abort()
    controller = null
    clearFlushTimer()
    drainPending()
    detachVisibility()
    await loopSettled
    running = false
  }

  const launch = (credentials: GreenApiCredentials): void => {
    running = true
    activeCredentials = credentials
    controller = new AbortController()
    attachVisibility()
    const signal = controller.signal
    loopSettled = runLoop(signal, credentials).finally(() => {
      if (running && controller !== null && controller.signal === signal) {
        running = false
        controller = null
        clearFlushTimer()
        drainPending()
        detachVisibility()
      }
    })
  }

  const enqueueLifecycle = (op: () => Promise<void>): Promise<void> => {
    const next = lifecycleChain.then(op, op)
    lifecycleChain = next.then(clear, clear)
    return next
  }

  return {
    start(credentials) {
      void enqueueLifecycle(async () => {
        if (running) {
          if (activeCredentials !== null && sameCredentials(activeCredentials, credentials)) {
            return
          }
          await halt()
        }
        launch(credentials)
      })
    },

    stop() {
      return enqueueLifecycle(async () => {
        if (running) {
          await halt()
        }
      })
    },

    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}

let sharedEngine: NotificationEngine | null = null

export function getNotificationEngine(): NotificationEngine {
  if (sharedEngine === null) {
    sharedEngine = createNotificationEngine({
      gateway: { receiveNotification, deleteNotification },
    })
  }
  return sharedEngine
}

export async function stopNotificationEngine(): Promise<void> {
  if (sharedEngine !== null) {
    await sharedEngine.stop()
  }
}
