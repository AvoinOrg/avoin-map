import React from 'react'
import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'

import { useUIStore } from '#/common/store/uiStore'
import { AppThemeProvider } from '#/common/style/theme'
import { SlotsProvider } from '#/components/context/slotsContext'
import { SidebarBoundary } from '#/components/Sidebar'
import { useAppletStore } from '../state/appletStore'
import EnergyHomePage from './EnergyHomePage'

const mockMapState = {
  setFilter: jest.fn(async () => undefined),
  setLayoutProperty: jest.fn(async () => undefined),
  setPaintProperty: jest.fn(async () => undefined),
  enableLayerGroup: jest.fn(async () => undefined),
  setSelectedFeatures: jest.fn(),
  selectedFeatures: [],
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
  useIsMobile: () => false,
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
        <SidebarBoundary id="energy-home-test" mode="none">
          <EnergyHomePage locale="fi" />
        </SidebarBoundary>
      </SlotsProvider>
    </AppThemeProvider>
  )

describe('EnergyHomePage thematic layer rows', () => {
  const originalMatchMedia = window.matchMedia

  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: jest.fn().mockImplementation(() => ({
        matches: true,
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
})
