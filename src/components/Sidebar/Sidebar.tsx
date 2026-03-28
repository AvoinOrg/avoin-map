'use client'

import React from 'react'
import { SxProps, Theme } from '@mui/material'

import { useUIStore } from '#/common/store'
import { Slot, useSlotContent } from '../context/slotsContext'
import SidebarHeader from './SidebarHeader'
import SidebarScaffold from './SidebarScaffold'
import SidebarToggleButton from './SidebarToggleButton'

export const Sidebar = ({
  sx,
  children,
}: {
  sx?: SxProps<Theme>
  children: React.ReactNode
}) => {
  const isSidebarDisabled = useUIStore((state) => state.isSidebarDisabled)
  const isSidebarHeaderHidden = useUIStore(
    (state) => state.isSidebarHeaderHidden
  )
  const sidebarHeaderConfig = useUIStore((state) => state.sidebarHeaderConfig)

  const hasCustomHeader = useSlotContent('sidebar-header')

  if (isSidebarDisabled) {
    return <>{children}</>
  }

  const topContent = isSidebarHeaderHidden
    ? null
    : hasCustomHeader
      ? <Slot name="sidebar-header" />
      : (
        <SidebarHeader
          title={sidebarHeaderConfig.title}
          backgroundImage={sidebarHeaderConfig.backgroundImage}
        >
          <Slot name="sidebar-header-children" />
        </SidebarHeader>
      )

  return (
    <>
      <SidebarToggleButton />
      <SidebarScaffold topContent={topContent} containerSx={sx}>
        {children}
      </SidebarScaffold>
    </>
  )
}

export default Sidebar
