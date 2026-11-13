import { MantineProvider } from '@mantine/core'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { i18n, maxTheme } from '@/shared/config'
import { DateDivider } from './date-divider'
import dividerClasses from './date-divider.module.css'
import type { MessageBubbleModel } from './message-bubble'
import { MessageBubble } from './message-bubble'
import classes from './message-bubble.module.css'
import { StatusTicks } from './status-ticks'
import tickClasses from './status-ticks.module.css'

const BUBBLE_CLASS = classes.bubble as string
const TICK_CLASS = tickClasses.tick as string
const DIVIDER_CLASS = dividerClasses.divider as string

const baseMessage: MessageBubbleModel = {
  id: 'msg-1',
  direction: 'incoming',
  text: 'Hello there',
  timestamp: new Date(2026, 10, 12, 14, 13).getTime(),
  status: null,
}

const renderBubble = (message: MessageBubbleModel, onRetry?: () => void): void => {
  render(
    <MantineProvider theme={maxTheme}>
      <MessageBubble message={message} {...(onRetry === undefined ? null : { onRetry })} />
    </MantineProvider>,
  )
}

const row = (): HTMLElement => {
  const node = document.querySelector(`.${BUBBLE_CLASS}`)?.parentElement
  if (!(node instanceof HTMLElement)) {
    throw new Error('bubble row not found')
  }
  return node
}

const tick = (status: string): string => {
  const node = document.querySelector(`.${TICK_CLASS}[data-status='${status}']`)
  if (!(node instanceof HTMLElement)) {
    throw new Error(`tick for status ${status} not found`)
  }
  return node.textContent ?? ''
}

describe('MessageBubble', () => {
  it('passes the theme bubble colors as css variables on the row', () => {
    renderBubble(baseMessage)
    const vars = row().style
    expect(row().getAttribute('data-direction')).toBe('incoming')
    expect(vars.getPropertyValue('--max-bubble-in')).toBe('#FFFFFF')
    expect(vars.getPropertyValue('--max-bubble-out')).toBe('#DFF3E9')
    expect(vars.getPropertyValue('--max-bubble-out-opacity')).toBe('0.75')
  })

  it('renders incoming bubble with text and time but without ticks', () => {
    renderBubble(baseMessage)
    expect(screen.getByText('Hello there').parentElement?.classList.contains(BUBBLE_CLASS)).toBe(
      true,
    )
    expect(screen.getByText('14:13')).toBeInTheDocument()
    expect(document.querySelector(`.${TICK_CLASS}`)).not.toBeInTheDocument()
  })

  it('renders outgoing bubble ticks across all delivery variants', () => {
    renderBubble({ ...baseMessage, direction: 'outgoing', status: 'pending' })
    expect(tick('pending')).toBe('✓')
    renderBubble({ ...baseMessage, direction: 'outgoing', status: 'sent' })
    expect(tick('sent')).toBe('✓')
    renderBubble({ ...baseMessage, direction: 'outgoing', status: 'delivered' })
    expect(tick('delivered')).toBe('✓✓')
    renderBubble({ ...baseMessage, direction: 'outgoing', status: 'read' })
    expect(tick('read')).toBe('✓✓')
  })

  it('marks failed outgoing bubble with the failure affordance', () => {
    renderBubble({ ...baseMessage, direction: 'outgoing', status: 'failed' })
    const bubble = screen.getByText('Hello there').parentElement
    expect(bubble).toHaveAttribute('data-failed', 'true')
    expect(bubble).toHaveAttribute('title', i18n.chat.sendFailed)
    expect(tick('failed')).toBe('✕')
  })

  it('leaves non-failed bubbles without a failure tooltip', () => {
    renderBubble({ ...baseMessage, direction: 'outgoing', status: 'sent' })
    expect(screen.getByText('Hello there').parentElement).not.toHaveAttribute('title')
  })

  it('offers a retry action on failed outgoing bubbles and fires it on click', () => {
    const onRetry = vi.fn()
    renderBubble({ ...baseMessage, direction: 'outgoing', status: 'failed' }, onRetry)

    const retry = screen.getByRole('button', { name: i18n.messenger.conversation.retryFailed })
    expect(retry).toHaveAttribute('title', i18n.messenger.conversation.retryFailed)
    fireEvent.click(retry)

    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('keeps the retry action out of non-failed bubbles and handler-less renders', () => {
    renderBubble({ ...baseMessage, direction: 'outgoing', status: 'failed' })
    expect(
      screen.queryByRole('button', { name: i18n.messenger.conversation.retryFailed }),
    ).toBeNull()
    renderBubble({ ...baseMessage, direction: 'outgoing', status: 'sent' }, () => {})
    expect(
      screen.queryByRole('button', { name: i18n.messenger.conversation.retryFailed }),
    ).toBeNull()
  })

  it('renders outgoing history entry without status without ticks', () => {
    renderBubble({ ...baseMessage, direction: 'outgoing', status: null })
    expect(screen.getByText('Hello there')).toBeInTheDocument()
    expect(document.querySelector(`.${TICK_CLASS}`)).not.toBeInTheDocument()
  })

  it('preserves multiline text and carries the timestamp as dateTime', () => {
    const timestamp = new Date(2026, 10, 12, 9, 5).getTime()
    renderBubble({ ...baseMessage, text: 'first\nsecond', timestamp })
    expect(screen.getByText('09:05').getAttribute('dateTime')).toBe(
      new Date(timestamp).toISOString(),
    )
    const text = document.querySelector(`.${BUBBLE_CLASS} > :first-child`)
    expect(text?.textContent).toBe('first\nsecond')
  })
})

describe('StatusTicks', () => {
  it('collapses pending and sent into a single gray tick', () => {
    const { rerender } = render(
      <MantineProvider theme={maxTheme}>
        <StatusTicks status="pending" />
      </MantineProvider>,
    )
    expect(document.querySelector(`.${TICK_CLASS}`)?.textContent).toBe('✓')
    rerender(
      <MantineProvider theme={maxTheme}>
        <StatusTicks status="sent" />
      </MantineProvider>,
    )
    expect(document.querySelector(`.${TICK_CLASS}`)?.textContent).toBe('✓')
  })
})

describe('DateDivider', () => {
  it('renders the label inside a centered pill', () => {
    render(
      <MantineProvider theme={maxTheme}>
        <DateDivider label="Yesterday" />
      </MantineProvider>,
    )
    const pill = screen.getByText('Yesterday')
    expect(pill.parentElement?.classList.contains(DIVIDER_CLASS)).toBe(true)
  })
})
