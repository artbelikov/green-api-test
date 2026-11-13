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
import { useState } from 'react'
import { ChatAvatarWithUrl, ChatRow } from '@/entities/chat'
import { useChatsStore } from '@/entities/chats'
import { useSessionStore } from '@/entities/session'
import { openChat } from '@/features/open-chat'
import { NewChatModal } from '@/features/pick-chat'
import { i18n } from '@/shared/config'
import { useChatListHydration } from '../use-chat-list'
import classes from './chat-list-pane.module.css'

const SKELETON_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6']

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
  const visible =
    query.length === 0
      ? summaries
      : summaries.filter(
          (summary) =>
            summary.name.toLowerCase().includes(query) ||
            (summary.lastMessage?.text.toLowerCase().includes(query) ?? false),
        )

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
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.4}
            strokeLinecap="round"
            aria-hidden
            className={classes.fabIcon}
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
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
      <div className={classes.rows}>
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
        {!isEmpty
          ? visible.map((summary) => (
              <ChatRow
                key={summary.id}
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
                onSelect={(chatId) => void openChat(chatId)}
              />
            ))
          : null}
      </div>
      <NewChatModal opened={modalOpen} onClose={() => setModalOpen(false)} />
    </aside>
  )
}
