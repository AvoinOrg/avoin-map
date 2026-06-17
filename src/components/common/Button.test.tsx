import React from 'react'
import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'

import { AppThemeProvider } from '#/common/style/theme'
import { ButtonBase, IconButton } from '#/components/common/Button'

const renderWithTheme = (ui: React.ReactElement) =>
  render(<AppThemeProvider>{ui}</AppThemeProvider>)

describe('ButtonBase', () => {
  it('renders a native button with type button by default and forwards refs', () => {
    const ref = React.createRef<HTMLElement>()

    renderWithTheme(
      <ButtonBase ref={ref}>Open</ButtonBase>
    )

    const button = screen.getByRole('button', { name: 'Open' })

    expect(button.tagName).toBe('BUTTON')
    expect(button).toHaveAttribute('type', 'button')
    expect(ref.current).toBe(button)
  })

  it('suppresses native button clicks while disabled', () => {
    const onClick = jest.fn()

    renderWithTheme(
      <ButtonBase disabled onClick={onClick}>
        Disabled
      </ButtonBase>
    )

    const button = screen.getByRole('button', { name: 'Disabled' })

    fireEvent.click(button)

    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('data-disabled')
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders href as a semantic anchor without a default button role', () => {
    renderWithTheme(
      <ButtonBase href="/docs">Docs</ButtonBase>
    )

    const link = screen.getByRole('link', { name: 'Docs' })

    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', '/docs')
    expect(link).not.toHaveAttribute('role')
  })

  it('suppresses disabled anchor clicks and exposes aria-disabled', () => {
    const onClick = jest.fn()

    renderWithTheme(
      <ButtonBase disabled href="/docs" onClick={onClick}>
        Disabled link
      </ButtonBase>
    )

    const link = screen.getByRole('link', { name: 'Disabled link' })

    fireEvent.click(link)

    expect(link).toHaveAttribute('aria-disabled', 'true')
    expect(link).toHaveAttribute('tabindex', '-1')
    expect(onClick).not.toHaveBeenCalled()
  })
})

describe('IconButton', () => {
  it('renders an accessible icon-only button when aria-label is supplied', () => {
    renderWithTheme(
      <IconButton aria-label="Show layer">
        <span aria-hidden="true">i</span>
      </IconButton>
    )

    expect(
      screen.getByRole('button', { name: 'Show layer' })
    ).toBeInTheDocument()
  })
})
