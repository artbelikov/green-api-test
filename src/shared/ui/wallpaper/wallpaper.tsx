import type { CSSProperties, ReactNode } from 'react'
import { DOODLE_TILE_SIZE, doodleTile } from './doodle-tile'
import classes from './wallpaper.module.css'

export interface WallpaperProps {
  readonly topColor: string
  readonly bottomColor: string
  readonly doodleColor: string
  readonly doodleOpacity: number
  readonly className?: string
  readonly children?: ReactNode
}

export function Wallpaper({
  topColor,
  bottomColor,
  doodleColor,
  doodleOpacity,
  className,
  children,
}: WallpaperProps) {
  const doodleStyle: CSSProperties & { '--doodle-tile-size': string } = {
    backgroundImage: doodleTile(doodleColor),
    opacity: doodleOpacity,
    '--doodle-tile-size': `${DOODLE_TILE_SIZE}px`,
  }
  return (
    <div
      className={className ? `${classes.wallpaper} ${className}` : classes.wallpaper}
      style={{ background: `linear-gradient(160deg, ${topColor} 0%, ${bottomColor} 100%)` }}
    >
      <div aria-hidden className={classes.doodles} style={doodleStyle} />
      <div className={classes.content}>{children}</div>
    </div>
  )
}
