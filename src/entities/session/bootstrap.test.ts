import { describe, expect, it, vi } from 'vitest'
import type {
  GreenApiCredentials,
  GreenApiSettingsPatch,
  GreenApiSettingsState,
} from '@/shared/api/greenapi'
import { bootstrapWebhookFlags, type SettingsGateway } from './bootstrap'

const credentials: GreenApiCredentials = {
  apiUrl: 'https://gateway.test',
  idInstance: '110100200',
  apiTokenInstance: 'token-1',
}

const settingsFrom = (values: GreenApiSettingsState): GreenApiSettingsState => ({
  wid: '79000000000@c.us',
  webhookUrl: '',
  ...values,
})

const createGateway = (settings: GreenApiSettingsState, failSetSettings = false) => {
  const applied: GreenApiSettingsPatch[] = []
  const gateway: SettingsGateway = {
    getSettings: vi.fn(async () => settings),
    setSettings: vi.fn(async (_credentials, patch) => {
      if (failSetSettings) {
        throw new Error('apply failed')
      }
      applied.push(patch)
    }),
  }
  return { gateway, applied }
}

const now = (): number => 5_000

describe('bootstrapWebhookFlags', () => {
  it('flips all required webhook flags when none are enabled', async () => {
    const { gateway, applied } = createGateway(settingsFrom({}))

    const outcome = await bootstrapWebhookFlags(credentials, gateway, now)

    expect(outcome.settledAt).toBe(5_000)
    expect(outcome.appliedFlags).toEqual([
      'incomingWebhook',
      'outgoingMessageWebhook',
      'outgoingWebhook',
      'stateWebhook',
    ])
    expect(applied).toEqual([
      {
        incomingWebhook: 'yes',
        outgoingMessageWebhook: 'yes',
        outgoingWebhook: 'yes',
        stateWebhook: 'yes',
      },
    ])
  })

  it('flips only the flags that are still disabled', async () => {
    const { gateway, applied } = createGateway(
      settingsFrom({ incomingWebhook: 'yes', outgoingWebhook: true }),
    )

    const outcome = await bootstrapWebhookFlags(credentials, gateway, now)

    expect(outcome.appliedFlags).toEqual(['outgoingMessageWebhook', 'stateWebhook'])
    expect(applied[0]).toEqual({ outgoingMessageWebhook: 'yes', stateWebhook: 'yes' })
  })

  it('reports nothing to settle when every flag is already enabled', async () => {
    const { gateway, applied } = createGateway(
      settingsFrom({
        incomingWebhook: 'yes',
        outgoingMessageWebhook: 'yes',
        outgoingWebhook: 'yes',
        stateWebhook: 'yes',
      }),
    )

    const outcome = await bootstrapWebhookFlags(credentials, gateway, now)

    expect(outcome.settledAt).toBe(5_000)
    expect(outcome.appliedFlags).toEqual([])
    expect(applied).toEqual([])
  })

  it('never touches webhookUrl', async () => {
    const { gateway, applied } = createGateway(settingsFrom({}))

    await bootstrapWebhookFlags(credentials, gateway, now)

    expect(Object.keys(applied[0] ?? {})).not.toContain('webhookUrl')
  })

  it('propagates settings apply failures', async () => {
    const { gateway } = createGateway(settingsFrom({}), true)

    await expect(bootstrapWebhookFlags(credentials, gateway, now)).rejects.toThrow('apply failed')
  })
})
