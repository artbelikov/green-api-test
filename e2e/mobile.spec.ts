import { expect, test } from '@playwright/test'
import { i18n } from '../src/shared/config'
import { chatRow, connectMockInstance, createChatByPhone, sendChatMessage } from './helpers'

test.describe('mobile viewport', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('the list and conversation swap as single panes with back navigation', async ({ page }) => {
    await connectMockInstance(page)

    await expect(page.getByRole('navigation', { name: i18n.messenger.navRail.label })).toHaveCount(
      0,
    )

    const listPane = page.locator('aside').first()
    await expect(listPane).toBeVisible()
    const listBounds = await listPane.boundingBox()
    expect(listBounds?.width ?? 999).toBeLessThanOrEqual(375)

    await createChatByPhone(page, '79991234567', 'Demo Contact')
    await sendChatMessage(page, 'Mobile hello')

    await expect(listPane).toBeHidden()
    await expect(
      page.getByRole('button', { name: i18n.messenger.conversation.backAction }),
    ).toBeVisible()

    await page.getByRole('button', { name: i18n.messenger.conversation.backAction }).click()
    await expect(listPane).toBeVisible()
    await expect(page.getByRole('heading', { name: i18n.messenger.list.heading })).toBeVisible()
    await expect(chatRow(page, 'Demo Contact')).toBeVisible()
  })

  test('settings and disconnect stay reachable from the list header', async ({ page }) => {
    await connectMockInstance(page)

    await page.getByRole('button', { name: i18n.messenger.navRail.settings }).click()
    const dialog = page.getByRole('dialog', { name: i18n.sessionSettings.title })
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText(i18n.messenger.list.status.connected)

    await dialog.getByRole('button', { name: i18n.sessionSettings.disconnectAction }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(i18n.connect.heading)
  })
})
