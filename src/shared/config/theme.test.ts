import { describe, expect, it } from 'vitest'
import { maxPalette, maxTheme } from './theme'

describe('maxTheme', () => {
  it('follows the MAX visual contract tokens', () => {
    expect(maxTheme.primaryColor).toBe('brand')
    const accent = maxTheme.colors?.brand?.[5]
    expect(accent?.toLowerCase()).toBe('#1d7df2')
    expect(maxPalette.accent.toLowerCase()).toBe('#1d7df2')
    expect(maxPalette.wallpaperTop.toLowerCase()).toBe('#7fb6f0')
    expect(maxPalette.wallpaperBottom.toLowerCase()).toBe('#9cc7f2')
    expect(maxPalette.wallpaperDoodle.toLowerCase()).toBe('#5c97d8')
    expect(maxPalette.bubbleIn.toLowerCase()).toBe('#ffffff')
    expect(maxPalette.bubbleOut.toLowerCase()).toBe('#dff3e9')
    expect(maxPalette.surfaceMuted.toLowerCase()).toBe('#f0f1f3')
    expect(maxPalette.textPrimary.toLowerCase()).toBe('#0f0f0f')
    expect(maxPalette.textSecondary.toLowerCase()).toBe('#808591')
    expect(maxTheme.other?.max).toBe(maxPalette)
  })
})
