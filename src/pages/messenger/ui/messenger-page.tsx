import { Alert, Text, useMantineTheme } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { selectActiveChatSummary, useChatsStore } from '@/entities/chats'
import { useSessionStore } from '@/entities/session'
import { i18n } from '@/shared/config'
import { Wallpaper } from '@/shared/ui'
import { ChatListPane } from '@/widgets/chat-list-pane'
import { ConversationPane } from '@/widgets/conversation-pane'
import { NavRail } from '@/widgets/nav-rail'
import classes from './messenger-page.module.css'

const MOBILE_QUERY = '(max-width: 768px)'

export function MessengerPage() {
  const activeChatId = useChatsStore((state) => state.activeChatId)
  const activeChat = useChatsStore((state) => selectActiveChatSummary(state))
  const closeChat = useChatsStore((state) => state.closeChat)
  const isMobile = useMediaQuery(MOBILE_QUERY)
  const reconnecting = useSessionStore((state) => state.reconnecting)
  const { max } = useMantineTheme().other

  const showList = !isMobile || activeChatId === null
  const showConversation = !isMobile || activeChatId !== null

  return (
    <div className={classes.page}>
      {reconnecting ? (
        <Alert
          className={classes.reconnect}
          variant="light"
          color="yellow"
          radius="xl"
          role="status"
        >
          {i18n.messenger.list.reconnectBanner}
        </Alert>
      ) : null}
      <div className={classes.shell}>
        {!isMobile ? <NavRail /> : null}
        {showList ? (
          <div className={classes.listPane}>
            <ChatListPane />
          </div>
        ) : null}
        {showConversation ? (
          <section className={classes.conversation}>
            {activeChat !== null ? (
              <ConversationPane
                key={activeChat.id}
                chat={activeChat}
                isMobile={isMobile}
                onBack={closeChat}
              />
            ) : (
              <Wallpaper
                topColor={max.wallpaperTop}
                bottomColor={max.wallpaperBottom}
                doodleColor={max.wallpaperDoodle}
                doodleOpacity={max.wallpaperDoodleOpacity}
              >
                <div className={classes.placeholder}>
                  <Text c="white" ta="center">
                    {i18n.messenger.conversation.placeholder}
                  </Text>
                </div>
              </Wallpaper>
            )}
          </section>
        ) : null}
      </div>
    </div>
  )
}
