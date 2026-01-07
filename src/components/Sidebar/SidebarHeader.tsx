import { Box, Typography } from '@mui/material'
import { useIsMobile } from '#/common/hooks/ui/useIsMobile'
import React from 'react'
import {
  MOBILE_SIDEBAR_PADDING_REM,
  SIDEBAR_PADDING_REM,
} from '#/common/style/theme/constants'

interface Props {
  children?: React.ReactNode
  title: string
  sx?: any
}

const SidebarHeader = ({ children, title, sx }: Props) => {
  const isMobile = useIsMobile()

  return (
    <Box
      className="sidebar-header"
      sx={{
        backgroundColor: 'neutral.light',
        display: 'flex',
        // border: 1,
        // borderColor: 'primary.dark',
        flexDirection: 'column',
        flexShrink: 0,
        minHeight: 8,
        zIndex: (theme) => theme.zIndex.drawer + 4,
        boxShadow: '0px 4px 4px 0 rgba(179, 179, 179, 0.25)',
        ...sx,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          flexGrow: 1,
          pr: isMobile
            ? MOBILE_SIDEBAR_PADDING_REM - 0.2 + 'rem'
            : SIDEBAR_PADDING_REM - 0.2 + 'rem',
          pb: 4,
        }}
      >
        <Typography
          sx={{
            width: '100%',
            textAlign: 'end',
            mt: 4,
            whiteSpace: 'nowrap',
            minHeight: '20px',
          }}
          variant="h2"
        >
          {title}
        </Typography>
      </Box>
      <Box
        sx={{
          pl: isMobile
            ? MOBILE_SIDEBAR_PADDING_REM + 'rem'
            : SIDEBAR_PADDING_REM + 'rem',
          pr: isMobile
            ? MOBILE_SIDEBAR_PADDING_REM - 0.2 + 'rem'
            : SIDEBAR_PADDING_REM - 0.2 + 'rem',
          maxWidth: sx?.width ? sx.width : '100%',
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

export default SidebarHeader
