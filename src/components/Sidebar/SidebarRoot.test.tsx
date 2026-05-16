import React, { useEffect } from 'react'
import '@testing-library/jest-dom'
import { act, render, screen } from '@testing-library/react'

import { useUIStore } from '#/common/store/uiStore'
import type { SidebarMode, SidebarRuntimeOptions } from '#/common/types/sidebar'
import { SlotsProvider } from '#/components/context/slotsContext'

import { SidebarRoot } from './SidebarRoot'
import type { ResolveSidebarRootFallbackInput } from './sidebarRootFallback'

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
})
