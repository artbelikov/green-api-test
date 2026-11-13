import { expect, test } from '@playwright/test'
import { i18n } from '../src/shared/config'
import {
  chatRow,
  connectMockInstance,
  createChatByPhone,
  messagesRegion,
  sendChatMessage,
} from './helpers'

const DEMO_PHONE = '79991234567'
const DEMO_NAME = 'Demo Contact'
const PERSISTED_TEXT = 'Persistence check message'

test('session, chats, and messages survive a reload', async ({ page }) => {
  await connectMockInstance(page)
  await createChatByPhone(page, DEMO_PHONE, DEMO_NAME)
  await sendChatMessage(page, PERSISTED_TEXT)
  await expect(
    messagesRegion(page).getByText('Mock reply — just checking the flow works.'),
  ).toBeVisible()

  await page.reload()

  await expect(page.getByRole('heading', { name: i18n.messenger.list.heading })).toBeVisible({
    timeout: 15_000,
  })
  await chatRow(page, DEMO_NAME).click()
  await expect(page.getByRole('heading', { level: 3, name: DEMO_NAME })).toBeVisible()
  await expect(messagesRegion(page).getByText(PERSISTED_TEXT)).toBeVisible()
})
