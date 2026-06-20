import React from 'react'
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'

import { useUIStore } from '#/common/store/uiStore'
import { AppThemeProvider } from '#/common/style/theme'
import { LoginModal } from './LoginModal'

const renderWithTheme = (ui: React.ReactElement) =>
  render(<AppThemeProvider>{ui}</AppThemeProvider>)

const resetLoginModalState = () => {
  act(() => {
    useUIStore.setState({
      isLoginModalOpen: false,
      isSidebarOpen: true,
      sidebarWidth: undefined,
    })
  })
}

describe('LoginModal', () => {
  beforeEach(() => {
    resetLoginModalState()
  })

  afterEach(() => {
    resetLoginModalState()
  })

  it('renders from the UI store and closes through the dialog close control', async () => {
    act(() => {
      useUIStore.setState({
        isLoginModalOpen: true,
        isSidebarOpen: true,
        sidebarWidth: 360,
      })
    })

    renderWithTheme(<LoginModal iframeSrc="about:blank" />)

    expect(await screen.findByRole('dialog', { name: 'Login modal' }))
      .toBeTruthy()
    expect(screen.getByTitle('Login modal content')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Close login modal' }))

    await waitFor(() => {
      expect(useUIStore.getState().isLoginModalOpen).toBe(false)
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })
})
