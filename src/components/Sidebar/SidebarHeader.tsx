import React from 'react'
import type { AppBoxProps } from '#/common/style/theme/system'
import { Box } from '#/common/style/theme/system'

type SidebarStyleProps = AppBoxProps['sx']

interface Props {
  children?: React.ReactNode
  title: string
  backgroundImage?: string
  sx?: SidebarStyleProps
}

const SidebarHeader = ({ children, title, backgroundImage, sx }: Props) => {
  return (
    <Box
      className="sidebar-header"
      sx={[
        {
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          mb: { mobile: 0.75, desktop: 1 },
          color: 'neutral.darker',
          zIndex: (theme) => (theme.zIndex?.drawer ?? 1200) + 4,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        sx={{
          position: 'relative',
          minHeight: { mobile: '5.25rem', desktop: '5.75rem' },
          mx: 0.75,
          mt: 0.75,
          borderRadius: '10px',
          border: '0.2px solid #ffffff',
          overflow: 'hidden',
          backgroundColor: '#f4f4f4',
          boxSizing: 'border-box',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: backgroundImage
              ? `url(${backgroundImage})`
              : 'linear-gradient(90deg, #f4f4f4 0%, #f4f4f4 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, rgba(255, 255, 255, 0.9) 17.5%, rgba(255, 255, 255, 0) 100%)',
          }}
        />
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            px: { mobile: '1rem', desktop: '1.1rem' },
          }}
        >
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              width: '100%',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ flex: 1, width: '100%' }}></Box>
            <Box
              component="h3"
              sx={{
                m: 0,
                textAlign: 'left',
                whiteSpace: 'normal',
                minHeight: '16px',
                lineHeight: 1.1,
                fontSize: { mobile: '1rem', desktop: '1.06rem' },
                fontWeight: 700,
                letterSpacing: '0.06rem',
                textTransform: 'uppercase',
              }}
            >
              {title}
            </Box>
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>{children}</Box>
          </Box>
          {/* {children && (
            <Box sx={{ width: '100%', pb: 0.45 }}>
            </Box>
          )} */}
        </Box>
      </Box>
    </Box>
  )
}

export default SidebarHeader
