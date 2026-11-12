import { ActionIcon, Button, Skeleton, Stack, Text, Title, useMantineTheme } from '@mantine/core'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { UIEvent } from 'react'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { ChatAvatarWithUrl } from '@/entities/chat'
import { DateDivider, MessageBubble } from '@/entities/message'
import { selectChatMessages, useMessagesStore } from '@/entities/messages'
import { useSessionStore } from '@/entities/session'
import { openChat } from '@/features/open-chat'
import { i18n } from '@/shared/config'
import { Wallpaper } from '@/shared/ui'
import { buildConversationRows } from '../lib/conversation-rows'
import { isPinnedToBottom } from '../lib/scroll-pinning'
import classes from './conversation-pane.module.css'

const SKELETON_KEYS = ['s1', 's2', 's3', 's4', 's5']

const DIVIDER_ROW_HEIGHT = 44
const BUBBLE_ROW_BASE = 48
const MESSAGE_LINE_HEIGHT = 20
const ESTIMATED_CHARS_PER_LINE = 48

export interface ConversationChat {
  readonly id: string
  readonly name: string
  readonly username: string | null
}

export interface ConversationPaneProps {
  readonly chat: ConversationChat
  readonly isMobile: boolean
  readonly onBack: () => void
}

const estimateRowHeight = (textLength: number, hardLines: number): number =>
  BUBBLE_ROW_BASE +
  Math.max(hardLines, Math.ceil(textLength / ESTIMATED_CHARS_PER_LINE)) * MESSAGE_LINE_HEIGHT

export function ConversationPane({ chat, isMobile, onBack }: ConversationPaneProps) {
  const { max } = useMantineTheme().other
  const credentials = useSessionStore((state) => state.credentials)
  const messages = useMessagesStore((state) => selectChatMessages(state, chat.id))
  const historyPhase = useMessagesStore((state) => state.history[chat.id] ?? 'ready')

  const rows = useMemo(
    () => buildConversationRows(messages, Date.now(), i18n.messenger.conversation.date),
    [messages],
  )

  const scrollRef = useRef<HTMLElement | null>(null)
  const [pinned, setPinned] = useState(true)
  const pinnedRef = useRef(true)

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: (index) => {
      const row = rows[index]
      if (row === undefined) {
        return BUBBLE_ROW_BASE
      }
      if (row.kind === 'divider') {
        return DIVIDER_ROW_HEIGHT
      }
      return estimateRowHeight(row.message.text.length, row.message.text.split('\n').length)
    },
    getItemKey: (index) => rows[index]?.key ?? `#${index}`,
    overscan: 6,
  })

  useLayoutEffect(() => {
    if (!pinnedRef.current || rows.length === 0) {
      return
    }
    virtualizer.scrollToOffset(virtualizer.getTotalSize(), { align: 'end' })
    const frame = requestAnimationFrame(() => {
      if (pinnedRef.current) {
        virtualizer.scrollToOffset(virtualizer.getTotalSize(), { align: 'end' })
      }
    })
    return () => cancelAnimationFrame(frame)
  }, [rows, virtualizer])

  const handleScroll = (event: UIEvent<HTMLDivElement>): void => {
    const element = event.currentTarget
    const stillPinned = isPinnedToBottom(
      element.scrollTop,
      element.clientHeight,
      element.scrollHeight,
    )
    pinnedRef.current = stillPinned
    setPinned(stillPinned)
  }

  const subtitle = chat.username === null ? null : `@${chat.username}`
  const isEmpty = rows.length === 0
  const showJump = !pinned && !isEmpty

  return (
    <Wallpaper
      topColor={max.wallpaperTop}
      bottomColor={max.wallpaperBottom}
      doodleColor={max.wallpaperDoodle}
      doodleOpacity={max.wallpaperDoodleOpacity}
    >
      <header className={classes.header}>
        {isMobile ? (
          <ActionIcon
            variant="subtle"
            color="dark"
            aria-label={i18n.messenger.conversation.backAction}
            onClick={onBack}
          >
            ‹
          </ActionIcon>
        ) : null}
        <ChatAvatarWithUrl chatId={chat.id} name={chat.name} size={40} credentials={credentials} />
        <div className={classes.titleBlock}>
          <Title order={3} className={classes.chatName}>
            {chat.name}
          </Title>
          {subtitle !== null ? <Text className={classes.subtitle}>{subtitle}</Text> : null}
        </div>
      </header>
      <section
        ref={scrollRef}
        className={classes.scroll}
        aria-label={i18n.messenger.conversation.messagesRegion}
        tabIndex={0}
        data-empty={isEmpty || undefined}
        onScroll={handleScroll}
      >
        {isEmpty ? (
          <div className={classes.substate}>
            {historyPhase === 'loading' ? (
              <Stack gap="sm" aria-hidden="true">
                {SKELETON_KEYS.map((key, index) => (
                  <Skeleton key={key} height={index % 2 === 0 ? 96 : 64} radius="md" />
                ))}
              </Stack>
            ) : null}
            {historyPhase === 'failed' ? (
              <Stack align="center" gap="sm">
                <Text c="dark" size="sm" ta="center">
                  {i18n.messenger.conversation.historyFailed}
                </Text>
                <Button
                  size="compact-sm"
                  radius="xl"
                  variant="white"
                  onClick={() => void openChat(chat.id)}
                >
                  {i18n.messenger.conversation.retryHistory}
                </Button>
              </Stack>
            ) : null}
            {historyPhase === 'ready' ? (
              <Text c="dark" opacity={0.55} size="sm" ta="center">
                {i18n.messenger.conversation.emptyHistory}
              </Text>
            ) : null}
          </div>
        ) : (
          <div
            className={classes.rows}
            style={{ height: virtualizer.getTotalSize(), position: 'relative' }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index]
              if (row === undefined) {
                return null
              }
              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  className={classes.rowCell}
                  style={{ transform: `translateY(${virtualRow.start}px)` }}
                >
                  {row.kind === 'divider' ? (
                    <DateDivider label={row.label} />
                  ) : (
                    <MessageBubble message={row.message} />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>
      <ActionIcon
        className={classes.jump}
        variant="white"
        radius="xl"
        size="lg"
        aria-label={i18n.messenger.conversation.jumpToLatest}
        aria-hidden={!showJump || undefined}
        tabIndex={showJump ? 0 : -1}
        data-visible={showJump || undefined}
        onClick={() => {
          pinnedRef.current = true
          setPinned(true)
          virtualizer.scrollToOffset(virtualizer.getTotalSize(), {
            align: 'end',
            behavior: 'smooth',
          })
        }}
      >
        ↓
      </ActionIcon>
    </Wallpaper>
  )
}
