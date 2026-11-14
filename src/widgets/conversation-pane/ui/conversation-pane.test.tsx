import { MantineProvider, ScrollArea } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { act } from 'react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import bubbleClasses from '@/entities/message/ui/message-bubble.module.css'
import { type MessagesState, useMessagesStore } from '@/entities/messages'
import { useSessionStore } from '@/entities/session'
import type { GreenApiCredentials, Message } from '@/shared/api/greenapi'
import { i18n, maxTheme } from '@/shared/config'
import { handlers, mockGateway } from '@/shared/mocks'
import { ConversationPane } from './conversation-pane'
import classes from './conversation-pane.module.css'

const mocks = vi.hoisted(() => ({ scrollToOffset: vi.fn() }))

const SCROLL_CLASS = classes.scroll as string
const JUMP_CLASS = classes.jump as string
const BUBBLE_CLASS = bubbleClasses.bubble as string

vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: (options: { count: number; getItemKey?: (index: number) => string }) => {
    const items = Array.from({ length: options.count }, (_, index) => ({
      index,
      key: options.getItemKey?.(index) ?? String(index),
      start: index * 72,
      size: 72,
    }))
    return {
      getVirtualItems: () => items,
      getTotalSize: () => options.count * 72,
      measureElement: () => {},
      scrollToOffset: mocks.scrollToOffset,
      scrollToIndex: () => {},
    }
  },
}))

const CREDENTIALS: GreenApiCredentials = {
  apiUrl: 'https://gateway.test',
  idInstance: '110100200',
  apiTokenInstance: 'token-1',
}

const CHAT = { id: 'chat-1', name: 'Demo Contact', username: 'demo_contact' }

const server = setupServer(...handlers)

beforeAll(() => {
  server.listen({ onUnhandledFrame: 'error' })
})

afterEach(() => {
  server.resetHandlers()
  mockGateway.reset()
  window.localStorage.clear()
  useSessionStore.getState().disconnect()
  useMessagesStore.getState().clear()
})

afterAll(() => {
  server.close()
})

const message = (
  id: string,
  date: Date,
  overrides: Partial<Omit<Message, 'id' | 'timestamp' | 'chatId'>> = {},
): Message => ({
  id,
  chatId: CHAT.id,
  direction: 'incoming',
  text: 'Hello',
  timestamp: date.getTime(),
  status: null,
  ...overrides,
})

const seedMessages = (messages: readonly Message[]): void => {
  useMessagesStore.setState({
    byChat: { [CHAT.id]: messages },
    history: { [CHAT.id]: 'ready' },
  } as Partial<MessagesState>)
}

const renderPane = (): void => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  render(
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={maxTheme}>
        <ConversationPane chat={CHAT} isMobile={false} onBack={() => {}} />
      </MantineProvider>
    </QueryClientProvider>,
  )
}

const scrollElement = (): HTMLElement => {
  const root = document.querySelector(`.${SCROLL_CLASS}`)
  if (!(root instanceof HTMLElement)) {
    throw new Error('scroll root not found')
  }
  const viewport = root.querySelector(`.${ScrollArea.classes.viewport}`)
  if (!(viewport instanceof HTMLElement)) {
    throw new Error('scroll viewport not found')
  }
  return viewport
}

const jumpPill = (): HTMLElement => {
  const node = document.querySelector(`.${JUMP_CLASS}`)
  if (!(node instanceof HTMLElement)) {
    throw new Error('jump pill not found')
  }
  return node
}

const applyScrollShim = (scrollTop: number): void => {
  const element = scrollElement()
  Object.defineProperty(element, 'clientHeight', { configurable: true, value: 400 })
  Object.defineProperty(element, 'scrollHeight', { configurable: true, value: 2000 })
  element.scrollTop = scrollTop
  fireEvent.scroll(element)
}

const FIND_OPTIONS = { timeout: 3000 }

const NOW = new Date(2026, 10, 13, 18, 0).getTime()

