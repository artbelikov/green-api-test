import { createTheme, type MantineColorsTuple } from '@mantine/core'

const brandShades: MantineColorsTuple = [
  '#e7f1fe',
  '#d2e4fd',
  '#a6c9fb',
  '#79aff7',
  '#4c96f4',
  '#1d7df2',
  '#1873de',
  '#1463ba',
  '#115197',
  '#0d3f73',
]

export const maxPalette = {
  accent: '#1D7DF2',
  wallpaperTop: '#7FB6F0',
  wallpaperBottom: '#9CC7F2',
  wallpaperDoodle: '#5C97D8',
  wallpaperDoodleOpacity: 0.2,
  bubbleIn: '#FFFFFF',
  bubbleOut: '#DFF3E9',
  bubbleOutOpacity: 0.75,
  surfaceMuted: '#F0F1F3',
  textPrimary: '#0F0F0F',
  textSecondary: '#808591',
} as const

export type MaxPalette = typeof maxPalette

declare module '@mantine/core' {
  interface MantineThemeOther {
    max: MaxPalette
  }
}

export const maxTheme = createTheme({
  colors: { brand: brandShades },
  primaryColor: 'brand',
  primaryShade: 5,
  fontFamily: '-apple-system, "Segoe UI", Roboto, Inter, sans-serif',
  defaultRadius: 'md',
  other: { max: maxPalette },
})
