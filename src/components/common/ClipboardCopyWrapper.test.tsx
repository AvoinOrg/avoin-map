import React from 'react'
import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { AppThemeProvider } from '#/common/style/theme'
import { useUIStore } from '#/common/store/uiStore'
import ClipboardCopyWrapper from './ClipboardCopyWrapper'

jest.mock('@tolgee/react', () => ({
  useTranslate: () => ({
    t: (key: string) => `translated:${key}`,
  }),
}))

const renderWithTheme = (ui: React.ReactElement) =>
  render(<AppThemeProvider>{ui}</AppThemeProvider>)

describe('ClipboardCopyWrapper', () => {
  const originalNotify = useUIStore.getState().notify
  const writeText = jest.fn()
  const notify = jest.fn()

  beforeAll(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText,
      },
    })
  })

  beforeEach(() => {
    writeText.mockReset()
    notify.mockReset()
    useUIStore.setState({ notify })
  })

  afterAll(() => {
    useUIStore.setState({ notify: originalNotify })
  })

  it('writes to the clipboard and shows an info notification on success', async () => {
    writeText.mockResolvedValueOnce(undefined)

    renderWithTheme(
      <ClipboardCopyWrapper textToCopy="copy me">
        Copy value
      </ClipboardCopyWrapper>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Copy to clipboard' }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('copy me')
      expect(notify).toHaveBeenCalledWith({
        message: 'translated:general.messages.clipboard_success',
        variant: 'info',
      })
    })
  })

  it('shows an error notification on clipboard failure', async () => {
    writeText.mockRejectedValueOnce(new Error('denied'))

    renderWithTheme(
      <ClipboardCopyWrapper textToCopy="copy me">
        Copy value
      </ClipboardCopyWrapper>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Copy to clipboard' }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('copy me')
      expect(notify).toHaveBeenCalledWith({
        message: 'translated:general.messages.clipboard_fail',
        variant: 'error',
      })
    })
  })

  it('does not write or notify while disabled', () => {
    renderWithTheme(
      <ClipboardCopyWrapper disabled textToCopy="copy me">
        Copy value
      </ClipboardCopyWrapper>
    )

    const button = screen.getByRole('button', { name: 'Copy to clipboard' })

    fireEvent.click(button)

    expect(button).toBeDisabled()
    expect(writeText).not.toHaveBeenCalled()
    expect(notify).not.toHaveBeenCalled()
  })
})
