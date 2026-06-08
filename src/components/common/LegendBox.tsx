import React from 'react'
import { css } from 'styled-system/css'

interface LegendBoxProps {
  color: string
  title: string
}

const rootClass = css({
  display: 'flex',
  alignItems: 'center',
  mt: 0.5,
})

const swatchClass = css({
  border: '1px solid black',
  width: '1rem',
  height: '1rem',
  mr: 1,
  flexShrink: 0,
})

const titleClass = css({
  fontFamily: 'var(--font-arimo)',
  fontSize: '0.875rem',
  fontWeight: 400,
  lineHeight: 'normal',
  letterSpacing: '0.0875rem',
})

export const LegendBox = ({ color, title }: LegendBoxProps) => (
  <div className={rootClass}>
    <span className={swatchClass} style={{ backgroundColor: color }} />
    <span className={titleClass}>{title}</span>
  </div>
)
