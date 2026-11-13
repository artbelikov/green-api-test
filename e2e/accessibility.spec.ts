import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'
import { connectMockInstance } from './helpers'

const assertNoCriticalViolations = async (page: Page): Promise<void> => {
  const results = await new AxeBuilder({ page }).analyze()
  const critical = results.violations.filter((violation) => violation.impact === 'critical')
  expect(critical).toEqual([])
}

test('connect page has no critical accessibility violations', async ({ page }) => {
  await page.goto('/?mock=1')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await assertNoCriticalViolations(page)
})

test('messenger shell has no critical accessibility violations', async ({ page }) => {
  await connectMockInstance(page)
  await expect(page.getByRole('heading', { level: 2, name: 'Chats' })).toBeVisible()
  await assertNoCriticalViolations(page)
})
