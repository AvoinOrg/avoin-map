import type { SidebarPanelExtensionRegistration } from '#/common/types/sidebar'

import {
  selectActiveSidebarPanelExtension,
  selectActiveSidebarPanelExtensionId,
} from './sidebarPanelExtensionRegistry'

const extension = ({
  id,
  depth,
  registrationOrder,
}: {
  id: string
  depth: number
  registrationOrder: number
}): SidebarPanelExtensionRegistration => ({
  id,
  depth,
  runtimeOptions: {},
  registrationOrder,
})

describe('sidebar panel extension registry selection', () => {
  it('returns undefined when no extensions are registered', () => {
    expect(selectActiveSidebarPanelExtension({})).toBeUndefined()
    expect(selectActiveSidebarPanelExtensionId({})).toBeUndefined()
  })

  it('selects a child extension over its parent', () => {
    const parent = extension({
      id: 'parent',
      depth: 0,
      registrationOrder: 2,
    })
    const child = extension({
      id: 'child',
      depth: 1,
      registrationOrder: 1,
    })

    expect(selectActiveSidebarPanelExtension({ parent, child })).toBe(child)
    expect(selectActiveSidebarPanelExtensionId({ parent, child })).toBe('child')
  })

  it('selects the latest registration when extensions have the same depth', () => {
    const first = extension({
      id: 'first',
      depth: 0,
      registrationOrder: 1,
    })
    const second = extension({
      id: 'second',
      depth: 0,
      registrationOrder: 2,
    })

    expect(selectActiveSidebarPanelExtension({ second, first })).toBe(second)
  })
})
