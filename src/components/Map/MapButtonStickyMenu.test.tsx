import React from 'react'
import '#/test/baseUiTestPolyfills'
import { act, fireEvent, render, screen } from '@testing-library/react'

import { useUIStore } from '#/common/store/uiStore'
import { Slot, SlotsProvider } from '#/components/context/slotsContext'
import { MapButton } from './MapButton'
import { MapButtonStickyMenu } from './MapButtonStickyMenu'

jest.mock('@tolgee/react', () => ({
  useTranslate: () => ({
    t: (key: string) => key,
  }),
}))

jest.mock('#/common/store', () => ({
  useUIStore: jest.requireActual('#/common/store/uiStore').useUIStore,
}))

jest.mock('#/components/common/SimpleTooltip', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactElement }) => children,
  SimpleTooltip: ({ children }: { children: React.ReactElement }) => children,
}))

jest.mock('./MapFloatingPanel', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- Jest hoists mock factories before the file-level React import is initialized.
  const React = require('react')

  const MockMapFloatingPanel = ({
    open,
    anchor,
    children,
    onClose,
  }: {
    open: boolean
    anchor: (() => Element | null) | Element | null
    children: React.ReactNode
    onClose: () => void
  }) => {
    const resolvedAnchor =
      typeof anchor === 'function' ? anchor() : anchor ?? null

    if (!open || resolvedAnchor == null) {
      return null
    }

    return React.createElement(
      'div',
      { 'data-testid': 'sticky-floating-panel' },
      children,
      React.createElement(
        'button',
        { type: 'button', onClick: onClose },
        'mock-close'
      )
    )
  }

  return {
    __esModule: true,
    default: MockMapFloatingPanel,
  }
})

const renderStickyMenu = ({
  isActive,
  disabled = false,
}: {
  isActive: boolean
  disabled?: boolean
}) => (
  <SlotsProvider>
    <Slot name="map-sticky-menu-toggle" />
    <MapButtonStickyMenu
      isVertical
      isActive={isActive}
      menuContent={<div>Corridor settings</div>}
      showTooltip="Show corridor settings"
      menuTitle="Corridor"
    >
      <MapButton tooltip="Draw corridor" disabled={disabled} isVertical>
        Draw
      </MapButton>
    </MapButtonStickyMenu>
  </SlotsProvider>
)

describe('MapButtonStickyMenu', () => {
  beforeEach(() => {
    useUIStore.setState({ activeMapMenu: undefined })
  })

  it('opens on the first active render after the slot anchor is available', async () => {
    render(renderStickyMenu({ isActive: true }))

    expect(await screen.findByText('Corridor settings')).toBeInTheDocument()
    expect(screen.getByTestId('sticky-floating-panel')).toBeInTheDocument()
  })

  it('reopens after the user hides it and then re-enters active mode', async () => {
    const { rerender } = render(renderStickyMenu({ isActive: true }))

    expect(await screen.findByText('Corridor settings')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'map.menu.hide' }))

    expect(screen.queryByTestId('sticky-floating-panel')).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Show corridor settings' })
    ).toBeInTheDocument()

    rerender(renderStickyMenu({ isActive: false }))
    expect(screen.queryByTestId('sticky-floating-panel')).not.toBeInTheDocument()

    rerender(renderStickyMenu({ isActive: true }))

    expect(await screen.findByText('Corridor settings')).toBeInTheDocument()
  })

  it('closes during active map menu suppression and waits for an explicit show click', async () => {
    act(() => {
      useUIStore.setState({ activeMapMenu: 'backgroundLayers' })
    })

    render(renderStickyMenu({ isActive: true }))

    expect(screen.queryByTestId('sticky-floating-panel')).not.toBeInTheDocument()

    act(() => {
      useUIStore.setState({ activeMapMenu: undefined })
    })

    expect(screen.queryByTestId('sticky-floating-panel')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Show corridor settings' }))

    expect(await screen.findByText('Corridor settings')).toBeInTheDocument()
  })
})
