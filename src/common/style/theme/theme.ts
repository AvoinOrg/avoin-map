import { alpha, createTheme } from '@mui/system'
import type {
  GlobalStylesProps,
  ThemeOptions as MuiSystemThemeOptions,
} from '@mui/system'

import type { AppPalette, AppTheme, AppTypography } from './system'
import {
  DESKTOP_BREAKPOINT_KEY,
  MOBILE_BREAKPOINT_KEY,
  MOBILE_BREAKPOINT_PX,
  SCROLLBAR_WIDTH_REM,
} from './constants'
import { ARIMO_FONT_FAMILY } from './fontConstants'

const palette = {
  mode: 'light',
  common: {
    black: '#000000',
    white: '#FFFFFF',
  },
  primary: {
    main: '#C7C9B8',
    dark: '#AFB29A',
    light: '#D7D9CC',
    lighter: '#EBECE6',
    contrastText: '#000000',
  },
  secondary: {
    dark: '#274AFF',
    main: '#5d77ff',
    light: '#b3bfff',
    contrastText: '#FFFFFF',
  },
  neutral: {
    main: '#D9D9D9',
    light: '#F6F4F4',
    dark: '#A0A0A0',
    darker: '#000000',
    lighter: '#FFFFFF',
  },
  info: {
    dark: '#EA7101',
    main: '#F09C4D',
    contrastText: '#000000',
  },
  success: {
    dark: '#1b5e20',
    main: '#2e7d32',
    light: '#4caf50',
    contrastText: '#FFFFFF',
  },
  warning: {
    dark: '#EA7101',
    main: '#EA7101',
    contrastText: '#000000',
  },
  error: {
    dark: '#c62828',
    main: '#d32f2f',
    light: '#ef5350',
    contrastText: '#FFFFFF',
  },
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
    A100: '#f5f5f5',
    A200: '#eeeeee',
    A400: '#bdbdbd',
    A700: '#616161',
  },
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.6)',
    disabled: 'rgba(0, 0, 0, 0.38)',
  },
  action: {
    active: 'rgba(0, 0, 0, 0.54)',
    hover: 'rgba(0, 0, 0, 0.04)',
    hoverOpacity: 0.04,
    selected: 'rgba(0, 0, 0, 0.08)',
    selectedOpacity: 0.08,
    disabled: 'rgba(0, 0, 0, 0.26)',
    disabledBackground: 'rgba(0, 0, 0, 0.12)',
    disabledOpacity: 0.38,
    focus: 'rgba(0, 0, 0, 0.12)',
    focusOpacity: 0.12,
    activatedOpacity: 0.12,
  },
  background: {
    default: '#FFFFFF',
    paper: '#FFFFFF',
  },
  divider: 'rgba(0, 0, 0, 0.12)',
} satisfies AppPalette

const shape = {
  borderRadius: 0,
}

const breakpoints = {
  values: {
    [MOBILE_BREAKPOINT_KEY]: 0,
    [DESKTOP_BREAKPOINT_KEY]: MOBILE_BREAKPOINT_PX,
    xs: 0,
    sm: MOBILE_BREAKPOINT_PX,
    md: 900,
    lg: 1200,
    xl: 1536,
  },
} as MuiSystemThemeOptions['breakpoints']

const zIndex = {
  mobileStepper: 1000,
  speedDial: 1050,
  appBar: 1400,
  drawer: 1400,
  modal: 1500,
  snackbar: 1600,
  tooltip: 1500,
  popup: 1500,
  mapButtons: 1300,
}

const fonts = {
  primary: ARIMO_FONT_FAMILY,
}

const typography = {
  fontFamily: fonts.primary,
  body1: {
    fontFamily: fonts.primary,
    fontSize: '0.875rem',
    fontWeight: 700,
    lineHeight: 'normal',
    letterSpacing: '0.0875rem',
  },
  body2: {
    fontFamily: fonts.primary,
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 'normal',
    letterSpacing: '0.0875rem',
  },
  body7: {
    fontFamily: fonts.primary,
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 'normal',
    letterSpacing: '0.075rem',
  },
  caption: {
    fontFamily: fonts.primary,
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.66,
    letterSpacing: '0.03333em',
  },
  h1: {
    fontFamily: fonts.primary,
    fontSize: '1.5rem',
    fontWeight: 700,
    lineHeight: 'normal',
    letterSpacing: '0.15rem',
  },
  h2: {
    fontFamily: fonts.primary,
    fontSize: '1.125rem',
    fontWeight: 700,
    lineHeight: 'normal',
    letterSpacing: '0.1125rem',
  },
  h3: {
    fontFamily: fonts.primary,
    fontSize: '1rem',
    fontWeight: 700,
    lineHeight: '1.625rem',
    letterSpacing: '0.1rem',
  },
  h4: {
    fontFamily: fonts.primary,
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: '1.625rem',
    letterSpacing: '0.1rem',
  },
  h5: {
    fontFamily: fonts.primary,
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 'normal',
    letterSpacing: '0.1rem',
  },
  h6: {
    fontFamily: fonts.primary,
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: '1.625rem',
    letterSpacing: '0.0875rem',
  },
  h7: {
    fontFamily: fonts.primary,
    fontSize: '0.875rem',
    fontWeight: 700,
    lineHeight: '1.625rem',
    letterSpacing: '0.0875rem',
  },
  h8: {
    fontFamily: fonts.primary,
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 'normal',
    letterSpacing: '0.0875rem',
  },
  h9: {
    fontFamily: fonts.primary,
    fontSize: '0.875rem',
    fontWeight: 700,
    lineHeight: 'normal',
    letterSpacing: '0.0875rem',
  },
  inherit: {
    fontFamily: 'inherit',
    fontSize: 'inherit',
    fontWeight: 'inherit',
    lineHeight: 'inherit',
    letterSpacing: 'inherit',
  },
} satisfies AppTypography

