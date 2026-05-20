import { useMediaQuery, useTheme } from '@mui/material'
import type { Breakpoint } from '@mui/material/styles'
import { DESKTOP_BREAKPOINT_KEY } from '#/common/style/theme/constants'

export const useIsMobile = (
  breakpoint: Breakpoint = DESKTOP_BREAKPOINT_KEY
) => {
  const theme = useTheme()
  return useMediaQuery(theme.breakpoints.down(breakpoint))
}
