'use client'

import React, { useEffect, useMemo } from 'react'
import Box from '@mui/material/Box'
import { Button } from '@mui/material'
import { styled } from '@mui/material/styles'
import { T } from '@tolgee/react'

import MutableLink from '#/components/common/MutableLink'
import { Upload } from '#/components/icons'

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
      <BigMenuButton
        variant="contained"
        component="label"
        color="primary"
        sx={{ pl: 3, pr: 3 }}
      >
        <Box typography={'body1'}>
          <T keyName={'sidebar.admin.upload'} ns={'luonnonmetsakartat'}></T>
        </Box>
        <Upload />
      </BigMenuButton>
    </MutableLink>
  )
}

const BigMenuButton = styled(Button)<{ component?: string }>(({ theme }) => ({
  width: '100%',
  height: '60px',
  margin: '0 0 0 0',
  justifyContent: 'space-between',
  borderRadius: '5px',
  backgroundColor: '#FBFBFB',
  border: `0.5px solid ${theme.palette.neutral.main}`,
  boxShadow: '1px 1px 7px 0px #EEECEC',
  '&:hover': {
    backgroundColor: theme.palette.primary.lighter, // Light highlight on hover
    borderColor: theme.palette.primary.main,
  },
  '&:active': {
    backgroundColor: theme.palette.primary.light, // Slightly darker when clicked
  },
  '&:focus': {
    outline: `2px solid ${theme.palette.primary.main}`, // Focus outline
    outlineOffset: '2px',
  },
}))

export default Page
