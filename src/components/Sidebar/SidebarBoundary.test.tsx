import React from 'react'
import { render } from '@testing-library/react'

import { useUIStore } from '#/common/store/uiStore'
import type { SidebarRuntimeOptions } from '#/common/types/sidebar'
import { selectActiveSidebarBoundaryId } from '#/common/utils/sidebarBoundaryRegistry'

import {
  SidebarBoundary,
  useSidebarBoundaryRuntimeOptions,
} from './SidebarBoundary'

const resetSidebarBoundaryRegistry = () => {
  useUIStore.setState({
    sidebarBoundaries: {},
    _sidebarBoundaryRegistrationOrder: 0,
  })
}

const activeBoundaryId = () =>
  selectActiveSidebarBoundaryId(useUIStore.getState().sidebarBoundaries)

const NestedBoundaries = ({ showChild }: { showChild: boolean }) => (
  <SidebarBoundary id="parent" mode="floating">
    {showChild && (
      <SidebarBoundary id="child" mode="simple">
        Child content
      </SidebarBoundary>
    )}
  </SidebarBoundary>
)

const RuntimeOptionsWriter = ({
  runtimeOptions,
}: {
  runtimeOptions: SidebarRuntimeOptions
}) => {
  useSidebarBoundaryRuntimeOptions(runtimeOptions)

  return null
}

describe('SidebarBoundary', () => {
  beforeEach(() => {
    resetSidebarBoundaryRegistry()
  })

  it('registers nested boundaries with child depth winning active selection', () => {
    const { rerender, unmount } = render(<NestedBoundaries showChild />)

    expect(activeBoundaryId()).toBe('child')
    expect(useUIStore.getState().sidebarBoundaries.parent?.depth).toBe(0)
    expect(useUIStore.getState().sidebarBoundaries.child?.depth).toBe(1)

    rerender(<NestedBoundaries showChild={false} />)

    expect(activeBoundaryId()).toBe('parent')

    unmount()

    expect(activeBoundaryId()).toBeUndefined()
  })

  it('updates boundary props without changing registration order', () => {
    const { rerender } = render(
      <SidebarBoundary id="boundary" mode="floating" />
    )
    const registrationOrder =
      useUIStore.getState().sidebarBoundaries.boundary?.registrationOrder

    rerender(
      <SidebarBoundary
        id="boundary"
        mode="simple"
        config={{
          panelLayout: 'double',
        }}
      />
    )

    expect(
      useUIStore.getState().sidebarBoundaries.boundary?.registrationOrder
    ).toBe(registrationOrder)
    expect(useUIStore.getState().sidebarBoundaries.boundary).toMatchObject({
      mode: 'simple',
      config: {
        panelLayout: 'double',
      },
    })
  })

  it('writes and resets scoped runtime options from a boundary child', () => {
    const RuntimeBoundary = ({ showWriter }: { showWriter: boolean }) => (
      <SidebarBoundary id="runtime-boundary" mode="simple">
        {showWriter && (
          <RuntimeOptionsWriter
            runtimeOptions={{
              panelLayout: 'double',
              visiblePanels: ['secondary'],
              activePanel: 'secondary',
              mobileMode: 'stacked',
              mobileStackPlacement: 'before',
            }}
          />
        )}
      </SidebarBoundary>
    )

    const { rerender } = render(<RuntimeBoundary showWriter />)

    expect(
      useUIStore.getState().sidebarBoundaries['runtime-boundary']
        ?.runtimeOptions
    ).toEqual({
      panelLayout: 'double',
      visiblePanels: ['secondary'],
      activePanel: 'secondary',
      mobileMode: 'stacked',
      mobileStackPlacement: 'before',
    })

    rerender(<RuntimeBoundary showWriter={false} />)

    expect(
      useUIStore.getState().sidebarBoundaries['runtime-boundary']
        ?.runtimeOptions
    ).toEqual({})
  })
})
