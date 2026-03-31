'use client'

import React from 'react'
import { SxProps, Theme } from '@mui/material'

import { useUIStore } from '#/common/store'
import { Slot, useSlotContent } from '../context/slotsContext'
import SidebarHeader from './SidebarHeader'
import SidebarScaffold from './SidebarScaffold'
import SidebarToggleButton from './SidebarToggleButton'

export const HiilikarttaHomeSidebar = ({
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
      <SidebarScaffold
        topContent={topContent}
        bottomContent={<Slot name="sidebar-footer" />}
        containerSx={[
          {
            width: { mobile: '100vw', desktop: '23.75rem' },
            maxWidth: {
              mobile: '100vw',
              desktop: 'min(23.75rem, calc(100vw - 2rem))',
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

export default HiilikarttaHomeSidebar
