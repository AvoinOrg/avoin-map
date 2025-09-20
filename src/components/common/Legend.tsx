import React from 'react'
import { Box, Typography, SxProps, Theme } from '@mui/material'
import { useTranslate } from '@tolgee/react'

interface LegendProps {
  children: React.ReactNode
  sx?: SxProps<Theme>
}

export const Legend = ({ children, sx }: LegendProps) => {
  const { t } = useTranslate('avoin-map')

  return (
    <Box sx={[{ pt: 2 }, ...(Array.isArray(sx) ? sx : [sx])]}>
      <Typography sx={{ fontWeight: 'bold' }}>
        {t('sidebar.legend.title')}
      </Typography>
      <Box
        component="legend"
        sx={{ display: 'flex', flexDirection: 'column', pt: 1 }}
      >
        {children}
      </Box>
    </Box>
  )
}
