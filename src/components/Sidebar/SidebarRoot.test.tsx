import React, { useEffect } from 'react'
import '@testing-library/jest-dom'
import { act, render, screen } from '@testing-library/react'

import { useUIStore } from '#/common/store/uiStore'
import type { SidebarMode, SidebarRuntimeOptions } from '#/common/types/sidebar'
import { SlotsProvider } from '#/components/context/slotsContext'

import { SidebarBoundary } from './SidebarBoundary'
import { SidebarRoot } from './SidebarRoot'
import type { ResolveSidebarRootFallbackInput } from './sidebarRootFallback'
import {
  IntoSidebarActionRailSlot,
  IntoSidebarFloatingTrailingSlot,
  IntoSidebarHeaderChildrenSlot,
  IntoSidebarPanelSlot,
} from './sidebarSlots'

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useParams: () => ({ locale: 'fi' }),
}))

jest.mock('#/common/store', () => ({
  useUIStore: jest.requireActual('#/common/store/uiStore').useUIStore,
}))

jest.mock('#/common/hooks/ui/useIsMobile', () => ({
  useIsMobile: () => false,
}))

const fallbackContext: ResolveSidebarRootFallbackInput = {
  pathnameWithoutLocale: '/',
  compiledApplets: ['main', 'hiilikartta'],
  sidebarVariant: 'default',
  isMapLayoutSidebarDisabled: false,
}

const resetUIStore = () => {
  useUIStore.setState({
    sidebarBoundaries: {},
    _sidebarBoundaryRegistrationOrder: 0,
    isSidebarOpen: true,
    isSidebarDisabled: false,
    isMapLayoutSidebarDisabled: false,
    isSidebarDrawerOpen: false,
    isSidebarDrawerOverlay: false,
    isSidebarHeaderHidden: false,
    isSidebarLoading: false,
    sidebarVariant: 'default',
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

const renderRoot = ({
  children,
  fallback = fallbackContext,
}: {
  children: React.ReactNode
  fallback?: ResolveSidebarRootFallbackInput
}) =>
  render(
    <SlotsProvider>
      <SidebarRoot fallbackContext={fallback}>{children}</SidebarRoot>
    </SlotsProvider>
  )

describe('SidebarRoot', () => {
  beforeEach(() => {
    resetUIStore()
  })

  it('lets an active none boundary override the compatibility fallback', () => {
    seedBoundary({ id: 'none-boundary', mode: 'none' })

    renderRoot({ children: <div>Raw child</div> })

    expect(screen.getByText('Raw child')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /hide sidebar/i })
    ).not.toBeInTheDocument()
  })

  it('lets an active boundary override a fallback that would render no shell', () => {
    seedBoundary({ id: 'floating-boundary', mode: 'floating' })

    renderRoot({
      children: <div>Floating child</div>,
      fallback: {
        ...fallbackContext,
        pathnameWithoutLocale: '/energiakartta',
      },
    })

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
      fallback: {
        ...fallbackContext,
        pathnameWithoutLocale: '/luonnonmetsakartat',
      },
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

  it('hosts scoped floating compatibility slots without remounting on runtime option changes', async () => {
    let mountCount = 0

    const Child = () => {
      useEffect(() => {
        mountCount += 1
      }, [])

      return (
        <>
          <IntoSidebarFloatingTrailingSlot>
            <div>Scoped floating trailing</div>
          </IntoSidebarFloatingTrailingSlot>
          <IntoSidebarActionRailSlot>
            <button type="button">Scoped floating action</button>
          </IntoSidebarActionRailSlot>
          <div>Stable floating child</div>
        </>
      )
    }

    renderRoot({
      children: (
        <SidebarBoundary
          id="energiakartta-floating"
          mode="floating"
          config={{ width: 'compact' }}
          initialRuntimeOptions={{
            mainPanelVisible: true,
            chrome: 'visible',
            floatingContentMode: 'default',
            floatingTogglePlacement: 'default',
          }}
        >
          <Child />
        </SidebarBoundary>
      ),
      fallback: {
        ...fallbackContext,
        pathnameWithoutLocale: '/energiakartta',
      },
    })

    expect(await screen.findByText('Stable floating child')).toBeInTheDocument()
    expect(screen.getByText('Scoped floating trailing')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Scoped floating action' })
    ).toBeInTheDocument()
    const mountCountAfterActivation = mountCount

    act(() => {
      useUIStore
        .getState()
        .setSidebarBoundaryRuntimeOptions('energiakartta-floating', {
          mainPanelVisible: false,
          chrome: 'hidden',
          floatingContentMode: 'fullscreenPanel',
          floatingTogglePlacement: 'bottomActionRow',
        })
    })

    expect(screen.getByText('Stable floating child')).toBeInTheDocument()
    expect(screen.getByText('Scoped floating trailing')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Scoped floating action' })
    ).toBeInTheDocument()
    expect(mountCount).toBe(mountCountAfterActivation)
  })

  it('hosts scoped panel slots, header children, and a closed panel action rail', async () => {
    renderRoot({
      children: (
        <SidebarBoundary
          id="route-panel"
          mode="panel"
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

  it('keeps a panel boundary child mounted when panel runtime options open', async () => {
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
          mode="panel"
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
