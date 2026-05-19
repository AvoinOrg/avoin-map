'use client'

import React, { useMemo } from 'react'

import { useUIStore } from '#/common/store'
import type {
  SidebarBoundaryRegistration,
  SidebarFloatingConfig,
  SidebarPanelExtensionRegistration,
  SidebarPanelExtensionRuntimeOptions,
  SidebarRuntimeOptions,
  SidebarSimpleConfig,
} from '#/common/types/sidebar'
import { selectActiveSidebarBoundary } from '#/common/utils/sidebarBoundaryRegistry'
import { selectActiveSidebarPanelExtension } from '#/common/utils/sidebarPanelExtensionRegistry'

import FloatingSidebar from './FloatingSidebar'
import type { FloatingSidebarWidth } from './FloatingSidebar'
import HomeSidebar from './HomeSidebar'
import {
  SidebarPanelExtension,
  SidebarPanelExtensionMobileStackedPanels,
  SidebarPanelExtensionTabRail,
} from './SidebarPanelExtension'
import {
  SidebarPanelExtensionTabsProvider,
  useSidebarPanelExtensionTabsRegistryContext,
} from './SidebarPanelExtensionTabsContext'
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

const mergePanelExtensionOptions = (
  extension: SidebarPanelExtensionRegistration
): SidebarPanelExtensionRuntimeOptions => ({
  ...(extension.config ?? {}),
  ...extension.runtimeOptions,
})

const getFloatingWidth = (
  options: SidebarRuntimeOptions | SidebarFloatingConfig
): FloatingSidebarWidth => (options.width === 'compact' ? 'compact' : 'default')

const SidebarRootContent = ({ children }: SidebarRootProps) => {
  const sidebarBoundaries = useUIStore((state) => state.sidebarBoundaries)
  const sidebarPanelExtensions = useUIStore(
    (state) => state.sidebarPanelExtensions
  )
  const sidebarWidth = useUIStore((state) => state.sidebarWidth)
  const sidebarPanelExtensionTabs =
    useSidebarPanelExtensionTabsRegistryContext()
  const activeBoundary = useMemo(
    () => selectActiveSidebarBoundary(sidebarBoundaries),
    [sidebarBoundaries]
  )
  const activePanelExtension = useMemo(
    () => selectActiveSidebarPanelExtension(sidebarPanelExtensions),
    [sidebarPanelExtensions]
  )
  const panelExtensionOptions =
    activePanelExtension == null
      ? undefined
      : mergePanelExtensionOptions(activePanelExtension)
  const panelExtensionMobileMode =
    panelExtensionOptions?.mobileMode ?? 'stacked'
  const panelExtensionVisiblePanels =
    panelExtensionOptions?.visiblePanels ?? ['main']
  const shouldReplaceBaseSidebar =
    activePanelExtension != null &&
    panelExtensionOptions?.replaceBaseSidebar === true &&
    panelExtensionVisiblePanels.length > 0
  const shouldStackPanelExtensionInSimpleSidebar =
    activePanelExtension != null &&
    !shouldReplaceBaseSidebar &&
    activeBoundary?.mode === 'simple' &&
    panelExtensionMobileMode === 'stacked'
  const mobileStackedPanelExtension =
    shouldStackPanelExtensionInSimpleSidebar && activePanelExtension != null ? (
      <SidebarPanelExtensionMobileStackedPanels
        extensionId={activePanelExtension.id}
        options={panelExtensionOptions}
      />
    ) : undefined
  const mobileStackPlacement =
    panelExtensionOptions?.mobileStackPlacement ?? 'after'
  const mobileStackedPanelExtensionBefore =
    mobileStackPlacement === 'before' ? mobileStackedPanelExtension : undefined
  const mobileStackedPanelExtensionAfter =
    mobileStackPlacement === 'after' ? mobileStackedPanelExtension : undefined

  const baseSidebar = (() => {
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
          hideMainContainer={
            shouldReplaceBaseSidebar || options.mainPanelVisible === false
          }
        >
          {children}
        </FloatingSidebar>
      )
    }

    if (activeBoundary.mode === 'simple') {
      return (
        <SimpleSidebar
          boundaryId={activeBoundary.id}
          options={
            {
              ...(options as SidebarSimpleConfig),
              mainPanelVisible: shouldReplaceBaseSidebar
                ? false
                : options.mainPanelVisible,
            } as SidebarSimpleConfig
          }
          mobileStackedContentBefore={mobileStackedPanelExtensionBefore}
          mobileStackedContentAfter={mobileStackedPanelExtensionAfter}
        >
          {children}
        </SimpleSidebar>
      )
    }

    return <>{children}</>
  })()

  const activePanelExtensionTabs =
    activePanelExtension == null
      ? undefined
      : sidebarPanelExtensionTabs.registry[activePanelExtension.id]
  const tabs = activePanelExtensionTabs?.tabs ?? []
  const resolvedActiveTabId =
    tabs.find((tab) => tab.tabId === activePanelExtensionTabs?.activeTabId)
      ?.tabId ?? tabs[0]?.tabId
  const hasPanelExtensionTabRail =
    activePanelExtension != null && tabs.length >= 2
  const desktopTabRail =
    activePanelExtension != null && hasPanelExtensionTabRail ? (
      <SidebarPanelExtensionTabRail
        tabs={tabs}
        activeTabId={resolvedActiveTabId}
        placement="desktop"
        onTabChange={(tabId) =>
          sidebarPanelExtensionTabs.setActiveTabId(
            activePanelExtension.id,
            tabId
          )
        }
      />
    ) : undefined
  const mobileTabRail =
    activePanelExtension != null && hasPanelExtensionTabRail ? (
      <SidebarPanelExtensionTabRail
        tabs={tabs}
        activeTabId={resolvedActiveTabId}
        placement="mobile"
        onTabChange={(tabId) =>
          sidebarPanelExtensionTabs.setActiveTabId(
            activePanelExtension.id,
            tabId
          )
        }
      />
    ) : undefined
  const sidebarOffset =
    shouldReplaceBaseSidebar
      ? 0
      : activeBoundary != null && activeBoundary.mode !== 'none'
      ? (sidebarWidth ?? 0)
      : 0

  return (
    <>
      {baseSidebar}
      {activePanelExtension != null && (
        <SidebarPanelExtension
          extensionId={activePanelExtension.id}
          options={panelExtensionOptions}
          sidebarOffset={sidebarOffset}
          desktopTabRail={desktopTabRail}
          mobileTabRail={mobileTabRail}
          suppressMobileStackedPanels={shouldStackPanelExtensionInSimpleSidebar}
        />
      )}
    </>
  )
}

export const SidebarRoot = ({ children }: SidebarRootProps) => (
  <SidebarPanelExtensionTabsProvider>
    <SidebarRootContent>{children}</SidebarRootContent>
  </SidebarPanelExtensionTabsProvider>
)

export default SidebarRoot
