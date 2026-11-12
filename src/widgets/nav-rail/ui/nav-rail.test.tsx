import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { i18n } from '@/shared/config'
import { NavRail } from './nav-rail'

describe('NavRail', () => {
  it('renders the reduced rail with labeled items', () => {
    render(<NavRail />)
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

  it('marks the chats item as the current page', () => {
    render(<NavRail />)
    const current = screen.getByRole('button', { current: 'page' })
    expect(current).toHaveTextContent(i18n.messenger.navRail.all)
  })
})
