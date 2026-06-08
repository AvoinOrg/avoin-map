import { css } from 'styled-system/css'

export const controlTextClass = css({
  fontFamily: 'var(--font-arimo)',
  color: '#111111',
})

export const visuallyHiddenClass = css({
  border: 0,
  clip: 'rect(0 0 0 0)',
  height: '1px',
  margin: '-1px',
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  whiteSpace: 'nowrap',
  width: '1px',
})

export const sharedFloatingPositionerClass = css({
  zIndex: 'modal',
})

export const sharedSelectPopupStyle = {
  minWidth: 'var(--anchor-width)',
  maxHeight: '18rem',
  overflowY: 'auto',
  borderRadius: '0.625rem',
  border: '0.5px solid #D6D6D6',
  backgroundColor: '#FFFFFF',
  boxShadow: '0px 8px 24px rgba(17, 17, 17, 0.12)',
} as const

export const sharedSelectPopupClass = css(sharedSelectPopupStyle)

export const sharedSelectItemStyle = {
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  gap: '0.375rem',
  minHeight: '1.875rem',
  width: '100%',
  cursor: 'pointer',
  userSelect: 'none',
  outline: 'none',
  color: '#111111',
  fontFamily: 'var(--font-arimo)',
  fontSize: '0.6875rem',
  fontWeight: 400,
  lineHeight: 'normal',
  letterSpacing: '0.04em',
  px: '0.75rem',
  py: '0.375rem',
  '&[data-highlighted]': {
    backgroundColor: 'primary.lighter',
  },
  '&[data-disabled]': {
    cursor: 'not-allowed',
    color: 'text.disabled',
    opacity: 0.6,
  },
} as const

export const sharedSelectItemClass = css(sharedSelectItemStyle)

export const sharedFocusRing = {
  outline: '2px solid var(--colors-secondary-dark)',
  outlineOffset: '2px',
} as const

export const sharedSelectTriggerFocusStyle = {
  outline: 'none',
  '&:focus-visible': {
    ...sharedFocusRing,
    borderColor: 'secondary.dark',
  },
  '&[data-focus-visible]': {
    ...sharedFocusRing,
    borderColor: 'secondary.dark',
  },
  '&[data-focused]': {
    borderColor: 'secondary.dark',
  },
} as const

export const sharedInputControlStyle = {
  boxSizing: 'border-box',
  width: '100%',
  minWidth: 0,
  minHeight: '2rem',
  borderRadius: '999px',
  border: '0.5px solid #D6D6D6',
  backgroundColor: '#FFFFFF',
  boxShadow: 'inset 0px 0.5px 1px 0px #D9D9D9',
  color: '#111111',
  fontFamily: 'var(--font-arimo)',
  fontSize: '0.6875rem',
  fontWeight: 400,
  lineHeight: 'normal',
  letterSpacing: '0.04em',
  '&:focus': {
    borderColor: 'secondary.dark',
    outline: 'none',
  },
  '&:disabled': {
    cursor: 'not-allowed',
    color: 'text.disabled',
    backgroundColor: 'action.disabledBackground',
  },
} as const

export const sharedInputControlClass = css(sharedInputControlStyle)
