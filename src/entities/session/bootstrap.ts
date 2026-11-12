import type {
  GreenApiCredentials,
  GreenApiSettingsPatch,
  GreenApiSettingsState,
  GreenApiWebhookFlag,
} from '@/shared/api/greenapi'

export const SETTLE_DURATION_MS = 5 * 60_000

const BOOTSTRAP_FLAGS: readonly GreenApiWebhookFlag[] = [
  'incomingWebhook',
  'outgoingMessageWebhook',
  'outgoingWebhook',
  'stateWebhook',
]

export interface SettingsGateway {
  getSettings(credentials: GreenApiCredentials): Promise<GreenApiSettingsState>
  setSettings(credentials: GreenApiCredentials, patch: GreenApiSettingsPatch): Promise<void>
}

export interface BootstrapOutcome {
  readonly settledAt: number
  readonly appliedFlags: readonly GreenApiWebhookFlag[]
}

const isFlagEnabled = (value: string | number | boolean | undefined): boolean =>
  value === 'yes' || value === true

export async function bootstrapWebhookFlags(
  credentials: GreenApiCredentials,
  gateway: SettingsGateway,
  now: () => number,
): Promise<BootstrapOutcome> {
  const settings = await gateway.getSettings(credentials)
  const patch: GreenApiSettingsPatch = {}
  const appliedFlags: GreenApiWebhookFlag[] = []
  for (const flag of BOOTSTRAP_FLAGS) {
    if (!isFlagEnabled(settings[flag])) {
      patch[flag] = 'yes'
      appliedFlags.push(flag)
    }
  }
  if (appliedFlags.length === 0) {
    return { settledAt: now(), appliedFlags }
  }
  await gateway.setSettings(credentials, patch)
  const settledAt = now()
  console.info(
    `[session] webhook settings enabled (${appliedFlags.join(', ')}) — applying for up to 5 min`,
  )
  return { settledAt, appliedFlags }
}
