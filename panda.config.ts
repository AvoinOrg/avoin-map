import { defineConfig } from '@pandacss/dev'

import { SCROLLBAR_WIDTH_REM } from './src/common/style/theme/constants'
import {
  APP_FONT_FAMILY,
  appBreakpoints,
  appPalette,
  appShape,
  appTypography,
  appZIndex,
} from './src/common/style/theme/tokens'

const token = <Value>(value: Value) => ({ value })

const spacingScale = [
  0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7, 8, 9,
  10, 12, 14, 16, 18, 20,
]

const spacingTokens = Object.fromEntries(
  spacingScale.map((value) => [String(value), token(`${value * 0.5}rem`)])
)

const muiShadowTokens = Object.fromEntries(
  Array.from({ length: 25 }, (_, index) => [String(index), token('none')])
)

const scrollbarWidth = `${SCROLLBAR_WIDTH_REM}rem`
const scrollbarThumb = 'rgba(160, 160, 160, 0.7)'
const scrollbarThumbHover = 'rgba(160, 160, 160, 0.9)'

const pandaBreakpoints = {
  mobile: `${appBreakpoints.mobile}px`,
  desktop: `${appBreakpoints.desktop}px`,
  xs: `${appBreakpoints.xs}px`,
  sm: `${appBreakpoints.sm}px`,
  md: `${appBreakpoints.md}px`,
  lg: `${appBreakpoints.lg}px`,
  xl: `${appBreakpoints.xl}px`,
}

type MuiTextVariant = Exclude<
  (typeof appTypography)[keyof typeof appTypography],
  string
>

const textStyleFromMuiVariant = (variant: MuiTextVariant) => ({
  value: {
    fontFamily: variant.fontFamily,
    fontSize: variant.fontSize,
    fontWeight: variant.fontWeight,
    lineHeight: variant.lineHeight,
    letterSpacing: variant.letterSpacing,
  },
})

