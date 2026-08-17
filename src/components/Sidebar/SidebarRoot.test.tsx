import React, { useEffect } from 'react'
import '@testing-library/jest-dom'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

import { useUIStore } from '#/common/store/uiStore'
import type {
  SidebarMode,
  SidebarPanelExtensionRuntimeOptions,
  SidebarRuntimeOptions,
} from '#/common/types/sidebar'
import { SlotsProvider } from '#/components/context/slotsContext'

import { SidebarBoundary } from './SidebarBoundary'
import {
  SidebarPanelExtensionProvider,
  useSidebarPanelExtensionRuntimeOptions,
} from './SidebarPanelExtensionProvider'
import { SidebarPanelExtensionTabContainer } from './SidebarPanelExtensionTabContainer'
import { useSidebarPanelExtensionTabsContext } from './SidebarPanelExtensionTabsContext'
import { SidebarRoot } from './SidebarRoot'
import {
  IntoSidebarHeaderChildrenSlot,
  IntoSidebarPanelExtensionActionRailSlot,
  IntoSidebarPanelExtensionPanelSlot,
  IntoSidebarPanelSlot,
} from './sidebarSlots'

jest.mock('#/common/store', () => ({
  useUIStore: jest.requireActual('#/common/store/uiStore').useUIStore,
}))

let mockIsMobile = false

jest.mock('#/common/hooks/ui/useIsMobile', () => ({
  useIsMobile: () => mockIsMobile,
}))

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

const seedBoundary = ({
  id,
  mode,
  runtimeOptions = {},
}: {
  id: string
  mode: SidebarMode
  runtimeOptions?: SidebarRuntimeOptions
}) => {
  useUIStore.setState({
    sidebarBoundaries: {
      [id]: {
        id,
        mode,
        depth: 0,
        runtimeOptions,
        registrationOrder: 1,
      },
    },
    _sidebarBoundaryRegistrationOrder: 1,
  })
}

const renderRoot = ({ children }: { children: React.ReactNode }) =>
  render(
    <SlotsProvider>
      <SidebarRoot>{children}</SidebarRoot>
    </SlotsProvider>
  )

const renderMobileControlsExtension = (id: string) => (
  <SidebarPanelExtensionProvider
    id={id}
    initialRuntimeOptions={{
      visiblePanels: ['main'],
      activePanel: 'main',
      actionRailPlacement: 'bottomActionRow',
    }}
  >
    <IntoSidebarPanelExtensionPanelSlot panelId="main">
      <SidebarPanelExtensionTabContainer tabId="first" tabName="First">
        <span>First {id} tab body</span>
      </SidebarPanelExtensionTabContainer>
      <SidebarPanelExtensionTabContainer tabId="second" tabName="Second">
        <span>Second {id} tab body</span>
      </SidebarPanelExtensionTabContainer>
    </IntoSidebarPanelExtensionPanelSlot>
  </SidebarPanelExtensionProvider>
)

const MOBILE_TARGET_TRANSITION_CONFIGURATIONS = [
  { tabId: 'one', label: '1', panelLayout: 'single', fullscreen: false },
  { tabId: 'one-fullscreen', label: '1F', panelLayout: 'single', fullscreen: true },
  { tabId: 'two', label: '2', panelLayout: 'double', fullscreen: false },
  { tabId: 'two-fullscreen', label: '2F', panelLayout: 'double', fullscreen: true },
  { tabId: 'three', label: '3', panelLayout: 'triple', fullscreen: false },
  {
    tabId: 'three-fullscreen',
    label: '3F',
    panelLayout: 'triple',
    fullscreen: true,
  },
] as const

