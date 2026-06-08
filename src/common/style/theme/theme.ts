'use client'

import {
  createTheme,
  PaletteColorOptions,
  Shadows,
  ThemeOptions,
  alpha,
} from '@mui/material/styles'
import { SCROLLBAR_WIDTH_REM } from './constants'
import {
  APP_FONT_FAMILY,
  appBreakpoints,
  appPalette,
  appShape,
  appTypography,
  appZIndex,
} from './tokens'

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

const palette = appPalette

const shape = appShape

const breakpoints: ThemeOptions['breakpoints'] = {
  values: appBreakpoints,
}

const zIndex = appZIndex

const typography = appTypography

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
        props: { variant: 'contained' as const },
        style: {
          backgroundColor: palette.neutral.light, // Replace with your desired color for the button
          borderColor: palette.neutral.main,
          color: palette.neutral.darker,
        },
      },
      {
        props: { variant: 'outlined' as const },
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
        textTransform: 'none' as const,
      },
    },
  },
  MuiTypography: {
    defaultProps: { variant: 'inherit' as const }, // <- key: do not reset sizes in children
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
        textTransform: 'inherit' as const,
        fontWeight: 'inherit',
      },
    },
  },
  MuiTooltip: {
    defaultProps: {
      arrow: false,
    },
    styleOverrides: {
      tooltip: {
        borderRadius: '0.5rem',
        padding: '0.5rem 0.75rem',
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
        fontFamily: APP_FONT_FAMILY,
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      },
      a: {
        color: 'inherit',
        textDecoration: 'inherit', // no underline
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
  breakpoints,
  components,
  typography,
  zIndex,
  shape,
  shadows,
})
