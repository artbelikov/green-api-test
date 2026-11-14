import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useMemo, useRef, useState } from 'react'
import { ChatAvatarWithUrl, ChatRow } from '@/entities/chat'
import { useChatsStore } from '@/entities/chats'
import { useSessionStore } from '@/entities/session'
import { openChat } from '@/features/open-chat'
import { NewChatModal } from '@/features/pick-chat'
import { i18n } from '@/shared/config'
import { useChatListHydration } from '../use-chat-list'
import classes from './chat-list-pane.module.css'

const SKELETON_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6']
const CHAT_ROW_ESTIMATED_HEIGHT = 80
const ROW_OVERSCAN = 6

const STATUS_COLORS = {
  connected: 'green',
  connecting: 'yellow',
  reconnecting: 'yellow',
  disconnected: 'gray',
} as const

export function ChatListPane() {
  const summaries = useChatsStore((state) => state.summaries)
  const activeChatId = useChatsStore((state) => state.activeChatId)
  const credentials = useSessionStore((state) => state.credentials)
  const status = useSessionStore((state) => state.status)
  const reconnecting = useSessionStore((state) => state.reconnecting)
  const settling = useSessionStore((state) => state.bootstrapPhase === 'settling')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const { loading } = useChatListHydration()
  const now = Date.now()

  const query = search.trim().toLowerCase()
  const visible = useMemo(
    () =>
      query.length === 0
        ? summaries
        : summaries.filter(
            (summary) =>
              summary.name.toLowerCase().includes(query) ||
              (summary.lastMessage?.text.toLowerCase().includes(query) ?? false),
          ),
    [summaries, query],
  )

  const scrollRef = useRef<HTMLDivElement | null>(null)
  const virtualizer = useVirtualizer({
    count: visible.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => CHAT_ROW_ESTIMATED_HEIGHT,
    getItemKey: (index) => visible[index]?.id ?? `#${index}`,
    overscan: ROW_OVERSCAN,
  })

  const isEmpty = summaries.length === 0
  const chipStatus: keyof typeof STATUS_COLORS =
    status === 'connected' && reconnecting ? 'reconnecting' : status

  return (
    <aside className={classes.pane}>
      <div className={classes.header}>
        <Title order={2}>{i18n.messenger.list.heading}</Title>
        <ActionIcon
          className={classes.fab}
          size={44}
          radius="xl"
          color="brand"
          aria-label={i18n.messenger.list.newChatAction}
          onClick={() => setModalOpen(true)}
        >
          <IconPlus className={classes.fabIcon} aria-hidden />
        </ActionIcon>
      </div>
      <div className={classes.statusRow}>
        <Badge variant="light" color={STATUS_COLORS[chipStatus]} size="sm" radius="xl">
          {i18n.messenger.list.status[chipStatus]}
        </Badge>
      </div>
      <TextInput
        className={classes.search}
        placeholder={i18n.messenger.list.searchPlaceholder}
        aria-label={i18n.messenger.list.searchPlaceholder}
        radius="xl"
        value={search}
        onChange={(event) => setSearch(event.currentTarget.value)}
      />
      {settling ? (
        <Alert variant="light" color="brand" className={classes.settling}>
          {i18n.session.settlingNotice}
        </Alert>
      ) : null}
      <div ref={scrollRef} className={classes.rows} data-empty={isEmpty || undefined}>
        {loading && isEmpty ? (
          <Stack gap="sm" className={classes.skeleton}>
            {SKELETON_KEYS.map((key) => (
              <Skeleton key={key} height={64} radius="md" />
            ))}
          </Stack>
        ) : null}
        {!loading && isEmpty ? (
          <div className={classes.empty}>
            <Text fw={600}>{i18n.messenger.list.emptyTitle}</Text>
            <Text c="dimmed" size="sm">
              {i18n.messenger.list.emptyHint}
            </Text>
            <Button radius="xl" variant="light" onClick={() => setModalOpen(true)}>
              {i18n.newChat.createAction}
            </Button>
          </div>
        ) : null}
        {!isEmpty ? (
          <div className={classes.rowsWindow} style={{ height: virtualizer.getTotalSize() }}>
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const summary = visible[virtualRow.index]
              if (summary === undefined) {
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
                  <ChatRow
                    chat={summary}
                    avatar={
                      <ChatAvatarWithUrl
                        chatId={summary.id}
                        name={summary.name}
                        size={54}
                        credentials={credentials}
                      />
                    }
                    active={summary.id === activeChatId}
                    now={now}
                    youPrefix={i18n.messenger.list.youPrefix}
                    noMessagesText={i18n.messenger.list.noMessagesYet}
                    onSelect={(chatId) => void openChat(chatId)}
                  />
                </div>
              )
            })}
          </div>
        ) : null}
      </div>
      <NewChatModal opened={modalOpen} onClose={() => setModalOpen(false)} />
    </aside>
  )
}
