import React from 'react'

import { Box, toSxArray, type AppSxProps } from '#/common/style/theme'

type AppSxItem = Exclude<NonNullable<AppSxProps>, readonly unknown[]>
const toAppSxItemArray = (sx?: AppSxProps) => toSxArray(sx) as AppSxItem[]
const ThemeImage = Box as unknown as React.ComponentType<
  React.ComponentProps<'img'> & {
    component?: 'img'
    sx?: AppSxProps
  }
>

type SidebarBackgroundContentProps = {
  imageSrc: string
  imageAlt: string
  title?: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
  actions?: React.ReactNode
  sx?: AppSxProps
  imageSx?: AppSxProps
  contentSx?: AppSxProps
  headerSx?: AppSxProps
  descriptionSx?: AppSxProps
  actionsSx?: AppSxProps
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
        ...toAppSxItemArray(sx),
      ]}
    >
      <ThemeImage
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
          ...toAppSxItemArray(imageSx),
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
          ...toAppSxItemArray(contentSx),
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
              ...toAppSxItemArray(headerSx),
            ]}
          >
            {title && (
              <Box
                component="p"
                sx={{
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  lineHeight: '1.125rem',
                  letterSpacing: '0.1em',
                  color: 'inherit',
                  textTransform: 'uppercase',
                  m: 0,
                }}
              >
                {title}
              </Box>
            )}
            {description && (
              <Box
                component="p"
                sx={[
                  {
                    fontSize: '0.625rem',
                    fontWeight: 400,
                    lineHeight: '1.125rem',
                    letterSpacing: '0.1em',
                    color: 'inherit',
                    maxWidth: '24ch',
                    m: 0,
                  },
                  ...toAppSxItemArray(descriptionSx),
                ]}
              >
                {description}
              </Box>
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
              ...toAppSxItemArray(actionsSx),
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
