import type {
  SidebarBoundaryRegistration,
  SidebarMode,
} from '#/common/types/sidebar'

import {
  selectActiveSidebarBoundary,
  selectActiveSidebarBoundaryId,
} from './sidebarBoundaryRegistry'

const boundary = ({
  id,
  depth,
  registrationOrder,
  mode = 'floating',
}: {
  id: string
  depth: number
  registrationOrder: number
  mode?: SidebarMode
}): SidebarBoundaryRegistration => ({
  id,
  mode,
  depth,
  runtimeOptions: {},
  registrationOrder,
})

describe('sidebar boundary registry selection', () => {
  it('returns undefined when no boundaries are registered', () => {
    expect(selectActiveSidebarBoundary({})).toBeUndefined()
    expect(selectActiveSidebarBoundaryId({})).toBeUndefined()
  })

  it('selects the only registered parent boundary', () => {
    const parent = boundary({
      id: 'parent',
      depth: 0,
      registrationOrder: 1,
    })

    expect(selectActiveSidebarBoundary({ parent })).toBe(parent)
    expect(selectActiveSidebarBoundaryId({ parent })).toBe('parent')
  })

  it('selects a child boundary over its parent', () => {
    const parent = boundary({
      id: 'parent',
      depth: 0,
      registrationOrder: 2,
    })
    const child = boundary({
      id: 'child',
      depth: 1,
      registrationOrder: 1,
    })

    expect(selectActiveSidebarBoundary({ parent, child })).toBe(child)
  })

  it('selects the latest registration when boundaries have the same depth', () => {
    const first = boundary({
      id: 'first',
      depth: 0,
      registrationOrder: 1,
    })
    const second = boundary({
      id: 'second',
      depth: 0,
      registrationOrder: 2,
    })

    expect(selectActiveSidebarBoundary({ second, first })).toBe(second)
  })

  it('ignores undefined registry entries', () => {
    const child = boundary({
      id: 'child',
      depth: 1,
      registrationOrder: 1,
    })

    expect(
      selectActiveSidebarBoundary({
        parent: undefined,
        child,
      })
    ).toBe(child)
  })

  it('allows a none-mode boundary to become active', () => {
    const parent = boundary({
      id: 'parent',
      depth: 0,
      registrationOrder: 1,
    })
    const noneBoundary = boundary({
      id: 'none-boundary',
      depth: 1,
      registrationOrder: 2,
      mode: 'none',
    })

    expect(
      selectActiveSidebarBoundary({
        parent,
        noneBoundary,
      })
    ).toBe(noneBoundary)
  })
})
