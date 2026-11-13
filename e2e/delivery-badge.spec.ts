import { expect, test } from '@playwright/test'
import {
  chatRow,
  connectMockInstance,
  createChatByPhone,
  deliverBackgroundMessage,
  sendChatMessage,
} from './helpers'

const DEMO_PHONE = '79991234567'
const DEMO_NAME = 'Demo Contact'
const OTHER_PHONE = '77771234567'
const BACKGROUND_TEXT = 'Background hello'

test('a message in a non-open chat raises a badge and a toast and clears on open', async ({
  page,
}) => {
  await connectMockInstance(page)

  await createChatByPhone(page, DEMO_PHONE, DEMO_NAME)
  await sendChatMessage(page, 'Hello demo')
  await expect(
    page
      .getByRole('region', { name: 'Messages' })
      .getByText('Mock reply — just checking the flow works.'),
  ).toBeVisible()

  await createChatByPhone(page, OTHER_PHONE, OTHER_PHONE)

  await deliverBackgroundMessage(page, {
    idMessage: 'e2e-bg-1',
    chatId: DEMO_PHONE,
    chatName: DEMO_NAME,
    text: BACKGROUND_TEXT,
  })

  await expect(page.getByText(BACKGROUND_TEXT).first()).toBeVisible()
  const demoChatRow = chatRow(page, DEMO_NAME)
  await expect(demoChatRow).toHaveAttribute('data-unread', 'true')

  await demoChatRow.click()

  await expect(page.getByRole('heading', { level: 3, name: DEMO_NAME })).toBeVisible()
  await expect(
    page.getByRole('region', { name: 'Messages' }).getByText(BACKGROUND_TEXT),
  ).toBeVisible()
  await expect(demoChatRow).not.toHaveAttribute('data-unread', 'true')
})
