import { Loader, Stack, Text } from '@mantine/core'
import { lazy, Suspense, useEffect } from 'react'
import { useSessionStore } from '@/entities/session'
import { ConnectPage } from '@/pages/connect'
import { i18n } from '@/shared/config'
import { AppProvider } from './providers/app-provider'
import { bindChatStores } from './providers/chat-stores'
import { bindNotificationEngineToSession } from './providers/notification-engine'

const MessengerPage = lazy(() =>
  import('@/pages/messenger').then((module) => ({ default: module.MessengerPage })),
)

const RestoreScreen = () => (
  <Stack align="center" justify="center" h="100vh">
    <Loader size="sm" />
    <Text c="dimmed" size="sm">
      {i18n.app.restoring}
    </Text>
  </Stack>
)

function App() {
  const sessionResolved = useSessionStore((state) => state.sessionResolved)
  const credentials = useSessionStore((state) =>
    state.status === 'connected' ? state.credentials : null,
  )

  useEffect(() => {
    void useSessionStore.getState().resume()
    return bindNotificationEngineToSession()
  }, [])

  useEffect(() => bindChatStores(), [])

  return (
    <AppProvider>
      {credentials === null ? (
        sessionResolved ? (
          <ConnectPage />
        ) : (
          <RestoreScreen />
        )
      ) : (
        <Suspense fallback={i18n.app.loading}>
          <MessengerPage credentials={credentials} />
        </Suspense>
      )}
    </AppProvider>
  )
}

export { App }
