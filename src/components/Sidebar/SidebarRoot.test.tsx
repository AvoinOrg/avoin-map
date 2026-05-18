import React, { useEffect } from 'react'
import '@testing-library/jest-dom'
import { act, render, screen } from '@testing-library/react'

import { useUIStore } from '#/common/store/uiStore'
import type { SidebarMode, SidebarRuntimeOptions } from '#/common/types/sidebar'
import { SlotsProvider } from '#/components/context/slotsContext'

import { SidebarBoundary } from './SidebarBoundary'
import { PanelSidebarTabContainer } from './PanelSidebarTabContainer'
import { SidebarRoot } from './SidebarRoot'
import {
  IntoSidebarActionRailSlot,
  IntoSidebarHeaderChildrenSlot,
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

describe('SidebarRoot', () => {
  beforeEach(() => {
    mockIsMobile = false
    resetUIStore()
  })

  it('renders raw children when no boundary is registered', () => {
    renderRoot({ children: <div>Raw child</div> })

    expect(screen.getByText('Raw child')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /hide sidebar/i })
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

  it('keeps the child subtree mounted when runtime options change within one mode', () => {
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

  it('hosts simple scoped main and secondary slots without remounting on runtime option changes', async () => {
    let mountCount = 0

    const Child = () => {
      useEffect(() => {
        mountCount += 1
      }, [])

      return (
        <>
          <IntoSidebarPanelSlot panelId="main">
            <div>Scoped energy panel</div>
          </IntoSidebarPanelSlot>
          <IntoSidebarPanelSlot panelId="secondary">
            <div>Scoped renovation panel</div>
          </IntoSidebarPanelSlot>
          <IntoSidebarActionRailSlot>
            <button type="button">Scoped graph action</button>
          </IntoSidebarActionRailSlot>
          <div>Stable panel child</div>
        </>
      )
    }

    renderRoot({
      children: (
        <SidebarBoundary
          id="simple-boundary"
          mode="simple"
          config={{ panelLayout: 'double' }}
          initialRuntimeOptions={{
            panelLayout: 'double',
            visiblePanels: ['main'],
            activePanel: 'main',
          }}
        >
          <Child />
        </SidebarBoundary>
      ),
    })

    expect(await screen.findByText('Stable panel child')).toBeInTheDocument()
    expect(screen.getByText('Scoped energy panel')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Scoped graph action' })
    ).toBeInTheDocument()
    expect(screen.queryByText('Scoped renovation panel')).not.toBeInTheDocument()
    const mountCountAfterActivation = mountCount

    act(() => {
      useUIStore
        .getState()
        .setSidebarBoundaryRuntimeOptions('simple-boundary', {
          panelLayout: 'double',
          visiblePanels: ['secondary'],
          activePanel: 'secondary',
          actionRailPlacement: 'fixedBottomActionRow',
        })
    })

    expect(screen.getByText('Stable panel child')).toBeInTheDocument()
    expect(screen.getByText('Scoped energy panel')).toBeInTheDocument()
    expect(screen.getByText('Scoped renovation panel')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Scoped graph action' })
    ).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-action-rail')).toHaveAttribute(
      'data-sidebar-action-rail-placement',
      'fixedBottomActionRow'
    )
    expect(screen.getByTestId('sidebar-action-rail')).toHaveAttribute(
      'data-sidebar-action-rail-fixed',
      'true'
    )
    expect(mountCount).toBe(mountCountAfterActivation)

    act(() => {
      useUIStore
        .getState()
        .setSidebarBoundaryRuntimeOptions('simple-boundary', {
          panelLayout: 'double',
          visiblePanels: ['main'],
          activePanel: 'main',
          actionRailPlacement: 'fixedRightActionColumn',
        })
    })

    expect(screen.getByText('Stable panel child')).toBeInTheDocument()
    expect(screen.getByText('Scoped energy panel')).toBeInTheDocument()
    expect(
      screen.queryByText('Scoped renovation panel')
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Scoped graph action' })
    ).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-action-rail')).toHaveAttribute(
      'data-sidebar-action-rail-placement',
      'fixedRightActionColumn'
    )
    expect(screen.getByTestId('sidebar-action-rail')).toHaveAttribute(
      'data-sidebar-action-rail-fixed',
      'true'
    )
    expect(mountCount).toBe(mountCountAfterActivation)
  })

  it('keeps the simple child subtree mounted when mobile stacked panels open', async () => {
    mockIsMobile = true
    let mountCount = 0

    const Child = () => {
      useEffect(() => {
        mountCount += 1
      }, [])

      return (
        <>
          <IntoSidebarPanelSlot panelId="main">
            <div>Scoped mobile energy panel</div>
          </IntoSidebarPanelSlot>
          <IntoSidebarPanelSlot panelId="secondary">
            <div>Scoped mobile renovation panel</div>
          </IntoSidebarPanelSlot>
          <IntoSidebarActionRailSlot>
            <button type="button">Scoped mobile graph action</button>
          </IntoSidebarActionRailSlot>
          <div>Stable mobile panel child</div>
        </>
      )
    }

    renderRoot({
      children: (
        <SidebarBoundary
          id="simple-mobile-boundary"
          mode="simple"
          config={{ panelLayout: 'double' }}
          initialRuntimeOptions={{
            panelLayout: 'double',
            visiblePanels: ['main'],
            activePanel: 'main',
            mobileMode: 'stacked',
          }}
        >
          <Child />
        </SidebarBoundary>
      ),
    })

    expect(
      await screen.findByText('Stable mobile panel child')
    ).toBeInTheDocument()
    expect(screen.getByText('Scoped mobile energy panel')).toBeInTheDocument()
    expect(
      screen.queryByText('Scoped mobile renovation panel')
    ).not.toBeInTheDocument()
    const mountCountAfterActivation = mountCount

    act(() => {
      useUIStore
        .getState()
        .setSidebarBoundaryRuntimeOptions('simple-mobile-boundary', {
          panelLayout: 'double',
          visiblePanels: ['secondary'],
          activePanel: 'secondary',
          mobileMode: 'stacked',
          actionRailPlacement: 'bottomActionRow',
        })
    })

    expect(screen.getByText('Stable mobile panel child')).toBeInTheDocument()
    expect(screen.getByText('Scoped mobile energy panel')).toBeInTheDocument()
    expect(
      screen.getByText('Scoped mobile renovation panel')
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Scoped mobile graph action' })
    ).toBeInTheDocument()
    expect(mountCount).toBe(mountCountAfterActivation)
  })

  it('renders panel tab containers as ordinary simple content without a tab rail', async () => {
    renderRoot({
      children: (
        <SidebarBoundary id="simple-tabs" mode="simple">
          <IntoSidebarPanelSlot panelId="main">
            <PanelSidebarTabContainer tabId="first" tabName="First">
              <span>First simple tab body</span>
            </PanelSidebarTabContainer>
            <PanelSidebarTabContainer tabId="second" tabName="Second">
              <span>Second simple tab body</span>
            </PanelSidebarTabContainer>
          </IntoSidebarPanelSlot>
        </SidebarBoundary>
      ),
    })

    expect(await screen.findByText('First simple tab body')).toBeInTheDocument()
    expect(screen.getByText('Second simple tab body')).toBeInTheDocument()
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: 'First' })).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('panel-sidebar-tab-rail')
    ).not.toBeInTheDocument()
  })

  it('hosts scoped panel slots, header children, and a closed panel action rail', async () => {
    renderRoot({
      children: (
        <SidebarBoundary
          id="route-panel"
          mode="simple"
          config={{ panelLayout: 'double' }}
          initialRuntimeOptions={{
            visiblePanels: [],
            activePanel: 'main',
            mobileMode: 'stacked',
          }}
        >
          <IntoSidebarHeaderChildrenSlot>
            <span>Panel breadcrumb</span>
          </IntoSidebarHeaderChildrenSlot>
          <IntoSidebarPanelSlot panelId="main">
            <span>Main panel slot content</span>
          </IntoSidebarPanelSlot>
          <IntoSidebarPanelSlot panelId="secondary">
            <span>Secondary panel slot content</span>
          </IntoSidebarPanelSlot>
          <IntoSidebarActionRailSlot>
            <button type="button">Toggle graph panel</button>
          </IntoSidebarActionRailSlot>
        </SidebarBoundary>
      ),
    })

    expect(await screen.findByText('Panel breadcrumb')).toBeInTheDocument()
    expect(screen.getByText('Main panel slot content')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Toggle graph panel' })
    ).toBeInTheDocument()
    expect(
      screen.queryByText('Secondary panel slot content')
    ).not.toBeInTheDocument()

    act(() => {
      useUIStore
        .getState()
        .setSidebarBoundaryRuntimeOptions('route-panel', {
          visiblePanels: ['secondary'],
          activePanel: 'secondary',
        })
    })

    expect(
      await screen.findByText('Secondary panel slot content')
    ).toBeInTheDocument()
  })

  it('keeps a simple boundary child mounted when panel runtime options open', async () => {
    let mountCount = 0

    const Child = () => {
      useEffect(() => {
        mountCount += 1
      }, [])

      return (
        <>
          <IntoSidebarPanelSlot panelId="main">
            <span>Stable panel child</span>
          </IntoSidebarPanelSlot>
          <IntoSidebarPanelSlot panelId="secondary">
            <span>Runtime secondary child</span>
          </IntoSidebarPanelSlot>
        </>
      )
    }

    renderRoot({
      children: (
        <SidebarBoundary
          id="stable-panel"
          mode="simple"
          config={{ panelLayout: 'double' }}
          initialRuntimeOptions={{
            visiblePanels: [],
            activePanel: 'main',
          }}
        >
          <Child />
        </SidebarBoundary>
      ),
    })

    expect(await screen.findByText('Stable panel child')).toBeInTheDocument()
    const mountCountAfterActivation = mountCount

    act(() => {
      useUIStore
        .getState()
        .setSidebarBoundaryRuntimeOptions('stable-panel', {
          visiblePanels: ['secondary'],
          activePanel: 'secondary',
        })
    })

    expect(await screen.findByText('Runtime secondary child')).toBeInTheDocument()
    expect(mountCount).toBe(mountCountAfterActivation)
  })
})
