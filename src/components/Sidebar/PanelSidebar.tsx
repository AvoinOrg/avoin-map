'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Box } from '@mui/material'
import type { SxProps, Theme } from '@mui/material'

import {
  HIILIKARTTA_HOME_FLOATING_GUTTER_PX,
  MAP_CONTROL_EDGE_GUTTER_PX,
} from '#/common/constants/map'
import type {
  SidebarBoundaryId,
  SidebarPanelConfig as SidebarPanelOptions,
  SidebarPanelId,
} from '#/common/types/sidebar'

import SimpleSidebar from './SimpleSidebar'
import type {
  SimpleSidebarMobilePanel,
  SimpleSidebarPanelsConfig,
} from './SimpleSidebar'
import { PanelSidebarTabIconButton } from './PanelSidebarTabIconButton'
import {
  PanelSidebarTabsContext,
  type PanelSidebarTabMetadata,
} from './PanelSidebarTabsContext'
import {
  SidebarActionRailSlot,
  SidebarFooterSlot,
  SidebarHeaderChildrenSlot,
  SidebarHeaderSlot,
  SidebarPanelSlot,
} from './sidebarSlots'

export type PanelSidebarProps = {
  sx?: SxProps<Theme>
  panels?: SimpleSidebarPanelsConfig
  boundaryId?: SidebarBoundaryId
  options?: SidebarPanelOptions
  children: React.ReactNode
}

const panelSlotContent = ({
  boundaryId,
  panelId,
}: {
  boundaryId: SidebarBoundaryId
  panelId: SidebarPanelId
}) => <SidebarPanelSlot boundaryId={boundaryId} panelId={panelId} />

const FULL_WIDTH_MAIN_PANEL_WIDTH = '30.5556vw'
const FULL_WIDTH_SECONDARY_PANEL_WIDTH = '38.8889vw'
const FULL_WIDTH_TERTIARY_PANEL_WIDTH = '30.5556vw'
const WIDE_SINGLE_MAIN_PANEL_WIDTH = 'min(1440px, 100vw)'
const DEFAULT_PANEL_WIDTH = '23.75rem'

const hasFullWidthPanelLayout = (options?: SidebarPanelOptions) => {
  const visiblePanels = options?.visiblePanels ?? []

  return (
    options?.width === 'wide' &&
    options.panelLayout === 'triple' &&
    visiblePanels.includes('main') &&
    visiblePanels.includes('secondary') &&
    visiblePanels.includes('tertiary')
  )
}

const hasWideSingleMainPanelLayout = (options?: SidebarPanelOptions) => {
  const visiblePanels = options?.visiblePanels ?? ['main']

  return (
    options?.width === 'wide' &&
    options.chrome === 'hidden' &&
    options.panelLayout === 'single' &&
    visiblePanels.length === 1 &&
    visiblePanels.includes('main')
  )
}

export const getPanelSidebarMainPanelWidth = (
  options?: SidebarPanelOptions
) =>
  hasFullWidthPanelLayout(options)
    ? FULL_WIDTH_MAIN_PANEL_WIDTH
    : hasWideSingleMainPanelLayout(options)
      ? WIDE_SINGLE_MAIN_PANEL_WIDTH
    : DEFAULT_PANEL_WIDTH

const getExtraPanelWidth = ({
  panelId,
  options,
}: {
  panelId: Exclude<SidebarPanelId, 'main'>
  options?: SidebarPanelOptions
}) => {
  if (!hasFullWidthPanelLayout(options)) {
    return DEFAULT_PANEL_WIDTH
  }

  return panelId === 'secondary'
    ? FULL_WIDTH_SECONDARY_PANEL_WIDTH
    : FULL_WIDTH_TERTIARY_PANEL_WIDTH
}

const toSingleMobilePanel = (
  activePanel: SidebarPanelId | undefined,
  panelId: SidebarPanelId
): Extract<SimpleSidebarMobilePanel, 'main' | 'a'> =>
  activePanel === panelId ? 'a' : 'main'

