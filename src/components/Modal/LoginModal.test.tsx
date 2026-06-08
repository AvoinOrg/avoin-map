import '#/test/baseUiTestPolyfills'
import React from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

import { useUIStore } from '#/common/store/uiStore'
import { LoginModal } from './LoginModal'

describe('LoginModal', () => {
  beforeEach(() => {
    useUIStore.setState({
      isLoginModalOpen: false,
      isSidebarOpen: true,
      sidebarWidth: 200,
    })
  })

  it('opens from UI store state and closes through the dialog close button', async () => {
    render(<LoginModal />)

    expect(screen.queryByTitle('My iframe Example')).not.toBeInTheDocument()

    act(() => {
      useUIStore.getState().setIsLoginModalOpen(true)
    })

    expect(screen.getByTitle('My iframe Example')).toHaveAttribute(
      'src',
      '/en/adds/login'
    )

    fireEvent.click(screen.getByRole('button', { name: 'Close login modal' }))

    await waitFor(() => {
      expect(useUIStore.getState().isLoginModalOpen).toBe(false)
    })
  })
})
