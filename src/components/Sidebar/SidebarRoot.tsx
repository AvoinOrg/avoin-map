'use client'

import React, { useMemo } from 'react'

import { useUIStore } from '#/common/store'
import type {
  SidebarBoundaryRegistration,
  SidebarFloatingConfig,
  SidebarRuntimeOptions,
  SidebarSimpleConfig,
} from '#/common/types/sidebar'
import { selectActiveSidebarBoundary } from '#/common/utils/sidebarBoundaryRegistry'

import FloatingSidebar from './FloatingSidebar'
import type { FloatingSidebarWidth } from './FloatingSidebar'
import HomeSidebar from './HomeSidebar'
import SimpleSidebar from './SimpleSidebar'

export type SidebarRootProps = {
  children?: React.ReactNode
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

export const SidebarRoot = ({ children }: SidebarRootProps) => {
  const sidebarBoundaries = useUIStore((state) => state.sidebarBoundaries)
  const activeBoundary = useMemo(
    () => selectActiveSidebarBoundary(sidebarBoundaries),
    [sidebarBoundaries]
  )

  if (activeBoundary == null) {
    return <>{children}</>
  }

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
      >
        {children}
      </FloatingSidebar>
    )
  }

  if (activeBoundary.mode === 'simple') {
    return (
      <SimpleSidebar
        boundaryId={activeBoundary.id}
        options={options as SidebarSimpleConfig}
      >
        {children}
      </SimpleSidebar>
    )
  }

  return <>{children}</>
}

export default SidebarRoot
