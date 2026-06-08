import '#/test/baseUiTestPolyfills'
import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import ClickableModal from './ClickableModal'

describe('ClickableModal', () => {
  it('opens from the trigger and closes from the close button', async () => {
    render(
      <ClickableModal
        triggerAriaLabel="Open details"
        modalBody={<div>Modal details</div>}
      >
        Read more
      </ClickableModal>
    )

    expect(screen.queryByText('Modal details')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Open details' }))

    expect(screen.getByText('Modal details')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'close' }))

    await waitFor(() => {
      expect(screen.queryByText('Modal details')).not.toBeInTheDocument()
    })
  })
})
