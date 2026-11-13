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

const typeTarget = (value: string): void => {
  fireEvent.change(screen.getByLabelText(i18n.newChat.targetLabel), {
    target: { value },
  })
}

describe('NewChatModal', () => {
  it('renders the single target field and actions', () => {
    renderModal()
    expect(screen.getByLabelText(i18n.newChat.targetLabel)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: i18n.newChat.createAction })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: i18n.newChat.cancelAction })).toBeInTheDocument()
  })

  it('creates a chat from a phone draft and closes the modal', async () => {
    useSessionStore.setState({ credentials: CREDENTIALS, status: 'connected' })
    const onClose = vi.fn()
    renderModal(onClose)
    typeTarget('8 999 123-45-67')
    submitForm()

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(useChatsStore.getState().summaries[0]?.name).toBe('Demo Contact')
    })
  })

  it('resolves a nickname draft to the underlying chat', async () => {
    useSessionStore.setState({ credentials: CREDENTIALS, status: 'connected' })
    const onClose = vi.fn()
    renderModal(onClose)
    typeTarget('@demo_contact')
    submitForm()

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(useChatsStore.getState().summaries[0]?.id).toBe('79991234567')
    })
  })

  it('shows a validation error for an empty draft', async () => {
    const onClose = vi.fn()
    renderModal(onClose)
    submitForm()
    expect(await screen.findByText(i18n.phone.errors.empty)).toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('shows an inline error for an unsupported phone region', async () => {
    useSessionStore.setState({ credentials: CREDENTIALS, status: 'connected' })
    renderModal()
    typeTarget('375291234567')
    submitForm()

    expect(await screen.findByText(i18n.phone.errors.unsupportedRegion)).toBeInTheDocument()
    expect(useChatsStore.getState().summaries).toHaveLength(0)
  })

  it('shows the resolve failure when a nickname does not exist', async () => {
    useSessionStore.setState({ credentials: CREDENTIALS, status: 'connected' })
    renderModal()
    typeTarget('@nobody_here')
    submitForm()

    expect(await screen.findByText(i18n.newChat.errors.resolveFailed)).toBeInTheDocument()
    expect(useChatsStore.getState().summaries).toHaveLength(0)
  })

  it('rejects a bare-word draft that the gateway echoes instead of creating a phantom chat', async () => {
    useSessionStore.setState({ credentials: CREDENTIALS, status: 'connected' })
    renderModal()
    typeTarget('durov')
    submitForm()

    expect(await screen.findByText(i18n.newChat.errors.resolveFailed)).toBeInTheDocument()
    expect(useChatsStore.getState().summaries).toHaveLength(0)
  })

  it('creates a chat from a bare-digit draft that fails phone normalization', async () => {
    useSessionStore.setState({ credentials: CREDENTIALS, status: 'connected' })
    const onClose = vi.fn()
    renderModal(onClose)
    typeTarget('777000111')
    submitForm()

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(useChatsStore.getState().summaries[0]?.id).toBe('777000111')
    })
  })
})
