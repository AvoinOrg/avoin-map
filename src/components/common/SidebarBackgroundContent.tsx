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
  imageSx?: SxProps<Theme>
  contentSx?: SxProps<Theme>
  headerSx?: SxProps<Theme>
  descriptionSx?: SxProps<Theme>
  actionsSx?: SxProps<Theme>
}

const SidebarBackgroundContent = ({
  imageSrc,
  imageAlt,
  title,
  description,
  children,
  actions,
  sx,
  imageSx,
  contentSx,
  headerSx,
  descriptionSx,
  actionsSx,
}: SidebarBackgroundContentProps) => {
  return (
    <Box
      sx={[
        {
          width: '100%',
          overflow: 'hidden',
          borderRadius: '1.25rem',
          backgroundColor: '#e4f6d5',
          color: '#111111',
          boxShadow: 'none',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        component="img"
        src={imageSrc}
        alt={imageAlt}
        sx={[
          {
            display: 'block',
            width: '100%',
            height: '4.375rem',
            objectFit: 'cover',
            objectPosition: 'center',
          },
          ...(Array.isArray(imageSx) ? imageSx : [imageSx]),
        ]}
      />
      <Box
        sx={[
          {
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            px: '1.25rem',
            pt: '1.125rem',
            pb: '1.25rem',
          },
          ...(Array.isArray(contentSx) ? contentSx : [contentSx]),
        ]}
      >
        {(title || description) && (
          <Box
            sx={[
              {
                display: 'flex',
                flexDirection: 'column',
                gap: 0.8,
              },
              ...(Array.isArray(headerSx) ? headerSx : [headerSx]),
            ]}
          >
            {title && (
              <Typography
                sx={{
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  lineHeight: '1.125rem',
                  letterSpacing: '0.1em',
                  color: 'inherit',
                  textTransform: 'uppercase',
                }}
              >
                {title}
              </Typography>
            )}
            {description && (
              <Typography
                sx={[
                  {
                    fontSize: '0.625rem',
                    fontWeight: 400,
                    lineHeight: '1.125rem',
                    letterSpacing: '0.1em',
                    color: 'inherit',
                    maxWidth: '24ch',
                  },
                  ...(Array.isArray(descriptionSx)
                    ? descriptionSx
                    : [descriptionSx]),
                ]}
              >
                {description}
              </Typography>
            )}
          </Box>
        )}
        {children}
        {actions && (
          <Box
            sx={[
              {
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              },
              ...(Array.isArray(actionsSx) ? actionsSx : [actionsSx]),
            ]}
          >
            {actions}
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default SidebarBackgroundContent
