export const SIDEBAR_CLOSED_WIDTH = 64

export const SIDEBAR_PADDING_REM = 2.75
export const MOBILE_SIDEBAR_PADDING_REM = 1.5
export const SIDEBAR_HEADER_EDGE_INSET_REM = 0.375

export const SIDEBAR_CONTENT_BOX_PADDING_X = {
  mobile: '1rem',
  desktop: '1.875rem',
} as const

export const SIDEBAR_CONTENT_BOX_PADDING_BOTTOM = {
  mobile: '1.25rem',
  desktop: '1.5rem',
} as const

// Header inset plus title padding should line up with SidebarContentBox content.
export const SIDEBAR_HEADER_TITLE_PADDING_X = {
  mobile: `${1 - SIDEBAR_HEADER_EDGE_INSET_REM}rem`,
  desktop: `${1.875 - SIDEBAR_HEADER_EDGE_INSET_REM}rem`,
} as const

export const MOBILE_BREAKPOINT_PX = 600
export const MOBILE_BREAKPOINT_KEY = 'mobile' as const
export const DESKTOP_BREAKPOINT_KEY = 'desktop' as const

export const SCROLLBAR_WIDTH_REM = 0.6

// Moderate shared radius for multiline, large, popup, and modal-like surfaces.
export const SHARED_CONTROL_BORDER_RADIUS = '1rem'

// Pill radius for single-line controls that should fully round their end caps.
export const SHARED_CONTROL_INFINITE_BORDER_RADIUS = '999px'

export const SIDEBAR_PADDING_WITH_SCROLLBAR_REM =
  SIDEBAR_PADDING_REM + SCROLLBAR_WIDTH_REM
