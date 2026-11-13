export type Clock = {
  now(): number
  schedule(delayMs: number, run: () => void): void
  random(): number
}

export type RateQueueOptions = {
  readonly clock?: Clock
  readonly jitterRatio?: number
}

type Slot = {
  readonly limit: number
  chain: Promise<void>
  lastRun: number
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

  enqueue<T>(method: string, task: () => Promise<T>, coalesceId?: string): Promise<T> {
    if (coalesceId === undefined) {
      return this.#dispatch(method, task)
    }
    const dedupeKey = `${method}::${coalesceId}`
    const pending = this.#inFlight.get(dedupeKey)
    if (pending) {
      return pending as Promise<T>
    }
    const promise = this.#dispatch(method, task)
    const forget = (): void => {
      this.#inFlight.delete(dedupeKey)
    }
    void promise.then(forget, forget).catch(() => undefined)
    this.#inFlight.set(dedupeKey, promise)
    return promise
  }

  #dispatch<T>(method: string, task: () => Promise<T>): Promise<T> {
    const slot = this.#slotFor(method)
    const minimumGapMs = 1000 / slot.limit
    const tail = slot.chain.then(async () => {
      const jitterFactor = 1 + this.#clock.random() * this.#jitterRatio
      const targetStart = slot.lastRun + minimumGapMs * jitterFactor
      const delayMs = targetStart - this.#clock.now()
      if (delayMs > 0) {
        await waitFor(this.#clock, delayMs)
      }
      slot.lastRun = this.#clock.now()
      return task()
    })
    slot.chain = tail.then(
      () => undefined,
      () => undefined,
    )
    return tail
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
      chain: Promise.resolve(),
      lastRun: Number.NEGATIVE_INFINITY,
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
