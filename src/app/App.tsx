import { PlaceholderPage } from '@/pages/placeholder'
import { AppProvider } from './providers/app-provider'

function App() {
  return (
    <AppProvider>
      <PlaceholderPage />
    </AppProvider>
  )
}

export { App }
