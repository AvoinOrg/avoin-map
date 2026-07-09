'use client'

import React from 'react'
import type { AppBoxProps } from '#/common/style/theme/system'

import {
  CARBON_HOME_FLOATING_GUTTER_PX,
  MAP_CONTROL_EDGE_GUTTER_PX,
} from '#/common/constants/map'
import type {
  SidebarBoundaryId,
  SidebarSimpleConfig as SidebarSimpleOptions,
} from '#/common/types/sidebar'

import SimpleSidebarBase from './SimpleSidebarBase'
import {
  SidebarFooterSlot,
  SidebarHeaderChildrenSlot,
  SidebarHeaderSlot,
  SidebarPanelSlot,
} from './sidebarSlots'

type SidebarStyleProps = AppBoxProps['sx']

export type SimpleSidebarProps = {
  sx?: SidebarStyleProps
  boundaryId?: SidebarBoundaryId
  options?: SidebarSimpleOptions
  mobileStackedContentBefore?: React.ReactNode
  mobileStackedContentAfter?: React.ReactNode
  children: React.ReactNode
}

const DEFAULT_PANEL_WIDTH = '23.75rem'

const getSimpleSidebarSx = (
  sx: SidebarStyleProps | undefined,
  options?: SidebarSimpleOptions
): SidebarStyleProps => {
  const floatingGutter = `${CARBON_HOME_FLOATING_GUTTER_PX}px`
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
          width: { mobile: '100vw', desktop: DEFAULT_PANEL_WIDTH },
          maxWidth: {
            mobile: '100vw',
            desktop: `min(${DEFAULT_PANEL_WIDTH}, 100vw)`,
          },
        },
    hiddenChromeHeightSx,
    ...(Array.isArray(sx) ? sx : [sx]),
  ]
}

const getSimpleSidebarToggleSx = (
  options?: SidebarSimpleOptions
): SidebarStyleProps | undefined => {
  if (options?.width !== 'compact') {
    return undefined
  }

  const toggleGutter = `${MAP_CONTROL_EDGE_GUTTER_PX}px`

  return {
    right: { mobile: '1rem', desktop: toggleGutter },
    bottom: { mobile: '1rem', desktop: toggleGutter },
  }
}

const getSimpleSidebarContentSx = ({
  options,
}: {
  options?: SidebarSimpleOptions
}): SidebarStyleProps | undefined => {
  if (options?.chrome !== 'hidden') {
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

export const SimpleSidebar = ({
  sx,
  boundaryId,
  options,
  mobileStackedContentBefore,
  mobileStackedContentAfter,
  children,
}: SimpleSidebarProps) => {
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
    <SimpleSidebarBase
      sx={getSimpleSidebarSx(sx, options)}
      sidebarToggleSx={getSimpleSidebarToggleSx(options)}
      headerChildren={headerChildren}
      topContent={scopedTopContent}
      bottomContent={scopedBottomContent}
      mobileStackedContentBefore={mobileStackedContentBefore}
      mobileStackedContentAfter={mobileStackedContentAfter}
      hideMainContainer={options?.mainPanelVisible === false}
      panelSx={
        options?.width === 'compact'
          ? {
              borderRadius: { mobile: 0, desktop: '10px' },
              backgroundColor: '#f4f4f4',
            }
          : undefined
      }
      contentSx={getSimpleSidebarContentSx({ options })}
    >
      {boundaryId != null && (
        <SidebarPanelSlot boundaryId={boundaryId} panelId="main" />
      )}
      {children}
    </SimpleSidebarBase>
  )
}

export default SimpleSidebar
