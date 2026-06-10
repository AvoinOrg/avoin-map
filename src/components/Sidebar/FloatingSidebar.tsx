'use client'

import React from 'react'

import { HIILIKARTTA_HOME_FLOATING_GUTTER_PX } from '#/common/constants/map'
import type { PandaStyleProp } from '#/common/style/panda'
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

export type FloatingSidebarWidth = 'default' | 'compact'
export type FloatingSidebarHeaderMode = 'default' | 'custom' | 'none'
export type FloatingSidebarFooterMode = 'none' | 'slot'

export type FloatingSidebarProps = {
  styleProps?: PandaStyleProp
  sidebarToggleSx?: PandaStyleProp
  contentSx?: PandaStyleProp
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
  styleProps,
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
  const floatingGutter = `${HIILIKARTTA_HOME_FLOATING_GUTTER_PX}px`
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
        styleProps={sidebarToggleSx}
      />
      <SidebarScaffold
        topContent={topContent}
        bottomContent={bottomContent}
        trailingContent={trailingContent}
        actionRail={resolvedActionRail}
        hideMainContainer={hideMainContainer}
        contentSx={contentSx}
        containerSx={styleProps}
        desktopWidth={width === 'compact' ? '23.75rem' : undefined}
        desktopMaxWidth={
          width === 'compact'
            ? `min(23.75rem, calc(100vw - ${floatingGutter}))`
            : undefined
        }
        desktopGutter={width === 'compact' ? floatingGutter : undefined}
        desktopPaddingBlock={
          width === 'compact' ? floatingGutter : undefined
        }
      >
        {children}
      </SidebarScaffold>
    </>
  )
}

export default FloatingSidebar
