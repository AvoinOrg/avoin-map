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