const toDoubleMobilePanel = (
  activePanel: SidebarPanelId | undefined
): Extract<SimpleSidebarMobilePanel, 'a' | 'b'> =>
  activePanel === 'tertiary' ? 'b' : 'a'

const getScopedPanelsConfig = ({
  boundaryId,
  options,
  actionRail,
}: {
  boundaryId?: SidebarBoundaryId
  options?: SidebarPanelOptions
  actionRail?: React.ReactNode
}): SimpleSidebarPanelsConfig | undefined => {
  if (boundaryId == null) {
    return undefined
  }

  const visiblePanels = options?.visiblePanels ?? ['main']
  const visibleExtraPanels = visiblePanels.filter(
    (panelId): panelId is Exclude<SidebarPanelId, 'main'> =>
      panelId === 'secondary' || panelId === 'tertiary'
  )
  const capacityPanels: Exclude<SidebarPanelId, 'main'>[] =
    options?.panelLayout === 'triple'
      ? ['secondary', 'tertiary']
      : options?.panelLayout === 'double'
        ? visibleExtraPanels.length > 0
          ? [visibleExtraPanels[0]]
          : ['secondary']
        : options?.panelLayout === 'single'
          ? []
          : visibleExtraPanels

  if (capacityPanels.length === 0) {
    return undefined
  }

  const panelLocalScrollContentSx =
    options?.chrome === 'hidden'
      ? {
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          height: '100%',
          maxHeight: '100%',
          minHeight: 0,
          width: '100%',
        }
      : undefined
  const openExtraPanels = capacityPanels.filter((panelId) =>
    visibleExtraPanels.includes(panelId)
  )

  if (
    capacityPanels.includes('secondary') &&
    capacityPanels.includes('tertiary') &&
    openExtraPanels.includes('secondary') &&
    openExtraPanels.includes('tertiary')
  ) {
    return {
      mode: 'double',
      mobileMode: options?.mobileMode,
      mobileActivePanel: toDoubleMobilePanel(options?.activePanel),
      desktopMainPanelVisible:
        options?.mainPanelVisible !== false && visiblePanels.includes('main'),
      mobileMainPanelVisible:
        options?.mainPanelVisible !== false && visiblePanels.includes('main'),
      desktopActionRail: actionRail,
      mobileActionRail: actionRail,
      panelA: {
        content: panelSlotContent({ boundaryId, panelId: 'secondary' }),
        desktopWidth: getExtraPanelWidth({ panelId: 'secondary', options }),
        desktopContentSx: panelLocalScrollContentSx,
      },
      panelB: {
        content: panelSlotContent({ boundaryId, panelId: 'tertiary' }),
        desktopWidth: getExtraPanelWidth({ panelId: 'tertiary', options }),
        desktopContentSx: panelLocalScrollContentSx,
      },
    }
  }

  const panelId = openExtraPanels[0] ?? capacityPanels[0]

  return {
    mode: 'single',
    isOpen: openExtraPanels.includes(panelId),
    mobileMode: options?.mobileMode,
    mobileStackPlacement: options?.mobileStackPlacement,
    mobileStackRender: 'direct',
    mobileActivePanel: toSingleMobilePanel(options?.activePanel, panelId),
    desktopActionRail: actionRail,
    mobileActionRail: actionRail,
    panel: {
      content: panelSlotContent({ boundaryId, panelId }),
      desktopWidth: getExtraPanelWidth({ panelId, options }),
      desktopContentSx: panelLocalScrollContentSx,
    },
  }
}

