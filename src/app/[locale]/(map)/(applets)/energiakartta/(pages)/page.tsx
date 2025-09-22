'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Box, Typography } from '@mui/material'

import { SidebarContentBox } from '#/components/Sidebar'
import { LoadingSpinner } from '#/components/Loading'

const Page = () => {
  const [isLoading, setIsLoading] = useState(false)
  return (
    <SidebarContentBox>
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <LoadingSpinner />
        </Box>
      )}
    </SidebarContentBox>
  )
}

export default Page
