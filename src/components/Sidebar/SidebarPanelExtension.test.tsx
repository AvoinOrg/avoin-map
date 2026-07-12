import React from 'react'
import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { PartialOptions } from 'overlayscrollbars'

import { MAP_CONTROL_EDGE_GUTTER_PX } from '#/common/constants/map'
import { AppThemeProvider } from '#/common/style/theme'
import theme from '#/common/style/theme/theme'
import { useUIStore } from '#/common/store/uiStore'
import type {
  SidebarPanelExtensionRuntimeOptions,
  SidebarPanelExtensionTabMetadata,
} from '#/common/types/sidebar'
import { SlotsProvider } from '#/components/context/slotsContext'

import {
  getSidebarPanelExtensionPageControlsRight,
  getSidebarPanelExtensionMainPanelWidth,
  SidebarPanelExtension,
  SidebarPanelExtensionTabRail,
} from './SidebarPanelExtension'
import { SidebarPanelExtensionPageContainer } from './SidebarPanelExtensionPageContainer'
import { SidebarPanelExtensionProvider } from './SidebarPanelExtensionProvider'
import { SidebarPanelExtensionTabIconButton } from './SidebarPanelExtensionTabIconButton'
import { SidebarPanelExtensionTabContainer } from './SidebarPanelExtensionTabContainer'
import { SidebarRoot } from './SidebarRoot'
import { SidebarPanelExtensionContextProvider } from './sidebarPanelExtensionContext'
import { IntoSidebarPanelExtensionPanelSlot } from './sidebarSlots'

jest.mock('#/common/store', () => ({
  useUIStore: jest.requireActual('#/common/store/uiStore').useUIStore,
}))

let mockIsMobile = false

jest.mock('#/common/hooks/ui/useIsMobile', () => ({
  useIsMobile: () => mockIsMobile,
}))

type MockOverlayScrollbarsProps = React.HTMLAttributes<HTMLDivElement> & {
  options?: PartialOptions
  style?: React.CSSProperties
}

jest.mock('overlayscrollbars-react', () => {
  const mockReact = jest.requireActual<typeof import('react')>('react')

  return {
    OverlayScrollbarsComponent: mockReact.forwardRef<
      unknown,
      MockOverlayScrollbarsProps
    >(
      (
        {
          children,
          className,
          options,
          style,
          ...props
        },
        ref
      ) => {
        mockReact.useImperativeHandle(ref, () => ({
          osInstance: () => ({
            elements: () => ({ viewport: { scrollTop: 0 } }),
            state: () => ({ hasOverflow: { y: false } }),
          }),
        }))

        return mockReact.createElement(
          'div',
          {
            ...props,
            className,
            style,
            'data-auto-hide': options?.scrollbars?.autoHide,
            'data-scrollbar-visibility': options?.scrollbars?.visibility,
            'data-scrollbar-theme': options?.scrollbars?.theme,
            'data-overflow-x': options?.overflow?.x,
            'data-overflow-y': options?.overflow?.y,
          },
          children
        )
      }
    ),
  }
})

const resetUIStore = () => {
  useUIStore.setState({
    sidebarBoundaries: {},
    _sidebarBoundaryRegistrationOrder: 0,
    sidebarPanelExtensions: {},
    _sidebarPanelExtensionRegistrationOrder: 0,
    isSidebarOpen: true,
    isSidebarDisabled: false,
    isSidebarLoading: false,
    sidebarHeaderConfig: { title: 'Test sidebar' },
    sidebarWidth: undefined,
  })
}

const SidebarPanelExtensionTestProviders = ({
  children,
}: {
  children: React.ReactNode
}) => (
  <AppThemeProvider disableCssBaseline>
    <SlotsProvider>{children}</SlotsProvider>
  </AppThemeProvider>
)

const renderSidebarPanelExtension = (
  children: React.ReactNode,
  initialRuntimeOptions: SidebarPanelExtensionRuntimeOptions = {
    visiblePanels: ['main'],
    activePanel: 'main',
  }
) =>
  render(
    <SidebarPanelExtensionTestProviders>
      <SidebarRoot>
        <SidebarPanelExtensionProvider
          id="test-extension"
          initialRuntimeOptions={initialRuntimeOptions}
        >
          <IntoSidebarPanelExtensionPanelSlot panelId="main">
            {children}
          </IntoSidebarPanelExtensionPanelSlot>
        </SidebarPanelExtensionProvider>
      </SidebarRoot>
    </SidebarPanelExtensionTestProviders>
  )

