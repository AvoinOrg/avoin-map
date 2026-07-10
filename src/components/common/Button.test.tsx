import React from 'react'
import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'

import { AppThemeProvider } from '#/common/style/theme'
import {
  SHARED_CONTROL_BORDER_RADIUS,
  SHARED_CONTROL_INFINITE_BORDER_RADIUS,
} from '#/common/style/theme/constants'
import BigMenuButton from '#/components/common/BigMenuButton'
import { Button, ButtonBase, IconButton } from '#/components/common/Button'

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

describe('Button', () => {
  it('uses the shared pill radius for basic buttons', () => {
    renderWithTheme(<Button>Apply filters</Button>)

    expect(screen.getByRole('button', { name: 'Apply filters' })).toHaveStyle({
      borderRadius: SHARED_CONTROL_INFINITE_BORDER_RADIUS,
    })
  })

  it('uses an eight pixel gap for start and end icon slots', () => {
    renderWithTheme(
      <Button
        startIcon={<span data-testid="start-icon">start</span>}
        endIcon={<span data-testid="end-icon">end</span>}
      >
        Inspect layer
      </Button>
    )

    const button = screen.getByRole('button', { name: 'start Inspect layer end' })
    const startIcon = screen.getByTestId('start-icon')
    const endIcon = screen.getByTestId('end-icon')

    expect(button).toHaveStyle({ gap: '8px' })
    expect(
      startIcon.compareDocumentPosition(endIcon) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
  })

  it('applies caller gap overrides after the shared icon spacing', () => {
    renderWithTheme(
      <Button startIcon={<span>start</span>} sx={{ gap: 2 }}>
        Custom spacing
      </Button>
    )

    expect(
      screen.getByRole('button', { name: 'start Custom spacing' })
    ).toHaveStyle({ gap: '16px' })
  })

  it('leaves icon buttons on the moderate shared radius', () => {
    renderWithTheme(
      <IconButton aria-label="Toggle layer">
        <span aria-hidden="true">i</span>
      </IconButton>
    )

    expect(screen.getByRole('button', { name: 'Toggle layer' })).toHaveStyle({
      borderRadius: SHARED_CONTROL_BORDER_RADIUS,
    })
  })

  it('allows big menu buttons to keep the moderate shared radius', () => {
    renderWithTheme(<BigMenuButton>Upload file</BigMenuButton>)

    const bigButton = screen.getByText('Upload file').closest('label')

    expect(bigButton).toHaveStyle({
      borderRadius: SHARED_CONTROL_BORDER_RADIUS,
    })
  })
})