const shadows = Array.from({ length: 25 }, () => 'none')

const formatTransitionValue = (value: number | string) =>
  typeof value === 'number' ? `${value}ms` : value

const transitions = {
  create: (
    props: string | string[],
    {
      duration = 300,
      easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
      delay,
    }: {
      duration?: number | string
      easing?: string
      delay?: number | string
    } = {}
  ) => {
    const transitionDelay =
      delay == null ? '' : ` ${formatTransitionValue(delay)}`

    return (Array.isArray(props) ? props : [props])
      .map(
        (prop) =>
          `${prop} ${formatTransitionValue(duration)} ${easing}${transitionDelay}`
      )
      .join(',')
  },
}

export const appGlobalStyles: GlobalStylesProps<AppTheme>['styles'] = {
  '*': {
    '@supports selector(::-webkit-scrollbar)': {
      '&::-webkit-scrollbar': {
        width: SCROLLBAR_WIDTH_REM + 'rem',
        backgroundColor: 'transparent',
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: alpha(palette.neutral.dark, 0.7),
        borderRadius: '7px !important',
        boxShadow: '0px 4px 4px 0px rgba(159, 159, 159, 0.25)',
      },
      '&::-webkit-scrollbar-thumb:hover': {
        backgroundColor: alpha(palette.neutral.dark, 0.9),
      },
    },
    '@supports not selector(::-webkit-scrollbar)': {
      scrollbarWidth: 'thin',
      scrollbarColor: `${alpha(palette.neutral.dark, 0.7)} transparent`,
    },
    boxSizing: 'border-box',
    borderCollapse: 'collapse',
  },
  html: {
    margin: 0,
    padding: 0,
    overflow: 'hidden',
  },
  body: {
    margin: 0,
    padding: 0,
    overflow: 'hidden',
    fontFamily: fonts.primary,
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
  },
  a: {
    color: 'inherit',
    textDecoration: 'inherit',
  },
  '.mapboxgl-ctrl-logo': {
    width: '55px !important',
    backgroundSize: '55px',
    margin: '0 0 -16px -8px !important',
  },
  '.osScroll': {
    position: 'relative',
    height: '100%',
  },
  '.osScroll .os-viewport': {
    scrollbarWidth: 'none !important',
    msOverflowStyle: 'none !important',
  },
  '.osScroll .os-viewport::-webkit-scrollbar': {
    width: 0,
    height: 0,
    background: 'transparent',
  },
  '.osScroll .os-scrollbar-vertical': {
    left: 'auto',
    zIndex: 0,
  },
  '.osScroll .os-scrollbar-corner': {
    left: 'auto',
  },
  '.osScroll .os-scrollbar': {
    zIndex: 0,
    '--os-size': `${SCROLLBAR_WIDTH_REM}rem`,
    '--os-track-bg': 'transparent',
    '--os-track-bg-hover': 'transparent',
    '--os-track-bg-active': 'transparent',
    '--os-handle-bg': alpha(palette.neutral.dark, 0.7),
    '--os-handle-bg-hover': alpha(palette.neutral.dark, 0.9),
    '--os-handle-bg-active': alpha(palette.neutral.dark, 0.9),
    '--os-padding-perpendicular': '0px',
    '--os-padding-axis': '4px',
  },
  '.osLeft .os-scrollbar-handle': {
    borderRadius: '7px',
    boxShadow: '0px 4px 4px 0px rgba(159, 159, 159, 0.25)',
  },
}

const theme = createTheme({
  palette,
  breakpoints,
  typography,
  zIndex,
  transitions,
  shape,
  shadows,
}) as AppTheme

export default theme