const renderPageControlsGeometry = ({
  options,
  sidebarOffset = 0,
  desktopTabRail = <div>Geometry tabs</div>,
}: {
  options: SidebarPanelExtensionRuntimeOptions
  sidebarOffset?: number
  desktopTabRail?: React.ReactNode
}) => {
  const onCollapse = jest.fn()
  const onClose = jest.fn()

  render(
    <SidebarPanelExtensionTestProviders>
      <SidebarPanelExtensionContextProvider
        value={{ extensionId: 'geometry-extension', depth: 0 }}
      >
        <IntoSidebarPanelExtensionPanelSlot panelId="main">
          <SidebarPanelExtensionPageContainer
            onCollapse={onCollapse}
            onClose={onClose}
          >
            <div>Geometry page content</div>
          </SidebarPanelExtensionPageContainer>
        </IntoSidebarPanelExtensionPanelSlot>
        <SidebarPanelExtension
          extensionId="geometry-extension"
          options={options}
          sidebarOffset={sidebarOffset}
          desktopTabRail={desktopTabRail}
        />
      </SidebarPanelExtensionContextProvider>
    </SidebarPanelExtensionTestProviders>
  )

  return { onCollapse, onClose }
}

const createDomRect = ({
  left,
  right,
}: {
  left: number
  right: number
}): DOMRect => ({
  x: left,
  y: 0,
  width: right - left,
  height: 900,
  top: 0,
  right,
  bottom: 900,
  left,
  toJSON: () => ({}),
})

