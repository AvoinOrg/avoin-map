import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { AppThemeProvider } from '#/common/style/theme'
import ClickableModal from './ClickableModal'

const renderWithTheme = (ui: React.ReactElement) =>
  render(<AppThemeProvider>{ui}</AppThemeProvider>)

describe('ClickableModal', () => {
  it('opens from the trigger, renders the modal body, and closes from the close button', async () => {
    renderWithTheme(
      <ClickableModal
        triggerAriaLabel="Open fixture modal"
        modalBody={<div>Modal fixture body</div>}
      >
        Open
      </ClickableModal>
    )

    expect(screen.queryByRole('dialog')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Open fixture modal' }))

    expect(
      await screen.findByRole('dialog', { name: 'Open fixture modal' })
    ).toBeTruthy()
    expect(screen.getByText('Modal fixture body')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'close' }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })
})
