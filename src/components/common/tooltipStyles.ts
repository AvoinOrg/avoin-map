import { css } from 'styled-system/css'

export const tooltipPositionerClass = css({
  zIndex: 'popup',
})

export const tooltipPopupClass = css({
  position: 'relative',
  overflow: 'visible',
  maxWidth: 'min(18.75rem, calc(100vw - 1rem))',
  borderRadius: '4px',
  backgroundColor: 'rgba(97, 97, 97, 0.92)',
  color: '#ffffff',
  px: '0.5rem',
  py: '0.25rem',
  fontSize: '0.6875rem',
  lineHeight: 1.4,
  boxShadow: '0 2px 8px rgba(17, 17, 17, 0.18)',
})

export const tooltipArrowClass = css({
  width: '0.5rem',
  height: '0.5rem',
  backgroundColor: 'rgba(97, 97, 97, 0.92)',
  pointerEvents: 'none',
  transform: 'rotate(45deg)',
  '&[data-side="top"]': {
    bottom: '-0.375rem',
  },
  '&[data-side="bottom"]': {
    top: '-0.375rem',
  },
  '&[data-side="left"]': {
    right: '-0.375rem',
  },
  '&[data-side="right"]': {
    left: '-0.375rem',
  },
})

export const TOOLTIP_ARROW_PADDING = 6
export const TOOLTIP_COLLISION_PADDING = 8
export const TOOLTIP_SIDE_OFFSET = 8