describe('SidebarPanelExtension generic tab helpers', () => {
  beforeEach(() => {
    mockIsMobile = false
    resetUIStore()
  })

  it('registers multiple tab containers, shows a tab rail, and switches panels', async () => {
    renderSidebarPanelExtension(
      <>
        <SidebarPanelExtensionTabContainer tabId="summary" tabName="Summary">
          <div>Summary panel content</div>
        </SidebarPanelExtensionTabContainer>
        <SidebarPanelExtensionTabContainer
          tabId="details"
          tabName="Details"
          tabIcon={<span data-testid="custom-details-icon">D</span>}
        >
          <div>Details panel content</div>
        </SidebarPanelExtensionTabContainer>
      </>
    )

    expect(await screen.findByText('Summary panel content')).toBeInTheDocument()
    expect(screen.queryByText('Details panel content')).not.toBeInTheDocument()
    expect(
      screen.getByRole('tablist', { name: /sidebar panel extension tabs/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Summary' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    expect(screen.getByRole('tab', { name: 'Details' })).toHaveAttribute(
      'aria-selected',
      'false'
    )
    expect(screen.getByTestId('custom-details-icon')).toBeInTheDocument()
    expect(screen.getAllByTestId('sidebar-panel-extension-default-tab-icon')).toHaveLength(
      1
    )

    fireEvent.click(screen.getByRole('tab', { name: 'Details' }))

    expect(await screen.findByText('Details panel content')).toBeInTheDocument()
    expect(screen.queryByText('Summary panel content')).not.toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Details' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })

  it('keeps tabs registered through Strict Mode effect cleanup replay', async () => {
    render(
      <SidebarPanelExtensionTestProviders>
        <React.StrictMode>
          <SidebarRoot>
            <SidebarPanelExtensionProvider
              id="strict-mode-extension"
              initialRuntimeOptions={{
                visiblePanels: ['main'],
                activePanel: 'main',
              }}
            >
              <IntoSidebarPanelExtensionPanelSlot panelId="main">
                <SidebarPanelExtensionTabContainer tabId="first" tabName="First">
                  <div>First strict mode content</div>
                </SidebarPanelExtensionTabContainer>
                <SidebarPanelExtensionTabContainer tabId="second" tabName="Second">
                  <div>Second strict mode content</div>
                </SidebarPanelExtensionTabContainer>
              </IntoSidebarPanelExtensionPanelSlot>
            </SidebarPanelExtensionProvider>
          </SidebarRoot>
        </React.StrictMode>
      </SidebarPanelExtensionTestProviders>
    )

    expect(await screen.findByText('First strict mode content')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'First' })).toHaveAttribute(
      'aria-selected',
      'true'
    )

    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(screen.getByText('First strict mode content')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Second' })).toBeInTheDocument()
  })

  it('keeps inline tab React nodes out of the global UI store across rerenders', async () => {
    const InlineTabs = ({ iconLabel }: { iconLabel: string }) => (
      <>
        <SidebarPanelExtensionTabContainer
          tabId="summary"
          tabName="Summary"
          tabIcon={<span data-testid="summary-inline-icon">{iconLabel}</span>}
        >
          <div>Summary panel content</div>
        </SidebarPanelExtensionTabContainer>
        <SidebarPanelExtensionTabContainer
          tabId="details"
          tabName="Details"
          tabIcon={<span data-testid="details-inline-icon">{iconLabel}</span>}
        >
          <div>Details panel content</div>
        </SidebarPanelExtensionTabContainer>
      </>
    )

    const { rerender } = renderSidebarPanelExtension(
      <InlineTabs iconLabel="A" />
    )

    expect(await screen.findByText('Summary panel content')).toBeInTheDocument()
    expect(screen.getAllByRole('tab')).toHaveLength(2)
    expect(
      useUIStore.getState().sidebarPanelExtensions['test-extension']
    ).not.toHaveProperty('tabs')

    rerender(
      <SidebarPanelExtensionTestProviders>
        <SidebarRoot>
          <SidebarPanelExtensionProvider
            id="test-extension"
            initialRuntimeOptions={{ visiblePanels: ['main'], activePanel: 'main' }}
          >
            <IntoSidebarPanelExtensionPanelSlot panelId="main">
              <InlineTabs iconLabel="B" />
            </IntoSidebarPanelExtensionPanelSlot>
          </SidebarPanelExtensionProvider>
        </SidebarRoot>
      </SidebarPanelExtensionTestProviders>
    )

    expect(await screen.findByText('Summary panel content')).toBeInTheDocument()
    expect(screen.getAllByRole('tab')).toHaveLength(2)
    expect(
      useUIStore.getState().sidebarPanelExtensions['test-extension']
    ).not.toHaveProperty('tabs')
  })

  it('renders one tab without a tab rail', async () => {
    renderSidebarPanelExtension(
      <SidebarPanelExtensionTabContainer tabId="only" tabName="Only tab">
        <div>Only tab content</div>
      </SidebarPanelExtensionTabContainer>
    )

    expect(await screen.findByText('Only tab content')).toBeInTheDocument()
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: 'Only tab' })).not.toBeInTheDocument()
  })

  it('registers tab containers rendered through an extension panel slot', async () => {
    render(
      <SidebarPanelExtensionTestProviders>
        <SidebarRoot>
          <SidebarPanelExtensionProvider
            id="slot-extension"
            initialRuntimeOptions={{ visiblePanels: ['main'], activePanel: 'main' }}
          >
            <IntoSidebarPanelExtensionPanelSlot panelId="main">
              <SidebarPanelExtensionTabContainer
                tabId="layers"
                tabName="Layers"
              >
                <div>Layers tab content</div>
              </SidebarPanelExtensionTabContainer>
              <SidebarPanelExtensionTabContainer
                tabId="report"
                tabName="Report"
              >
                <div>Report tab content</div>
              </SidebarPanelExtensionTabContainer>
            </IntoSidebarPanelExtensionPanelSlot>
          </SidebarPanelExtensionProvider>
        </SidebarRoot>
      </SidebarPanelExtensionTestProviders>
    )

    expect(await screen.findByText('Layers tab content')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Layers' })).toHaveAttribute(
      'aria-selected',
      'true'
    )

    fireEvent.click(screen.getByRole('tab', { name: 'Report' }))

    expect(await screen.findByText('Report tab content')).toBeInTheDocument()
    expect(screen.queryByText('Layers tab content')).not.toBeInTheDocument()
  })

  it('falls back to the first remaining tab when the active tab unmounts', async () => {
    const { rerender } = renderSidebarPanelExtension(
      <>
        <SidebarPanelExtensionTabContainer tabId="first" tabName="First">
          <div>First panel content</div>
        </SidebarPanelExtensionTabContainer>
        <SidebarPanelExtensionTabContainer tabId="second" tabName="Second">
          <div>Second panel content</div>
        </SidebarPanelExtensionTabContainer>
      </>
    )

    fireEvent.click(await screen.findByRole('tab', { name: 'Second' }))
    expect(await screen.findByText('Second panel content')).toBeInTheDocument()

    rerender(
      <SidebarPanelExtensionTestProviders>
        <SidebarRoot>
          <SidebarPanelExtensionProvider
            id="test-extension"
            initialRuntimeOptions={{ visiblePanels: ['main'], activePanel: 'main' }}
          >
            <IntoSidebarPanelExtensionPanelSlot panelId="main">
              <SidebarPanelExtensionTabContainer tabId="first" tabName="First">
                <div>First panel content</div>
              </SidebarPanelExtensionTabContainer>
            </IntoSidebarPanelExtensionPanelSlot>
          </SidebarPanelExtensionProvider>
        </SidebarRoot>
      </SidebarPanelExtensionTestProviders>
    )

    expect(await screen.findByText('First panel content')).toBeInTheDocument()
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
  })

  it('resolves wide hidden single main width without changing default or triple widths', () => {
    expect(
      getSidebarPanelExtensionMainPanelWidth({
        width: 'wide',
        chrome: 'hidden',
        panelLayout: 'single',
        visiblePanels: ['main'],
      })
    ).toBe('min(1440px, calc(100vw - 4rem))')
    expect(getSidebarPanelExtensionMainPanelWidth()).toBe('23.75rem')
    expect(
      getSidebarPanelExtensionMainPanelWidth({
        width: 'compact',
        panelLayout: 'single',
        visiblePanels: ['main'],
      })
    ).toBe('23.75rem')
    expect(
      getSidebarPanelExtensionMainPanelWidth({
        width: 'wide',
        chrome: 'hidden',
        panelLayout: 'triple',
        visiblePanels: ['main', 'secondary', 'tertiary'],
      })
    ).toBe('30.5556vw')
  })

  it('uses opt-in custom main widths only outside fullscreen layouts', () => {
    expect(
      getSidebarPanelExtensionMainPanelWidth({
        width: 'wide',
        chrome: 'hidden',
        panelLayout: 'single',
        visiblePanels: ['main'],
        desktopMainPanelWidth: '760px',
      })
    ).toBe('760px')
    expect(
      getSidebarPanelExtensionMainPanelWidth({
        width: 'wide',
        chrome: 'hidden',
        panelLayout: 'single',
        visiblePanels: ['main'],
        layoutMode: 'fullscreen',
      })
    ).toBe('100vw')
    expect(
      getSidebarPanelExtensionMainPanelWidth({
        width: 'wide',
        chrome: 'hidden',
        panelLayout: 'single',
        visiblePanels: ['main'],
        layoutMode: 'fullscreen',
        desktopMainPanelWidth: '100%',
        desktopPanelGroupMaxWidth: '1440px',
      })
    ).toBe('100vw')
  })

  it.each([
    {
      name: 'default',
      options: { visiblePanels: ['main'], activePanel: 'main' },
      expectedWidth: '23.75rem',
    },
    {
      name: 'single',
      options: {
        panelLayout: 'single',
        visiblePanels: ['main'],
        activePanel: 'main',
      },
      expectedWidth: '23.75rem',
    },
    {
      name: 'double',
      options: {
        panelLayout: 'double',
        visiblePanels: ['main', 'secondary'],
        activePanel: 'main',
      },
      expectedWidth: 'calc(23.75rem + 23.75rem)',
    },
    {
      name: 'triple',
      options: {
        panelLayout: 'triple',
        visiblePanels: ['main', 'secondary', 'tertiary'],
        activePanel: 'main',
      },
      expectedWidth: 'calc(23.75rem + 23.75rem + 23.75rem)',
    },
  ] as const)(
    'anchors $name desktop page controls to the complete visible panel group',
    ({ options, expectedWidth }) => {
      renderPageControlsGeometry({ options })

      const root = screen.getByTestId('sidebar-panel-extension-root')
      const rootStyle = window.getComputedStyle(root)
      const controls = document.querySelector(
        '.sidebar-panel-extension-page-container-controls'
      ) as HTMLElement

      expect(
        getSidebarPanelExtensionPageControlsRight({ options })
      ).toBe(
        `calc(100vw - min(100vw, calc(0px + ${expectedWidth})) + ${MAP_CONTROL_EDGE_GUTTER_PX}px)`
      )
      expect(
        rootStyle.getPropertyValue(
          '--sidebar-panel-extension-page-controls-position'
        )
      ).toBe('fixed')
      expect(
        rootStyle.getPropertyValue(
          '--sidebar-panel-extension-page-controls-top'
        )
      ).toBe(`${MAP_CONTROL_EDGE_GUTTER_PX}px`)
      expect(
        rootStyle.getPropertyValue(
          '--sidebar-panel-extension-page-controls-right'
        )
      ).toBe(
        `calc(100vw - min(100vw, calc(0px + ${expectedWidth})) + ${MAP_CONTROL_EDGE_GUTTER_PX}px)`
      )
      expect(controls).toHaveStyle({
        position:
          'var(--sidebar-panel-extension-page-controls-position, static)',
        top: 'var(--sidebar-panel-extension-page-controls-top, auto)',
        right: 'var(--sidebar-panel-extension-page-controls-right, auto)',
        paddingInline:
          'var(--sidebar-panel-extension-page-controls-padding-inline, 12px)',
        paddingBlock:
          'var(--sidebar-panel-extension-page-controls-padding-block, 10px)',
      })
      expect(
        screen.getByTestId('sidebar-panel-extension-desktop-tab-controls')
      ).toHaveStyle({ paddingTop: `${MAP_CONTROL_EDGE_GUTTER_PX}px` })
    }
  )

  it('uses filtered visible panels, a custom main width, and sidebar offset in the anchor', () => {
    const options: SidebarPanelExtensionRuntimeOptions = {
      panelLayout: 'triple',
      visiblePanels: ['main', 'tertiary'],
      activePanel: 'main',
      desktopMainPanelWidth: '512px',
    }

    renderPageControlsGeometry({ options, sidebarOffset: 64 })

    expect(
      window
        .getComputedStyle(screen.getByTestId('sidebar-panel-extension-root'))
        .getPropertyValue('--sidebar-panel-extension-page-controls-right')
    ).toBe(
      'calc(100vw - min(100vw, calc(64px + calc(512px + 23.75rem))) + 16px)'
    )
    expect(
      screen.queryByTestId(
        'sidebar-panel-extension-desktop-panel-secondary'
      )
    ).not.toBeInTheDocument()
    expect(
      screen.getByTestId('sidebar-panel-extension-desktop-panel-tertiary')
    ).toBeInTheDocument()
  })

  it('moves only shared chrome into separate viewport lanes when fixed panels overflow', async () => {
    const originalInnerWidth = window.innerWidth
    const options: SidebarPanelExtensionRuntimeOptions = {
      panelLayout: 'triple',
      visiblePanels: ['main', 'secondary', 'tertiary'],
      activePanel: 'main',
    }
    const tabs: SidebarPanelExtensionTabMetadata[] = [
      { tabId: 'one', tabName: '1' },
      { tabId: 'two', tabName: '2' },
      { tabId: 'three', tabName: '3' },
      { tabId: 'one-fullscreen', tabName: '1F' },
      { tabId: 'two-fullscreen', tabName: '2F' },
      { tabId: 'three-fullscreen', tabName: '3F' },
    ]

    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1440,
    })

    try {
      renderPageControlsGeometry({
        options,
        sidebarOffset: 380,
        desktopTabRail: (
          <SidebarPanelExtensionTabRail
            tabs={tabs}
            activeTabId="three"
            placement="desktop"
            onTabChange={jest.fn()}
          />
        ),
      })

      const root = screen.getByTestId('sidebar-panel-extension-root')
      const group = screen.getByTestId(
        'sidebar-panel-extension-desktop-panel-group'
      )
      const tabControls = screen.getByTestId(
        'sidebar-panel-extension-desktop-tab-controls'
      )
      const getPanelGroupRect = jest
        .spyOn(group, 'getBoundingClientRect')
        .mockReturnValue(createDomRect({ left: 380, right: 1520 }))

      fireEvent(window, new Event('resize'))

      await waitFor(() => {
        expect(root).toHaveAttribute(
          'data-sidebar-panel-extension-viewport-overflow',
          'true'
        )
      })

      expect(group).toHaveStyle({ width: 'auto' })
      for (const panelId of ['main', 'secondary', 'tertiary'] as const) {
        expect(
          screen.getByTestId(`sidebar-panel-extension-desktop-panel-${panelId}`)
        ).toHaveStyle({ width: '23.75rem' })
      }
      expect(root).toHaveStyle({ left: '380px' })
      expect(tabControls).toHaveAttribute(
        'data-sidebar-panel-extension-tab-placement',
        'viewport-edge'
      )
      expect(tabControls).toHaveStyle({
        position: 'fixed',
        top: `${MAP_CONTROL_EDGE_GUTTER_PX}px`,
        right: '71px',
        overflowY: 'auto',
      })
      expect(screen.getAllByRole('tab')).toHaveLength(6)
      expect(screen.getByRole('tab', { name: '1F' })).toBeEnabled()
      expect(
        window
          .getComputedStyle(root)
          .getPropertyValue('--sidebar-panel-extension-page-controls-right')
      ).toBe('126px')

      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: 1800,
      })
      getPanelGroupRect.mockReturnValue(
        createDomRect({ left: 380, right: 1520 })
      )
      fireEvent(window, new Event('resize'))

      await waitFor(() => {
        expect(root).not.toHaveAttribute(
          'data-sidebar-panel-extension-viewport-overflow'
        )
      })

      expect(tabControls).toHaveAttribute(
        'data-sidebar-panel-extension-tab-placement',
        'sidebar-edge'
      )
      expect(tabControls).toHaveStyle({
        display: 'flex',
        paddingTop: '16px',
        paddingLeft: '8px',
      })
      expect(
        window
          .getComputedStyle(root)
          .getPropertyValue('--sidebar-panel-extension-page-controls-right')
      ).toBe(
        'calc(100vw - min(100vw, calc(380px + calc(23.75rem + 23.75rem + 23.75rem))) + 16px)'
      )
    } finally {
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: originalInnerWidth,
      })
    }
  })

  it.each([
    {
      name: 'single',
      options: {
        panelLayout: 'single',
        visiblePanels: ['main'],
        activePanel: 'main',
        layoutMode: 'fullscreen',
      },
      expectedPanels: ['main'],
      expectedWidth: '100vw',
    },
    {
      name: 'double',
      options: {
        panelLayout: 'double',
        visiblePanels: ['main', 'secondary'],
        activePanel: 'main',
        layoutMode: 'fullscreen',
      },
      expectedPanels: ['main', 'secondary'],
      expectedWidth: '50vw',
    },
    {
      name: 'triple',
      options: {
        panelLayout: 'triple',
        visiblePanels: ['main', 'secondary', 'tertiary'],
        activePanel: 'main',
        layoutMode: 'fullscreen',
      },
      expectedPanels: ['main', 'secondary', 'tertiary'],
      expectedWidth: 'calc(100vw / 3)',
    },
    {
      name: 'filtered triple',
      options: {
        panelLayout: 'triple',
        visiblePanels: ['main', 'tertiary'],
        activePanel: 'main',
        layoutMode: 'fullscreen',
      },
      expectedPanels: ['main', 'tertiary'],
      expectedWidth: '50vw',
    },
  ] as const)(
    'keeps fullscreen $name panel geometry within one viewport',
    ({ options, expectedPanels, expectedWidth }) => {
      renderPageControlsGeometry({ options })

      const root = screen.getByTestId('sidebar-panel-extension-root')
      const rootStyle = window.getComputedStyle(root)
      const group = screen.getByTestId(
        'sidebar-panel-extension-desktop-panel-group'
      )
      const renderedPanels = Array.from(
        group.querySelectorAll<HTMLElement>(
          ':scope > [data-sidebar-panel-extension-panel-id]'
        )
      )

      expect(root).toHaveStyle({
        left: '0px',
        right: '0px',
        width: '100vw',
        backgroundColor: '#ffffff',
        pointerEvents: 'auto',
        zIndex: `${theme.zIndex.drawer + 2}`,
      })
      expect(group).toHaveStyle({
        width: '100vw',
        maxWidth: '100vw',
        marginLeft: '0px',
        marginRight: '0px',
      })
      expect(
        renderedPanels.map((panel) =>
          panel.getAttribute('data-sidebar-panel-extension-panel-id')
        )
      ).toEqual(expectedPanels)

      renderedPanels.forEach((panel) => {
        expect(panel).toHaveStyle({ width: expectedWidth, minWidth: '0' })

        const panelId = panel.getAttribute(
          'data-sidebar-panel-extension-panel-id'
        )
        expect(
          screen.getByTestId(
            `sidebar-panel-extension-desktop-panel-${panelId}-scroll-host`
          )
        ).toHaveStyle({ position: 'absolute', overflow: 'auto' })
      })

      expect(
        getSidebarPanelExtensionPageControlsRight({ options })
      ).toBe(`${MAP_CONTROL_EDGE_GUTTER_PX}px`)
      expect(
        rootStyle.getPropertyValue(
          '--sidebar-panel-extension-page-controls-position'
        )
      ).toBe('fixed')
      expect(
        rootStyle.getPropertyValue('--sidebar-panel-extension-page-controls-top')
      ).toBe(`${MAP_CONTROL_EDGE_GUTTER_PX}px`)
      expect(
        rootStyle.getPropertyValue(
          '--sidebar-panel-extension-page-controls-right'
        )
      ).toBe(`${MAP_CONTROL_EDGE_GUTTER_PX}px`)
    }
  )

  it.each([
    {
      name: 'ignores a full-width main override in a two-panel layout',
      options: {
        panelLayout: 'double',
        visiblePanels: ['main', 'secondary'],
        activePanel: 'main',
        layoutMode: 'fullscreen',
        desktopMainPanelWidth: '100%',
      },
      expectedPanels: ['main', 'secondary'],
    },
    {
      name: 'partitions by visible count when the main panel is omitted',
      options: {
        panelLayout: 'triple',
        visiblePanels: ['secondary', 'tertiary'],
        activePanel: 'secondary',
        layoutMode: 'fullscreen',
        desktopMainPanelWidth: '40vw',
      },
      expectedPanels: ['secondary', 'tertiary'],
    },
  ] as const)(
    '$name',
    ({ options, expectedPanels }) => {
      renderPageControlsGeometry({ options })

      const group = screen.getByTestId(
        'sidebar-panel-extension-desktop-panel-group'
      )
      const renderedPanels = Array.from(
        group.querySelectorAll<HTMLElement>(
          ':scope > [data-sidebar-panel-extension-panel-id]'
        )
      )

      expect(group).toHaveStyle({ width: '100vw', maxWidth: '100vw' })
      expect(
        renderedPanels.map((panel) =>
          panel.getAttribute('data-sidebar-panel-extension-panel-id')
        )
      ).toEqual(expectedPanels)
      renderedPanels.forEach((panel) => {
        expect(panel).toHaveStyle({ width: '50vw', minWidth: '0' })
      })
    }
  )

  it('keeps non-fullscreen desktop extension chrome below map controls', async () => {
    renderSidebarPanelExtension(
      <>
        <SidebarPanelExtensionTabContainer tabId="first" tabName="First">
          <div>First z-index content</div>
        </SidebarPanelExtensionTabContainer>
        <SidebarPanelExtensionTabContainer tabId="second" tabName="Second">
          <div>Second z-index content</div>
        </SidebarPanelExtensionTabContainer>
      </>,
      {
        width: 'wide',
        chrome: 'hidden',
        panelLayout: 'single',
        visiblePanels: ['main'],
        activePanel: 'main',
        desktopMainPanelWidth: '760px',
      }
    )

    expect(await screen.findByText('First z-index content')).toBeInTheDocument()

    const nonFullscreenRootZIndex = theme.zIndex.mapButtons - 20

    expect(screen.getByTestId('sidebar-panel-extension-root')).toHaveStyle({
      zIndex: `${nonFullscreenRootZIndex}`,
    })
    expect(
      screen.getByTestId('sidebar-panel-extension-desktop-panel-group')
    ).toHaveStyle({
      zIndex: `${nonFullscreenRootZIndex + 2}`,
    })
    expect(
      screen.getByTestId('sidebar-panel-extension-desktop-panel-main')
    ).not.toHaveStyle({ zIndex: `${nonFullscreenRootZIndex + 2}` })
    expect(
      screen.getByTestId('sidebar-panel-extension-desktop-tab-controls')
    ).toHaveStyle({
      zIndex: `${nonFullscreenRootZIndex + 3}`,
    })
    expect(
      screen.getByTestId('sidebar-panel-extension-desktop-controls')
    ).toHaveStyle({
      zIndex: `${nonFullscreenRootZIndex + 3}`,
    })
  })

  it('removes left-edge decoration from the first visible desktop panel', async () => {
    renderSidebarPanelExtension(
      <div>First panel content</div>,
      {
        panelLayout: 'double',
        visiblePanels: ['main', 'secondary'],
        activePanel: 'main',
      }
    )

    expect(await screen.findByText('First panel content')).toBeInTheDocument()

    const firstPanelSurface = screen.getByTestId(
      'sidebar-panel-extension-desktop-panel-main'
    ).firstElementChild as HTMLElement
    const secondPanelSurface = screen.getByTestId(
      'sidebar-panel-extension-desktop-panel-secondary'
    ).firstElementChild as HTMLElement

    expect(window.getComputedStyle(firstPanelSurface).borderLeftWidth).toBe(
      '0px'
    )
    expect(window.getComputedStyle(firstPanelSurface).boxShadow).toBe('none')
    expect(window.getComputedStyle(secondPanelSurface).borderLeftWidth).toBe(
      '1px'
    )
    expect(window.getComputedStyle(secondPanelSurface).boxShadow).toBe(
      '0 2px 6px rgba(17, 17, 17, 0.06)'
    )
  })

  it('uses mobile extension rendering when forceMobileLayout is set on desktop', async () => {
    const onCollapse = jest.fn()
    const onClose = jest.fn()

    renderSidebarPanelExtension(
      <SidebarPanelExtensionPageContainer
        onCollapse={onCollapse}
        onClose={onClose}
      >
        <div>Forced mobile panel content</div>
      </SidebarPanelExtensionPageContainer>,
      {
        visiblePanels: ['main'],
        activePanel: 'main',
        forceMobileLayout: true,
      }
    )

    expect(
      await screen.findByText('Forced mobile panel content')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('sidebar-panel-extension-mobile-panels')
    ).toHaveAttribute(
      'data-sidebar-panel-extension-mobile-render',
      'overlay'
    )
    expect(
      screen.queryByTestId('sidebar-panel-extension-root')
    ).not.toBeInTheDocument()
    fireEvent.click(
      screen.getByRole('button', {
        name: 'collapse sidebar panel extension page',
      })
    )
    fireEvent.click(
      screen.getByRole('button', {
        name: 'close sidebar panel extension page',
      })
    )
    expect(onCollapse).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('keeps mobile tab controls above fixed map bottom controls', () => {
    render(
      <SidebarPanelExtensionTestProviders>
        <SidebarPanelExtension
          extensionId="mobile-z-index-extension"
          options={{
            visiblePanels: ['main'],
            activePanel: 'main',
            forceMobileLayout: true,
          }}
          mobileTabRail={<div>Mobile tab rail</div>}
        />
      </SidebarPanelExtensionTestProviders>
    )

    expect(
      screen.getByTestId('sidebar-panel-extension-mobile-panels')
    ).toHaveStyle({ zIndex: `${theme.zIndex.drawer + 4}` })
    expect(
      screen.getByTestId('sidebar-panel-extension-mobile-controls')
    ).toHaveStyle({ zIndex: `${theme.zIndex.drawer + 14}` })
  })

  it('styles selected tab icon buttons with a light gray background', () => {
    render(
      <AppThemeProvider disableCssBaseline>
        <SidebarPanelExtensionTabIconButton
          tabId="summary"
          tabName="Summary"
          selected
        />
      </AppThemeProvider>
    )

    const selectedTab = screen.getByRole('tab', { name: 'Summary' })

    expect(selectedTab).toHaveStyle({
      backgroundColor: '#e8e8e8',
      color: '#111111',
      borderColor: '#d8d8d8',
    })
  })
})

