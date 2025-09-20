import React from 'react'
import { Box, Typography } from '@mui/material'

interface LegendBoxProps {
  color: string
  title: string
}

export const LegendBox = ({ color, title }: LegendBoxProps) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
    <Box
      sx={{
        backgroundColor: color,
        border: '1px solid black',
        width: '1rem',
        height: '1rem',
        mr: 1,
        flexShrink: 0,
      }}
    />
    <Typography>{title}</Typography>
  </Box>
)
