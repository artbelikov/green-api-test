import { IconMessageCircle, IconSettings } from '@tabler/icons-react'
import type { JSX, ReactNode } from 'react'
import { i18n } from '@/shared/config'
import classes from './nav-rail.module.css'

export type NavRailSection = 'all' | 'settings'

export type NavRailProps = {
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
        {renderItem('all', <IconMessageCircle className={classes.icon} aria-hidden />)}
      </div>
      <div className={classes.group}>
        {renderItem('settings', <IconSettings className={classes.icon} aria-hidden />)}
      </div>
    </nav>
  )
}
