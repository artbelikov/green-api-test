import { describe, expect, it } from 'vitest'
import { type Clock, RateQueue } from './rate-queue'

type ScheduledTask = {
  readonly at: number
  readonly run: () => void
}

class ManualClock implements Clock {
  readonly randomValues: readonly number[]

  #now = 0
  #randomIndex = 0
  #tasks: ScheduledTask[] = []

  constructor(randomValues: readonly number[] = []) {
    this.randomValues = randomValues
  }

  now(): number {
    return this.#now
  }

  random(): number {
    const value = this.randomValues[this.#randomIndex] ?? 0
    this.#randomIndex += 1
    return value
  }

  schedule(delayMs: number, run: () => void): void {
    this.#tasks.push({ at: this.#now + delayMs, run })
  }

  advance(ms: number): void {
    const target = this.#now + ms
    this.#tasks.sort((a, b) => a.at - b.at)
    while (this.#tasks.length > 0) {
      const earliest = this.#tasks[0]
      if (earliest === undefined || earliest.at > target) {
        break
      }
      this.#tasks.shift()
      this.#now = earliest.at
      earliest.run()
    }
    this.#now = target
  }
}

const settle = async (rounds = 4): Promise<void> => {
  for (let index = 0; index < rounds; index += 1) {
    await Promise.resolve()
  }
}

describe('RateQueue', () => {
  it('runs the first task of a method immediately', async () => {
    const clock = new ManualClock()
    const queue = new RateQueue({ history: 1 }, { clock })
    const startTimes: number[] = []

    const promise = queue.enqueue('history', async () => {
      startTimes.push(clock.now())
      return 'first'
    })
    await settle()

    expect(startTimes).toEqual([0])
    await expect(promise).resolves.toBe('first')
  })

  it('spaces same-method tasks by the per-method minimum gap', async () => {
    const clock = new ManualClock([0, 0])
    const queue = new RateQueue({ history: 1 }, { clock })
    const startTimes: number[] = []

    const first = queue.enqueue('history', async () => {
      startTimes.push(clock.now())
      return 'first'
    })
    await settle()
    await expect(first).resolves.toBe('first')

    const second = queue.enqueue('history', async () => {
      startTimes.push(clock.now())
      return 'second'
    })
    await settle()
    expect(startTimes).toEqual([0])

    clock.advance(1000)
    await settle()
    await expect(second).resolves.toBe('second')
    expect(startTimes).toEqual([0, 1000])
  })

  it('applies the jitter ratio to the spacing', async () => {
    const clock = new ManualClock([0.5, 0.5])
    const queue = new RateQueue({ history: 1 }, { clock })
    const startTimes: number[] = []

    const first = queue.enqueue('history', async () => {
      startTimes.push(clock.now())
      return 1
    })
    await settle()
    await expect(first).resolves.toBe(1)

    const second = queue.enqueue('history', async () => {
      startTimes.push(clock.now())
      return 2
    })
    await settle()
    expect(startTimes).toEqual([0])

    clock.advance(1075)
    await settle()
    await expect(second).resolves.toBe(2)
    expect(startTimes).toEqual([0, 1075])
  })

  it('does not couple different methods', async () => {
    const clock = new ManualClock()
    const queue = new RateQueue({ slow: 1, fast: 50 }, { clock })
    const startTimes: number[] = []

    const slow = queue.enqueue('slow', async () => {
      startTimes.push(clock.now())
      return 'slow'
    })
    const fast = queue.enqueue('fast', async () => {
      startTimes.push(clock.now())
      return 'fast'
    })
    await settle()

    expect(startTimes).toEqual([0, 0])
    await expect(slow).resolves.toBe('slow')
    await expect(fast).resolves.toBe('fast')
  })

  it('coalesces identical in-flight requests and runs the task once', async () => {
    const clock = new ManualClock()
    const queue = new RateQueue({ history: 1 }, { clock })
    let taskCalls = 0

    const first = queue.enqueue(
      'history',
      async () => {
        taskCalls += 1
        return { items: [1, 2] }
      },
      'chat-1',
    )
    const second = queue.enqueue(
      'history',
      async () => {
        taskCalls += 1
        return { items: [] }
      },
      'chat-1',
    )
    await settle()

    expect(taskCalls).toBe(1)
    expect(second).toBe(first)
    await expect(first).resolves.toEqual({ items: [1, 2] })
    await expect(second).resolves.toEqual({ items: [1, 2] })
  })

  it('re-runs the task when a coalescing identity is reused after settling', async () => {
    const clock = new ManualClock([0, 0])
    const queue = new RateQueue({ history: 1 }, { clock })
    let taskCalls = 0

    const first = queue.enqueue(
      'history',
      async () => {
        taskCalls += 1
        return 1
      },
      'chat-1',
    )
    await settle()
    await expect(first).resolves.toBe(1)

    const second = queue.enqueue(
      'history',
      async () => {
        taskCalls += 1
        return 2
      },
      'chat-1',
    )
    await settle()
    expect(taskCalls).toBe(1)

    clock.advance(1000)
    await settle()
    expect(taskCalls).toBe(2)
    await expect(second).resolves.toBe(2)
  })

  it('isolates task failures to their own caller and keeps the chain usable', async () => {
    const clock = new ManualClock([0, 0, 0])
    const queue = new RateQueue({ history: 1 }, { clock })

    const failing = queue.enqueue('history', async () => {
      throw new Error('boom')
    })
    await settle()
    await expect(failing).rejects.toThrow('boom')

    const recovering = queue.enqueue('history', async () => 'recovered', 'after-failure')
    await settle()

    clock.advance(1000)
    await settle()
    await expect(recovering).resolves.toBe('recovered')
  })

  it('rejects enqueues for methods without a configured limit', () => {
    const clock = new ManualClock()
    const queue = new RateQueue({ history: 1 }, { clock })

    expect(() => queue.enqueue('unknown', async () => 'x')).toThrow('No rate limit configured')
  })

  it('runs a user-priority task before queued background tasks of the same method', async () => {
    const clock = new ManualClock([0, 0, 0, 0])
    const queue = new RateQueue({ history: 1 }, { clock })
    const startTimes: string[] = []

    const running = queue.enqueue('history', async () => {
      startTimes.push(`running:${clock.now()}`)
      return 'running'
    })
    await settle()
    await expect(running).resolves.toBe('running')

    const backgroundFirst = queue.enqueue(
      'history',
      async () => {
        startTimes.push(`background-first:${clock.now()}`)
        return 'background-first'
      },
      'background-first',
    )
    const backgroundSecond = queue.enqueue(
      'history',
      async () => {
        startTimes.push(`background-second:${clock.now()}`)
        return 'background-second'
      },
      'background-second',
    )
    const user = queue.enqueue(
      'history',
      async () => {
        startTimes.push(`user:${clock.now()}`)
        return 'user'
      },
      'user-submit',
      'user',
    )

    clock.advance(1000)
    await settle()
    await expect(user).resolves.toBe('user')

    clock.advance(1000)
    await settle()
    await expect(backgroundFirst).resolves.toBe('background-first')

    clock.advance(1000)
    await settle()
    await expect(backgroundSecond).resolves.toBe('background-second')
    expect(startTimes).toEqual([
      'running:0',
      'user:1000',
      'background-first:2000',
      'background-second:3000',
    ])
  })

  it('never interrupts a running background task when a user task arrives', async () => {
    const clock = new ManualClock()
    const queue = new RateQueue({ history: 1 }, { clock })
    const startTimes: string[] = []

    const running = queue.enqueue('history', async () => {
      startTimes.push(`running:${clock.now()}`)
      return 'running'
    })
    const background = queue.enqueue('history', async () => {
      startTimes.push(`background:${clock.now()}`)
      return 'background'
    })
    const user = queue.enqueue(
      'history',
      async () => {
        startTimes.push(`user:${clock.now()}`)
        return 'user'
      },
      undefined,
      'user',
    )
    await settle()
    await expect(running).resolves.toBe('running')

    clock.advance(1000)
    await settle()
    await expect(user).resolves.toBe('user')
    clock.advance(1000)
    await settle()
    await expect(background).resolves.toBe('background')
    expect(startTimes).toEqual(['running:0', 'user:1000', 'background:2000'])
  })
})
