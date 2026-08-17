import type React from 'react'

import { Box } from '#/common/style/theme'

type BaselineSectionProps = {
  title: string
  children: React.ReactNode
}

type BaselineExampleProps = {
  title: string
  children: React.ReactNode
  minHeight?: string | number
}

export const noop = () => {}

export const BaselineSection = ({
  title,
  children,
}: BaselineSectionProps) => (
  <Box
    component="section"
    sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.875rem',
    }}
  >
    <Box
      component="h2"
      sx={{
        m: 0,
        color: '#111111',
        fontSize: '0.8125rem',
        fontWeight: 700,
        lineHeight: 1.3,
      }}
    >
      {title}
    </Box>
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {children}
    </Box>
  </Box>
)

export const BaselineExample = ({
  title,
  children,
  minHeight,
}: BaselineExampleProps) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.375rem',
      minHeight,
    }}
  >
    <Box
      component="h3"
      sx={{
        m: 0,
        color: '#111111',
        fontSize: '0.6875rem',
        fontWeight: 700,
        lineHeight: 1.35,
      }}
    >
      {title}
    </Box>
    {children}
  </Box>
)

export const BaselineInlineGroup = ({
  children,
}: {
  children: React.ReactNode
}) => (
  <Box
    sx={{
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: '0.75rem',
    }}
  >
    {children}
  </Box>
)
