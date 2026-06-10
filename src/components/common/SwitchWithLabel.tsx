import * as React from 'react'
import { css, cx } from 'styled-system/css'

import type { PandaStyleProp } from '#/common/style/panda'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'
import Switch, { type SwitchProps } from '#/components/common/Switch'

type SwitchWithLabelProps = Omit<SwitchProps, 'styleProps'> & {
  children?: React.ReactNode
  ariaLabel?: string
  styleProps?: PandaStyleProp
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
  styleProps,
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
      className={cx(wrapperClass, css(...pandaStylePropsToArray(styleProps)))}
      data-disabled={disabled ? '' : undefined}
      style={mergePandaStyleProps({ styleProps })}
    >
      <Switch
        styleProps={controlSx}
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
        style={mergePandaStyleProps({ styleProps: labelSx })}
      >
        {children}
        {required && ' *'}
      </span>
    </label>
  )
}

export default SwitchWithLabel
