import { useUIStore } from './uiStore'
import { selectActiveSidebarBoundaryId } from '#/common/utils/sidebarBoundaryRegistry'

const resetSidebarBoundaryRegistry = () => {
  useUIStore.setState({
    sidebarBoundaries: {},
    _sidebarBoundaryRegistrationOrder: 0,
    sidebarPanelExtensions: {},
    _sidebarPanelExtensionRegistrationOrder: 0,
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
      mode: 'simple',
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
      mode: 'simple',
      depth: 1,
    })

    useUIStore.getState().unregisterSidebarBoundary('parent')

    expect(activeBoundaryId()).toBe('child')
    expect(useUIStore.getState().sidebarBoundaries.child).toMatchObject({
      id: 'child',
      mode: 'simple',
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
      mode: 'simple',
      config: {
        panelLayout: 'double',
      },
    })

    expect(activeBoundaryId()).toBe('second')
    expect(
      useUIStore.getState().sidebarBoundaries.first?.registrationOrder
    ).toBe(firstOrder)
    expect(useUIStore.getState().sidebarBoundaries.first).toMatchObject({
      mode: 'simple',
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
      mode: 'simple',
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
      mode: 'simple',
      runtimeOptions: {
        activePanel: 'secondary',
      },
    })
  })

  it('keeps runtime updates scoped to the target boundary id', () => {
    useUIStore.getState().registerSidebarBoundary({
      id: 'first',
      mode: 'simple',
      depth: 0,
      runtimeOptions: {
        activePanel: 'main',
      },
    })
    useUIStore.getState().registerSidebarBoundary({
      id: 'second',
      mode: 'simple',
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

describe('uiStore sidebar panel extension registry', () => {
  beforeEach(() => {
    resetSidebarBoundaryRegistry()
  })

  it('tracks active extension by depth and registration order', () => {
    useUIStore.getState().registerSidebarPanelExtension({
      id: 'parent-extension',
      depth: 0,
    })
    useUIStore.getState().registerSidebarPanelExtension({
      id: 'child-extension',
      depth: 1,
    })

    expect(useUIStore.getState().sidebarPanelExtensions).toMatchObject({
      'parent-extension': { id: 'parent-extension', depth: 0 },
      'child-extension': { id: 'child-extension', depth: 1 },
    })

    useUIStore.getState().unregisterSidebarPanelExtension('child-extension')

    expect(
      useUIStore.getState().sidebarPanelExtensions['child-extension']
    ).toBeUndefined()
    expect(
      useUIStore.getState().sidebarPanelExtensions['parent-extension']
    ).toMatchObject({ id: 'parent-extension', depth: 0 })
  })

  it('patches and resets extension runtime options independently from boundaries', () => {
    useUIStore.getState().registerSidebarBoundary({
      id: 'simple-boundary',
      mode: 'simple',
      depth: 0,
      runtimeOptions: {
        activePanel: 'secondary',
      },
    })
    useUIStore.getState().registerSidebarPanelExtension({
      id: 'graph-extension',
      depth: 0,
      runtimeOptions: {
        activePanel: 'main',
      },
    })

    useUIStore.getState().setSidebarPanelExtensionRuntimeOptions(
      'graph-extension',
      {
        visiblePanels: ['main'],
        actionRailPlacement: 'bottomActionRow',
      }
    )

    expect(
      useUIStore.getState().sidebarPanelExtensions['graph-extension']
        ?.runtimeOptions
    ).toEqual({
      activePanel: 'main',
      visiblePanels: ['main'],
      actionRailPlacement: 'bottomActionRow',
    })
    expect(
      useUIStore.getState().sidebarBoundaries['simple-boundary']?.runtimeOptions
    ).toEqual({
      activePanel: 'secondary',
    })

    useUIStore
      .getState()
      .resetSidebarPanelExtensionRuntimeOptions('graph-extension')

    expect(
      useUIStore.getState().sidebarPanelExtensions['graph-extension']
        ?.runtimeOptions
    ).toEqual({})
  })

  it('registers tabs, switches active tab, and falls back when the active tab unregisters', () => {
    useUIStore.getState().registerSidebarPanelExtension({
      id: 'tab-extension',
      depth: 0,
    })

    useUIStore.getState().registerSidebarPanelExtensionTab('tab-extension', {
      tabId: 'first',
      tabName: 'First',
      tabButtonId: 'first-button',
      tabPanelId: 'first-panel',
    })
    useUIStore.getState().registerSidebarPanelExtensionTab('tab-extension', {
      tabId: 'second',
      tabName: 'Second',
      tabButtonId: 'second-button',
      tabPanelId: 'second-panel',
    })

    expect(
      useUIStore.getState().sidebarPanelExtensions['tab-extension']?.activeTabId
    ).toBe('first')

    useUIStore
      .getState()
      .setSidebarPanelExtensionActiveTab('tab-extension', 'second')

    expect(
      useUIStore.getState().sidebarPanelExtensions['tab-extension']?.activeTabId
    ).toBe('second')

    useUIStore
      .getState()
      .unregisterSidebarPanelExtensionTab('tab-extension', 'second')

    expect(
      useUIStore.getState().sidebarPanelExtensions['tab-extension']?.activeTabId
    ).toBe('first')
  })
})
