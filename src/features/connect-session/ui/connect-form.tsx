import {
  Alert,
  Anchor,
  Button,
  Collapse,
  Group,
  PasswordInput,
  Stack,
  TextInput,
} from '@mantine/core'
import { type FormEvent, useState } from 'react'
import { useSessionStore } from '@/entities/session'
import { DEFAULT_GREENAPI_API_URL, i18n } from '@/shared/config'
import { isMockRuntime } from '@/shared/lib'

const MOCK_ID_INSTANCE = '110100200'
const MOCK_API_TOKEN = 'mock-token'

type FieldKey = 'idInstance' | 'apiTokenInstance' | 'apiUrl'

export function ConnectForm() {
  const mockActive = isMockRuntime()
  const connecting = useSessionStore((state) => state.status === 'connecting')
  const [idInstance, setIdInstance] = useState(mockActive ? MOCK_ID_INSTANCE : '')
  const [apiTokenInstance, setApiTokenInstance] = useState(mockActive ? MOCK_API_TOKEN : '')
  const [apiUrl, setApiUrl] = useState(DEFAULT_GREENAPI_API_URL)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFieldErrors({})
    setFormError(null)
    const result = await useSessionStore
      .getState()
      .connect({ idInstance, apiTokenInstance, apiUrl })
    if (result.ok) {
      return
    }
    const message = i18n.connect.errors[result.code]
    if (result.code === 'invalidInstanceId') {
      setFieldErrors({ idInstance: message })
      return
    }
    if (result.code === 'missingToken') {
      setFieldErrors({ apiTokenInstance: message })
      return
    }
    if (result.code === 'invalidApiUrl') {
      setFieldErrors({ apiUrl: message })
      return
    }
    setFormError(message)
  }

  return (
    <form noValidate onSubmit={handleSubmit}>
      <Stack gap="sm">
        {mockActive ? (
          <Alert variant="light" color="brand">
            {i18n.connect.mockHint}
          </Alert>
        ) : null}
        {formError !== null ? (
          <Alert variant="light" color="red">
            {formError}
          </Alert>
        ) : null}
        <TextInput
          label={i18n.connect.idInstanceLabel}
          placeholder={i18n.connect.idInstancePlaceholder}
          inputMode="numeric"
          required
          disabled={connecting}
          value={idInstance}
          error={fieldErrors.idInstance ?? null}
          onChange={(event) => setIdInstance(event.currentTarget.value)}
        />
        <PasswordInput
          label={i18n.connect.apiTokenLabel}
          placeholder={i18n.connect.apiTokenPlaceholder}
          required
          disabled={connecting}
          value={apiTokenInstance}
          error={fieldErrors.apiTokenInstance ?? null}
          onChange={(event) => setApiTokenInstance(event.currentTarget.value)}
        />
        <Group justify="flex-start">
          <Anchor
            component="button"
            type="button"
            size="sm"
            c="dimmed"
            onClick={() => setAdvancedOpen((open) => !open)}
          >
            {i18n.connect.advancedToggle}
          </Anchor>
        </Group>
        <Collapse expanded={advancedOpen}>
          <TextInput
            label={i18n.connect.apiUrlLabel}
            value={apiUrl}
            disabled={connecting}
            error={fieldErrors.apiUrl ?? null}
            onChange={(event) => setApiUrl(event.currentTarget.value)}
          />
        </Collapse>
        <Button type="submit" radius="xl" size="md" loading={connecting}>
          {i18n.connect.connectAction}
        </Button>
      </Stack>
    </form>
  )
}
