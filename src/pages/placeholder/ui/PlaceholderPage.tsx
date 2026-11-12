import { Alert, Button, Card, Stack, Text, Title, useMantineTheme } from '@mantine/core'
import { useSessionStore } from '@/entities/session'
import { i18n } from '@/shared/config'
import classes from './PlaceholderPage.module.css'

export function PlaceholderPage() {
  const { other } = useMantineTheme()
  const settling = useSessionStore((state) => state.bootstrapPhase === 'settling')
  return (
    <main
      className={classes.screen}
      style={{
        background: `linear-gradient(160deg, ${other.max.wallpaperTop} 0%, ${other.max.wallpaperBottom} 100%)`,
      }}
    >
      <Card className={classes.card} padding="xl" radius={32} shadow="lg">
        <Stack gap="md">
          <Title order={1} ta="center">
            {i18n.placeholder.title}
          </Title>
          <Text c="dimmed" ta="center">
            {i18n.placeholder.subtitle}
          </Text>
          {settling ? (
            <Alert variant="light" color="brand">
              {i18n.session.settlingNotice}
            </Alert>
          ) : null}
          <Button
            variant="light"
            color="red"
            radius="xl"
            size="md"
            onClick={() => useSessionStore.getState().disconnect()}
          >
            {i18n.session.disconnectAction}
          </Button>
        </Stack>
      </Card>
    </main>
  )
}
