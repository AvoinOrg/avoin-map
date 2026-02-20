'use client'

import {
  createTheme,
  PaletteColorOptions,
  Shadows,
  ThemeOptions,
  alpha,
} from '@mui/material/styles'
import { Arimo } from 'next/font/google'
import {
  DESKTOP_BREAKPOINT_KEY,
  MOBILE_BREAKPOINT_KEY,
  MOBILE_BREAKPOINT_PX,
  SCROLLBAR_WIDTH_REM,
} from './constants'

//extending palette to add background color

declare module '@mui/material/styles' {
  interface PaletteColor {
    lighter?: string
    darker?: string
  }

  interface SimplePaletteColorOptions {
    lighter?: string
    darker?: string
  }

  interface Palette {
    neutral: PaletteColor
  }
  interface PaletteOptions {
    neutral: PaletteColorOptions
  }

  interface TypographyVariants {
    h7?: React.CSSProperties
    h8?: React.CSSProperties
    h9?: React.CSSProperties
    body7?: React.CSSProperties
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    h7?: React.CSSProperties
    h8?: React.CSSProperties
    h9?: React.CSSProperties
    body7?: React.CSSProperties
  }

  interface ZIndex {
    popup: number
    mapButtons: number
  }

  interface ThemeOptions {
    zIndex?: Partial<ZIndex> | undefined
  }

  interface BreakpointOverrides {
    mobile: true
    desktop: true
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    buttonSmall: true
    h7: true
    h8: true
    h9: true
    body7: true
  }
}

const defaultTheme = createTheme()

export const arimo = Arimo({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  fallback: [
    'Arial',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Oxygen',
    'Ubuntu',
    'Cantarell',
    'Fira Sans',
    'Droid Sans',
    'Helvetica Neue',
  ],
})

const palette = {
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

const shape = {
  borderRadius: 0,
}

const breakpoints: ThemeOptions['breakpoints'] = {
  values: {
    [MOBILE_BREAKPOINT_KEY]: 0,
    [DESKTOP_BREAKPOINT_KEY]: MOBILE_BREAKPOINT_PX,
    xs: 0,
    sm: MOBILE_BREAKPOINT_PX,
    md: 900,
    lg: 1200,
    xl: 1536,
  },
}

const zIndex = {
  modal: 1500,
  snackbar: 1600,
  MapButtons: 1300,
  drawer: 1400,
  appBar: 1400,
  zpopup: 1500,
}

const fonts = {
  primary: arimo.style.fontFamily,
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
}

const defaultShadows: ThemeOptions['shadows'] = [...defaultTheme.shadows]

const shadows = defaultShadows.map(() => 'none') as Shadows

const components = {
  MuiTableRow: {
    styleOverrides: {
      root: {
        '&:last-child td': {
          borderBottom: 0,
        },
      },
    },
  },
  MuiButton: {
    variants: [
      {
        props: { variant: 'contained' as 'contained' },
        style: {
          backgroundColor: palette.neutral.light, // Replace with your desired color for the button
          borderColor: palette.neutral.main,
          color: palette.neutral.darker,
        },
      },
      {
        props: { variant: 'outlined' as 'outlined' },
        style: {
          backgroundColor: palette.neutral.light, // Replace with your desired color for the button
          borderColor: palette.neutral.main,
          color: palette.neutral.darker,
          boxShadow: '1px 1px 7px 0px #EEECEC',
        },
      },
    ],
    styleOverrides: {
      root: {
        textTransform: 'none' as 'none',
      },
    },
  },
  MuiTypography: {
    defaultProps: { variant: 'inherit' as 'inherit' }, // <- key: do not reset sizes in children
  },
  MuiLink: {
    styleOverrides: {
      root: {
        color: palette.secondary.dark,
        textDecoration: 'underline',
        '&:hover': {
          color: palette.secondary.main,
        },
        fontSize: 'inherit',
        lineHeight: 'inherit',
        letterSpacing: 'inherit',
        textTransform: 'inherit' as 'inherit',
        fontWeight: 'inherit',
      },
    },
  },
  MuiCssBaseline: {
    styleOverrides: {
      '*': {
        '@supports selector(::-webkit-scrollbar)': {
          '&::-webkit-scrollbar': {
            width: SCROLLBAR_WIDTH_REM + 'rem',
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            // darker + 70% opacity
            backgroundColor: alpha(palette.neutral.dark, 0.7),
            borderRadius: '7px !important',
            boxShadow: '0px 4px 4px 0px rgba(159, 159, 159, 0.25)',
          },
          // hover → 90% opacity
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: alpha(palette.neutral.dark, 0.9),
          },
        },
        '@supports not selector(::-webkit-scrollbar)': {
          // Firefox (no hover state available)
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
        textDecoration: 'inherit', // no underline
      },
      '.maplibregl-ctrl-attrib': {
        fontSize: '0.7rem',
        letterSpacing: '0.02rem',
        lineHeight: 2,
        fontFamily: fonts.primary,
      },
      '.maplibregl-ctrl-attrib a': { fontSize: 'inherit' },
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
        Scroll: 0,
        left: 'auto',
        zIndex: 0,
      },
      '.osScroll .os-scrollbar-corner': {
        Scroll: 0,
        left: 'auto',
      },

      // Match the natives: darker @70%, hover @90%
      '.osScroll .os-scrollbar': {
        zIndex: 0,
        '--os-size': `${SCROLLBAR_WIDTH_REM}rem`,
        '--os-track-bg': 'transparent',
        '--os-track-bg-hover': 'transparent',
        '--os-track-bg-active': 'transparent',

        // base / hover / active
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
      // old stuff below, probably not needed
      // code: {
      //   fontFamily:
      //     "source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace",
      // },
      // 'input, ul, li': {
      //   fontFamily:
      //     "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
      // },
      // 'input::placeholder': {
      //   fontFamily: "'Raleway'",
      // },
      // '.ol-popup': {
      //   position: 'absolute',
      //   backgroundColor: 'white',
      //   filter: 'drop-shadow(0 1px 4px rgba(0, 0, 0, 0.2))',
      //   padding: '15px',
      //   borderRadius: '10px',
      //   border: '1px solid #cccccc',
      //   bottom: '12px',
      //   left: '-50px',
      //   minWidth: '280px',
      // },
      // '.ol-popup:after, .ol-popup:before': {
      //   top: '100%',
      //   border: 'solid transparent',
      //   content: "' '",
      //   height: 0,
      //   width: 0,
      //   position: 'absolute',
      //   pointerEvents: 'none',
      // },
      // '.ol-popup:after': {
      //   borderTopColor: 'white',
      //   borderWidth: '10px',
      //   left: '48px',
      //   marginLeft: '-10px',
      // },
      // '.ol-popup:before': {
      //   borderTopColor: '#cccccc',
      //   borderWidth: '11px',
      //   left: '48px',
      //   marginLeft: '-11px',
      // },
      // '.ol-popup-closer': {
      //   textDecoration: 'none',
      //   position: 'absolute',
      //   top: '2px',
      //   right: '8px',
      // },
      // '.ol-popup-closer:after': {
      //   content: "'✖'",
      // },
    },
  },
}

export default createTheme({
  palette,
  components,
  typography,
  zIndex,
  shape,
  shadows,
})
