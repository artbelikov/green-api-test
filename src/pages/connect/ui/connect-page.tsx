import { Anchor, Card, Stack, Text, Title, useMantineTheme } from '@mantine/core'
import { ConnectForm } from '@/features/connect-session'
import { i18n } from '@/shared/config'
import classes from './connect-page.module.css'

export function ConnectPage() {
  const { other } = useMantineTheme()
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
            {i18n.connect.heading}
          </Title>
          <Text c="dimmed" ta="center">
            {i18n.connect.subtitle}
          </Text>
          <ConnectForm />
          <Anchor
            href={i18n.connect.credentialsHintUrl}
            target="_blank"
            rel="noreferrer"
            size="sm"
            ta="center"
          >
            {i18n.connect.credentialsHint}
          </Anchor>
        </Stack>
      </Card>
    </main>
  )
}
