import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { buildDoodleTileMarkup, DOODLE_TILE_SIZE, doodleTile } from './doodle-tile'
import { Wallpaper } from './wallpaper'
import classes from './wallpaper.module.css'

const WALLPAPER_CLASS = classes.wallpaper as string
const DOODLES_CLASS = classes.doodles as string

describe('doodleTile', () => {
  it('encodes the svg tile as a css background url with the pattern color', () => {
    const tile = doodleTile('#5C97D8')
    expect(tile.startsWith('url("data:image/svg+xml,%3Csvg')).toBe(true)
    expect(tile).toContain('%235C97D8')
  })

  it('caches tiles per color', () => {
    expect(doodleTile('#5C97D8')).toBe(doodleTile('#5C97D8'))
    expect(doodleTile('#FFFFFF')).not.toBe(doodleTile('#5C97D8'))
  })

  it('builds stroke-only line-art doodles with the tile size', () => {
    const markup = buildDoodleTileMarkup('#5C97D8')
    expect(markup).toContain(`width="${DOODLE_TILE_SIZE}"`)
    expect(markup).toContain('stroke="#5C97D8"')
    expect(markup).toContain('fill="none"')
    expect(markup.match(/<g /g)?.length).toBeGreaterThanOrEqual(10)
  })
})

describe('Wallpaper', () => {
  it('renders the gradient base and the tiled doodle layer with the pattern color and opacity', () => {
    render(
      <Wallpaper topColor="#7FB6F0" bottomColor="#9CC7F2" doodleColor="#5C97D8" doodleOpacity={0.2}>
        <p>inside</p>
      </Wallpaper>,
    )
    const doodles = document.querySelector<HTMLElement>(`.${DOODLES_CLASS}`)
    expect(doodles).not.toBeNull()
    expect(doodles?.style.backgroundImage).toContain('data:image/svg+xml')
    expect(doodles?.style.backgroundImage).toContain('%235C97D8')
    expect(doodles?.style.opacity).toBe('0.2')
    expect(doodles?.style.getPropertyValue('--doodle-tile-size')).toBe(`${DOODLE_TILE_SIZE}px`)
    const surface = doodles?.parentElement
    expect(surface?.classList.contains(WALLPAPER_CLASS)).toBe(true)
    expect(surface?.style.background).toContain('linear-gradient(160deg')
    expect(surface?.style.background).toContain('rgb(127, 182, 240)')
    expect(surface?.style.background).toContain('rgb(156, 199, 242)')
    expect(screen.getByText('inside')).toBeInTheDocument()
  })

  it('applies the provided class name and hides the doodle layer from assistive tech', () => {
    render(
      <Wallpaper
        className="extra"
        topColor="#7FB6F0"
        bottomColor="#9CC7F2"
        doodleColor="#5C97D8"
        doodleOpacity={0.2}
      />,
    )
    const surface = document.querySelector(`.${WALLPAPER_CLASS}`)
    expect(surface).toHaveClass('extra')
    expect(document.querySelector(`.${DOODLES_CLASS}`)).toHaveAttribute('aria-hidden', 'true')
  })
})
