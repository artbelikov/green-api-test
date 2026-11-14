import { expect, type Page, test } from '@playwright/test'
import { i18n } from '../src/shared/config'
import {
  connectMockInstance,
  createChatByPhone,
  deliverBackgroundMessages,
  messagesRegion,
  setMockGatewayFlag,
} from './helpers'

const DEMO_PHONE = '79991234567'
const DEMO_NAME = 'Demo Contact'
const MESSAGE_COUNT = 36
const TEXT_PREFIX = 'Scroll filler message'

const fillerDeliveries = Array.from({ length: MESSAGE_COUNT }, (_, index) => ({
  idMessage: `scroll-${index + 1}`,
  chatId: DEMO_PHONE,
  chatName: DEMO_NAME,
  text: `${TEXT_PREFIX} ${index + 1} ${'lorem ipsum dolor sit amet consectetur adipiscing elit '.repeat(4)}`,
}))

test('the conversation virtualizes long histories and keeps autoscroll pinned', async ({
  page,
}) => {
  await connectMockInstance(page)
  await createChatByPhone(page, DEMO_PHONE, DEMO_NAME)
  await setMockGatewayFlag(page, 'autoReplyEnabled', false)
  await deliverBackgroundMessages(page, fillerDeliveries)

  await expect(messagesRegion(page).getByText(`${TEXT_PREFIX} ${MESSAGE_COUNT}`)).toBeVisible()

  const renderedRowBlocks = await renderedRowCount(page)
  expect(renderedRowBlocks).toBeLessThan(MESSAGE_COUNT + 1)

  await scrollConversation(page, -900)
  const jumpPill = page.getByRole('button', { name: i18n.messenger.conversation.jumpToLatest })
  await expect(jumpPill).toBeVisible()

  const topRowBlocks = await renderedRowCount(page)
  expect(topRowBlocks).toBeLessThan(MESSAGE_COUNT + 1)

  await jumpPill.click()
  await expect(messagesRegion(page).getByText(`${TEXT_PREFIX} ${MESSAGE_COUNT}`)).toBeVisible()
  await expect(jumpPill).toBeHidden()
})

const renderedRowCount = async (page: Page): Promise<number> =>
  page.evaluate(() => {
    const region = document.querySelector('[aria-label="Messages"]')
    return region?.querySelectorAll('[data-index]').length ?? -1
  })

const scrollConversation = async (page: Page, deltaY: number): Promise<void> => {
  await messagesRegion(page).hover()
  await page.mouse.wheel(0, deltaY)
}
