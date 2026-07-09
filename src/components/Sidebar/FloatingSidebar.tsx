'use client'

import React from 'react'
import type { AppBoxProps } from '#/common/style/theme/system'

import {
  CARBON_HOME_FLOATING_GUTTER_PX,
  MAP_CONTROL_EDGE_GUTTER_PX,
} from '#/common/constants/map'
import { useUIStore } from '#/common/store'
import type { SidebarBoundaryId } from '#/common/types/sidebar'

import SidebarHeader from './SidebarHeader'
import SidebarScaffold from './SidebarScaffold'
import {
  SidebarActionRailSlot,
  SidebarFooterSlot,
  SidebarHeaderChildrenSlot,
  SidebarHeaderSlot,
} from './sidebarSlots'
import SidebarToggleButton from './SidebarToggleButton'

type SidebarStyleProps = AppBoxProps['sx']

export type FloatingSidebarWidth = 'default' | 'compact'
export type FloatingSidebarHeaderMode = 'default' | 'custom' | 'none'
export type FloatingSidebarFooterMode = 'none' | 'slot'

export type FloatingSidebarProps = {
  sx?: SidebarStyleProps
  sidebarToggleSx?: SidebarStyleProps
  contentSx?: SidebarStyleProps
  trailingContent?: React.ReactNode
  actionRail?: React.ReactNode
  hideMainContainer?: boolean
  boundaryId?: SidebarBoundaryId
  width?: FloatingSidebarWidth
  headerMode?: FloatingSidebarHeaderMode
  footerMode?: FloatingSidebarFooterMode
  chromeHidden?: boolean
  children: React.ReactNode
}

const getCustomHeaderSlot = (boundaryId?: SidebarBoundaryId) =>
  boundaryId != null ? <SidebarHeaderSlot boundaryId={boundaryId} /> : null

const getFooterSlot = (boundaryId?: SidebarBoundaryId) =>
  boundaryId != null ? <SidebarFooterSlot boundaryId={boundaryId} /> : null

const getDefaultHeaderChildrenSlot = (boundaryId?: SidebarBoundaryId) =>
  boundaryId != null ? (
    <SidebarHeaderChildrenSlot boundaryId={boundaryId} />
  ) : null

export const FloatingSidebar = ({
  sx,
  sidebarToggleSx,
  contentSx,
  trailingContent,
  actionRail,
  hideMainContainer = false,
  boundaryId,
  width = 'default',
  headerMode = 'default',
  footerMode = 'none',
  chromeHidden = false,
  children,
}: FloatingSidebarProps) => {
  const floatingGutter = `${CARBON_HOME_FLOATING_GUTTER_PX}px`
  const toggleGutter = `${MAP_CONTROL_EDGE_GUTTER_PX}px`
  const isSidebarDisabled = useUIStore((state) => state.isSidebarDisabled)
  const sidebarHeaderConfig = useUIStore((state) => state.sidebarHeaderConfig)

  if (isSidebarDisabled) {
    return <>{children}</>
  }

  const topContent =
    chromeHidden || headerMode === 'none' ? null : headerMode === 'custom' ? (
      getCustomHeaderSlot(boundaryId)
    ) : (
      <SidebarHeader
        title={sidebarHeaderConfig.title}
        backgroundImage={sidebarHeaderConfig.backgroundImage}
      >
        {getDefaultHeaderChildrenSlot(boundaryId)}
      </SidebarHeader>
    )

  const bottomContent =
    footerMode === 'slot' ? getFooterSlot(boundaryId) : undefined

  const resolvedActionRail =
    boundaryId != null ? (
      <>
        <SidebarActionRailSlot boundaryId={boundaryId} />
        {actionRail}
      </>
    ) : (
      actionRail
    )
  return (
    <>
      <SidebarToggleButton
        sx={[
          width === 'compact'
            ? {
                right: { mobile: '1rem', desktop: toggleGutter },
                bottom: { mobile: '1rem', desktop: toggleGutter },
              }
            : undefined,
          ...(Array.isArray(sidebarToggleSx)
            ? sidebarToggleSx
            : [sidebarToggleSx]),
        ]}
      />
      <SidebarScaffold
        topContent={topContent}
        bottomContent={bottomContent}
        trailingContent={trailingContent}
        actionRail={resolvedActionRail}
        hideMainContainer={hideMainContainer}
        contentSx={contentSx}
        containerSx={[
          width === 'compact'
            ? {
                pt: { mobile: 0, desktop: floatingGutter },
                pb: { mobile: 0, desktop: floatingGutter },
                ml: { mobile: 0, desktop: floatingGutter },
                width: { mobile: '100vw', desktop: '23.75rem' },
                maxWidth: {
                  mobile: '100vw',
                  desktop: `min(23.75rem, calc(100vw - ${floatingGutter}))`,
                },
              }
            : undefined,
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {children}
      </SidebarScaffold>
    </>
  )
}

export default FloatingSidebar
