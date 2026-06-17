import React from 'react'
import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'

import { AppThemeProvider } from '#/common/style/theme'
import IconWithText from './IconWithText'
import { InfoCircle } from '#/components/icons'

const renderWithTheme = (ui: React.ReactElement) =>
  render(<AppThemeProvider>{ui}</AppThemeProvider>)

describe('IconWithText', () => {
  it('activates on click, Enter, and Space when interactive', () => {
    const onClick = jest.fn()

    renderWithTheme(
      <IconWithText icon={<InfoCircle aria-hidden="true" />} onClick={onClick}>
        Open layer
      </IconWithText>
    )

    const button = screen.getByRole('button', { name: 'Open layer' })

    fireEvent.click(button)
    fireEvent.keyDown(button, { key: 'Enter' })
    fireEvent.keyDown(button, { key: ' ' })

    expect(onClick).toHaveBeenCalledTimes(3)
  })

  it('suppresses click and keyboard activation while disabled', () => {
    const onClick = jest.fn()

    renderWithTheme(
      <IconWithText
        disabled
        icon={<InfoCircle aria-hidden="true" />}
        onClick={onClick}
      >
        Disabled layer
      </IconWithText>
    )

    const button = screen.getByRole('button', { name: 'Disabled layer' })

    fireEvent.click(button)
    fireEvent.keyDown(button, { key: 'Enter' })
    fireEvent.keyDown(button, { key: ' ' })

    expect(button).toHaveAttribute('aria-disabled', 'true')
    expect(button).toHaveAttribute('tabindex', '-1')
    expect(onClick).not.toHaveBeenCalled()
  })

  it('uses an explicit aria label when supplied', () => {
    renderWithTheme(
      <IconWithText
        ariaLabel="Open layer controls"
        icon={<InfoCircle aria-hidden="true" />}
        onClick={jest.fn()}
      >
        Controls
      </IconWithText>
    )

    expect(
      screen.getByRole('button', { name: 'Open layer controls' })
    ).toBeInTheDocument()
  })
})
