import * as React from 'react'
import { css, cx } from 'styled-system/css'

import type { PandaStyleProp } from '#/common/style/panda'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'
import Switch, { type SwitchProps } from '#/components/common/Switch'

type SwitchWithLabelProps = Omit<SwitchProps, 'sx'> & {
  children?: React.ReactNode
  ariaLabel?: string
  sx?: PandaStyleProp
  controlSx?: PandaStyleProp
  labelSx?: PandaStyleProp
  required?: boolean
}

const wrapperClass = css({
  m: 0,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  cursor: 'pointer',
  '&[data-disabled]': {
    cursor: 'not-allowed',
  },
})

const labelClass = css({
  color: 'neutral.darker',
  userSelect: 'none',
  ml: 2,
  opacity: 1,
  fontFamily: 'var(--font-arimo)',
  fontSize: '0.875rem',
  fontWeight: 400,
  lineHeight: 'normal',
  letterSpacing: '0.0875rem',
  '[data-disabled] &': {
    color: 'text.disabled',
    opacity: 0.8,
  },
})

const SwitchWithLabel = ({
  children,
  ariaLabel,
  sx,
  controlSx,
  labelSx,
  disabled,
  required = false,
  inputProps,
  ...rest
}: SwitchWithLabelProps) => {
  const resolvedAriaLabel =
    inputProps?.['aria-label'] ??
    ariaLabel ??
    (typeof children === 'string' || typeof children === 'number'
      ? String(children)
      : undefined)

  return (
    <label
      className={cx(wrapperClass, css(...pandaStylePropsToArray(sx)))}
      data-disabled={disabled ? '' : undefined}
      style={mergePandaStyleProps({ sx })}
    >
      <Switch
        sx={controlSx}
        disabled={disabled}
        aria-label={resolvedAriaLabel}
        inputProps={{
          ...inputProps,
          'aria-label': resolvedAriaLabel,
        }}
        {...rest}
      />
      <span
        className={cx(labelClass, css(...pandaStylePropsToArray(labelSx)))}
        style={mergePandaStyleProps({ sx: labelSx })}
      >
        {children}
        {required && ' *'}
      </span>
    </label>
  )
}

export default SwitchWithLabel
