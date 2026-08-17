export const ARIMO_FONT_FAMILY =
  'var(--font-arimo, Arial), BlinkMacSystemFont, "Segoe UI", Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif'

export const ARIMO_FONT_VARIABLE_CLASS = 'font-arimo-variable'

export const ARIMO_GOOGLE_FONTS_STYLESHEET =
  'https://fonts.googleapis.com/css2?family=Arimo:wght@400;500;700&display=swap'

export const ARIMO_FONT_VARIABLE_STYLE = `.${ARIMO_FONT_VARIABLE_CLASS} { --font-arimo: "Arimo", Arial; }`

export const arimo = {
  variable: ARIMO_FONT_VARIABLE_CLASS,
} as const
