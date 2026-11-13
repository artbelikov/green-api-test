import { expect, type Page, test } from '@playwright/test'
import { i18n } from '../src/shared/config'
import {
  chatRow,
  connectMockInstance,
  createChatByPhone,
  deliverStatusUpdate,
  messagesRegion,
  sendChatMessage,
  setMockGatewayFlag,
} from './helpers'

const DEMO_PHONE = '79991234567'
const DEMO_NAME = 'Demo Contact'
const UNKNOWN_PHONE = '77771234567'
const FIRST_TEXT = 'Hello from the tester'
const SECOND_TEXT = 'Second outgoing message'
const AUTO_REPLY_TEXT = 'Mock reply — just checking the flow works.'

test('a chat created by phone resolves the known contact by name', async ({ page }) => {
  await connectMockInstance(page)
  await createChatByPhone(page, DEMO_PHONE, DEMO_NAME)
  await expect(page.getByText('@demo_contact')).toBeVisible()
})

test('a chat created for an unknown phone keeps the phone as its name', async ({ page }) => {
  await connectMockInstance(page)
  await createChatByPhone(page, UNKNOWN_PHONE, UNKNOWN_PHONE)
  await expect(
    messagesRegion(page).getByText(i18n.messenger.conversation.emptyHistory),
  ).toBeVisible()
})

test('sent messages reconcile and escalate through delivered and read ticks', async ({ page }) => {
  await connectMockInstance(page)
  await createChatByPhone(page, DEMO_PHONE, DEMO_NAME)
  await setMockGatewayFlag(page, 'autoReplyEnabled', false)
  await sendChatMessage(page, FIRST_TEXT)

  const outgoingBubble = messagesRegion(page).getByText(FIRST_TEXT).locator('..')
  await expect(outgoingBubble.locator('[data-status]')).toHaveAttribute('data-status', 'sent')

  const sentId = await lastOutgoingMessageId(page)
  await deliverStatusUpdate(page, { idMessage: sentId, chatId: DEMO_PHONE, status: 'delivered' })
  await expect(outgoingBubble.locator('[data-status]')).toHaveAttribute('data-status', 'delivered')

  await deliverStatusUpdate(page, { idMessage: sentId, chatId: DEMO_PHONE, status: 'read' })
  await expect(outgoingBubble.locator('[data-status]')).toHaveAttribute('data-status', 'read')
})

test('the scripted reply appears live in the open conversation', async ({ page }) => {
  await connectMockInstance(page)
  await createChatByPhone(page, DEMO_PHONE, DEMO_NAME)
  await sendChatMessage(page, FIRST_TEXT)
  await expect(messagesRegion(page).getByText(AUTO_REPLY_TEXT)).toBeVisible()
  await sendChatMessage(page, SECOND_TEXT)
  await expect(messagesRegion(page).getByText(SECOND_TEXT)).toBeVisible()
  await expect(chatRow(page, DEMO_NAME)).toContainText(SECOND_TEXT)
})

async function lastOutgoingMessageId(page: Page): Promise<string> {
  return page.evaluate(() => {
    const outgoing = window.mockGateway.messages.filter(
      (message) => message.direction === 'outgoing',
    )
    const latest = outgoing[outgoing.length - 1]
    if (latest === undefined) {
      throw new Error('no outgoing message recorded by the mock gateway')
    }
    return latest.idMessage
  })
}
