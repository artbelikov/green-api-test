import { MantineProvider } from '@mantine/core'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ChatAvatar } from './avatar'
import { ChatRow, type ChatRowModel } from './chat-row'

const NOW = new Date(2026, 10, 12, 15, 0).getTime()

const baseChat: ChatRowModel = {
  id: '79161234567',
  name: 'Demo Contact',
  unread: 0,
  lastMessage: {
    text: 'Hello there',
    direction: 'incoming',
    status: null,
    timestamp: new Date(2026, 10, 12, 14, 13).getTime(),
  },
}

const renderRow = (chat: ChatRowModel, onSelect = () => {}): void => {
  render(
    <MantineProvider>
      <ChatRow
        chat={chat}
        avatar={<ChatAvatar name={chat.name} seed={chat.id} url={null} size={54} />}
        active={false}
        now={NOW}
        youPrefix="You: "
        noMessagesText="No messages yet"
        onSelect={onSelect}
      />
    </MantineProvider>,
  )
}

describe('ChatRow', () => {
  it('renders name, incoming preview, and time', () => {
    renderRow(baseChat)
    expect(screen.getByText('Demo Contact')).toBeInTheDocument()
    expect(screen.getByText('Hello there')).toBeInTheDocument()
    expect(screen.getByText('14:13')).toBeInTheDocument()
  })

  it('marks the row as current when active', () => {
    render(
      <MantineProvider>
        <ChatRow
          chat={baseChat}
          avatar={<ChatAvatar name={baseChat.name} seed={baseChat.id} url={null} size={54} />}
          active
          now={NOW}
          youPrefix="You: "
          noMessagesText="No messages yet"
          onSelect={() => {}}
        />
      </MantineProvider>,
    )
    expect(screen.getByRole('button')).toHaveAttribute('aria-current', 'true')
  })

  it('prefixes outgoing previews with the you-prefix and shows sent ticks', () => {
    const chat: ChatRowModel = {
      ...baseChat,
      lastMessage: { text: 'Привет!', direction: 'outgoing', status: 'sent', timestamp: NOW },
    }
    renderRow(chat)
    expect(screen.getByText('You: Привет!')).toBeInTheDocument()
    expect(screen.getByText('✓')).toBeInTheDocument()
  })

  it('shows read ticks and the unread badge', () => {
    const chat: ChatRowModel = {
      ...baseChat,
      unread: 3,
      lastMessage: { text: 'Check', direction: 'outgoing', status: 'read', timestamp: NOW },
    }
    renderRow(chat)
    expect(screen.getByText('✓✓')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('renders failed ticks for a failed outgoing message', () => {
    const chat: ChatRowModel = {
      ...baseChat,
      lastMessage: { text: 'Oops', direction: 'outgoing', status: 'failed', timestamp: NOW },
    }
    renderRow(chat)
    expect(screen.getByText('✕')).toBeInTheDocument()
  })

  it('shows the no-messages placeholder instead of a raw id when there is no last message', () => {
    const chat: ChatRowModel = { ...baseChat, lastMessage: null }
    renderRow(chat)
    expect(screen.queryByText('79161234567')).not.toBeInTheDocument()
    expect(screen.getByText('No messages yet')).toBeInTheDocument()
  })

  it('selects the chat on click', () => {
    const onSelect = vi.fn()
    renderRow(baseChat, onSelect)
    fireEvent.click(screen.getByRole('button'))
    expect(onSelect).toHaveBeenCalledWith('79161234567')
  })
})
