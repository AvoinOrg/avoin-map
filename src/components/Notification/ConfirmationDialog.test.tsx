import '#/test/baseUiTestPolyfills'
import React from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

import { useUIStore } from '#/common/store/uiStore'
import ConfirmationDialog from './ConfirmationDialog'

jest.mock('@tolgee/react', () => ({
  useTranslate: () => ({
    t: (key: string) => key,
  }),
}))

describe('ConfirmationDialog', () => {
  beforeEach(() => {
    useUIStore.setState({
      confirmationDialogOptions: { id: null },
    })
  })

  it('renders store-triggered content and calls confirm after closing', async () => {
    const onConfirm = jest.fn()

    render(<ConfirmationDialog />)

    await act(async () => {
      await useUIStore.getState().triggerConfirmationDialog({
        title: 'Delete item',
        content: 'This cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Keep',
        onConfirm,
      })
    })

    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    expect(screen.getByText('Delete item')).toBeInTheDocument()
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    })
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('resolves default labels and calls cancel', async () => {
    const onCancel = jest.fn()

    render(<ConfirmationDialog />)

    await act(async () => {
      await useUIStore.getState().triggerConfirmationDialog({
        title: 'Leave page?',
        onCancel,
      })
    })

    fireEvent.click(
      screen.getByRole('button', {
        name: 'components.confirmation_dialog.cancel',
      })
    )

    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    })
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(
      screen.queryByRole('button', {
        name: 'components.confirmation_dialog.confirm',
      })
    ).not.toBeInTheDocument()
  })
})
