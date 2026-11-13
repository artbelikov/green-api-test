import { Alert, Loader, Modal, Stack, Text, UnstyledButton } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { ChatAvatar } from '@/entities/chat'
import { useSessionStore } from '@/entities/session'
import { createNewChat, type NewChatErrorCode } from '@/features/pick-chat'
import { type Chat, getContacts, mapContactItem } from '@/shared/api/greenapi'
import { i18n } from '@/shared/config'
import classes from './contacts-modal.module.css'

const errorText = (code: NewChatErrorCode): string => {
  if (
    code === 'notConnected' ||
    code === 'resolveFailed' ||
    code === 'statusError' ||
    code === 'networkError' ||
    code === 'timeoutError' ||
    code === 'rateLimited'
  ) {
    return i18n.newChat.errors[code]
  }
  return i18n.contactsBook.loadFailed
}

export interface ContactsModalProps {
  readonly opened: boolean
  readonly onClose: () => void
}

export function ContactsModal({ opened, onClose }: ContactsModalProps) {
  const credentials = useSessionStore((state) => state.credentials)
  const [openingId, setOpeningId] = useState<string | null>(null)
  const [openError, setOpenError] = useState<string | null>(null)

  const contactsQuery = useQuery({
    queryKey: ['contacts'],
    queryFn: async (): Promise<readonly Chat[]> => {
      if (credentials === null) {
        return []
      }
      const items = await getContacts(credentials)
      return items.map(mapContactItem).filter((chat): chat is Chat => chat !== null)
    },
    enabled: opened && credentials !== null,
    staleTime: 60_000,
  })

  const openContact = async (chatId: string): Promise<void> => {
    if (openingId !== null) {
      return
    }
    setOpenError(null)
    setOpeningId(chatId)
    const result = await createNewChat({ phone: '', chatId })
    setOpeningId(null)
    if (!result.ok) {
      const text = errorText(result.code)
      setOpenError(text)
      if (result.code === 'rateLimited') {
        notifications.show({ message: i18n.newChat.limitToast, color: 'red' })
      }
      return
    }
    onClose()
  }

  const contacts = contactsQuery.data ?? []

  return (
    <Modal opened={opened} onClose={onClose} title={i18n.contactsBook.title} centered>
      <Stack gap="xs">
        {contactsQuery.isError ? (
          <Alert variant="light" color="red">
            {i18n.contactsBook.loadFailed}
          </Alert>
        ) : null}
        {openError !== null ? (
          <Alert variant="light" color="red">
            {openError}
          </Alert>
        ) : null}
        {contactsQuery.isPending ? (
          <Stack gap="sm" align="center" py="lg">
            <Loader size="sm" />
          </Stack>
        ) : null}
        {contactsQuery.isSuccess && contacts.length === 0 ? (
          <Text c="dimmed" size="sm" ta="center" py="lg">
            {i18n.contactsBook.empty}
          </Text>
        ) : null}
        {contacts.map((contact) => (
          <UnstyledButton
            key={contact.id}
            className={classes.row}
            disabled={openingId !== null}
            onClick={() => void openContact(contact.id)}
          >
            <ChatAvatar name={contact.name} seed={contact.id} url={null} size={40} />
            <span className={classes.meta}>
              <Text size="sm" fw={600} lineClamp={1}>
                {contact.name}
              </Text>
              <Text size="xs" c="dimmed" lineClamp={1}>
                {contact.id}
              </Text>
            </span>
          </UnstyledButton>
        ))}
      </Stack>
    </Modal>
  )
}
