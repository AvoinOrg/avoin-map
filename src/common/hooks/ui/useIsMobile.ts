import { useMediaQuery, useTheme } from '@mui/material'
import type { Breakpoint } from '@mui/material/styles'

export const useIsMobile = (breakpoint: Breakpoint = 'sm') => {
  const theme = useTheme()
  return useMediaQuery(theme.breakpoints.down(breakpoint))
}
