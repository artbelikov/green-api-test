import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { i18n } from '@/shared/config'
import { App } from './App'

describe('App', () => {
  it('renders the MAX-themed scaffold placeholder', () => {
    render(<App />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent(i18n.placeholder.title)
  })
})
