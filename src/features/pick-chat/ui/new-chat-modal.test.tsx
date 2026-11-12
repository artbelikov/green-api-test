import { MantineProvider } from '@mantine/core'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { useChatsStore } from '@/entities/chats'
import { useMessagesStore } from '@/entities/messages'
import { useSessionStore } from '@/entities/session'
import type { GreenApiCredentials } from '@/shared/api/greenapi'
import { i18n } from '@/shared/config'
import { handlers, mockGateway } from '@/shared/mocks'
import { NewChatModal } from './new-chat-modal'

const CREDENTIALS: GreenApiCredentials = {
  apiUrl: 'https://gateway.test',
  idInstance: '110100200',
  apiTokenInstance: 'token-1',
}

const server = setupServer(...handlers)

beforeAll(() => {
  server.listen({ onUnhandledFrame: 'error' })
})

afterEach(() => {
  server.resetHandlers()
  mockGateway.reset()
  window.localStorage.clear()
  useSessionStore.getState().disconnect()
  useChatsStore.getState().clear()
  useMessagesStore.getState().clear()
})

afterAll(() => {
  server.close()
})

const renderModal = (onClose: () => void = () => {}): void => {
  render(
    <MantineProvider>
      <NewChatModal opened onClose={onClose} />
    </MantineProvider>,
  )
}

const submitForm = (): void => {
  const form = document.body.querySelector('form')
  if (form === null) {
    throw new Error('New chat form is missing')
  }
  fireEvent.submit(form)
}

describe('NewChatModal', () => {
  it('renders phone and chatId fields', () => {
    renderModal()
    expect(screen.getByLabelText(i18n.newChat.phoneLabel)).toBeInTheDocument()
    expect(screen.getByLabelText(i18n.newChat.chatIdLabel)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: i18n.newChat.createAction })).toBeInTheDocument()
  })

  it('auto-normalizes the phone draft while typing', () => {
    renderModal()
    const phone = screen.getByLabelText(i18n.newChat.phoneLabel)
    fireEvent.change(phone, { target: { value: '8 999 123-45-67' } })
    expect(phone).toHaveValue('79991234567')
    submitForm()
    expect(screen.queryByText(i18n.newChat.errors.emptyChatId)).not.toBeInTheDocument()
  })

  it('shows a validation error for an empty draft', async () => {
    const onClose = vi.fn()
    renderModal(onClose)
    submitForm()
    expect(await screen.findByText(i18n.phone.errors.empty)).toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('creates a chat from the demo phone and closes the modal', async () => {
    useSessionStore.setState({ credentials: CREDENTIALS, status: 'connected' })
    const onClose = vi.fn()
    renderModal(onClose)
    fireEvent.change(screen.getByLabelText(i18n.newChat.phoneLabel), {
      target: { value: '79991234567' },
    })
    submitForm()

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(useChatsStore.getState().summaries[0]?.name).toBe('Demo Contact')
    })
  })

  it('shows an inline error for an unsupported phone region', async () => {
    useSessionStore.setState({ credentials: CREDENTIALS, status: 'connected' })
    renderModal()
    fireEvent.change(screen.getByLabelText(i18n.newChat.phoneLabel), {
      target: { value: '375291234567' },
    })
    submitForm()

    expect(await screen.findByText(i18n.phone.errors.unsupportedRegion)).toBeInTheDocument()
    expect(useChatsStore.getState().summaries).toHaveLength(0)
  })
})