const MobileTargetTransitionTabs = ({ onClose }: { onClose: () => void }) => {
  const { resolvedActiveTabId } = useSidebarPanelExtensionTabsContext()
  const activeConfiguration =
    MOBILE_TARGET_TRANSITION_CONFIGURATIONS.find(
      ({ tabId }) => tabId === resolvedActiveTabId
    ) ?? MOBILE_TARGET_TRANSITION_CONFIGURATIONS[0]
  const runtimeOptions = React.useMemo<SidebarPanelExtensionRuntimeOptions>(
    () => {
      const visiblePanels =
        activeConfiguration.panelLayout === 'triple'
          ? ['main', 'secondary', 'tertiary']
          : activeConfiguration.panelLayout === 'double'
            ? ['main', 'secondary']
            : ['main']

      return {
        panelLayout: activeConfiguration.panelLayout,
        visiblePanels,
        activePanel: 'main',
        layoutMode: activeConfiguration.fullscreen ? 'fullscreen' : 'default',
        replaceBaseSidebar: activeConfiguration.fullscreen,
        mobileMode: 'stacked',
      }
    },
    [activeConfiguration]
  )

  useSidebarPanelExtensionRuntimeOptions(runtimeOptions)

  return (
    <IntoSidebarPanelExtensionPanelSlot panelId="main">
      {MOBILE_TARGET_TRANSITION_CONFIGURATIONS.map((configuration) => (
        <SidebarPanelExtensionTabContainer
          key={configuration.tabId}
          tabId={configuration.tabId}
          tabName={configuration.label}
          tabAriaLabel={`Open ${configuration.label}`}
        >
          <span data-testid={`mobile-transition-content-${configuration.tabId}`}>
            {configuration.label} configuration content
          </span>
          <button type="button" onClick={onClose}>
            Close transition extension
          </button>
        </SidebarPanelExtensionTabContainer>
      ))}
    </IntoSidebarPanelExtensionPanelSlot>
  )
}

const MobileTargetTransitionHarness = () => {
  const [enabled, setEnabled] = React.useState(true)

  return (
    <SidebarBoundary id="mobile-transition-boundary" mode="simple">
      <IntoSidebarPanelSlot panelId="main">
        <button type="button" onClick={() => setEnabled(true)}>
          Reopen transition extension
        </button>
      </IntoSidebarPanelSlot>
      <SidebarPanelExtensionProvider
        id="mobile-transition-extension"
        enabled={enabled}
        initialRuntimeOptions={{
          panelLayout: 'single',
          visiblePanels: ['main'],
          activePanel: 'main',
          layoutMode: 'default',
          replaceBaseSidebar: false,
          mobileMode: 'stacked',
        }}
      >
        <MobileTargetTransitionTabs onClose={() => setEnabled(false)} />
      </SidebarPanelExtensionProvider>
    </SidebarBoundary>
  )
}

const expectMobileControlsToShareSidebarToggleRow = (
  controls: HTMLElement
) => {
  const toggle = document.querySelector(
    '.sidebar-toggle-button'
  ) as HTMLElement | null

  expect(toggle).not.toBeNull()

  const controlsStyle = window.getComputedStyle(controls)
  const toggleStyle = window.getComputedStyle(toggle as HTMLElement)
  const controlsRight = Number.parseFloat(controlsStyle.right)
  const toggleRight = Number.parseFloat(toggleStyle.right)
  const toggleWidth = Number.parseFloat(toggleStyle.width)

  expect(controlsStyle.bottom).toBe(toggleStyle.bottom)
  expect(controlsRight - toggleRight).toBeCloseTo(toggleWidth + 10)
}

const expectMobileControlsToReserveSidebarToggleLane = (
  controls: HTMLElement
) => {
  const controlsStyle = window.getComputedStyle(controls)

  expect(
    document.querySelector('.sidebar-toggle-button')
  ).not.toBeInTheDocument()
  expect(controlsStyle.bottom).toBe('16px')
  expect(controlsStyle.right).toBe('71px')
}

