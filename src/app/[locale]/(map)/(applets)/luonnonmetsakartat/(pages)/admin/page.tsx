'use client'

import React, { useEffect } from 'react'
import Box from '@mui/material/Box'
import { T } from '@tolgee/react'

import MutableLink from '#/components/common/MutableLink'
import { Upload } from '#/components/icons'
import BigMenuButton from '#/components/common/BigMenuButton'

import { routeTree } from 'applets/luonnonmetsakartat/common/routes'

const Page = () => {
  useEffect(() => {}, [])

  return (
    <MutableLink
      route={routeTree.admin.import}
      routeTree={routeTree}
      sx={{
        display: 'flex',
        color: 'inherit',
        textDecoration: 'none',
        width: '100%',
      }}
    >
      <BigMenuButton color="primary" sx={{ pl: 3, pr: 3 }}>
        <Box typography={'body1'}>
          <T keyName={'sidebar.admin.upload'} ns={'luonnonmetsakartat'}></T>
        </Box>
        <Upload />
      </BigMenuButton>
    </MutableLink>
  )
}

export default Page