const getPanelSidebarSx = (
  sx: SxProps<Theme> | undefined,
  options?: SidebarPanelOptions
): SxProps<Theme> => {
  const floatingGutter = `${HIILIKARTTA_HOME_FLOATING_GUTTER_PX}px`
  const mainPanelWidth = getPanelSidebarMainPanelWidth(options)
  const hiddenChromeHeightSx =
    options?.chrome === 'hidden'
      ? {
          height: '100dvh',
          maxHeight: '100dvh',
          minHeight: 0,
        }
      : undefined

  return [
    options?.width === 'compact'
      ? {
          pt: { mobile: 0, desktop: floatingGutter },
          pb: { mobile: 0, desktop: floatingGutter },
          ml: { mobile: 0, desktop: floatingGutter },
          width: { mobile: '100vw', desktop: DEFAULT_PANEL_WIDTH },
          maxWidth: {
            mobile: '100vw',
            desktop: `min(${DEFAULT_PANEL_WIDTH}, calc(100vw - ${floatingGutter}))`,
          },
        }
      : {
          width: { mobile: '100vw', desktop: mainPanelWidth },
          maxWidth: { mobile: '100vw', desktop: `min(${mainPanelWidth}, 100vw)` },
        },
    hiddenChromeHeightSx,
    ...(Array.isArray(sx) ? sx : [sx]),
  ]
}

const getPanelSidebarToggleSx = (
  options?: SidebarPanelOptions
): SxProps<Theme> | undefined => {
  if (options?.width !== 'compact') {
    return undefined
  }

  const toggleGutter = `${MAP_CONTROL_EDGE_GUTTER_PX}px`

  return {
    right: { mobile: '1rem', desktop: toggleGutter },
    bottom: { mobile: '1rem', desktop: toggleGutter },
  }
}

const areTabMetadataEqual = (
  previous: PanelSidebarTabMetadata,
  next: PanelSidebarTabMetadata
) =>
  previous.tabId === next.tabId &&
  previous.tabName === next.tabName &&
  previous.tabAriaLabel === next.tabAriaLabel &&
  previous.tabIcon === next.tabIcon &&
  previous.tabButtonSx === next.tabButtonSx &&
  previous.tabIconSx === next.tabIconSx &&
  previous.tabButtonId === next.tabButtonId &&
  previous.tabPanelId === next.tabPanelId

const getPanelSidebarContentSx = ({
  options,
  hasTabs,
}: {
  options?: SidebarPanelOptions
  hasTabs: boolean
}): SxProps<Theme> | undefined => {
  if (!hasTabs && options?.chrome !== 'hidden') {
    return undefined
  }

  return {
    overflow: 'hidden',
    height: '100%',
    maxHeight: '100%',
    minHeight: 0,
    width: '100%',
    alignItems: 'stretch',
  }
}

const PanelSidebarTabRail = ({
  tabs,
  activeTabId,
  onTabChange,
}: {
  tabs: PanelSidebarTabMetadata[]
  activeTabId?: string
  onTabChange: (tabId: string) => void
}) => {
  if (tabs.length < 2) {
    return null
  }

  return (
    <Box
      role="tablist"
      aria-label="Sidebar panel tabs"
      data-testid="panel-sidebar-tab-rail"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        pointerEvents: 'auto',
      }}
    >
      {tabs.map((tab) => (
        <PanelSidebarTabIconButton
          key={tab.tabId}
          tabId={tab.tabId}
          tabName={tab.tabName}
          ariaLabel={tab.tabAriaLabel}
          icon={tab.tabIcon}
          selected={tab.tabId === activeTabId}
          buttonId={tab.tabButtonId}
          controlsId={tab.tabPanelId}
          onSelect={onTabChange}
          sx={tab.tabButtonSx}
          iconSx={tab.tabIconSx}
        />
      ))}
    </Box>
  )
}

