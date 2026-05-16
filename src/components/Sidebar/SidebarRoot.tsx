'use client'

import React, { useMemo } from 'react'
import { useParams, usePathname } from 'next/navigation'

import { useUIStore } from '#/common/store'
import type {
  SidebarBoundaryRegistration,
  SidebarFloatingConfig,
  SidebarPanelConfig,
  SidebarRuntimeOptions,
} from '#/common/types/sidebar'
import { selectActiveSidebarBoundary } from '#/common/utils/sidebarBoundaryRegistry'
import {
  compiledApplets,
  getPathnameWithoutLocale,
} from '#/common/routing/routing'

import FloatingSidebar from './FloatingSidebar'
import type { FloatingSidebarWidth } from './FloatingSidebar'
import HomeSidebar from './HomeSidebar'
import PanelSidebar from './PanelSidebar'
import {
  resolveSidebarRootFallback,
} from './sidebarRootFallback'
import type { ResolveSidebarRootFallbackInput } from './sidebarRootFallback'

export type SidebarRootProps = {
  children?: React.ReactNode
  fallbackContext?: ResolveSidebarRootFallbackInput
}

const mergeBoundaryOptions = (
  boundary: SidebarBoundaryRegistration
): SidebarRuntimeOptions => ({
  ...(boundary.config ?? {}),
  ...boundary.runtimeOptions,
})

const getFloatingWidth = (
  options: SidebarRuntimeOptions | SidebarFloatingConfig
): FloatingSidebarWidth => (options.width === 'compact' ? 'compact' : 'default')

const getFallbackContext = ({
  pathname,
  locale,
  sidebarVariant,
  isMapLayoutSidebarDisabled,
}: {
  pathname: string
  locale: string | string[] | null
  sidebarVariant: ResolveSidebarRootFallbackInput['sidebarVariant']
  isMapLayoutSidebarDisabled: boolean
}): ResolveSidebarRootFallbackInput => ({
  pathnameWithoutLocale: getPathnameWithoutLocale(pathname, locale),
  compiledApplets,
  sidebarVariant,
  isMapLayoutSidebarDisabled,
})

export const SidebarRoot = ({
  children,
  fallbackContext,
}: SidebarRootProps) => {
  const pathname = usePathname()
  const { locale } = useParams()
  const sidebarBoundaries = useUIStore((state) => state.sidebarBoundaries)
  const sidebarVariant = useUIStore((state) => state.sidebarVariant)
  const isMapLayoutSidebarDisabled = useUIStore(
    (state) => state.isMapLayoutSidebarDisabled
  )
  const activeBoundary = useMemo(
    () => selectActiveSidebarBoundary(sidebarBoundaries),
    [sidebarBoundaries]
  )

  if (activeBoundary != null) {
    const options = mergeBoundaryOptions(activeBoundary)

    if (activeBoundary.mode === 'none') {
      return <>{children}</>
    }

    if (activeBoundary.mode === 'home') {
      return <HomeSidebar>{children}</HomeSidebar>
    }

    if (activeBoundary.mode === 'floating') {
      const width = getFloatingWidth(options)

      return (
        <FloatingSidebar
          boundaryId={activeBoundary.id}
          width={width}
          headerMode={width === 'compact' ? 'custom' : 'default'}
          footerMode="slot"
          chromeHidden={options.chrome === 'hidden'}
          hideMainContainer={options.mainPanelVisible === false}
          contentMode={options.floatingContentMode}
          togglePlacement={options.floatingTogglePlacement}
        >
          {children}
        </FloatingSidebar>
      )
    }

    return (
      <PanelSidebar
        boundaryId={activeBoundary.id}
        options={options as SidebarPanelConfig}
      >
        {children}
      </PanelSidebar>
    )
  }

  const resolvedFallbackContext =
    fallbackContext ??
    getFallbackContext({
      pathname,
      locale: locale ?? null,
      sidebarVariant,
      isMapLayoutSidebarDisabled,
    })
  const fallback = resolveSidebarRootFallback(resolvedFallbackContext)

  if (fallback === 'none') {
    return <>{children}</>
  }

  if (fallback === 'home') {
    return <HomeSidebar>{children}</HomeSidebar>
  }

  if (fallback === 'floating-compact') {
    return (
      <FloatingSidebar width="compact" headerMode="custom" footerMode="slot">
        {children}
      </FloatingSidebar>
    )
  }

  if (fallback === 'panel-simple') {
    return <PanelSidebar>{children}</PanelSidebar>
  }

  return <FloatingSidebar>{children}</FloatingSidebar>
}

export default SidebarRoot
