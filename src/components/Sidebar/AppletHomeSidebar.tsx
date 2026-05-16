'use client'

import React from 'react'
import type { SxProps, Theme } from '@mui/material'

import FloatingSidebar from './FloatingSidebar'

export type AppletHomeSidebarProps = {
  sx?: SxProps<Theme>
  sidebarToggleSx?: SxProps<Theme>
  contentSx?: SxProps<Theme>
  trailingContent?: React.ReactNode
  actionRail?: React.ReactNode
  hideMainContainer?: boolean
  children: React.ReactNode
}

export const AppletHomeSidebar = ({
  sx,
  sidebarToggleSx,
  contentSx,
  trailingContent,
  actionRail,
  hideMainContainer = false,
  children,
}: AppletHomeSidebarProps) => {
  return (
    <FloatingSidebar
      sx={sx}
      sidebarToggleSx={sidebarToggleSx}
      contentSx={contentSx}
      trailingContent={trailingContent}
      actionRail={actionRail}
      hideMainContainer={hideMainContainer}
      width="compact"
      headerMode="custom"
      footerMode="slot"
    >
      {children}
    </FloatingSidebar>
  )
}

export default AppletHomeSidebar
