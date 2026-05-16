import { useUIStore } from './uiStore'
import { selectActiveSidebarBoundaryId } from '#/common/utils/sidebarBoundaryRegistry'

const resetSidebarBoundaryRegistry = () => {
  useUIStore.setState({
    sidebarBoundaries: {},
    _sidebarBoundaryRegistrationOrder: 0,
  })
}

const activeBoundaryId = () =>
  selectActiveSidebarBoundaryId(useUIStore.getState().sidebarBoundaries)

describe('uiStore sidebar boundary registry', () => {
  beforeEach(() => {
    resetSidebarBoundaryRegistry()
  })

  it('returns to the parent boundary when the child unregisters', () => {
    useUIStore.getState().registerSidebarBoundary({
      id: 'parent',
      mode: 'floating',
      depth: 0,
    })
    useUIStore.getState().registerSidebarBoundary({
      id: 'child',
      mode: 'panel',
      depth: 1,
    })

    expect(activeBoundaryId()).toBe('child')

    useUIStore.getState().unregisterSidebarBoundary('child')

    expect(activeBoundaryId()).toBe('parent')
  })

  it('does not clear a child boundary when a parent unregisters', () => {
    useUIStore.getState().registerSidebarBoundary({
      id: 'parent',
      mode: 'floating',
      depth: 0,
    })
    useUIStore.getState().registerSidebarBoundary({
      id: 'child',
      mode: 'panel',
      depth: 1,
    })

    useUIStore.getState().unregisterSidebarBoundary('parent')

    expect(activeBoundaryId()).toBe('child')
    expect(useUIStore.getState().sidebarBoundaries.child).toMatchObject({
      id: 'child',
      mode: 'panel',
      depth: 1,
    })
  })

  it('uses the latest registration for same-depth boundaries', () => {
    useUIStore.getState().registerSidebarBoundary({
      id: 'first',
      mode: 'floating',
      depth: 0,
    })
    useUIStore.getState().registerSidebarBoundary({
      id: 'second',
      mode: 'home',
      depth: 0,
    })

    expect(activeBoundaryId()).toBe('second')
  })

  it('does not make an older same-depth boundary latest when it is updated', () => {
    useUIStore.getState().registerSidebarBoundary({
      id: 'first',
      mode: 'floating',
      depth: 0,
    })
    useUIStore.getState().registerSidebarBoundary({
      id: 'second',
      mode: 'home',
      depth: 0,
    })
    const firstOrder =
      useUIStore.getState().sidebarBoundaries.first?.registrationOrder

    useUIStore.getState().updateSidebarBoundary('first', {
      mode: 'panel',
      config: {
        panelLayout: 'double',
      },
    })

    expect(activeBoundaryId()).toBe('second')
    expect(
      useUIStore.getState().sidebarBoundaries.first?.registrationOrder
    ).toBe(firstOrder)
    expect(useUIStore.getState().sidebarBoundaries.first).toMatchObject({
      mode: 'panel',
      config: {
        panelLayout: 'double',
      },
    })
  })

  it('preserves registration order when registering an existing id', () => {
    useUIStore.getState().registerSidebarBoundary({
      id: 'first',
      mode: 'floating',
      depth: 0,
    })
    useUIStore.getState().registerSidebarBoundary({
      id: 'second',
      mode: 'home',
      depth: 0,
    })
    const firstOrder =
      useUIStore.getState().sidebarBoundaries.first?.registrationOrder

    useUIStore.getState().registerSidebarBoundary({
      id: 'first',
      mode: 'panel',
      depth: 0,
      runtimeOptions: {
        activePanel: 'secondary',
      },
    })

    expect(activeBoundaryId()).toBe('second')
    expect(
      useUIStore.getState().sidebarBoundaries.first?.registrationOrder
    ).toBe(firstOrder)
    expect(useUIStore.getState().sidebarBoundaries.first).toMatchObject({
      mode: 'panel',
      runtimeOptions: {
        activePanel: 'secondary',
      },
    })
  })

  it('keeps runtime updates scoped to the target boundary id', () => {
    useUIStore.getState().registerSidebarBoundary({
      id: 'first',
      mode: 'panel',
      depth: 0,
      runtimeOptions: {
        activePanel: 'main',
      },
    })
    useUIStore.getState().registerSidebarBoundary({
      id: 'second',
      mode: 'panel',
      depth: 1,
      runtimeOptions: {
        activePanel: 'secondary',
      },
    })

    useUIStore.getState().setSidebarBoundaryRuntimeOptions('first', {
      activePanel: 'tertiary',
      mainPanelVisible: false,
    })

    expect(useUIStore.getState().sidebarBoundaries.first?.runtimeOptions).toEqual(
      {
        activePanel: 'tertiary',
        mainPanelVisible: false,
      }
    )
    expect(
      useUIStore.getState().sidebarBoundaries.second?.runtimeOptions
    ).toEqual({
      activePanel: 'secondary',
    })

    useUIStore.getState().resetSidebarBoundaryRuntimeOptions('first')

    expect(useUIStore.getState().sidebarBoundaries.first?.runtimeOptions).toEqual(
      {}
    )
    expect(
      useUIStore.getState().sidebarBoundaries.second?.runtimeOptions
    ).toEqual({
      activePanel: 'secondary',
    })
  })

  it('allows a none-mode boundary to override an inherited parent', () => {
    useUIStore.getState().registerSidebarBoundary({
      id: 'parent',
      mode: 'floating',
      depth: 0,
    })
    useUIStore.getState().registerSidebarBoundary({
      id: 'none-child',
      mode: 'none',
      depth: 1,
    })

    expect(activeBoundaryId()).toBe('none-child')
    expect(useUIStore.getState().sidebarBoundaries['none-child']?.mode).toBe(
      'none'
    )
  })
})
