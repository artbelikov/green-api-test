import { Alert, Button, Group, Modal, Stack, TextInput } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { type FormEvent, useEffect, useState } from 'react'
import type { PhoneErrorCode } from '@/shared/api/greenapi'
import { i18n } from '@/shared/config'
import { createNewChat, type NewChatErrorCode } from '../create-new-chat'

const PHONE_DRAFT_PATTERN = /^[+\d][\d\s\-()]*$/

const isPhoneCode = (code: NewChatErrorCode): code is PhoneErrorCode =>
  code === 'empty' || code === 'notANumber' || code === 'unsupportedRegion'

const errorText = (code: NewChatErrorCode): string =>
  isPhoneCode(code) ? i18n.phone.errors[code] : i18n.newChat.errors[code]

export interface NewChatModalProps {
  readonly opened: boolean
  readonly onClose: () => void
}

export function NewChatModal({ opened, onClose }: NewChatModalProps) {
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!opened) {
      return
    }
    setDraft('')
    setError(null)
    setSubmitting(false)
  }, [opened])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) {
      return
    }
    setError(null)
    setSubmitting(true)
    const isPhoneDraft = PHONE_DRAFT_PATTERN.test(draft.trim())
    const result = await createNewChat({
      phone: isPhoneDraft ? draft : '',
      chatId: isPhoneDraft ? '' : draft,
    })
    setSubmitting(false)
    if (!result.ok) {
      setError(errorText(result.code))
      if (result.code === 'statusError' || result.code === 'rateLimited') {
        notifications.show({ message: i18n.newChat.limitToast, color: 'red' })
      }
      return
    }
    onClose()
  }

  return (
    <Modal opened={opened} onClose={onClose} title={i18n.newChat.title} centered>
      <form noValidate onSubmit={handleSubmit}>
        <Stack gap="sm">
          {error !== null ? (
            <Alert variant="light" color="red">
              {error}
            </Alert>
          ) : null}
          <TextInput
            label={i18n.newChat.targetLabel}
            placeholder={i18n.newChat.targetPlaceholder}
            value={draft}
            disabled={submitting}
            onChange={(event) => setDraft(event.currentTarget.value)}
          />
          <Group justify="flex-end">
            <Button variant="default" radius="xl" onClick={onClose} disabled={submitting}>
              {i18n.newChat.cancelAction}
            </Button>
            <Button type="submit" radius="xl" loading={submitting}>
              {i18n.newChat.createAction}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}
