'use client'

import React, { useEffect, useMemo } from 'react'

import { SidebarContentBox } from '#/components/Sidebar'
import { openWindow } from '#/common/utils/modal'
import { useUIStore } from '#/common/store'

const Page = () => {
  useEffect(() => {
    openWindow('/en/adds/login')
  }, [])

  return (
    <SidebarContentBox>
      <></>
    </SidebarContentBox>
  )
}

export default Page
