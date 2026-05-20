import type {
  SidebarBoundaryId,
  SidebarBoundaryRegistration,
  SidebarBoundaryRegistry,
  SidebarMode,
} from '#/common/types/sidebar'

export const selectActiveSidebarBoundary = (
  boundaries: SidebarBoundaryRegistry
): SidebarBoundaryRegistration | undefined => {
  let activeBoundary: SidebarBoundaryRegistration | undefined

  for (const boundary of Object.values(boundaries)) {
    if (boundary == null) {
      continue
    }

    if (
      activeBoundary == null ||
      boundary.depth > activeBoundary.depth ||
      (boundary.depth === activeBoundary.depth &&
        boundary.registrationOrder > activeBoundary.registrationOrder)
    ) {
      activeBoundary = boundary
    }
  }

  return activeBoundary
}

export const selectActiveSidebarBoundaryId = (
  boundaries: SidebarBoundaryRegistry
): SidebarBoundaryId | undefined => selectActiveSidebarBoundary(boundaries)?.id

export const selectActiveSidebarMode = (
  boundaries: SidebarBoundaryRegistry
): SidebarMode | undefined => selectActiveSidebarBoundary(boundaries)?.mode
