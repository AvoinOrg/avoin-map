import React from 'react'
import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { MapGeoJSONFeature } from 'maplibre-gl'

import { useUIStore } from '#/common/store/uiStore'
import { AppThemeProvider } from '#/common/style/theme'
import { SlotsProvider } from '#/components/context/slotsContext'
import { SidebarBoundary, SidebarRoot } from '#/components/Sidebar'
import type {
  EnergymapBuildingInfoPanel,
  EnergymapBuildingInfoPanelId,
} from '../common/buildingInfo'
import {
  ENERGYMAP_BUILDING_POLYGONS_FILL_LAYER_ID,
  ENERGYMAP_BUILDING_POLYGONS_SOURCE_ID,
} from '../layers/buildingPolygonsLayerConf'
import { ENERGYMAP_BUILDING_POLYGONS_SOURCE_LAYER } from '../layers/buildingSource'
import { useAppletStore } from '../state/appletStore'
import EnergyHomePage from './EnergyHomePage'

const mockBuildingInfoPanelsByBuildingKey = new Map<
  string,
  EnergymapBuildingInfoPanel[]
>()
const mockBuildingInfoPanelFactoryKeys: Array<string | null> = []
let mockIsMobile = false
let mockDesktopWidthMatches = true

const mockMapState = {
  setFilter: jest.fn(async () => undefined),
  setLayoutProperty: jest.fn(async () => undefined),
  setPaintProperty: jest.fn(async () => undefined),
  enableLayerGroup: jest.fn(async () => undefined),
  setSelectedFeatures: jest.fn(),
  selectedFeatures: [] as MapGeoJSONFeature[],
  _layerGroups: {},
}

jest.mock('#/common/store', () => ({
  useMapStore: (selector: (state: typeof mockMapState) => unknown) =>
    selector(mockMapState),
  useUIStore: jest.requireActual('#/common/store/uiStore').useUIStore,
}))

jest.mock('#/common/hooks/map/useVisibleLayerGroupIds', () => ({
  useVisibleLayerGroupIds: () => ['energymap_building_polygons'],
}))

jest.mock('#/common/hooks/ui/useIsMobile', () => ({
  useIsMobile: () => mockIsMobile,
}))

jest.mock('../common/buildingInfo', () => ({
  createEnergymapBuildingInfoPanels: ({
    selectedBuilding,
  }: {
    selectedBuilding: { buildingKey: string } | null
  }) => {
    const buildingKey = selectedBuilding?.buildingKey ?? null

    mockBuildingInfoPanelFactoryKeys.push(buildingKey)
    return buildingKey == null
      ? null
      : (mockBuildingInfoPanelsByBuildingKey.get(buildingKey) ?? [])
  },
}))

jest.mock('#/common/navigation/navigation', () => ({
  useAppParams: () => ({ locale: 'fi' }),
}))

jest.mock('@tolgee/react', () => {
  const ReactRuntime = jest.requireActual<typeof import('react')>('react')

  return {
    T: ({ keyName }: { keyName: string }) =>
      ReactRuntime.createElement('span', null, keyName),
    useTranslate: () => ({
      t: (keyName: string) => keyName,
    }),
  }
})

