import { Text, UnstyledButton } from '@mantine/core'
import type { ReactNode } from 'react'
import { formatChatListTime } from '@/shared/lib'
import classes from './chat-row.module.css'

export type ChatRowDirection = 'incoming' | 'outgoing'

export type ChatRowStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | null

export interface ChatRowModel {
  readonly id: string
  readonly name: string
  readonly unread: number
  readonly lastMessage: {
    readonly text: string
    readonly direction: ChatRowDirection
    readonly status: ChatRowStatus
    readonly timestamp: number
  } | null
}

export interface ChatRowProps {
  readonly chat: ChatRowModel
  readonly avatar: ReactNode
  readonly active: boolean
  readonly now: number
  readonly youPrefix: string
  readonly onSelect: (chatId: string) => void
}

const tickGlyphs = (status: ChatRowStatus): string => {
  switch (status) {
    case 'pending':
    case 'sent':
      return '✓'
    case 'delivered':
    case 'read':
      return '✓✓'
    case 'failed':
      return '✕'
    default:
      return ''
  }
}

const isOutgoingTickRead = (status: ChatRowStatus): boolean => status === 'read'

export function ChatRow({ chat, avatar, active, now, youPrefix, onSelect }: ChatRowProps) {
  const preview = chat.lastMessage
  const outgoing = preview?.direction === 'outgoing'
  const glyphs = outgoing ? tickGlyphs(preview?.status ?? null) : ''
  return (
    <UnstyledButton
      className={classes.row}
      data-active={active || undefined}
      data-unread={chat.unread > 0 || undefined}
      aria-current={active ? 'true' : undefined}
      onClick={() => onSelect(chat.id)}
    >
      {avatar}
      <span className={classes.body}>
        <span className={classes.top}>
          <Text component="span" className={classes.name} truncate>
            {chat.name}
          </Text>
          {preview !== null ? (
            <span className={classes.meta}>
              {glyphs.length > 0 ? (
                <span
                  className={classes.tick}
                  data-read={isOutgoingTickRead(preview.status) || undefined}
                  data-failed={preview.status === 'failed' || undefined}
                >
                  {glyphs}
                </span>
              ) : null}
              {formatChatListTime(preview.timestamp, now)}
            </span>
          ) : null}
        </span>
        <span className={classes.bottom}>
          <Text component="span" className={classes.preview} truncate>
            {outgoing ? youPrefix : ''}
            {preview?.text ?? chat.id}
          </Text>
          {chat.unread > 0 ? <span className={classes.badge}>{chat.unread}</span> : null}
        </span>
      </span>
    </UnstyledButton>
  )
}
