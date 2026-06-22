import {
  type AppBreakpoint,
  useMediaQuery,
  useTheme,
} from '#/common/style/theme'
import { DESKTOP_BREAKPOINT_KEY } from '#/common/style/theme/constants'

export const useIsMobile = (
  breakpoint: AppBreakpoint = DESKTOP_BREAKPOINT_KEY
) => {
  const theme = useTheme()
  return useMediaQuery(theme.breakpoints.down(breakpoint))
}
