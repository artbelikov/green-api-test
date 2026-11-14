import { Button, Divider, Group, Modal, Stack, Text } from '@mantine/core'
import { useSessionStore } from '@/entities/session'
import type { GreenApiCredentials } from '@/shared/api/greenapi'
import { i18n } from '@/shared/config'

export type SettingsModalProps = {
  readonly opened: boolean
  readonly onClose: () => void
  readonly credentials: GreenApiCredentials
}

export function SettingsModal({ opened, onClose, credentials }: SettingsModalProps) {
  const status = useSessionStore((state) => state.status)
  const reconnecting = useSessionStore((state) => state.reconnecting)
  const disconnect = useSessionStore((state) => state.disconnect)

  const statusKey = status === 'connected' && reconnecting ? 'reconnecting' : status
  const statusText = i18n.messenger.list.status[statusKey]

  return (
    <Modal opened={opened} onClose={onClose} title={i18n.sessionSettings.title} centered>
      <Stack gap="sm">
        <Stack gap={4}>
          <Text size="xs" c="dimmed">
            {i18n.sessionSettings.apiUrlLabel}
          </Text>
          <Text size="sm">{credentials.apiUrl}</Text>
        </Stack>
        <Stack gap={4}>
          <Text size="xs" c="dimmed">
            {i18n.sessionSettings.instanceIdLabel}
          </Text>
          <Text size="sm">{credentials.idInstance}</Text>
        </Stack>
        <Stack gap={4}>
          <Text size="xs" c="dimmed">
            {i18n.sessionSettings.statusLabel}
          </Text>
          <Text size="sm">{statusText}</Text>
        </Stack>
        <Divider />
        <Group justify="flex-end">
          <Button
            variant="light"
            color="red"
            radius="xl"
            onClick={() => {
              disconnect()
              onClose()
            }}
          >
            {i18n.sessionSettings.disconnectAction}
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
