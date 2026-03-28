'use client'

import React from 'react'
import { Box, SxProps, Theme, Typography } from '@mui/material'

type SidebarBackgroundContentProps = {
  imageSrc: string
  imageAlt: string
  title?: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
  actions?: React.ReactNode
  sx?: SxProps<Theme>
  contentSx?: SxProps<Theme>
}

const SidebarBackgroundContent = ({
  imageSrc,
  imageAlt,
  title,
  description,
  children,
  actions,
  sx,
  contentSx,
}: SidebarBackgroundContentProps) => {
  return (
    <Box
      sx={[
        {
          width: '100%',
          overflow: 'hidden',
          borderRadius: '1.5rem',
          backgroundColor: '#4B7D2F',
          color: '#fff',
          boxShadow: '0 18px 42px rgba(35, 60, 24, 0.16)',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        component="img"
        src={imageSrc}
        alt={imageAlt}
        sx={{
          display: 'block',
          width: '100%',
          height: { mobile: '10rem', desktop: '11rem' },
          objectFit: 'cover',
          objectPosition: 'center',
        }}
      />
      <Box
        sx={[
          {
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            px: { mobile: '1.25rem', desktop: '1.5rem' },
            py: { mobile: '1.25rem', desktop: '1.5rem' },
          },
          ...(Array.isArray(contentSx) ? contentSx : [contentSx]),
        ]}
      >
        {(title || description) && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {title && (
              <Typography
                sx={{
                  typography: 'h2',
                  color: 'inherit',
                  textTransform: 'uppercase',
                }}
              >
                {title}
              </Typography>
            )}
            {description && (
              <Typography
                sx={{
                  typography: 'body2',
                  color: 'inherit',
                  maxWidth: '32ch',
                }}
              >
                {description}
              </Typography>
            )}
          </Box>
        )}
        {children}
        {actions && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {actions}
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default SidebarBackgroundContent
