'use client'

import React from 'react'
import { SxProps, Theme } from '@mui/material'

import {
  HIILIKARTTA_HOME_FLOATING_GUTTER_PX,
  MAP_CONTROL_EDGE_GUTTER_PX,
} from '#/common/constants/map'
import { useUIStore } from '#/common/store'
import { Slot } from '../context/slotsContext'
import SidebarScaffold from './SidebarScaffold'
import SidebarToggleButton from './SidebarToggleButton'

export type AppletHomeSidebarProps = {
  sx?: SxProps<Theme>
  sidebarToggleSx?: SxProps<Theme>
  trailingContent?: React.ReactNode
  actionRail?: React.ReactNode
  hideMainContainer?: boolean
  children: React.ReactNode
}

export const AppletHomeSidebar = ({
  sx,
  sidebarToggleSx,
  trailingContent,
  actionRail,
  hideMainContainer = false,
  children,
}: AppletHomeSidebarProps) => {
  const floatingGutter = `${HIILIKARTTA_HOME_FLOATING_GUTTER_PX}px`
  const toggleGutter = `${MAP_CONTROL_EDGE_GUTTER_PX}px`
  const isSidebarDisabled = useUIStore((state) => state.isSidebarDisabled)
  const isSidebarHeaderHidden = useUIStore(
    (state) => state.isSidebarHeaderHidden
  )

  if (isSidebarDisabled) {
    return <>{children}</>
  }

  const topContent = isSidebarHeaderHidden ? null : (
    <Slot name="sidebar-header" />
  )

  return (
    <>
      <SidebarToggleButton
        sx={[
          {
            right: { mobile: '1rem', desktop: toggleGutter },
            bottom: { mobile: '1rem', desktop: toggleGutter },
          },
          ...(Array.isArray(sidebarToggleSx)
            ? sidebarToggleSx
            : [sidebarToggleSx]),
        ]}
      />
      <SidebarScaffold
        topContent={topContent}
        bottomContent={<Slot name="sidebar-footer" />}
        trailingContent={trailingContent}
        actionRail={actionRail}
        hideMainContainer={hideMainContainer}
        containerSx={[
          {
            pt: { mobile: 0, desktop: floatingGutter },
            pb: { mobile: 0, desktop: floatingGutter },
            ml: { mobile: 0, desktop: floatingGutter },
            width: { mobile: '100vw', desktop: '23.75rem' },
            maxWidth: {
              mobile: '100vw',
              desktop: `min(23.75rem, calc(100vw - ${floatingGutter}))`,
            },
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {children}
      </SidebarScaffold>
    </>
  )
}

export default AppletHomeSidebar
