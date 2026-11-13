import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { i18n } from '@/shared/config'
import { NavRail, type NavRailSection } from './nav-rail'

describe('NavRail', () => {
  it('renders all three labeled sections', () => {
    render(<NavRail active="all" onSelect={() => {}} />)
    expect(
      screen.getByRole('navigation', { name: i18n.messenger.navRail.label }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: i18n.messenger.navRail.all })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: i18n.messenger.navRail.contacts }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: i18n.messenger.navRail.settings }),
    ).toBeInTheDocument()
  })

  it('marks the active section as the current page', () => {
    render(<NavRail active="contacts" onSelect={() => {}} />)
    const current = screen.getByRole('button', { current: 'page' })
    expect(current).toHaveTextContent(i18n.messenger.navRail.contacts)
  })

  it('reports the selected section on click', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<NavRail active="all" onSelect={onSelect} />)

    await user.click(screen.getByRole('button', { name: i18n.messenger.navRail.contacts }))
    await user.click(screen.getByRole('button', { name: i18n.messenger.navRail.settings }))

    expect(onSelect).toHaveBeenCalledTimes(2)
    expect(onSelect.mock.calls.map(([section]) => section as NavRailSection)).toEqual([
      'contacts',
      'settings',
    ])
  })
})