export const PanelSidebar = ({
  sx,
  panels,
  boundaryId,
  options,
  children,
}: PanelSidebarProps) => {
  const [tabs, setTabs] = useState<PanelSidebarTabMetadata[]>([])
  const [activeTabId, setActiveTabId] = useState<string | undefined>()
  const resolvedActiveTabId = activeTabId ?? tabs[0]?.tabId

  const registerTab = useCallback((tab: PanelSidebarTabMetadata) => {
    setTabs((currentTabs) => {
      const tabIndex = currentTabs.findIndex(
        (currentTab) => currentTab.tabId === tab.tabId
      )

      if (tabIndex === -1) {
        return [...currentTabs, tab]
      }

      if (areTabMetadataEqual(currentTabs[tabIndex], tab)) {
        return currentTabs
      }

      return currentTabs.map((currentTab, index) =>
        index === tabIndex ? tab : currentTab
      )
    })
  }, [])

  const unregisterTab = useCallback((tabId: string) => {
    setTabs((currentTabs) =>
      currentTabs.filter((currentTab) => currentTab.tabId !== tabId)
    )
  }, [])

  useEffect(() => {
    const firstTabId = tabs[0]?.tabId

    if (firstTabId == null) {
      if (activeTabId !== undefined) {
        setActiveTabId(undefined)
      }
      return
    }

    if (
      activeTabId == null ||
      !tabs.some((tab) => tab.tabId === activeTabId)
    ) {
      setActiveTabId(firstTabId)
    }
  }, [activeTabId, tabs])

  const tabsContextValue = useMemo(
    () => ({
      tabs,
      activeTabId,
      resolvedActiveTabId,
      setActiveTabId,
      registerTab,
      unregisterTab,
    }),
    [activeTabId, registerTab, resolvedActiveTabId, tabs, unregisterTab]
  )

  const scopedActionRailSlot = useMemo(
    () =>
      boundaryId != null ? (
        <SidebarActionRailSlot boundaryId={boundaryId} />
      ) : undefined,
    [boundaryId]
  )
  const tabRail = useMemo(
    () =>
      tabs.length >= 2 ? (
        <PanelSidebarTabRail
          tabs={tabs}
          activeTabId={resolvedActiveTabId}
          onTabChange={setActiveTabId}
        />
      ) : undefined,
    [resolvedActiveTabId, tabs]
  )
  const combinedActionRail = useMemo(() => {
    if (tabRail == null && scopedActionRailSlot == null) {
      return undefined
    }

    if (scopedActionRailSlot != null) {
      return (
        <>
          {tabRail}
          {scopedActionRailSlot}
        </>
      )
    }

    return tabRail
  }, [scopedActionRailSlot, tabRail])
  const scopedPanels = useMemo(
    () =>
      getScopedPanelsConfig({
        boundaryId,
        options,
        actionRail: combinedActionRail,
      }),
    [boundaryId, combinedActionRail, options]
  )
  const headerChildren =
    boundaryId != null ? (
      <SidebarHeaderChildrenSlot boundaryId={boundaryId} />
    ) : undefined
  const scopedTopContent =
    options?.chrome === 'hidden'
      ? null
      : options?.width === 'compact' && boundaryId != null
        ? <SidebarHeaderSlot boundaryId={boundaryId} />
        : undefined
  const scopedBottomContent =
    options?.chrome === 'hidden'
      ? null
      : options?.width === 'compact' && boundaryId != null
        ? <SidebarFooterSlot boundaryId={boundaryId} />
        : undefined

  return (
    <PanelSidebarTabsContext.Provider value={tabsContextValue}>
      <SimpleSidebar
        sx={getPanelSidebarSx(sx, options)}
        sidebarToggleSx={getPanelSidebarToggleSx(options)}
        panels={panels ?? scopedPanels}
        headerChildren={headerChildren}
        topContent={scopedTopContent}
        bottomContent={scopedBottomContent}
        actionRail={
          panels == null && scopedPanels == null ? combinedActionRail : undefined
        }
        actionRailPlacement={options?.actionRailPlacement}
        hideMainContainer={options?.mainPanelVisible === false}
        panelSx={
          options?.width === 'compact'
            ? {
                borderRadius: { mobile: 0, desktop: '10px' },
                backgroundColor: '#f4f4f4',
              }
            : undefined
        }
        contentSx={getPanelSidebarContentSx({
          options,
          hasTabs: tabs.length > 0,
        })}
      >
        {boundaryId != null && (
          <SidebarPanelSlot boundaryId={boundaryId} panelId="main" />
        )}
        {children}
      </SimpleSidebar>
    </PanelSidebarTabsContext.Provider>
  )
}

export default PanelSidebar
