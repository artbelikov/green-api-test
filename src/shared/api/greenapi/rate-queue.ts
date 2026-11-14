export type Clock = {
  now(): number
  schedule(delayMs: number, run: () => void): void
  random(): number
}

export type RateQueuePriority = 'user' | 'background'

export type RateQueueOptions = {
  readonly clock?: Clock
  readonly jitterRatio?: number
}

type QueueEntry = {
  readonly task: () => Promise<unknown>
  readonly priority: RateQueuePriority
  readonly resolve: (value: unknown) => void
  readonly reject: (reason: unknown) => void
}

type Slot = {
  readonly limit: number
  lastRun: number
  readonly entries: QueueEntry[]
  running: boolean
}

const realClock: Clock = {
  now: () => performance.now(),
  random: () => Math.random(),
  schedule: (delayMs, run) => {
    globalThis.setTimeout(run, delayMs)
  },
}

const waitFor = (clock: Clock, delayMs: number): Promise<void> =>
  new Promise((resolve) => {
    clock.schedule(Math.max(0, delayMs), resolve)
  })

export class RateQueue {
  readonly #slots = new Map<string, Slot>()
  readonly #inFlight = new Map<string, Promise<unknown>>()
  readonly #clock: Clock
  readonly #jitterRatio: number
  readonly #limits: Readonly<Record<string, number>>

  constructor(limits: Readonly<Record<string, number>>, options: RateQueueOptions = {}) {
    this.#limits = limits
    this.#clock = options.clock ?? realClock
    this.#jitterRatio = options.jitterRatio ?? 0.15
  }

  enqueue<T>(
    method: string,
    task: () => Promise<T>,
    coalesceId?: string,
    priority: RateQueuePriority = 'background',
  ): Promise<T> {
    if (coalesceId === undefined) {
      return this.#dispatch(method, task, priority)
    }
    const dedupeKey = `${method}::${coalesceId}`
    const pending = this.#inFlight.get(dedupeKey)
    if (pending) {
      return pending as Promise<T>
    }
    const promise = this.#dispatch(method, task, priority)
    const forget = (): void => {
      this.#inFlight.delete(dedupeKey)
    }
    void promise.then(forget, forget).catch(() => undefined)
    this.#inFlight.set(dedupeKey, promise)
    return promise
  }

  #dispatch<T>(method: string, task: () => Promise<T>, priority: RateQueuePriority): Promise<T> {
    const slot = this.#slotFor(method)
    return new Promise<T>((resolve, reject) => {
      slot.entries.push({
        task,
        priority,
        resolve: resolve as (value: unknown) => void,
        reject,
      })
      this.#pump(slot)
    })
  }

  #pump(slot: Slot): void {
    if (slot.running) {
      return
    }
    slot.running = true
    void (async () => {
      try {
        while (slot.entries.length > 0) {
          const jitterFactor = 1 + this.#clock.random() * this.#jitterRatio
          const minimumGapMs = 1000 / slot.limit
          const targetStart = slot.lastRun + minimumGapMs * jitterFactor
          const delayMs = targetStart - this.#clock.now()
          if (delayMs > 0) {
            await waitFor(this.#clock, delayMs)
          }
          const entry = this.#pickNext(slot)
          if (entry === undefined) {
            break
          }
          try {
            slot.lastRun = this.#clock.now()
            entry.resolve(await entry.task())
          } catch (error) {
            entry.reject(error)
          }
        }
      } catch (error) {
        for (const queued of slot.entries.splice(0)) {
          queued.reject(error)
        }
      } finally {
        slot.running = false
      }
    })()
  }

  #pickNext(slot: Slot): QueueEntry | undefined {
    const userIndex = slot.entries.findIndex((entry) => entry.priority === 'user')
    const entryIndex = userIndex === -1 ? 0 : userIndex
    const entry = slot.entries[entryIndex]
    if (entry !== undefined) {
      slot.entries.splice(entryIndex, 1)
    }
    return entry
  }

  #slotFor(method: string): Slot {
    const existing = this.#slots.get(method)
    if (existing) {
      return existing
    }
    const limit = this.#limits[method]
    if (limit === undefined || limit <= 0) {
      throw new Error(`No rate limit configured for method: ${method}`)
    }
    const slot: Slot = {
      limit,
      lastRun: Number.NEGATIVE_INFINITY,
      entries: [],
      running: false,
    }
    this.#slots.set(method, slot)
    return slot
  }
}

export const GREEN_API_RATE_LIMITS: Readonly<Record<string, number>> = {
  getChatHistory: 1,
  getChats: 1,
  getContacts: 1,
  getSettings: 1,
  setSettings: 1,
  getStateInstance: 1,
  getContactInfo: 10,
  getAvatar: 10,
  readChat: 10,
  sendMessage: 50,
  receiveNotification: 100,
  deleteNotification: 100,
}
