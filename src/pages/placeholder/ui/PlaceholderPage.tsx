import { Button, Card, Stack, Text, Title } from '@mantine/core'
import { i18n } from '@/shared/config'
import classes from './PlaceholderPage.module.css'

export function PlaceholderPage() {
  return (
    <main className={classes.screen}>
      <Card className={classes.card} padding="xl" radius={32} shadow="lg">
        <Stack gap="md">
          <Title order={1} ta="center">
            {i18n.placeholder.title}
          </Title>
          <Text c="dimmed" ta="center">
            {i18n.placeholder.subtitle}
          </Text>
          <Button radius="xl" size="md" disabled>
            {i18n.placeholder.connectAction}
          </Button>
        </Stack>
      </Card>
    </main>
  )
}
