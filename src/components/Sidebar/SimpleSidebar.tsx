'use client'

import React from 'react'

import { HIILIKARTTA_HOME_FLOATING_GUTTER_PX } from '#/common/constants/map'
import type { PandaStyleProp } from '#/common/style/panda'
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

export type SimpleSidebarProps = {
  styleProps?: PandaStyleProp
  boundaryId?: SidebarBoundaryId
  options?: SidebarSimpleOptions
  mobileStackedContentBefore?: React.ReactNode
  mobileStackedContentAfter?: React.ReactNode
  children: React.ReactNode
}

const DEFAULT_PANEL_WIDTH = '23.75rem'

const getSimpleSidebarSx = (
  styleProps: PandaStyleProp | undefined,
  options?: SidebarSimpleOptions
): PandaStyleProp => {
  const hiddenChromeHeightSx =
    options?.chrome === 'hidden'
      ? {
          height: '100dvh',
          maxHeight: '100dvh',
          minHeight: 0,
        }
      : undefined

  return [
    hiddenChromeHeightSx,
    ...(Array.isArray(styleProps) ? styleProps : [styleProps]),
  ]
}

const getSimpleSidebarLayoutProps = (options?: SidebarSimpleOptions) => {
  const floatingGutter = `${HIILIKARTTA_HOME_FLOATING_GUTTER_PX}px`

  if (options?.width !== 'compact') {
    return {
      desktopWidth: DEFAULT_PANEL_WIDTH,
      desktopMaxWidth: `min(${DEFAULT_PANEL_WIDTH}, 100vw)`,
      desktopGutter: '0',
      desktopPaddingBlock: '0',
      desktopPanelBorderRadius: '0',
      panelBackgroundColor: '#ffffff',
    }
  }

  return {
    desktopWidth: DEFAULT_PANEL_WIDTH,
    desktopMaxWidth: `min(${DEFAULT_PANEL_WIDTH}, calc(100vw - ${floatingGutter}))`,
    desktopGutter: floatingGutter,
    desktopPaddingBlock: floatingGutter,
    desktopPanelBorderRadius: '10px',
    panelBackgroundColor: '#f4f4f4',
  }
}

const getSimpleSidebarContentSx = ({
  options,
}: {
  options?: SidebarSimpleOptions
}): PandaStyleProp | undefined => {
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
  styleProps,
  boundaryId,
  options,
  mobileStackedContentBefore,
  mobileStackedContentAfter,
  children,
}: SimpleSidebarProps) => {
  const layoutProps = getSimpleSidebarLayoutProps(options)
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
      styleProps={getSimpleSidebarSx(styleProps, options)}
      {...layoutProps}
      headerChildren={headerChildren}
      topContent={scopedTopContent}
      bottomContent={scopedBottomContent}
      mobileStackedContentBefore={mobileStackedContentBefore}
      mobileStackedContentAfter={mobileStackedContentAfter}
      hideMainContainer={options?.mainPanelVisible === false}
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
