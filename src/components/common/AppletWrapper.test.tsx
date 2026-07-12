import React from 'react'
import { render, waitFor } from '@testing-library/react'

import { defaultListedLayerGroups } from '#/components/Map/layers/defaultListedLayerGroups'
import AppletWrapper from '#/components/common/AppletWrapper'

const setMapContext = jest.fn()
const setListedLayerGroups = jest.fn()

const mapStoreState = {
  mapContext: 'main',
  setMapContext,
  setListedLayerGroups,
  fitBounds: jest.fn(),
  easeTo: jest.fn(),
}

const uiStoreState = {
  searchCountryCodes: ['FI'],
  setSearchCountryCodes: jest.fn(),
  setIsBaseDomainForApplet: jest.fn(),
  setIsNavbarHidden: jest.fn(),
  setSidebarHeaderConfig: jest.fn(),
}

jest.mock('#/common/store', () => ({
  useMapStore: (selector: (state: typeof mapStoreState) => unknown) =>
    selector(mapStoreState),
  useUIStore: (selector: (state: typeof uiStoreState) => unknown) =>
    selector(uiStoreState),
}))

jest.mock('#/common/hooks/map/useExclusiveLayerGroups', () => ({
  useExclusiveLayerGroups: jest.fn(),
}))

jest.mock('@tolgee/react', () => ({
  useTolgee: () => ({
    isLoaded: () => true,
    addActiveNs: jest.fn(),
    removeActiveNs: jest.fn(),
    getAllRecords: () => [{ namespace: 'ui-baseline' }],
  }),
}))

describe('AppletWrapper listed-layer initialization', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.history.replaceState({}, '', '/en/ui-baseline')
  })

  it('sets map context before a supplied list and preserves visibility by default', async () => {
    const suppliedListedLayerGroups = [defaultListedLayerGroups[0]]

    render(
      <AppletWrapper
        mapContext="ui-baseline"
        listedLayerGroups={suppliedListedLayerGroups}
      >
        Fixture
      </AppletWrapper>
    )

    await waitFor(() => {
      expect(setListedLayerGroups).toHaveBeenCalledTimes(1)
    })

    expect(setMapContext).toHaveBeenCalledTimes(1)
    expect(setMapContext).toHaveBeenCalledWith('ui-baseline')
    expect(setListedLayerGroups).toHaveBeenCalledWith(
      suppliedListedLayerGroups,
      false
    )
    expect(setMapContext.mock.invocationCallOrder[0]).toBeLessThan(
      setListedLayerGroups.mock.invocationCallOrder[0]
    )
  })

  it('uses the shared default list through the same visibility-preserving path', async () => {
    render(<AppletWrapper mapContext="main">Fixture</AppletWrapper>)

    await waitFor(() => {
      expect(setListedLayerGroups).toHaveBeenCalledTimes(1)
    })

    expect(setMapContext).toHaveBeenCalledTimes(1)
    expect(setListedLayerGroups).toHaveBeenCalledWith(
      defaultListedLayerGroups,
      false
    )
    expect(setMapContext.mock.invocationCallOrder[0]).toBeLessThan(
      setListedLayerGroups.mock.invocationCallOrder[0]
    )
  })

  it('passes the visibility-reset opt-in without adding a competing call', async () => {
    const suppliedListedLayerGroups = [defaultListedLayerGroups[0]]

    render(
      <AppletWrapper
        mapContext="ui-baseline"
        listedLayerGroups={suppliedListedLayerGroups}
        resetListedLayerVisibility
      >
        Fixture
      </AppletWrapper>
    )

    await waitFor(() => {
      expect(setListedLayerGroups).toHaveBeenCalledTimes(1)
    })

    expect(setMapContext).toHaveBeenCalledTimes(1)
    expect(setListedLayerGroups).toHaveBeenCalledWith(
      suppliedListedLayerGroups,
      true
    )
    expect(setMapContext.mock.invocationCallOrder[0]).toBeLessThan(
      setListedLayerGroups.mock.invocationCallOrder[0]
    )
  })
})
