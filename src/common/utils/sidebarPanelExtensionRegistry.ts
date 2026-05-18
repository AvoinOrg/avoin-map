import type {
  SidebarPanelExtensionId,
  SidebarPanelExtensionRegistration,
  SidebarPanelExtensionRegistry,
} from '#/common/types/sidebar'

export const selectActiveSidebarPanelExtension = (
  extensions: SidebarPanelExtensionRegistry
): SidebarPanelExtensionRegistration | undefined => {
  let activeExtension: SidebarPanelExtensionRegistration | undefined

  for (const extension of Object.values(extensions)) {
    if (extension == null) {
      continue
    }

    if (
      activeExtension == null ||
      extension.depth > activeExtension.depth ||
      (extension.depth === activeExtension.depth &&
        extension.registrationOrder > activeExtension.registrationOrder)
    ) {
      activeExtension = extension
    }
  }

  return activeExtension
}

export const selectActiveSidebarPanelExtensionId = (
  extensions: SidebarPanelExtensionRegistry
): SidebarPanelExtensionId | undefined =>
  selectActiveSidebarPanelExtension(extensions)?.id
