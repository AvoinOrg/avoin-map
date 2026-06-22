import type { ReactNode } from 'react'

import { Box } from '#/common/style/theme/system'

type Props = {
  children: ReactNode
}

const StartMapShell = ({ children }: Props) => (
  <Box
    component="section"
    aria-label="Start shared map shell"
    sx={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: {
        mobile: '1fr',
        desktop: 'minmax(320px, 28rem) minmax(0, 1fr)',
      },
      bgcolor: 'neutral.light',
      color: 'text.primary',
      overflow: 'hidden',
    }}
  >
    <Box
      component="aside"
      sx={{
        minHeight: 0,
        overflow: 'auto',
        bgcolor: 'background.paper',
        borderRight: {
          mobile: 0,
          desktop: '1px solid',
        },
        borderBottom: {
          mobile: '1px solid',
          desktop: 0,
        },
        borderColor: 'divider',
        p: 2,
      }}
    >
      {children}
    </Box>
    <Box
      aria-hidden="true"
      sx={{
        minHeight: {
          mobile: '55vh',
          desktop: '100vh',
        },
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'primary.lighter',
        backgroundImage: [
          'linear-gradient(135deg, rgba(39, 74, 255, 0.12) 0 1px, transparent 1px 80px)',
          'linear-gradient(45deg, rgba(234, 113, 1, 0.1) 0 1px, transparent 1px 96px)',
          'linear-gradient(0deg, rgba(0, 0, 0, 0.04) 0 1px, transparent 1px 48px)',
          'linear-gradient(90deg, rgba(0, 0, 0, 0.04) 0 1px, transparent 1px 48px)',
        ].join(', '),
      }}
    />
  </Box>
)

export default StartMapShell
