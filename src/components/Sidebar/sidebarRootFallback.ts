import type { SidebarVariant } from '#/common/store/uiStore'

export type SidebarRootFallbackKind =
  | 'none'
  | 'home'
  | 'floating-default'
  | 'floating-compact'
  | 'panel-simple'

export type ResolveSidebarRootFallbackInput = {
  pathnameWithoutLocale: string
  compiledApplets: string[]
  sidebarVariant: SidebarVariant
  isMapLayoutSidebarDisabled: boolean
}

const isStandaloneApplet = (compiledApplets: string[], applet: string) =>
  compiledApplets.length === 1 && compiledApplets[0] === applet

// Temporary F026 compatibility fallback. Remove in F026.7 after routes declare
// explicit SidebarBoundary ownership.
export const resolveSidebarRootFallback = ({
  pathnameWithoutLocale,
  compiledApplets,
  sidebarVariant,
  isMapLayoutSidebarDisabled,
}: ResolveSidebarRootFallbackInput): SidebarRootFallbackKind => {
  if (isMapLayoutSidebarDisabled) {
    return 'none'
  }

  const isStandaloneHiilikartta = isStandaloneApplet(
    compiledApplets,
    'hiilikartta'
  )
  const isStandaloneEnergiakartta = isStandaloneApplet(
    compiledApplets,
    'energiakartta'
  )
  const isStandaloneForests = isStandaloneApplet(compiledApplets, 'forests')

  const useAppletOwnedSidebar =
    pathnameWithoutLocale.startsWith('/hiilikartta/kaavat') ||
    (isStandaloneHiilikartta && pathnameWithoutLocale.startsWith('/kaavat')) ||
    pathnameWithoutLocale === '/energiakartta' ||
    (isStandaloneEnergiakartta && pathnameWithoutLocale === '/') ||
    pathnameWithoutLocale === '/forests' ||
    (isStandaloneForests && pathnameWithoutLocale === '/')

  if (useAppletOwnedSidebar) {
    return 'none'
  }

  const useHomeSidebar =
    pathnameWithoutLocale === '/' &&
    !isStandaloneHiilikartta &&
    !isStandaloneEnergiakartta

  if (useHomeSidebar) {
    return 'home'
  }

  const useCompactFloatingSidebar =
    pathnameWithoutLocale === '/hiilikartta' ||
    (isStandaloneHiilikartta && pathnameWithoutLocale === '/')

  if (useCompactFloatingSidebar) {
    return 'floating-compact'
  }

  if (sidebarVariant === 'simple') {
    return 'panel-simple'
  }

  return 'floating-default'
}
