import type { JSX, ReactNode } from 'react'
import { i18n } from '@/shared/config'
import classes from './nav-rail.module.css'

const iconProps = {
  className: classes.icon,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

const ChatsIcon = () => (
  <svg {...iconProps}>
    <title>{i18n.messenger.navRail.all}</title>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
)

const ContactsIcon = () => (
  <svg {...iconProps}>
    <title>{i18n.messenger.navRail.contacts}</title>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const SettingsIcon = () => (
  <svg {...iconProps}>
    <title>{i18n.messenger.navRail.settings}</title>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0 .33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)

export type NavRailSection = 'all' | 'contacts' | 'settings'

export interface NavRailProps {
  readonly active: NavRailSection
  readonly onSelect: (section: NavRailSection) => void
}

export interface NavRailProps {
  readonly active: NavRailSection
  readonly onSelect: (section: NavRailSection) => void
}

export function NavRail({ active, onSelect }: NavRailProps) {
  const renderItem = (section: NavRailSection, icon: ReactNode): JSX.Element => {
    const isActive = section === active
    return (
      <button
        key={section}
        type="button"
        className={classes.item}
        data-active={isActive || undefined}
        aria-current={isActive ? 'page' : undefined}
        aria-label={i18n.messenger.navRail[section]}
        onClick={() => onSelect(section)}
      >
        {icon}
        <span className={classes.label}>{i18n.messenger.navRail[section]}</span>
      </button>
    )
  }

  return (
    <nav className={classes.rail} aria-label={i18n.messenger.navRail.label}>
      <div className={classes.group}>
        {renderItem('all', <ChatsIcon />)}
        {renderItem('contacts', <ContactsIcon />)}
      </div>
      <div className={classes.group}>{renderItem('settings', <SettingsIcon />)}</div>
    </nav>
  )
}