describe('ConversationPane', () => {
  it('renders the header with the subtitle, the messages region, and the empty state', () => {
    useSessionStore.setState({ credentials: CREDENTIALS, status: 'connected' })

    renderPane()

    expect(screen.getByRole('heading', { level: 3, name: 'Demo Contact' })).toBeInTheDocument()
    expect(screen.getByText('@demo_contact')).toBeInTheDocument()
    const region = screen.getByRole('region', { name: i18n.messenger.conversation.messagesRegion })
    expect(region.querySelector(`.${ScrollArea.classes.viewport}`)).toHaveAttribute('tabindex', '0')
    expect(screen.getByText(i18n.messenger.conversation.emptyHistory)).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: i18n.messenger.conversation.backAction }),
    ).toBeNull()
  })

  it('renders day-grouped bubbles with times', () => {
    vi.useFakeTimers()
    try {
      vi.setSystemTime(new Date(2026, 10, 13, 18, 0))
      seedMessages([
        message('m1', new Date(2026, 10, 12, 9, 0)),
        message('m2', new Date(2026, 10, 12, 9, 5), { direction: 'outgoing', status: 'sent' }),
        message('m3', new Date(2026, 10, 13, 10, 0), { text: 'Second day' }),
      ])

      renderPane()

      const yesterday = screen.getAllByText(i18n.messenger.conversation.date.yesterday)
      expect(yesterday.length).toBeGreaterThan(0)
      expect(screen.getByText(i18n.messenger.conversation.date.today)).toBeInTheDocument()
      expect(screen.getByText('Second day')).toBeInTheDocument()
      expect(screen.getByText('09:00')).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it('re-labels day dividers when midnight passes without new messages', () => {
    vi.useFakeTimers()
    try {
      vi.setSystemTime(new Date(2026, 10, 13, 23, 30))
      seedMessages([message('m1', new Date(2026, 10, 13, 10, 0))])

      renderPane()
      expect(screen.getByText(i18n.messenger.conversation.date.today)).toBeInTheDocument()

      act(() => {
        vi.advanceTimersByTime(65 * 60_000)
      })

      expect(screen.queryByText(i18n.messenger.conversation.date.today)).not.toBeInTheDocument()
      expect(screen.getByText(i18n.messenger.conversation.date.yesterday)).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it('shows the jump-to-latest pill only when scrolled away from the bottom', () => {
    seedMessages([message('m1', new Date(2026, 10, 13, 9, 0))])

    renderPane()

    const jump = jumpPill()
    expect(jump.getAttribute('data-visible')).toBeNull()
    expect(jump.getAttribute('aria-hidden')).toBe('true')
    expect(jump.getAttribute('tabindex')).toBe('-1')
    expect(jump.getAttribute('aria-label')).toBe(i18n.messenger.conversation.jumpToLatest)

    applyScrollShim(0)
    expect(jump.getAttribute('data-visible')).not.toBeNull()
    expect(jump.getAttribute('aria-hidden')).toBeNull()
    expect(jump.getAttribute('tabindex')).toBe('0')

    applyScrollShim(1600)
    expect(jump.getAttribute('data-visible')).toBeNull()
  })

  it('scrolls smoothly to the latest message from the jump pill', () => {
    seedMessages([message('m1', new Date(2026, 10, 13, 9, 0))])

    renderPane()
    applyScrollShim(0)

    fireEvent.click(jumpPill())

    expect(mocks.scrollToOffset).toHaveBeenCalledWith(144, {
      align: 'end',
      behavior: 'smooth',
    })
    expect(jumpPill().getAttribute('data-visible')).toBeNull()
  })

  it('autoscrolls when pinned and skips autoscroll when scrolled up', () => {
    seedMessages([message('m1', new Date(2026, 10, 13, 9, 0))])

    renderPane()

    expect(mocks.scrollToOffset).toHaveBeenCalledWith(144, { align: 'end' })
    const callsAfterMount = mocks.scrollToOffset.mock.calls.length

    applyScrollShim(0)
    act(() => {
      seedMessages([
        message('m1', new Date(2026, 10, 13, 9, 0)),
        message('m2', new Date(2026, 10, 13, 9, 1)),
      ])
    })

    expect(mocks.scrollToOffset.mock.calls.length).toBeGreaterThanOrEqual(callsAfterMount)
    expect(mocks.scrollToOffset).not.toHaveBeenCalledWith(216, { align: 'end' })

    applyScrollShim(1600)
    const callsBeforeAppend = mocks.scrollToOffset.mock.calls.length
    act(() => {
      seedMessages([
        message('m1', new Date(2026, 10, 13, 9, 0)),
        message('m2', new Date(2026, 10, 13, 9, 1)),
        message('m3', new Date(2026, 10, 13, 9, 2)),
      ])
    })

    expect(mocks.scrollToOffset.mock.calls.length).toBeGreaterThan(callsBeforeAppend)
    expect(mocks.scrollToOffset).toHaveBeenCalledWith(288, { align: 'end' })
  })

  it('keeps a history-loading affordance visible below a partially hydrated list', () => {
    seedMessages([message('m1', new Date(2026, 10, 13, 9, 0))])
    useMessagesStore.setState({ history: { [CHAT.id]: 'loading' } } as Partial<MessagesState>)

    renderPane()

    expect(document.querySelector(`.${classes.historyLoading}`)).not.toBeNull()

    act(() => {
      useMessagesStore.setState({ history: { [CHAT.id]: 'ready' } } as Partial<MessagesState>)
    })

    expect(document.querySelector(`.${classes.historyLoading}`)).toBeNull()
  })

  it('shows the back chevron on mobile and reports back navigation', () => {
    useSessionStore.setState({ credentials: CREDENTIALS, status: 'connected' })
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const onBack = vi.fn()
    render(
      <QueryClientProvider client={queryClient}>
        <MantineProvider theme={maxTheme}>
          <ConversationPane chat={CHAT} isMobile onBack={onBack} />
        </MantineProvider>
      </QueryClientProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: i18n.messenger.conversation.backAction }))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('offers a retry action when history loading failed', async () => {
    useSessionStore.setState({ credentials: CREDENTIALS, status: 'connected' })
    mockGateway.messages.push({
      idMessage: 'h1',
      chatId: CHAT.id,
      direction: 'incoming',
      text: 'History line',
      timestamp: NOW - 60_000,
    })
    useMessagesStore.setState({
      byChat: {},
      history: { [CHAT.id]: 'failed' },
    })

    renderPane()

    const retry = screen.getByRole('button', { name: i18n.messenger.conversation.retryHistory })
    fireEvent.click(retry)

    expect(await screen.findByText('History line', {}, FIND_OPTIONS)).toBeInTheDocument()
    expect(useMessagesStore.getState().history[CHAT.id]).toBe('ready')
  })

  it('mounts the composer under the messages region', () => {
    useSessionStore.setState({ credentials: CREDENTIALS, status: 'connected' })

    renderPane()

    expect(
      screen.getByRole('textbox', { name: i18n.messenger.composer.inputLabel }),
    ).toHaveAttribute('placeholder', i18n.messenger.composer.placeholder)
  })

  it('sends text from the composer and renders the reconciled bubble', async () => {
    useSessionStore.setState({ credentials: CREDENTIALS, status: 'connected' })
    mockGateway.autoReplyEnabled = false

    renderPane()

    const input = screen.getByRole('textbox', { name: i18n.messenger.composer.inputLabel })
    fireEvent.change(input, { target: { value: 'first outgoing line' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(() => {
      expect(useMessagesStore.getState().byChat[CHAT.id]?.[0]).toMatchObject({
        text: 'first outgoing line',
        status: 'sent',
      })
    })
    expect(screen.getByText('first outgoing line')).toBeInTheDocument()
  })

  it('retries a failed send from the bubble affordance', async () => {
    useSessionStore.setState({ credentials: CREDENTIALS, status: 'connected' })
    mockGateway.autoReplyEnabled = false
    server.use(
      http.post(
        `${CREDENTIALS.apiUrl}/waInstance${CREDENTIALS.idInstance}/sendMessage/${CREDENTIALS.apiTokenInstance}`,
        () => new HttpResponse('boom', { status: 500 }),
      ),
    )

    renderPane()

    const input = screen.getByRole('textbox', { name: i18n.messenger.composer.inputLabel })
    fireEvent.change(input, { target: { value: 'doomed line' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(() => {
      expect(document.querySelector(`.${BUBBLE_CLASS}[data-failed='true']`)).not.toBeNull()
    })

    server.resetHandlers()
    fireEvent.click(screen.getByRole('button', { name: i18n.messenger.conversation.retryFailed }))

    await waitFor(() => {
      expect(useMessagesStore.getState().byChat[CHAT.id]?.[0]).toMatchObject({ status: 'sent' })
      expect(useMessagesStore.getState().byChat[CHAT.id]).toHaveLength(1)
    })
    expect(document.querySelector(`.${BUBBLE_CLASS}[data-failed='true']`)).toBeNull()
  })
})