export default defineConfig({
  preflight: false,
  hash: false,
  strictTokens: false,
  strictPropertyValues: false,
  gitignore: false,
  clean: true,
  syntax: 'object-literal',
  jsxFramework: 'react',
  outdir: 'styled-system',
  importMap: 'styled-system',
  include: ['./src/**/*.{js,jsx,ts,tsx}'],
  exclude: [
    './node_modules/**/*',
    './.next/**/*',
    './public/**/*',
    './i18n/**/*',
    './.dev/**/*',
    './.tmp/**/*',
    './.codex-orch/**/*',
    './legacy/**/*',
    './styled-system/**/*',
    './styled-system-static/**/*',
  ],
  theme: {
    breakpoints: pandaBreakpoints,
    tokens: {
      colors: {
        primary: {
          main: token(appPalette.primary.main),
          dark: token(appPalette.primary.dark),
          light: token(appPalette.primary.light),
          lighter: token(appPalette.primary.lighter),
        },
        secondary: {
          dark: token(appPalette.secondary.dark),
          main: token(appPalette.secondary.main),
          light: token(appPalette.secondary.light),
        },
        neutral: {
          main: token(appPalette.neutral.main),
          light: token(appPalette.neutral.light),
          dark: token(appPalette.neutral.dark),
          darker: token(appPalette.neutral.darker),
          lighter: token(appPalette.neutral.lighter),
        },
        info: {
          dark: token(appPalette.info.dark),
          main: token(appPalette.info.main),
        },
        warning: {
          main: token(appPalette.warning.main),
          light: token('rgb(238, 141, 51)'),
          dark: token('rgb(163, 79, 0)'),
          contrastText: token('#fff'),
        },
        error: {
          main: token('#d32f2f'),
          light: token('#ef5350'),
          dark: token('#c62828'),
          contrastText: token('#fff'),
        },
        common: {
          white: token('#fff'),
          black: token('#000'),
        },
        text: {
          primary: token('rgba(0, 0, 0, 0.87)'),
          secondary: token('rgba(0, 0, 0, 0.6)'),
          disabled: token('rgba(0, 0, 0, 0.38)'),
        },
        action: {
          active: token('rgba(0, 0, 0, 0.54)'),
          hover: token('rgba(0, 0, 0, 0.04)'),
          selected: token('rgba(0, 0, 0, 0.08)'),
          disabled: token('rgba(0, 0, 0, 0.26)'),
          disabledBackground: token('rgba(0, 0, 0, 0.12)'),
          focus: token('rgba(0, 0, 0, 0.12)'),
        },
        background: {
          paper: token('#fff'),
          default: token('#fff'),
        },
        grey: {
          300: token('#e0e0e0'),
          500: token('#9e9e9e'),
        },
        divider: token('rgba(0, 0, 0, 0.12)'),
      },
      fonts: {
        primary: token(APP_FONT_FAMILY),
        body: token(APP_FONT_FAMILY),
      },
      spacing: spacingTokens,
      radii: {
        none: token(`${appShape.borderRadius}`),
        '2px': token('2px'),
        '4px': token('4px'),
        '5px': token('5px'),
        xs: token('2px'),
        sm: token('4px'),
        md: token('5px'),
        mapButton: token('0.3125rem'),
        tooltip: token('0.5rem'),
        panel: token('0.625rem'),
        '10px': token('10px'),
        '12px': token('12px'),
        '15px': token('15px'),
        '20px': token('20px'),
        pill: token('999px'),
        circle: token('50%'),
      },
      shadows: {
        none: token('none'),
        ...muiShadowTokens,
        button: token('1px 1px 7px 0px #EEECEC'),
        layerCard: token('0 2px 4px 0 rgba(0, 0, 0, 0.10)'),
        floatingPanel: token('0 2px 8px rgba(17, 17, 17, 0.12)'),
        dropdown: token('0px 8px 24px rgba(17, 17, 17, 0.12)'),
        sidebarPanel: token('0px 10px 24px rgba(0, 0, 0, 0.18)'),
        sidebarToggle: token('0px 10px 24px rgba(0, 0, 0, 0.26)'),
        mapInset: token('inset 2px 2px 2px rgba(177, 177, 177, 0.25)'),
        controlInset: token('inset 0px 0.5px 1px 0px #D9D9D9'),
        fieldInset: token('0px 4px 7px 0px rgba(217, 217, 217, 0.50) inset'),
        mainCard: token('0 14px 30px rgba(0, 0, 0, 0.16)'),
        mainCardHover: token('0 18px 34px rgba(0, 0, 0, 0.2)'),
        mainPreview: token('0 18px 36px rgba(0, 0, 0, 0.2)'),
      },
      zIndex: {
        mapButtons: token(appZIndex.mapButtons),
        drawer: token(appZIndex.drawer),
        appBar: token(appZIndex.appBar),
        modal: token(appZIndex.modal),
        snackbar: token(appZIndex.snackbar),
        zpopup: token(appZIndex.zpopup),
        popup: token(appZIndex.zpopup),
      },
    },
    textStyles: {
      body1: textStyleFromMuiVariant(appTypography.body1),
      body2: textStyleFromMuiVariant(appTypography.body2),
      body7: textStyleFromMuiVariant(appTypography.body7),
      h1: textStyleFromMuiVariant(appTypography.h1),
      h2: textStyleFromMuiVariant(appTypography.h2),
      h3: textStyleFromMuiVariant(appTypography.h3),
      h4: textStyleFromMuiVariant(appTypography.h4),
      h5: textStyleFromMuiVariant(appTypography.h5),
      h6: textStyleFromMuiVariant(appTypography.h6),
      h7: textStyleFromMuiVariant(appTypography.h7),
      h8: textStyleFromMuiVariant(appTypography.h8),
      h9: textStyleFromMuiVariant(appTypography.h9),
      caption: {
        value: {
          fontFamily: APP_FONT_FAMILY,
          fontSize: '0.75rem',
          fontWeight: 400,
          lineHeight: 1.66,
        },
      },
    },
  },
  globalCss: {
    '*': {
      boxSizing: 'border-box',
      borderCollapse: 'collapse',
      '@supports selector(::-webkit-scrollbar)': {
        '&::-webkit-scrollbar': {
          width: scrollbarWidth,
          backgroundColor: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: scrollbarThumb,
          borderRadius: '7px !important',
          boxShadow: '0px 4px 4px 0px rgba(159, 159, 159, 0.25)',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          backgroundColor: scrollbarThumbHover,
        },
      },
      '@supports not selector(::-webkit-scrollbar)': {
        scrollbarWidth: 'thin',
        scrollbarColor: `${scrollbarThumb} transparent`,
      },
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
      '--os-size': scrollbarWidth,
      '--os-track-bg': 'transparent',
      '--os-track-bg-hover': 'transparent',
      '--os-track-bg-active': 'transparent',
      '--os-handle-bg': scrollbarThumb,
      '--os-handle-bg-hover': scrollbarThumbHover,
      '--os-handle-bg-active': scrollbarThumbHover,
      '--os-padding-perpendicular': '0px',
      '--os-padding-axis': '4px',
    },
    '.osLeft .os-scrollbar-handle': {
      borderRadius: '7px',
      boxShadow: '0px 4px 4px 0px rgba(159, 159, 159, 0.25)',
    },
  },
})
