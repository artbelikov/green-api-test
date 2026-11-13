import { expect, type Page, test } from '@playwright/test'
import { i18n } from '../src/shared/config'
import {
  connectMockInstance,
  createChatByPhone,
  deliverBackgroundMessage,
  messagesRegion,
  sendChatMessage,
  setMockGatewayFlag,
} from './helpers'

const DEMO_PHONE = '79991234567'
const DEMO_NAME = 'Demo Contact'

test('a poll outage flips the chip to reconnecting and recovery clears it', async ({ page }) => {
  await connectMockInstance(page)
  await createChatByPhone(page, DEMO_PHONE, DEMO_NAME)
  await setMockGatewayFlag(page, 'autoReplyEnabled', false)
  await expect(page.getByText(i18n.messenger.list.status.connected, { exact: true })).toBeVisible()

  await setMockGatewayFlag(page, 'pollOutage', true)
  await expect(
    page.getByText(i18n.messenger.list.status.reconnecting, { exact: true }),
  ).toBeVisible({ timeout: 15_000 })
  await expect(page.getByText(i18n.messenger.list.reconnectBanner)).toBeVisible()

  await setMockGatewayFlag(page, 'pollOutage', false)
  await deliverBackgroundMessage(page, {
    idMessage: 'outage-recovery-1',
    chatId: DEMO_PHONE,
    chatName: DEMO_NAME,
    text: 'Back online message',
  })
  await expect(page.getByText(i18n.messenger.list.status.connected, { exact: true })).toBeVisible({
    timeout: 15_000,
  })
  await expect(page.getByText(i18n.messenger.list.reconnectBanner)).toHaveCount(0)
  await expect(messagesRegion(page).getByText('Back online message')).toBeVisible()
})

test('a session-invalidating gateway answer disconnects back to the connect screen', async ({
  page,
}) => {
  await connectMockInstance(page)
  await createChatByPhone(page, DEMO_PHONE, DEMO_NAME)

  await setMockGatewayFlag(page, 'invalidate', true)
  await expect(page.getByRole('heading', { level: 1, name: i18n.connect.heading })).toBeVisible({
    timeout: 30_000,
  })
  await expect(
    page.getByRole('button', { name: i18n.sessionSettings.disconnectAction }),
  ).toHaveCount(0)
})

test('unrecognized webhook envelopes are skipped without breaking the stream', async ({ page }) => {
  await connectMockInstance(page)
  await createChatByPhone(page, DEMO_PHONE, DEMO_NAME)
  await deliverUnknownWebhook(page, DEMO_PHONE)

  await sendChatMessage(page, 'Still works')
  await expect(messagesRegion(page).getByText('Still works')).toBeVisible()

  await deliverBackgroundMessage(page, {
    idMessage: 'after-unknown-1',
    chatId: DEMO_PHONE,
    chatName: DEMO_NAME,
    text: 'Delivered after the unknown webhook',
  })
  await expect(messagesRegion(page).getByText('Delivered after the unknown webhook')).toBeVisible()
})

function deliverUnknownWebhook(page: Page, chatId: string): Promise<void> {
  return page.evaluate((targetChatId) => {
    window.mockGateway.deliverNotification({
      typeWebhook: 'brandNewWebhookFromTheFuture',
      idMessage: 'unknown-1',
      timestamp: Math.floor(Date.now() / 1000),
      senderData: { chatId: targetChatId },
    })
  }, chatId)
}