describe('SidebarPanelExtensionPageContainer', () => {
  beforeEach(() => {
    resetUIStore()
  })

  it('uses left-side OverlayScrollbars defaults', () => {
    render(
      <SidebarPanelExtensionPageContainer>
        <div>Scrollable page content</div>
      </SidebarPanelExtensionPageContainer>
    )

    const scrollArea = screen.getByTestId('sidebar-panel-extension-page-scroll')

    expect(scrollArea).toHaveClass('osScroll', 'osLeft')
    expect(scrollArea).toHaveAttribute('data-auto-hide', 'leave')
    expect(scrollArea).toHaveAttribute('data-scrollbar-visibility', 'auto')
    expect(scrollArea).toHaveAttribute('data-scrollbar-theme', 'os-theme-dark')
    expect(scrollArea).toHaveAttribute('data-overflow-x', 'hidden')
    expect(scrollArea).toHaveAttribute('data-overflow-y', 'scroll')
    expect(scrollArea).toHaveStyle({ direction: 'rtl' })
    expect(screen.getByText('Scrollable page content')).toBeInTheDocument()
  })

  it('renders accessible collapse and close controls from consumer handlers', () => {
    const onCollapse = jest.fn()
    const onClose = jest.fn()

    render(
      <AppThemeProvider disableCssBaseline>
        <SidebarPanelExtensionPageContainer
          onCollapse={onCollapse}
          onClose={onClose}
          collapseAriaLabel="Collapse current page"
          closeAriaLabel="Close current page"
        >
          <div>Controlled page content</div>
        </SidebarPanelExtensionPageContainer>
      </AppThemeProvider>
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Collapse current page' })
    )
    fireEvent.click(screen.getByRole('button', { name: 'Close current page' }))

    const collapseButton = screen.getByRole('button', {
      name: 'Collapse current page',
    })
    const closeButton = screen.getByRole('button', {
      name: 'Close current page',
    })
    const collapseIcon = screen.getByTestId(
      'sidebar-panel-extension-collapse-icon'
    )
    const collapseIconPaths = collapseIcon.querySelectorAll('path')
    const closeIcon = closeButton.querySelector('svg') as SVGSVGElement
    const controls = document.querySelector(
      '.sidebar-panel-extension-page-container-controls'
    ) as HTMLElement

    expect(onCollapse).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(controls).toHaveStyle({
      position:
        'var(--sidebar-panel-extension-page-controls-position, static)',
      paddingInline:
        'var(--sidebar-panel-extension-page-controls-padding-inline, 12px)',
      paddingBlock:
        'var(--sidebar-panel-extension-page-controls-padding-block, 10px)',
    })
    expect(collapseButton).toHaveStyle({
      width: '2.25rem',
      minWidth: '2.25rem',
      height: '2.25rem',
      padding: '0.125rem',
      boxShadow: '0 2px 8px rgba(17, 17, 17, 0.12)',
    })
    expect(closeButton).toHaveStyle({
      width: '2.25rem',
      minWidth: '2.25rem',
      height: '2.25rem',
      padding: '0.125rem',
      boxShadow: '0 2px 8px rgba(17, 17, 17, 0.12)',
    })
    expect(collapseIcon).toHaveStyle({
      fontSize: '1.85rem',
    })
    expect(collapseIcon).toHaveAttribute('aria-hidden', 'true')
    expect(collapseIconPaths).toHaveLength(2)
    collapseIconPaths.forEach((path) => {
      expect(path).toHaveAttribute('fill', 'none')
      expect(path).toHaveAttribute('stroke', 'currentColor')
      expect(path).toHaveAttribute('stroke-linecap', 'round')
      expect(path).toHaveAttribute('stroke-linejoin', 'round')
      expect(path).toHaveAttribute('stroke-width', '1.7')
    })
    expect(closeIcon).toHaveStyle({
      width: '1rem',
      height: '1rem',
    })
  })

  it('keeps controlsSx as the last-applied positioning override', () => {
    render(
      <AppThemeProvider disableCssBaseline>
        <SidebarPanelExtensionPageContainer
          onClose={jest.fn()}
          controlsSx={{ position: 'absolute', top: '7px', right: '9px' }}
        />
      </AppThemeProvider>
    )

    expect(
      document.querySelector(
        '.sidebar-panel-extension-page-container-controls'
      )
    ).toHaveStyle({ position: 'absolute', top: '7px', right: '9px' })
  })
})