jest.mock('overlayscrollbars-react', () => ({
  OverlayScrollbarsComponent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))

const resetUIStore = () => {
  useUIStore.setState({
    sidebarBoundaries: {},
    _sidebarBoundaryRegistrationOrder: 0,
    sidebarPanelExtensions: {},
    _sidebarPanelExtensionRegistrationOrder: 0,
    isSidebarOpen: true,
    sidebarWidth: undefined,
  })
}

const renderPage = () =>
  render(
    <AppThemeProvider disableCssBaseline>
      <SlotsProvider>
        <SidebarRoot>
          <SidebarBoundary id="energy-home-test" mode="floating">
            <EnergyHomePage locale="fi" />
          </SidebarBoundary>
        </SidebarRoot>
      </SlotsProvider>
    </AppThemeProvider>
  )

const createMapBuildingFeature = (buildingKey: string): MapGeoJSONFeature =>
  ({
    id: buildingKey,
    source: ENERGYMAP_BUILDING_POLYGONS_SOURCE_ID,
    sourceLayer: ENERGYMAP_BUILDING_POLYGONS_SOURCE_LAYER,
    layer: { id: ENERGYMAP_BUILDING_POLYGONS_FILL_LAYER_ID },
    properties: { building_key: buildingKey },
  }) as MapGeoJSONFeature

const createPanel = (
  id: EnergymapBuildingInfoPanelId
): EnergymapBuildingInfoPanel => ({
  id,
  title: { type: 'plain', text: `${id} title` },
  sections: [
    {
      id:
        id === 'energyConsumption'
          ? 'actualConsumption'
          : id === 'renovationRecommendations'
            ? 'certificateRecommendations'
            : 'buildingDetails',
      rows: [
        {
          id: `${id}Value`,
          label: { type: 'plain', text: `${id} label` },
          text: { type: 'plain', text: `${id} value` },
          status: 'real',
        },
      ],
    },
  ],
})

const completePanels = [
  createPanel('energyConsumption'),
  createPanel('renovationRecommendations'),
  createPanel('buildingDetails'),
]

const selectBuilding = ({
  buildingKey,
  panels,
}: {
  buildingKey: string
  panels: EnergymapBuildingInfoPanel[]
}) => {
  mockBuildingInfoPanelsByBuildingKey.set(buildingKey, panels)
  mockMapState.selectedFeatures = [createMapBuildingFeature(buildingKey)]
}

describe('EnergyHomePage', () => {
  const originalMatchMedia = window.matchMedia

  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: jest.fn().mockImplementation(() => ({
        matches: mockDesktopWidthMatches,
        media: '',
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    })
  })

  afterAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: originalMatchMedia,
    })
  })

  beforeEach(() => {
    resetUIStore()
    mockBuildingInfoPanelsByBuildingKey.clear()
    mockBuildingInfoPanelFactoryKeys.length = 0
    mockMapState.selectedFeatures = []
    mockIsMobile = false
    mockDesktopWidthMatches = true
    useAppletStore.getState().resetBuildingFilters()
    useAppletStore.getState().resetEnergyCertificateClassFilters()
    useAppletStore.getState().clearSelectedBuilding()
  })

  it('widens both accordion rows and keeps the expanded highlight aligned', () => {
    renderPage()

    const energyClassesButton = screen.getByRole('button', {
      name: 'sidebar.front_page.aria.toggle_energy_classes',
    })
    const heatingButton = screen.getByRole('button', {
      name: 'sidebar.front_page.aria.toggle_heating',
    })
    const thematicButtons = [energyClassesButton, heatingButton]

    thematicButtons.forEach((button) => {
      expect(button).toHaveStyle({
        width: 'calc(100% + 0.75rem)',
        marginLeft: '-0.375rem',
        marginRight: '-0.375rem',
      })
      expect(
        button.querySelector('[data-slot="layer-status-icon-slot"]')
      ).toHaveStyle({ justifyContent: 'flex-start' })
    })

    expect(energyClassesButton).not.toHaveStyle({
      backgroundColor: '#e6efff',
    })

    fireEvent.click(energyClassesButton)

    expect(energyClassesButton).toHaveAttribute('aria-expanded', 'true')
    expect(energyClassesButton).toHaveStyle({
      width: 'calc(100% + 0.75rem)',
      marginLeft: '-0.375rem',
      marginRight: '-0.375rem',
      backgroundColor: '#e6efff',
    })
  })

  it('registers the extension from filtered content and replaces it with sparse and empty topologies', async () => {
    selectBuilding({ buildingKey: 'complete', panels: completePanels })
    const view = renderPage()

    await screen.findByTestId('building-info-tab-page-basic')
    await waitFor(() => {
      expect(
        useUIStore.getState().sidebarPanelExtensions[
          'energiakartta-building-info-panel'
        ]?.runtimeOptions
      ).toMatchObject({
        desktopMainPanelWidth: '760px',
        layoutMode: 'default',
        visiblePanels: ['main'],
      })
    })
    expect(screen.getByRole('tablist')).toBeInTheDocument()

    selectBuilding({
      buildingKey: 'sparse',
      panels: [createPanel('buildingDetails')],
    })
    view.rerender(
      <AppThemeProvider disableCssBaseline>
        <SlotsProvider>
          <SidebarRoot>
            <SidebarBoundary id="energy-home-test" mode="floating">
              <EnergyHomePage locale="fi" />
            </SidebarBoundary>
          </SidebarRoot>
        </SlotsProvider>
      </AppThemeProvider>
    )

    await waitFor(() => {
      expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
      expect(screen.getByTestId('building-info-grid')).toHaveAttribute(
        'data-building-info-content-width',
        '380'
      )
      expect(
        screen.queryByText('renovationRecommendations value')
      ).not.toBeInTheDocument()
      expect(
        useUIStore.getState().sidebarPanelExtensions[
          'energiakartta-building-info-panel'
        ]?.runtimeOptions
      ).toMatchObject({ desktopMainPanelWidth: '380px' })
    })

    selectBuilding({ buildingKey: 'empty', panels: [] })
    view.rerender(
      <AppThemeProvider disableCssBaseline>
        <SlotsProvider>
          <SidebarRoot>
            <SidebarBoundary id="energy-home-test" mode="floating">
              <EnergyHomePage locale="fi" />
            </SidebarBoundary>
          </SidebarRoot>
        </SlotsProvider>
      </AppThemeProvider>
    )

    await waitFor(() => {
      expect(
        useUIStore.getState().sidebarPanelExtensions[
          'energiakartta-building-info-panel'
        ]
      ).toBeUndefined()
    })
    expect(
      screen.queryByTestId('building-info-tab-page-basic')
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('building-info-action-rail')
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'sidebar.front_page.footer.edit_building_details',
      })
    ).toHaveAttribute('data-mobile-building-info-action-count', '0')
  })

  it('never renders the previous building topology or collapsed state for a new map selection', async () => {
    selectBuilding({ buildingKey: 'building-a', panels: completePanels })
    const view = renderPage()

    await screen.findByTestId('building-info-tab-page-basic')
    fireEvent.click(
      screen.getByRole('tab', {
        name: 'sidebar.building_info.aria.open_renovation',
      })
    )
    await screen.findByTestId('building-info-tab-page-renovation')
    fireEvent.click(
      screen.getByRole('button', {
        name: 'sidebar.building_info.aria.collapse',
      })
    )
    await screen.findByTestId('building-info-action-rail')

    mockBuildingInfoPanelFactoryKeys.length = 0
    selectBuilding({
      buildingKey: 'building-b',
      panels: [createPanel('buildingDetails')],
    })
    view.rerender(
      <AppThemeProvider disableCssBaseline>
        <SlotsProvider>
          <SidebarRoot>
            <SidebarBoundary id="energy-home-test" mode="floating">
              <EnergyHomePage locale="fi" />
            </SidebarBoundary>
          </SidebarRoot>
        </SlotsProvider>
      </AppThemeProvider>
    )

    expect(mockBuildingInfoPanelFactoryKeys).not.toContain('building-a')
    expect(mockBuildingInfoPanelFactoryKeys).toContain('building-b')
    expect(
      screen.queryByTestId('building-info-action-rail')
    ).not.toBeInTheDocument()
    expect(screen.getByTestId('building-info-tab-page-basic')).toBeInTheDocument()
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
    expect(screen.getByText('buildingDetails value')).toBeInTheDocument()
    expect(
      screen.queryByText('renovationRecommendations value')
    ).not.toBeInTheDocument()

    mockBuildingInfoPanelFactoryKeys.length = 0
    mockMapState.selectedFeatures = []
    view.rerender(
      <AppThemeProvider disableCssBaseline>
        <SlotsProvider>
          <SidebarRoot>
            <SidebarBoundary id="energy-home-test" mode="floating">
              <EnergyHomePage locale="fi" />
            </SidebarBoundary>
          </SidebarRoot>
        </SlotsProvider>
      </AppThemeProvider>
    )

    expect(mockBuildingInfoPanelFactoryKeys).not.toContain('building-b')
    expect(mockBuildingInfoPanelFactoryKeys).toContain(null)
    expect(
      screen.queryByTestId('building-info-tab-page-basic')
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('building-info-action-rail')
    ).not.toBeInTheDocument()
  })

  it('replaces a sparse active tab with the complete building default topology', async () => {
    selectBuilding({
      buildingKey: 'sparse',
      panels: [
        createPanel('energyConsumption'),
        createPanel('renovationRecommendations'),
      ],
    })
    const view = renderPage()

    await screen.findByTestId('building-info-tab-page-basic')
    fireEvent.click(
      screen.getByRole('tab', {
        name: 'sidebar.building_info.aria.open_renovation',
      })
    )
    await screen.findByTestId('building-info-tab-page-renovation')
    await waitFor(() => {
      expect(
        useUIStore.getState().sidebarPanelExtensions[
          'energiakartta-building-info-panel'
        ]?.runtimeOptions
      ).toMatchObject({ desktopMainPanelWidth: '1000px' })
    })

    selectBuilding({ buildingKey: 'complete', panels: completePanels })
    view.rerender(
      <AppThemeProvider disableCssBaseline>
        <SlotsProvider>
          <SidebarRoot>
            <SidebarBoundary id="energy-home-test" mode="floating">
              <EnergyHomePage locale="fi" />
            </SidebarBoundary>
          </SidebarRoot>
        </SlotsProvider>
      </AppThemeProvider>
    )

    await screen.findByTestId('building-info-tab-page-basic')
    expect(
      screen.queryByTestId('building-info-tab-page-renovation')
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('tab', {
        name: 'sidebar.building_info.aria.open_overview',
      })
    ).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByTestId('building-info-grid')).toHaveAttribute(
      'data-building-info-content-width',
      '760'
    )
    expect(screen.getByTestId('building-info-grid-row-basic')).toHaveAttribute(
      'data-grid-region-count',
      '2'
    )
    expect(
      screen.getByTestId('building-info-panel-buildingDetails')
    ).toBeInTheDocument()
    await waitFor(() => {
      expect(
        useUIStore.getState().sidebarPanelExtensions[
          'energiakartta-building-info-panel'
        ]?.runtimeOptions
      ).toMatchObject({ desktopMainPanelWidth: '760px' })
    })

    mockIsMobile = true
    view.rerender(
      <AppThemeProvider disableCssBaseline>
        <SlotsProvider>
          <SidebarRoot>
            <SidebarBoundary id="energy-home-test" mode="floating">
              <EnergyHomePage locale="fi" />
            </SidebarBoundary>
          </SidebarRoot>
        </SlotsProvider>
      </AppThemeProvider>
    )

    await screen.findByTestId('building-info-tab-page-basic')
    expect(screen.queryByTestId('building-info-grid')).not.toBeInTheDocument()
    expect(
      screen
        .getAllByTestId(/building-info-panel-/)
        .map((panel) => panel.dataset.panelId)
    ).toEqual(['energyConsumption', 'buildingDetails'])
  })

  it('reserves mobile footer space for the actual collapsed action count', async () => {
    mockIsMobile = true
    selectBuilding({
      buildingKey: 'mobile-sparse',
      panels: [createPanel('buildingDetails')],
    })
    renderPage()

    await screen.findByTestId('building-info-tab-page-basic')
    fireEvent.click(
      screen.getByRole('button', {
        name: 'sidebar.building_info.aria.collapse',
      })
    )

    await screen.findByTestId('building-info-action-rail')
    expect(
      screen.getByTestId('building-info-action-rail').querySelectorAll('button')
    ).toHaveLength(1)
    expect(
      screen.getByRole('button', {
        name: 'sidebar.front_page.footer.edit_building_details',
      })
    ).toHaveAttribute('data-mobile-building-info-action-count', '1')
  })

  it('uses fullscreen fallback from the active topology width', async () => {
    mockDesktopWidthMatches = false
    selectBuilding({ buildingKey: 'fallback', panels: completePanels })
    renderPage()

    await waitFor(() => {
      expect(
        useUIStore.getState().sidebarPanelExtensions[
          'energiakartta-building-info-panel'
        ]?.runtimeOptions
      ).toMatchObject({
        layoutMode: 'fullscreen',
        replaceBaseSidebar: true,
      })
    })
    expect(
      useUIStore.getState().sidebarPanelExtensions[
        'energiakartta-building-info-panel'
      ]?.runtimeOptions.desktopMainPanelWidth
    ).toBeUndefined()
  })
})
