import { ActionIcon, Text, Title, useMantineTheme } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { ChatAvatar } from '@/entities/chat'
import { selectActiveChatSummary, useChatsStore } from '@/entities/chats'
import { i18n } from '@/shared/config'
import { ChatListPane } from '@/widgets/chat-list-pane'
import { NavRail } from '@/widgets/nav-rail'
import classes from './messenger-page.module.css'

const MOBILE_QUERY = '(max-width: 768px)'

export function MessengerPage() {
  const activeChatId = useChatsStore((state) => state.activeChatId)
  const activeChat = useChatsStore((state) => selectActiveChatSummary(state))
  const closeChat = useChatsStore((state) => state.closeChat)
  const isMobile = useMediaQuery(MOBILE_QUERY)
  const { other } = useMantineTheme()

  const showList = !isMobile || activeChatId === null
  const showConversation = !isMobile || activeChatId !== null

  return (
    <div className={classes.shell}>
      <NavRail />
      {showList ? (
        <div className={classes.listPane}>
          <ChatListPane />
        </div>
      ) : null}
      {showConversation ? (
        <section
          className={classes.conversation}
          style={{
            background: `linear-gradient(160deg, ${other.max.wallpaperTop} 0%, ${other.max.wallpaperBottom} 100%)`,
          }}
        >
          {activeChat !== null ? (
            <header className={classes.header}>
              {isMobile ? (
                <ActionIcon
                  variant="subtle"
                  color="dark"
                  aria-label={i18n.messenger.conversation.backAction}
                  onClick={closeChat}
                >
                  ‹
                </ActionIcon>
              ) : null}
              <ChatAvatar name={activeChat.name} seed={activeChat.id} url={null} size={40} />
              <Title order={3} className={classes.chatName}>
                {activeChat.name}
              </Title>
            </header>
          ) : null}
          <div className={classes.placeholder}>
            <Text c="white" ta="center">
              {i18n.messenger.conversation.placeholder}
            </Text>
          </div>
        </section>
      ) : null}
    </div>
  )
}
