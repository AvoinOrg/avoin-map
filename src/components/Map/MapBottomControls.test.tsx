import React from 'react'
import '@testing-library/jest-dom'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

import { SlotsProvider } from '#/components/context/slotsContext'
import MapBottomControls from './MapBottomControls'

const Provider = jest.requireActual(
  '#/common/style/theme/App' + 'T' + 'hemeProvider'
).default as React.ComponentType<{ children: React.ReactNode }>

type MapEventHandler = (event?: object) => void

const mapHandlers = new Map<string, MapEventHandler[]>()
const mockMap = {
  on: jest.fn((eventName: string, handler: MapEventHandler) => {
    mapHandlers.set(eventName, [
      ...(mapHandlers.get(eventName) ?? []),
      handler,
    ])
  }),
  off: jest.fn((eventName: string, handler: MapEventHandler) => {
    mapHandlers.set(
      eventName,
      (mapHandlers.get(eventName) ?? []).filter((item) => item !== handler)
    )
  }),
}

const mockMapState = {
  mapAttributionHtml: '<p>Map attribution</p>',
}

const mockUIState = {
  isSidebarOpen: false,
  sidebarWidth: 0,
  sidebarBoundaries: {},
}

jest.mock('#/common/hooks/ui/useIsMobile', () => ({
  useIsMobile: () => false,
}))

jest.mock('#/common/store', () => ({
  useMapStore: (selector: (state: typeof mockMapState) => unknown) =>
    selector(mockMapState),
  useUIStore: (selector: (state: typeof mockUIState) => unknown) =>
    selector(mockUIState),
}))

jest.mock('#/common/store/mapStore/mapInstanceStore', () => ({
  useMapInstanceStore: (selector: (state: { _map: typeof mockMap }) => unknown) =>
    selector({ _map: mockMap }),
}))

jest.mock('#/common/utils/sidebarBoundaryRegistry', () => ({
  selectActiveSidebarBoundaryId: () => null,
  selectActiveSidebarMode: () => null,
}))

const renderWithProviders = (ui: React.ReactElement) =>
  render(
    <Provider>
      <SlotsProvider>{ui}</SlotsProvider>
    </Provider>
  )

const emitMapEvent = (eventName: string, event?: object) => {
  for (const handler of mapHandlers.get(eventName) ?? []) {
    handler(event)
  }
}

describe('MapBottomControls', () => {
  beforeEach(() => {
    mapHandlers.clear()
    mockMap.on.mockClear()
    mockMap.off.mockClear()
  })

  it('closes the attribution panel on map events without originalEvent data', async () => {
    renderWithProviders(<MapBottomControls />)

    expect(screen.getByText('Map attribution')).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Toggle attribution information',
      })
    )
    expect(screen.queryByText('Map attribution')).not.toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Toggle attribution information',
      })
    )
    expect(screen.getByText('Map attribution')).toBeInTheDocument()

    await waitFor(() => expect(mockMap.on).toHaveBeenCalledWith('click', expect.any(Function)))

    act(() => {
      emitMapEvent('click', {})
    })

    expect(screen.queryByText('Map attribution')).not.toBeInTheDocument()
  })
})
