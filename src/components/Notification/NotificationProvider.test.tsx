import '#/test/baseUiTestPolyfills'
import React from 'react'
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'

import { useUIStore } from '#/common/store/uiStore'
import NotificationProvider from './NotificationProvider'

jest.mock('@tolgee/react', () => ({
  useTranslate: () => ({
    t: (key: string) => key,
  }),
}))

describe('NotificationProvider', () => {
  beforeEach(() => {
    useUIStore.setState({ notifications: {} })
  })

  it('renders notification links and closes through the close action', async () => {
    render(
      <NotificationProvider>
        <div>App</div>
      </NotificationProvider>
    )

    await act(async () => {
      await useUIStore.getState().notify({
        message: 'Copied',
        variant: 'info',
        persist: true,
        link: {
          href: '/report',
          label: 'Open report',
        },
      })
    })

    expect(await screen.findByText('Copied')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open report' })).toHaveAttribute(
      'href',
      '/report'
    )

    fireEvent.click(screen.getByRole('button', { name: 'Close notification' }))

    await waitFor(() => {
      expect(screen.queryByText('Copied')).not.toBeInTheDocument()
    })
  })
})
