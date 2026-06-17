import React from 'react'
import '@testing-library/jest-dom'
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'

import { AppThemeProvider } from '#/common/style/theme'
import IconTextButton from './IconTextButton'
import { InfoCircle } from '#/components/icons'

const renderWithTheme = (ui: React.ReactElement) =>
  render(<AppThemeProvider>{ui}</AppThemeProvider>)

const renderButton = ({
  disabled = false,
  onClick = jest.fn(),
}: {
  disabled?: boolean
  onClick?: jest.Mock
} = {}) => {
  renderWithTheme(
    <IconTextButton
      disabled={disabled}
      icon={<InfoCircle aria-hidden="true" />}
      text="Open report"
      helperText="This opens the report."
      onClick={onClick}
    />
  )

  return onClick
}

describe('IconTextButton', () => {
  it('derives the main button accessible name from string text', () => {
    renderButton()

    expect(
      screen.getByRole('button', { name: 'Open report' })
    ).toBeInTheDocument()
  })

  it('calls the main action from the main button', () => {
    const onClick = renderButton()

    fireEvent.click(screen.getByRole('button', { name: 'Open report' }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('opens the helper without invoking the main action', async () => {
    const onClick = renderButton()

    fireEvent.click(
      screen.getByRole('button', { name: 'Show more information' })
    )

    expect(onClick).not.toHaveBeenCalled()
    expect(await screen.findByText('This opens the report.')).toBeInTheDocument()
  })

  it('closes the helper on Escape', async () => {
    renderButton()

    fireEvent.click(
      screen.getByRole('button', { name: 'Show more information' })
    )

    expect(await screen.findByText('This opens the report.')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })

    await waitFor(() => {
      expect(screen.queryByText('This opens the report.')).not.toBeInTheDocument()
    })
  })

  it('disables the main action and helper trigger together', () => {
    const onClick = renderButton({ disabled: true })

    const mainButton = screen.getByRole('button', { name: 'Open report' })
    const helperButton = screen.getByRole('button', {
      name: 'Show more information',
    })

    fireEvent.click(mainButton)
    fireEvent.click(helperButton)

    expect(mainButton).toBeDisabled()
    expect(helperButton).toBeDisabled()
    expect(onClick).not.toHaveBeenCalled()
    expect(screen.queryByText('This opens the report.')).not.toBeInTheDocument()
  })
})
