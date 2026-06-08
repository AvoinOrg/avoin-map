import React from 'react'
import { css, cx } from 'styled-system/css'

import type { PandaStyleProp } from '#/common/style/panda'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'

type LoadingSpinnerColor =
  | 'primary'
  | 'secondary'
  | 'error'
  | 'info'
  | 'success'
  | 'warning'
  | 'inherit'
  | string

interface LoadingSpinnerProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color' | 'children'> {
  sx?: PandaStyleProp
  size?: number | string
  color?: LoadingSpinnerColor
  variant?: 'determinate' | 'indeterminate'
  thickness?: number
  disableShrink?: boolean
  value?: number
}

const spinnerClass = css({
  display: 'inline-flex',
  color: 'primary.main',
  lineHeight: 0,
})

const svgClass = css({
  display: 'block',
  width: '100%',
  height: '100%',
})

const colorToCssValue = (color: LoadingSpinnerColor) => {
  switch (color) {
    case 'primary':
      return 'var(--colors-primary-main)'
    case 'secondary':
      return 'var(--colors-secondary-main)'
    case 'error':
      return 'var(--colors-error-main)'
    case 'info':
      return 'var(--colors-info-main)'
    case 'warning':
      return 'var(--colors-warning-main)'
    case 'success':
      return '#2e7d32'
    case 'inherit':
      return 'currentColor'
    default:
      return color
  }
}

const sizeToCssValue = (size: number | string) => {
  return typeof size === 'number' ? `${size}px` : size
}

export const LoadingSpinner = ({
  sx,
  size = '4rem',
  color = 'primary',
  variant = 'indeterminate',
  thickness = 3.6,
  disableShrink = false,
  value = 0,
  className,
  style,
  ...rest
}: LoadingSpinnerProps) => {
  const normalizedValue = Math.min(100, Math.max(0, value))
  const radius = (44 - thickness) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset =
    variant === 'determinate'
      ? circumference * (1 - normalizedValue / 100)
      : undefined
  const resolvedSize = sizeToCssValue(size)

  return (
    <span
      role="progressbar"
      aria-valuemin={variant === 'determinate' ? 0 : undefined}
      aria-valuemax={variant === 'determinate' ? 100 : undefined}
      aria-valuenow={variant === 'determinate' ? normalizedValue : undefined}
      className={cx(spinnerClass, css(...pandaStylePropsToArray(sx)), className)}
      style={{
        width: resolvedSize,
        height: resolvedSize,
        color: colorToCssValue(color),
        ...mergePandaStyleProps({ sx, style }),
      }}
      {...rest}
    >
      <svg className={svgClass} viewBox="0 0 44 44" aria-hidden="true">
        {variant === 'indeterminate' ? (
          <g>
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 22 22"
              to="360 22 22"
              dur="1.4s"
              repeatCount="indefinite"
            />
            <circle
              cx="22"
              cy="22"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={thickness}
              strokeLinecap="round"
              strokeDasharray={disableShrink ? '80px, 200px' : '1px, 200px'}
              strokeDashoffset="0"
            >
              {!disableShrink && (
                <>
                  <animate
                    attributeName="stroke-dasharray"
                    values="1px, 200px;100px, 200px;100px, 200px"
                    dur="1.4s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="stroke-dashoffset"
                    values="0px;-15px;-125px"
                    dur="1.4s"
                    repeatCount="indefinite"
                  />
                </>
              )}
            </circle>
          </g>
        ) : (
          <circle
            cx="22"
            cy="22"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 22 22)"
          />
        )}
      </svg>
    </span>
  )
}
