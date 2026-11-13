import { MantineProvider } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { useMessagesStore } from '@/entities/messages'
import { useSessionStore } from '@/entities/session'
import type { GreenApiCredentials } from '@/shared/api/greenapi'
import { i18n, maxTheme } from '@/shared/config'
import { handlers, mockGateway } from '@/shared/mocks'
import { MessageComposer } from './message-composer'
import classes from './message-composer.module.css'

vi.mock('@mantine/notifications', () => ({
  notifications: { show: vi.fn() },
}))

const CREDENTIALS: GreenApiCredentials = {
  apiUrl: 'https://gateway.test',
  idInstance: '110100200',
  apiTokenInstance: 'token-1',
}

const COMPOSER_CLASS = classes.composer as string
const MIC_CLASS = classes.mic as string

const server = setupServer(...handlers)

beforeAll(() => {
  server.listen({ onUnhandledFrame: 'error' })
})

beforeEach(() => {
  vi.mocked(notifications.show).mockClear()
  mockGateway.autoReplyEnabled = false
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

const renderComposer = (): HTMLFormElement => {
  render(
    <MantineProvider theme={maxTheme}>
      <MessageComposer chatId="chat-1" />
    </MantineProvider>,
  )
  const form = document.querySelector(`.${COMPOSER_CLASS}`)
  if (!(form instanceof HTMLFormElement)) {
    throw new Error('composer form not found')
  }
  return form
}

const textarea = (): HTMLTextAreaElement => {
  const node = screen.getByRole('textbox', { name: i18n.messenger.composer.inputLabel })
  if (!(node instanceof HTMLTextAreaElement)) {
    throw new Error('composer textarea not found')
  }
  return node
}

const micGlyph = (): Element | null => document.querySelector(`.${MIC_CLASS}`)

const connectSession = (): void => {
  useSessionStore.setState({ credentials: CREDENTIALS, status: 'connected' })
}

describe('MessageComposer', () => {
  it('renders the input with the placeholder and the mic glyph while empty', () => {
    renderComposer()

    expect(textarea()).toHaveAttribute('placeholder', i18n.messenger.composer.placeholder)
    expect(micGlyph()).not.toBeNull()
    expect(screen.queryByRole('button', { name: i18n.messenger.composer.sendAction })).toBeNull()
  })

  it('swaps the mic glyph for the send button when text is entered', () => {
    connectSession()
    renderComposer()

    fireEvent.change(textarea(), { target: { value: 'hello' } })

    expect(micGlyph()).toBeNull()
    expect(screen.getByRole('button', { name: i18n.messenger.composer.sendAction })).toBeEnabled()
  })

  it('sends on Enter, clears the input, and reconciles the pending bubble to sent', async () => {
    connectSession()
    renderComposer()
    fireEvent.change(textarea(), { target: { value: 'hello from composer' } })

    fireEvent.keyDown(textarea(), { key: 'Enter' })

    await waitFor(() => {
      const messages = useMessagesStore.getState().byChat['chat-1'] ?? []
      expect(messages[0]).toMatchObject({ text: 'hello from composer', status: 'sent' })
    })
    expect(textarea()).toHaveValue('')
  })

  it('sends from the form submit path', async () => {
    connectSession()
    const form = renderComposer()
    fireEvent.change(textarea(), { target: { value: 'hello from submit' } })

    fireEvent.submit(form)

    await waitFor(() => {
      const messages = useMessagesStore.getState().byChat['chat-1'] ?? []
      expect(messages[0]).toMatchObject({ text: 'hello from submit', status: 'sent' })
    })
  })

  it('ignores whitespace-only text', () => {
    connectSession()
    const form = renderComposer()
    fireEvent.change(textarea(), { target: { value: '   ' } })

    fireEvent.submit(form)

    expect(useMessagesStore.getState().byChat['chat-1']).toBeUndefined()
  })

  it('does not send on Shift+Enter', () => {
    connectSession()
    renderComposer()
    fireEvent.change(textarea(), { target: { value: 'line one' } })

    fireEvent.keyDown(textarea(), { key: 'Enter', shiftKey: true })

    expect(useMessagesStore.getState().byChat['chat-1']).toBeUndefined()
  })

  it('does not send while the IME composition is active', () => {
    connectSession()
    renderComposer()
    fireEvent.change(textarea(), { target: { value: 'けんぶん' } })

    fireEvent.keyDown(textarea(), { key: 'Enter', isComposing: true })

    expect(useMessagesStore.getState().byChat['chat-1']).toBeUndefined()
  })

  it('never shrinks the input below the measured empty height while typing', () => {
    connectSession()
    const scrollHeight = vi
      .spyOn(HTMLTextAreaElement.prototype, 'scrollHeight', 'get')
      .mockImplementation(function (this: HTMLTextAreaElement) {
        if (this.value.length === 0) {
          return 44
        }
        return this.value.includes('\n') ? 80 : 36
      })
    try {
      renderComposer()
      const node = textarea()

      fireEvent.change(node, { target: { value: 'a' } })
      expect(node.style.height).toBe('44px')

      fireEvent.change(node, { target: { value: 'a\nb' } })
      expect(node.style.height).toBe('80px')

      fireEvent.change(node, { target: { value: '' } })
      expect(node.style.height).toBe('44px')
    } finally {
      scrollHeight.mockRestore()
    }
  })

  it('does not send text longer than the limit', () => {
    connectSession()
    renderComposer()
    fireEvent.change(textarea(), { target: { value: 'a'.repeat(4001) } })

    fireEvent.keyDown(textarea(), { key: 'Enter' })

    expect(useMessagesStore.getState().byChat['chat-1']).toBeUndefined()
  })

  it('disables sending while the session is offline and explains it in the tooltip', () => {
    renderComposer()
    fireEvent.change(textarea(), { target: { value: 'hello while offline' } })

    const send = screen.getByRole('button', { name: i18n.messenger.composer.sendAction })
    expect(send).toBeDisabled()
    expect(send).toHaveAttribute('title', i18n.messenger.composer.offlineTooltip)

    fireEvent.keyDown(textarea(), { key: 'Enter' })

    expect(useMessagesStore.getState().byChat['chat-1']).toBeUndefined()
  })
})
