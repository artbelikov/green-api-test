import { MantineProvider } from '@mantine/core'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ChatAvatar, initialsOf, seedHash } from './avatar'

describe('seedHash', () => {
  it('is deterministic for the same seed', () => {
    expect(seedHash('79161234567')).toBe(seedHash('79161234567'))
  })

  it('differs between seeds', () => {
    expect(seedHash('79161234567')).not.toBe(seedHash('79001234567'))
  })
})

describe('initialsOf', () => {
  it('takes the first letters of up to two words', () => {
    expect(initialsOf('Иван Царевич')).toBe('ИЦ')
    expect(initialsOf('Demo Contact')).toBe('DC')
  })

  it('uses a single letter for a single word', () => {
    expect(initialsOf('Иван')).toBe('И')
  })

  it('falls back for empty and whitespace names', () => {
    expect(initialsOf('')).toBe('?')
    expect(initialsOf('   ')).toBe('?')
  })
})

describe('ChatAvatar', () => {
  it('renders an image when a url is available', () => {
    const view = render(
      <MantineProvider>
        <ChatAvatar name="Demo Contact" seed="79161234567" url="https://cdn.test/a.png" size={54} />
      </MantineProvider>,
    )
    const image = view.container.querySelector('img')
    expect(image).not.toBeNull()
    expect(image).toHaveAttribute('src', 'https://cdn.test/a.png')
  })

  it('renders initials on a gradient circle without a url', () => {
    render(
      <MantineProvider>
        <ChatAvatar name="Demo Contact" seed="79161234567" url={null} size={54} />
      </MantineProvider>,
    )
    expect(screen.getByText('DC')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('keeps the same gradient for the same seed', () => {
    const first = render(
      <MantineProvider>
        <ChatAvatar name="A" seed="seed-1" url={null} size={54} />
      </MantineProvider>,
    )
    const gradient = (first.container.querySelector('span') as HTMLElement).style.background
    const second = render(
      <MantineProvider>
        <ChatAvatar name="B" seed="seed-1" url={null} size={54} />
      </MantineProvider>,
    )
    expect((second.container.querySelector('span') as HTMLElement).style.background).toBe(gradient)
  })
})
