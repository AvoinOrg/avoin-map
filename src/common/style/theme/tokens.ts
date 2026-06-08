import {
  DESKTOP_BREAKPOINT_KEY,
  MOBILE_BREAKPOINT_KEY,
  MOBILE_BREAKPOINT_PX,
} from './constants'

export const APP_FONT_FAMILY = 'var(--font-arimo)'

export const appPalette = {
  primary: {
    main: '#C7C9B8',
    dark: '#AFB29A',
    light: '#D7D9CC',
    lighter: '#EBECE6',
  },
  secondary: { dark: '#274AFF', main: '#5d77ff', light: '#b3bfff' },
  neutral: {
    main: '#D9D9D9',
    light: '#F6F4F4',
    dark: '#A0A0A0',
    darker: '#000000',
    lighter: '#FFFFFF',
  },
  info: { dark: '#EA7101', main: '#F09C4D' },
  warning: { main: '#EA7101' },
}

export const appShape = {
  borderRadius: 0,
}

export const appBreakpoints = {
  [MOBILE_BREAKPOINT_KEY]: 0,
  [DESKTOP_BREAKPOINT_KEY]: MOBILE_BREAKPOINT_PX,
  xs: 0,
  sm: MOBILE_BREAKPOINT_PX,
  md: 900,
  lg: 1200,
  xl: 1536,
}

export const appZIndex = {
  modal: 1500,
  snackbar: 1600,
  mapButtons: 1300,
  drawer: 1400,
  appBar: 1400,
  zpopup: 1500,
}

export const appTypography = {
  fontFamily: APP_FONT_FAMILY,
  body1: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: '0.875rem',
    fontWeight: 700,
    lineHeight: 'normal',
    letterSpacing: '0.0875rem',
  },
  body2: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 'normal',
    letterSpacing: '0.0875rem',
  },
  body7: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 'normal',
    letterSpacing: '0.075rem',
  },
  h1: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: '1.5rem',
    fontWeight: 700,
    lineHeight: 'normal',
    letterSpacing: '0.15rem',
  },
  h2: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: '1.125rem',
    fontWeight: 700,
    lineHeight: 'normal',
    letterSpacing: '0.1125rem',
  },
  h3: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: '1rem',
    fontWeight: 700,
    lineHeight: '1.625rem',
    letterSpacing: '0.1rem',
  },
  h4: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: '1.625rem',
    letterSpacing: '0.1rem',
  },
  h5: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 'normal',
    letterSpacing: '0.1rem',
  },
  h6: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: '1.625rem',
    letterSpacing: '0.0875rem',
  },
  h7: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: '0.875rem',
    fontWeight: 700,
    lineHeight: '1.625rem',
    letterSpacing: '0.0875rem',
  },
  h8: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 'normal',
    letterSpacing: '0.0875rem',
  },
  h9: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: '0.875rem',
    fontWeight: 700,
    lineHeight: 'normal',
    letterSpacing: '0.0875rem',
  },
}