describe('SidebarRoot', () => {
  beforeEach(() => {
    mockIsMobile = false
    resetUIStore()
  })

  it('renders raw children when no boundary or extension is registered', () => {
    renderRoot({ children: <div>Raw child</div> })

    expect(screen.getByText('Raw child')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /hide sidebar/i })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('sidebar-panel-extension-root')
    ).not.toBeInTheDocument()
  })

  it('renders raw children for an active none boundary', () => {
    seedBoundary({ id: 'none-boundary', mode: 'none' })

    renderRoot({ children: <div>Raw child</div> })

    expect(screen.getByText('Raw child')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /hide sidebar/i })
    ).not.toBeInTheDocument()
  })

  it('renders the active floating boundary shell', () => {
    seedBoundary({ id: 'floating-boundary', mode: 'floating' })

    renderRoot({ children: <div>Floating child</div> })

    expect(screen.getByText('Floating child')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /hide sidebar/i })
    ).toBeInTheDocument()
  })

  it('hosts scoped header children for a default floating boundary', async () => {
    renderRoot({
      children: (
        <SidebarBoundary id="route-floating" mode="floating">
          <IntoSidebarHeaderChildrenSlot>
            <span>Scoped breadcrumb</span>
          </IntoSidebarHeaderChildrenSlot>
          <div>Floating child</div>
        </SidebarBoundary>
      ),
    })

    expect(await screen.findByText('Scoped breadcrumb')).toBeInTheDocument()
    expect(screen.getByText('Floating child')).toBeInTheDocument()
  })

  it('keeps the child subtree mounted when boundary runtime options change within one mode', () => {
    let mountCount = 0

    const Child = () => {
      useEffect(() => {
        mountCount += 1
      }, [])

      return <div>Stable child</div>
    }

    seedBoundary({
      id: 'runtime-boundary',
      mode: 'floating',
      runtimeOptions: { width: 'default' },
    })

    renderRoot({ children: <Child /> })

    expect(screen.getByText('Stable child')).toBeInTheDocument()
    expect(mountCount).toBe(1)

    act(() => {
      useUIStore
        .getState()
        .setSidebarBoundaryRuntimeOptions('runtime-boundary', {
          width: 'compact',
        })
    })

    expect(screen.getByText('Stable child')).toBeInTheDocument()
    expect(mountCount).toBe(1)
  })

  it('renders extension slots independently of the active simple boundary without remounting children', async () => {
    let mountCount = 0

    const Child = () => {
      useEffect(() => {
        mountCount += 1
      }, [])

      return (
        <SidebarPanelExtensionProvider
          id="route-extension"
          initialRuntimeOptions={{
            panelLayout: 'single',
            visiblePanels: [],
            activePanel: 'main',
            actionRailPlacement: 'bottomActionRow',
          }}
        >
          <IntoSidebarPanelSlot panelId="main">
            <div>Base simple panel</div>
          </IntoSidebarPanelSlot>
          <IntoSidebarPanelExtensionPanelSlot panelId="main">
            <div>Extension graph panel</div>
          </IntoSidebarPanelExtensionPanelSlot>
          <IntoSidebarPanelExtensionActionRailSlot>
            <button type="button">Toggle graph panel</button>
          </IntoSidebarPanelExtensionActionRailSlot>
          <div>Stable extension child</div>
        </SidebarPanelExtensionProvider>
      )
    }

    renderRoot({
      children: (
        <SidebarBoundary id="simple-boundary" mode="simple">
          <Child />
        </SidebarBoundary>
      ),
    })

    expect(await screen.findByText('Stable extension child')).toBeInTheDocument()
    expect(screen.getByText('Base simple panel')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Toggle graph panel' })
    ).toBeInTheDocument()
    expect(screen.queryByText('Extension graph panel')).not.toBeInTheDocument()
    const mountCountAfterActivation = mountCount

    act(() => {
      useUIStore
        .getState()
        .setSidebarPanelExtensionRuntimeOptions('route-extension', {
          visiblePanels: ['main'],
          activePanel: 'main',
        })
    })

    expect(screen.getByText('Stable extension child')).toBeInTheDocument()
    expect(screen.getByText('Base simple panel')).toBeInTheDocument()
    expect(await screen.findByText('Extension graph panel')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-panel-extension-root')).toBeInTheDocument()
    expect(
      screen.getByTestId('sidebar-panel-extension-desktop-controls')
    ).toHaveAttribute(
      'data-sidebar-panel-extension-control-placement',
      'bottomActionRow'
    )
    expect(mountCount).toBe(mountCountAfterActivation)
  })

  it('hides floating base sidebar content while a replacement extension is expanded', async () => {
    renderRoot({
      children: (
        <SidebarBoundary id="replace-floating" mode="floating">
          <SidebarPanelExtensionProvider
            id="replacement-extension"
            initialRuntimeOptions={{
              visiblePanels: ['main'],
              activePanel: 'main',
              replaceBaseSidebar: true,
            }}
          >
            <IntoSidebarPanelExtensionPanelSlot panelId="main">
              <div>Replacement extension content</div>
            </IntoSidebarPanelExtensionPanelSlot>
            <div>Underlying floating sidebar content</div>
          </SidebarPanelExtensionProvider>
        </SidebarBoundary>
      ),
    })

    expect(
      await screen.findByText('Replacement extension content')
    ).toBeInTheDocument()
    expect(screen.getByText('Underlying floating sidebar content')).toBeInTheDocument()
    expect(document.querySelector('.sidebar-container')).toHaveStyle({
      display: 'none',
    })
    expect(screen.getByTestId('sidebar-panel-extension-root')).toHaveStyle({
      left: '0px',
    })
  })

  it('restores floating base sidebar content for collapsed replacement extensions', async () => {
    renderRoot({
      children: (
        <SidebarBoundary id="collapsed-replace-floating" mode="floating">
          <SidebarPanelExtensionProvider
            id="collapsed-replacement-extension"
            initialRuntimeOptions={{
              visiblePanels: [],
              activePanel: 'main',
              replaceBaseSidebar: true,
            }}
          >
            <IntoSidebarPanelExtensionActionRailSlot>
              <button type="button">Collapsed replacement action</button>
            </IntoSidebarPanelExtensionActionRailSlot>
            <div>Visible floating sidebar content</div>
          </SidebarPanelExtensionProvider>
        </SidebarBoundary>
      ),
    })

    expect(
      await screen.findByRole('button', {
        name: 'Collapsed replacement action',
      })
    ).toBeInTheDocument()
    expect(screen.getByText('Visible floating sidebar content')).toBeInTheDocument()
    expect(document.querySelector('.sidebar-container')).not.toHaveStyle({
      display: 'none',
    })
  })

  it('renders root-owned desktop tab controls for active extension tabs', async () => {
    renderRoot({
      children: (
        <SidebarPanelExtensionProvider
          id="desktop-tabs-extension"
          initialRuntimeOptions={{ visiblePanels: ['main'], activePanel: 'main' }}
        >
          <IntoSidebarPanelExtensionPanelSlot panelId="main">
            <SidebarPanelExtensionTabContainer tabId="first" tabName="First">
              <span>First extension tab body</span>
            </SidebarPanelExtensionTabContainer>
            <SidebarPanelExtensionTabContainer tabId="second" tabName="Second">
              <span>Second extension tab body</span>
            </SidebarPanelExtensionTabContainer>
          </IntoSidebarPanelExtensionPanelSlot>
        </SidebarPanelExtensionProvider>
      ),
    })

    expect(await screen.findByText('First extension tab body')).toBeInTheDocument()
    expect(
      screen.getByTestId('sidebar-panel-extension-desktop-tab-rail')
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('sidebar-panel-extension-mobile-tab-rail')
    ).not.toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'First' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })

  it('hides and restores active extension chrome with the sidebar toggle state', async () => {
    renderRoot({
      children: (
        <SidebarPanelExtensionProvider
          id="toggle-hidden-extension"
          initialRuntimeOptions={{
            visiblePanels: ['main'],
            activePanel: 'main',
            desktopPanelGroupMaxWidth: '1440px',
            forceMobileLayout: false,
          }}
        >
          <IntoSidebarPanelExtensionPanelSlot panelId="main">
            <span>Toggle hidden extension body</span>
          </IntoSidebarPanelExtensionPanelSlot>
          <IntoSidebarPanelExtensionActionRailSlot>
            <button type="button">Toggle hidden action</button>
          </IntoSidebarPanelExtensionActionRailSlot>
        </SidebarPanelExtensionProvider>
      ),
    })

    expect(
      await screen.findByText('Toggle hidden extension body')
    ).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-panel-extension-root')).toHaveStyle({
      visibility: 'visible',
    })

    act(() => {
      useUIStore.getState().setIsSidebarOpen(false)
    })

    expect(screen.getByTestId('sidebar-panel-extension-root')).toHaveStyle({
      visibility: 'hidden',
      pointerEvents: 'none',
    })
    expect(screen.getByText('Toggle hidden action')).toBeInTheDocument()

    act(() => {
      useUIStore.getState().setIsSidebarOpen(true)
    })

    expect(screen.getByTestId('sidebar-panel-extension-root')).toHaveStyle({
      visibility: 'visible',
    })
  })

  it('renders fullscreen desktop extension tabs in the bottom action row', async () => {
    renderRoot({
      children: (
        <SidebarPanelExtensionProvider
          id="fullscreen-tabs-extension"
          initialRuntimeOptions={{
            visiblePanels: ['main'],
            activePanel: 'main',
            layoutMode: 'fullscreen',
            desktopMainPanelWidth: '100%',
            desktopPanelGroupMaxWidth: '1440px',
          }}
        >
          <IntoSidebarPanelExtensionPanelSlot panelId="main">
            <SidebarPanelExtensionTabContainer tabId="first" tabName="First">
              <span>First fullscreen tab body</span>
            </SidebarPanelExtensionTabContainer>
            <SidebarPanelExtensionTabContainer tabId="second" tabName="Second">
              <span>Second fullscreen tab body</span>
            </SidebarPanelExtensionTabContainer>
          </IntoSidebarPanelExtensionPanelSlot>
        </SidebarPanelExtensionProvider>
      ),
    })

    expect(await screen.findByText('First fullscreen tab body')).toBeInTheDocument()

    const root = screen.getByTestId('sidebar-panel-extension-root')
    const panel = screen.getByTestId(
      'sidebar-panel-extension-desktop-panel-main'
    )
    const panelGroup = screen.getByTestId(
      'sidebar-panel-extension-desktop-panel-group'
    )
    const tabRail = screen.getByTestId(
      'sidebar-panel-extension-desktop-tab-rail'
    )
    const tabControls = screen.getByTestId(
      'sidebar-panel-extension-desktop-tab-controls'
    )

    expect(root).toHaveStyle({ left: '0px', right: '0px', width: '100vw' })
    expect(panelGroup).toHaveStyle({
      width: '100vw',
      maxWidth: '100vw',
      marginLeft: '0px',
      marginRight: '0px',
    })
    expect(panel).toHaveStyle({ width: '100vw' })
    expect(tabControls).toHaveAttribute(
      'data-sidebar-panel-extension-tab-placement',
      'bottomActionRow'
    )
    expect(tabControls).toHaveStyle({
      position: 'fixed',
      right: '71px',
      bottom: '16px',
    })
    expect(tabRail).toHaveStyle({ flexDirection: 'row' })
  })

  it('places sidebar-edge desktop action rails beside the current sidebar edge', async () => {
    renderRoot({
      children: (
        <SidebarPanelExtensionProvider
          id="sidebar-edge-action-extension"
          initialRuntimeOptions={{
            visiblePanels: [],
            activePanel: 'main',
            actionRailPlacement: 'sidebarEdgeActionColumn',
          }}
        >
          <IntoSidebarPanelExtensionActionRailSlot>
            <button type="button">Sidebar edge action</button>
          </IntoSidebarPanelExtensionActionRailSlot>
        </SidebarPanelExtensionProvider>
      ),
    })

    expect(
      await screen.findByRole('button', { name: 'Sidebar edge action' })
    ).toBeInTheDocument()

    const actionControls = screen.getByTestId(
      'sidebar-panel-extension-desktop-controls'
    )

    expect(actionControls).toHaveAttribute(
      'data-sidebar-panel-extension-control-placement',
      'sidebarEdgeActionColumn'
    )
    expect(actionControls).toHaveStyle({
      position: 'fixed',
      top: '16px',
      left: '16px',
      flexDirection: 'column',
    })
  })

  it('renders root-owned mobile tab controls in the bottom action row', async () => {
    mockIsMobile = true

    renderRoot({
      children: (
        <SidebarPanelExtensionProvider
          id="mobile-tabs-extension"
          initialRuntimeOptions={{
            visiblePanels: ['main'],
            activePanel: 'main',
            actionRailPlacement: 'bottomActionRow',
          }}
        >
          <IntoSidebarPanelExtensionPanelSlot panelId="main">
            <SidebarPanelExtensionTabContainer tabId="first" tabName="First">
              <span>First mobile extension tab body</span>
            </SidebarPanelExtensionTabContainer>
            <SidebarPanelExtensionTabContainer tabId="second" tabName="Second">
              <span>Second mobile extension tab body</span>
            </SidebarPanelExtensionTabContainer>
          </IntoSidebarPanelExtensionPanelSlot>
        </SidebarPanelExtensionProvider>
      ),
    })

    expect(
      await screen.findByText('First mobile extension tab body')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('sidebar-panel-extension-mobile-tab-rail')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('sidebar-panel-extension-mobile-controls')
    ).toHaveAttribute(
      'data-sidebar-panel-extension-tab-placement',
      'bottomActionRow'
    )
    expect(
      screen.queryByTestId('sidebar-panel-extension-desktop-tab-rail')
    ).not.toBeInTheDocument()
  })

  it.each([
    {
      label: 'simple sidebar',
      boundary: (
        children: React.ReactNode
      ): React.ReactNode => (
        <SidebarBoundary id="mobile-row-simple" mode="simple">
          {children}
        </SidebarBoundary>
      ),
    },
    {
      label: 'compact simple sidebar',
      boundary: (
        children: React.ReactNode
      ): React.ReactNode => (
        <SidebarBoundary
          id="mobile-row-simple-compact"
          mode="simple"
          config={{ width: 'compact' }}
        >
          {children}
        </SidebarBoundary>
      ),
    },
    {
      label: 'floating sidebar',
      boundary: (
        children: React.ReactNode
      ): React.ReactNode => (
        <SidebarBoundary id="mobile-row-floating" mode="floating">
          {children}
        </SidebarBoundary>
      ),
    },
    {
      label: 'compact floating sidebar',
      boundary: (
        children: React.ReactNode
      ): React.ReactNode => (
        <SidebarBoundary
          id="mobile-row-floating-compact"
          mode="floating"
          config={{ width: 'compact' }}
        >
          {children}
        </SidebarBoundary>
      ),
    },
  ])(
    'aligns mobile extension controls with the toggle row for $label',
    async ({ label, boundary }) => {
      mockIsMobile = true
      const extensionId = `extension-${label.replaceAll(' ', '-')}`

      renderRoot({
        children: boundary(renderMobileControlsExtension(extensionId)),
      })

      expect(
        await screen.findByText(`First ${extensionId} tab body`)
      ).toBeInTheDocument()

      expectMobileControlsToShareSidebarToggleRow(
        screen.getByTestId('sidebar-panel-extension-mobile-controls')
      )
    }
  )

  it('anchors mobile extension controls in the reserved toggle row when no base boundary is active', async () => {
    mockIsMobile = true

    renderRoot({
      children: renderMobileControlsExtension('extension-no-boundary'),
    })

    expect(
      await screen.findByText('First extension-no-boundary tab body')
    ).toBeInTheDocument()

    expectMobileControlsToReserveSidebarToggleLane(
      screen.getByTestId('sidebar-panel-extension-mobile-controls')
    )
  })

  it('aligns mobile action-only extension controls with the toggle row', async () => {
    mockIsMobile = true

    renderRoot({
      children: (
        <SidebarBoundary id="mobile-row-action-only" mode="simple">
          <SidebarPanelExtensionProvider
            id="action-only-extension"
            initialRuntimeOptions={{
              visiblePanels: [],
              activePanel: 'main',
              actionRailPlacement: 'bottomActionRow',
            }}
          >
            <IntoSidebarPanelExtensionActionRailSlot>
              <button type="button">Toggle action-only extension</button>
            </IntoSidebarPanelExtensionActionRailSlot>
          </SidebarPanelExtensionProvider>
        </SidebarBoundary>
      ),
    })

    expect(
      await screen.findByRole('button', {
        name: 'Toggle action-only extension',
      })
    ).toBeInTheDocument()

    expectMobileControlsToShareSidebarToggleRow(
      screen.getByTestId('sidebar-panel-extension-mobile-controls')
    )
  })

  it('stacks mobile extension panels before simple sidebar content when requested', async () => {
    mockIsMobile = true

    renderRoot({
      children: (
        <SidebarBoundary id="simple-stacked-before" mode="simple">
          <SidebarPanelExtensionProvider
            id="stacked-before-extension"
            initialRuntimeOptions={{
              visiblePanels: ['main'],
              activePanel: 'main',
              mobileMode: 'stacked',
              mobileStackPlacement: 'before',
            }}
          >
            <IntoSidebarPanelSlot panelId="main">
              <div>Base simple mobile content</div>
            </IntoSidebarPanelSlot>
            <IntoSidebarPanelExtensionPanelSlot panelId="main">
              <div>Stacked extension before content</div>
            </IntoSidebarPanelExtensionPanelSlot>
          </SidebarPanelExtensionProvider>
        </SidebarBoundary>
      ),
    })

    expect(
      await screen.findByText('Stacked extension before content')
    ).toBeInTheDocument()

    const stackedPanels = screen.getByTestId(
      'sidebar-panel-extension-mobile-panels'
    )
    const sidebarContainer = document.querySelector('.sidebar-container')

    expect(stackedPanels).toHaveAttribute(
      'data-sidebar-panel-extension-mobile-render',
      'stacked'
    )
    expect(stackedPanels).toHaveAttribute(
      'data-sidebar-panel-extension-mobile-stack-placement',
      'before'
    )
    expect(sidebarContainer).toContainElement(stackedPanels)
    expect(
      screen.queryByTestId('sidebar-panel-extension-mobile-panel-main')
    ).toBeInTheDocument()

    const contentText = sidebarContainer?.textContent ?? ''
    expect(contentText.indexOf('Stacked extension before content')).toBeLessThan(
      contentText.indexOf('Base simple mobile content')
    )
  })

  it('stacks mobile extension panels after simple sidebar content when requested', async () => {
    mockIsMobile = true

    renderRoot({
      children: (
        <SidebarBoundary id="simple-stacked-after" mode="simple">
          <SidebarPanelExtensionProvider
            id="stacked-after-extension"
            initialRuntimeOptions={{
              visiblePanels: ['main'],
              activePanel: 'main',
              mobileMode: 'stacked',
              mobileStackPlacement: 'after',
            }}
          >
            <IntoSidebarPanelSlot panelId="main">
              <div>Base simple content before extension</div>
            </IntoSidebarPanelSlot>
            <IntoSidebarPanelExtensionPanelSlot panelId="main">
              <div>Stacked extension after content</div>
            </IntoSidebarPanelExtensionPanelSlot>
          </SidebarPanelExtensionProvider>
        </SidebarBoundary>
      ),
    })

    expect(
      await screen.findByText('Stacked extension after content')
    ).toBeInTheDocument()

    const stackedPanels = screen.getByTestId(
      'sidebar-panel-extension-mobile-panels'
    )
    const sidebarContainer = document.querySelector('.sidebar-container')

    expect(stackedPanels).toHaveAttribute(
      'data-sidebar-panel-extension-mobile-render',
      'stacked'
    )
    expect(stackedPanels).toHaveAttribute(
      'data-sidebar-panel-extension-mobile-stack-placement',
      'after'
    )
    expect(sidebarContainer).toContainElement(stackedPanels)

    const contentText = sidebarContainer?.textContent ?? ''
    expect(
      contentText.indexOf('Base simple content before extension')
    ).toBeLessThan(contentText.indexOf('Stacked extension after content'))
  })

  it('preserves selected tabs across mobile stacked and overlay target transitions', async () => {
    mockIsMobile = true

    renderRoot({ children: <MobileTargetTransitionHarness /> })

    const assertConfiguration = async ({
      tabId,
      label,
      fullscreen,
    }: (typeof MOBILE_TARGET_TRANSITION_CONFIGURATIONS)[number]) => {
      const tab = await screen.findByRole('tab', { name: `Open ${label}` })

      if (tab.getAttribute('aria-selected') !== 'true') {
        fireEvent.click(tab)
      }

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: `Open ${label}` })).toHaveAttribute(
          'aria-selected',
          'true'
        )
        expect(
          screen.getByTestId(`mobile-transition-content-${tabId}`)
        ).toBeInTheDocument()
        expect(
          screen.getByTestId('sidebar-panel-extension-mobile-panels')
        ).toHaveAttribute(
          'data-sidebar-panel-extension-mobile-render',
          fullscreen ? 'overlay' : 'stacked'
        )
      })
    }

    for (const configuration of MOBILE_TARGET_TRANSITION_CONFIGURATIONS) {
      await assertConfiguration(configuration)
    }

    fireEvent.click(
      screen.getByRole('button', { name: 'Close transition extension' })
    )
    await waitFor(() => {
      expect(
        screen.queryByTestId('sidebar-panel-extension-mobile-panels')
      ).not.toBeInTheDocument()
    })

    fireEvent.click(
      screen.getByRole('button', { name: 'Reopen transition extension' })
    )

    for (const configuration of MOBILE_TARGET_TRANSITION_CONFIGURATIONS) {
      await assertConfiguration(configuration)
    }
  })

  it('keeps desktop tab rail beside the extension when action rail is fixed right', async () => {
    renderRoot({
      children: (
        <SidebarPanelExtensionProvider
          id="fixed-right-desktop-extension"
          initialRuntimeOptions={{
            visiblePanels: ['main'],
            activePanel: 'main',
            actionRailPlacement: 'fixedRightActionColumn',
          }}
        >
          <IntoSidebarPanelExtensionPanelSlot panelId="main">
            <SidebarPanelExtensionTabContainer tabId="first" tabName="First">
              <span>First fixed desktop tab body</span>
            </SidebarPanelExtensionTabContainer>
            <SidebarPanelExtensionTabContainer tabId="second" tabName="Second">
              <span>Second fixed desktop tab body</span>
            </SidebarPanelExtensionTabContainer>
          </IntoSidebarPanelExtensionPanelSlot>
          <IntoSidebarPanelExtensionActionRailSlot>
            <button type="button">Fixed right action</button>
          </IntoSidebarPanelExtensionActionRailSlot>
        </SidebarPanelExtensionProvider>
      ),
    })

    expect(
      await screen.findByText('First fixed desktop tab body')
    ).toBeInTheDocument()

    const tabRail = screen.getByTestId(
      'sidebar-panel-extension-desktop-tab-rail'
    )
    const tabControls = screen.getByTestId(
      'sidebar-panel-extension-desktop-tab-controls'
    )
    const actionControls = screen.getByTestId(
      'sidebar-panel-extension-desktop-controls'
    )

    expect(tabControls).toHaveAttribute(
      'data-sidebar-panel-extension-tab-placement',
      'sidebar-edge'
    )
    expect(tabControls).toContainElement(tabRail)
    expect(actionControls).toHaveAttribute(
      'data-sidebar-panel-extension-control-placement',
      'fixedRightActionColumn'
    )
    expect(actionControls).toContainElement(
      screen.getByRole('button', { name: 'Fixed right action' })
    )
    expect(actionControls).not.toContainElement(tabRail)
  })

  it('keeps mobile tabs in the bottom row when action rail is fixed right', async () => {
    mockIsMobile = true

    renderRoot({
      children: (
        <SidebarPanelExtensionProvider
          id="fixed-right-mobile-extension"
          initialRuntimeOptions={{
            visiblePanels: ['main'],
            activePanel: 'main',
            actionRailPlacement: 'fixedRightActionColumn',
          }}
        >
          <IntoSidebarPanelExtensionPanelSlot panelId="main">
            <SidebarPanelExtensionTabContainer tabId="first" tabName="First">
              <span>First fixed mobile tab body</span>
            </SidebarPanelExtensionTabContainer>
            <SidebarPanelExtensionTabContainer tabId="second" tabName="Second">
              <span>Second fixed mobile tab body</span>
            </SidebarPanelExtensionTabContainer>
          </IntoSidebarPanelExtensionPanelSlot>
          <IntoSidebarPanelExtensionActionRailSlot>
            <button type="button">Fixed mobile action</button>
          </IntoSidebarPanelExtensionActionRailSlot>
        </SidebarPanelExtensionProvider>
      ),
    })

    expect(
      await screen.findByText('First fixed mobile tab body')
    ).toBeInTheDocument()

    const tabRail = screen.getByTestId(
      'sidebar-panel-extension-mobile-tab-rail'
    )
    const tabControls = screen.getByTestId(
      'sidebar-panel-extension-mobile-controls'
    )
    const actionControls = screen.getByTestId(
      'sidebar-panel-extension-mobile-action-rail'
    )

    expect(tabControls).toHaveAttribute(
      'data-sidebar-panel-extension-tab-placement',
      'bottomActionRow'
    )
    expect(tabControls).toContainElement(tabRail)
    expect(tabControls).not.toContainElement(
      screen.getByRole('button', { name: 'Fixed mobile action' })
    )
    expect(actionControls).toHaveAttribute(
      'data-sidebar-panel-extension-control-placement',
      'fixedRightActionColumn'
    )
    expect(actionControls).toContainElement(
      screen.getByRole('button', { name: 'Fixed mobile action' })
    )
  })

  it('renders tab containers as ordinary simple content outside an extension context', async () => {
    renderRoot({
      children: (
        <SidebarBoundary id="simple-tabs" mode="simple">
          <IntoSidebarPanelSlot panelId="main">
            <SidebarPanelExtensionTabContainer tabId="first" tabName="First">
              <span>First simple tab body</span>
            </SidebarPanelExtensionTabContainer>
            <SidebarPanelExtensionTabContainer tabId="second" tabName="Second">
              <span>Second simple tab body</span>
            </SidebarPanelExtensionTabContainer>
          </IntoSidebarPanelSlot>
        </SidebarBoundary>
      ),
    })

    expect(await screen.findByText('First simple tab body')).toBeInTheDocument()
    expect(screen.getByText('Second simple tab body')).toBeInTheDocument()
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: 'First' })).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('sidebar-panel-extension-desktop-tab-rail')
    ).not.toBeInTheDocument()
  })
})
