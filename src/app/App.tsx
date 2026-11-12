import { useEffect } from 'react'
import { useSessionStore } from '@/entities/session'
import { ConnectPage } from '@/pages/connect'
import { MessengerPage } from '@/pages/messenger'
import { AppProvider } from './providers/app-provider'
import { bindChatStores } from './providers/chat-stores'
import { bindNotificationEngineToSession } from './providers/notification-engine'

function App() {
  const status = useSessionStore((state) => state.status)

  useEffect(() => {
    void useSessionStore.getState().resume()
    return bindNotificationEngineToSession()
  }, [])

  useEffect(() => bindChatStores(), [])

  return (
    <AppProvider>{status === 'disconnected' ? <ConnectPage /> : <MessengerPage />}</AppProvider>
  )
}

export { App }
