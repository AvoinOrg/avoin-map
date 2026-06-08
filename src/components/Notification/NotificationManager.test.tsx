import '#/test/baseUiTestPolyfills'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'

import { useUIStore } from '#/common/store/uiStore'
import NotificationManager from './NotificationManager'

const mockAdd = jest.fn()

jest.mock('@base-ui/react/toast', () => ({
  Toast: {
    useToastManager: () => ({
      add: mockAdd,
    }),
  },
}))

jest.mock('@tolgee/react', () => ({
  useTranslate: () => ({
    t: (key: string, options?: { ns?: string }) =>
      options?.ns ? `${options.ns}:${key}` : key,
  }),
}))

describe('NotificationManager', () => {
  beforeEach(() => {
    mockAdd.mockClear()
    useUIStore.setState({ notifications: {} })
  })

  it('adds direct message notifications with custom duration', async () => {
    useUIStore.setState({
      notifications: {
        notificationA: {
          id: 'notificationA',
          message: 'Saved',
          variant: 'success',
          duration: 2500,
          triggeredTs: 1,
          shown: false,
        },
      },
    })

    const { rerender } = render(<NotificationManager />)

    await waitFor(() => {
      expect(mockAdd).toHaveBeenCalledTimes(1)
    })
    expect(mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'notificationA',
        type: 'success',
        timeout: 2500,
      })
    )
    expect(useUIStore.getState().notifications.notificationA.shown).toBe(true)

    rerender(<NotificationManager />)
    expect(mockAdd).toHaveBeenCalledTimes(1)
  })

  it('resolves notification and link translation keys and persists toasts', async () => {
    useUIStore.setState({
      notifications: {
        notificationB: {
          id: 'notificationB',
          keyName: 'notifications.saved',
          ns: 'hiilikartta',
          variant: 'info',
          duration: 6000,
          persist: true,
          triggeredTs: 1,
          shown: false,
          link: {
            href: '/report',
            keyName: 'notifications.open_report',
            ns: 'hiilikartta',
          },
        },
      },
    })

    render(<NotificationManager />)

    await waitFor(() => {
      expect(mockAdd).toHaveBeenCalledTimes(1)
    })

    const addOptions = mockAdd.mock.calls[0][0]
    expect(addOptions.timeout).toBe(0)

    render(addOptions.description)

    expect(screen.getByText('hiilikartta:notifications.saved'))
      .toBeInTheDocument()
    expect(screen.getByRole('link', {
      name: 'hiilikartta:notifications.open_report',
    })).toHaveAttribute('href', '/report')
  })

  it('warns and marks empty notifications shown without adding a toast', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

    useUIStore.setState({
      notifications: {
        notificationC: {
          id: 'notificationC',
          variant: 'warning',
          duration: 6000,
          triggeredTs: 1,
          shown: false,
        },
      },
    })

    render(<NotificationManager />)

    await waitFor(() => {
      expect(warnSpy).toHaveBeenCalledWith(
        '[NotificationManager] Notification missing message/keyName:',
        'notificationC'
      )
    })
    expect(mockAdd).not.toHaveBeenCalled()
    expect(useUIStore.getState().notifications.notificationC.shown).toBe(true)

    warnSpy.mockRestore()
  })
})
