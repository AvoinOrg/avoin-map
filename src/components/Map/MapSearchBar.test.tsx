import React from 'react'
import '@testing-library/jest-dom'
import { act, fireEvent, render, screen } from '@testing-library/react'
import axios from 'axios'

import { AppThemeProvider } from '#/common/style/theme'
import { MapSearchBar } from './MapSearchBar'

const mockMapState = {
  searchableDatas: {},
  fitBounds: jest.fn(),
  flyTo: jest.fn(),
}

const mockUIState = {
  activeMapMenu: undefined as string | undefined,
  searchCountryCodes: [] as string[],
  setMapMenuState: jest.fn((menu: string, open: boolean) => {
    mockUIState.activeMapMenu = open ? menu : undefined
  }),
}

jest.mock('@tolgee/react', () => ({
  useTranslate: () => ({
    t: (key: string) => key,
  }),
}))

jest.mock('#/common/navigation/navigation', () => ({
  useAppParams: () => ({ locale: 'en' }),
}))

jest.mock('axios')

jest.mock('#/common/store', () => ({
  useMapStore: (selector: (state: typeof mockMapState) => unknown) =>
    selector(mockMapState),
  useUIStore: (selector: (state: typeof mockUIState) => unknown) =>
    selector(mockUIState),
}))

jest.mock('#/common/store/mapStore/mapInstanceStore', () => ({
  useMapInstanceStore: (selector: (state: { _map: object }) => unknown) =>
    selector({ _map: {} }),
}))

jest.mock('#/common/utils/map', () => ({
  boundsFromNominatim: () => null,
  defaultFeatureDisplayPattern: () => [],
  defaultPointZoom: () => 12,
  getFeatureCenterCoordinates: () => null,
  zoomFromPlaceOptions: () => 12,
}))

const mockedAxios = axios as jest.Mocked<typeof axios>

const renderWithTheme = (ui: React.ReactElement) =>
  render(<AppThemeProvider>{ui}</AppThemeProvider>)

describe('MapSearchBar', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    mockedAxios.get.mockReset()
    mockMapState.searchableDatas = {}
    mockMapState.fitBounds.mockClear()
    mockMapState.flyTo.mockClear()
    mockUIState.activeMapMenu = undefined
    mockUIState.searchCountryCodes = []
    mockUIState.setMapMenuState.mockClear()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('aborts and invalidates pending remote search work when cleared', async () => {
    let capturedSignal: AbortSignal | undefined
    let resolveRemoteSearch:
      | ((response: { data: Array<{ place_id: string; display_name: string }> }) => void)
      | undefined

    mockedAxios.get.mockImplementation((_url, config) => {
      capturedSignal = config?.signal as AbortSignal | undefined

      return new Promise((resolve) => {
        resolveRemoteSearch = resolve
      })
    })

    renderWithTheme(<MapSearchBar isVertical={false} />)

    fireEvent.change(screen.getByRole('combobox', { name: 'map.search.placeholder' }), {
      target: { value: 'remote' },
    })

    await act(async () => {
      jest.advanceTimersByTime(300)
      await Promise.resolve()
    })

    expect(mockedAxios.get).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'map.search.clear_or_close' }))

    expect(capturedSignal?.aborted).toBe(true)
    expect(screen.getByRole('combobox', { name: 'map.search.placeholder' })).toHaveValue('')

    await act(async () => {
      resolveRemoteSearch?.({
        data: [
          {
            place_id: 'stale-remote-result',
            display_name: 'Stale Remote Result',
          },
        ],
      })
      await Promise.resolve()
    })

    expect(screen.queryByText('Stale Remote Result')).not.toBeInTheDocument()
  })
})
