import React from 'react'
import {
  createBox,
  useTheme as useMuiSystemTheme,
} from '@mui/system'
import type {
  BoxProps as MuiSystemBoxProps,
  Breakpoint as MuiSystemBreakpoint,
  SxProps,
  Theme as MuiSystemTheme,
} from '@mui/system'

import appTheme from './theme'

export type AppBreakpoint = MuiSystemBreakpoint | 'mobile' | 'desktop'

export type AppPaletteColor = {
  main: string
  light?: string
  dark?: string
  contrastText?: string
  lighter?: string
  darker?: string
}

export type AppGreyPalette = {
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
  A100: string
  A200: string
  A400: string
  A700: string
}

export type AppPalette = {
  mode: 'light' | 'dark'
  common: {
    black: string
    white: string
  }
  primary: AppPaletteColor
  secondary: AppPaletteColor
  neutral: Required<Pick<AppPaletteColor, 'main' | 'light' | 'dark'>> &
    Pick<AppPaletteColor, 'lighter' | 'darker'>
  info: AppPaletteColor
  success: AppPaletteColor
  warning: AppPaletteColor
  error: AppPaletteColor
  grey: AppGreyPalette
  text: {
    primary: string
    secondary: string
    disabled: string
  }
  action: {
    active: string
    hover: string
    hoverOpacity: number
    selected: string
    selectedOpacity: number
    disabled: string
    disabledBackground: string
    disabledOpacity: number
    focus: string
    focusOpacity: number
    activatedOpacity: number
  }
  background: {
    default: string
    paper: string
  }
  divider: string
}

export type AppTypographyStyle = Record<string, string | number> & {
  fontFamily: string
  fontSize: string | number
  fontWeight: string | number
  lineHeight: string | number
  letterSpacing: string | number
}

export type AppTypography = {
  fontFamily: string
  body1: AppTypographyStyle
  body2: AppTypographyStyle
  body7: AppTypographyStyle
  caption: AppTypographyStyle
  h1: AppTypographyStyle
  h2: AppTypographyStyle
  h3: AppTypographyStyle
  h4: AppTypographyStyle
  h5: AppTypographyStyle
  h6: AppTypographyStyle
  h7: AppTypographyStyle
  h8: AppTypographyStyle
  h9: AppTypographyStyle
  inherit: AppTypographyStyle
}

export type AppZIndex = {
  mobileStepper: number
  speedDial: number
  appBar: number
  drawer: number
  modal: number
  snackbar: number
  tooltip: number
  popup: number
  mapButtons: number
}

export type AppTransitions = {
  create: (
    props: string | string[],
    options?: {
      duration?: number | string
      easing?: string
      delay?: number | string
    }
  ) => string
}

export type AppBreakpoints = Omit<
  MuiSystemTheme['breakpoints'],
  'values' | 'up' | 'down' | 'between' | 'only' | 'not'
> & {
  values: Record<AppBreakpoint, number>
  up: (key: AppBreakpoint | number) => string
  down: (key: AppBreakpoint | number) => string
  between: (
    start: AppBreakpoint | number,
    end: AppBreakpoint | number
  ) => string
  only: (key: AppBreakpoint) => string
  not: (key: AppBreakpoint) => string
}

export type AppTheme = Omit<
  MuiSystemTheme,
  | 'breakpoints'
  | 'palette'
  | 'typography'
  | 'shadows'
  | 'transitions'
  | 'zIndex'
> & {
  breakpoints: AppBreakpoints
  palette: AppPalette
  typography: AppTypography
  shadows: string[]
  transitions: AppTransitions
  zIndex: AppZIndex
}

export type AppSxProps = SxProps<AppTheme>
type AppSxItem = Exclude<NonNullable<AppSxProps>, readonly unknown[]>
export type AppSystemStyleObject = AppSxProps
export type AppBoxProps = Omit<MuiSystemBoxProps, 'sx'> & { sx?: AppSxProps }

export { useMediaQuery } from '@mui/system'

export const useTheme = <T = AppTheme>() => useMuiSystemTheme<T>()

const MuiSystemBox = createBox<AppTheme>({ defaultTheme: appTheme })

export const Box = React.forwardRef<HTMLElement, AppBoxProps>(function Box(
  {
    sx,
    ...props
  },
  ref
) {
  const systemProps = props as MuiSystemBoxProps
  const systemSx = sx as MuiSystemBoxProps['sx']

  return React.createElement(MuiSystemBox, {
    ...systemProps,
    ref,
    sx: systemSx,
  })
})

export const toSxArray = (sx?: AppSxProps): AppSxItem[] => {
  if (sx == null) {
    return []
  }

  return (Array.isArray(sx) ? sx : [sx]) as AppSxItem[]
}
