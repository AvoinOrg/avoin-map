'use client'

import type React from 'react'
import type { SxProps, Theme } from '@mui/material'

import HomeSidebar from './HomeSidebar'

export const MainSidebar = ({
  sx,
  children,
}: {
  sx?: SxProps<Theme>
  children: React.ReactNode
}) => <HomeSidebar sx={sx}>{children}</HomeSidebar>

export default MainSidebar
