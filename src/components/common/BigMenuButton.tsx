import * as React from 'react'
import { Button as BaseButton } from '@base-ui/react/button'
import { css, cx } from 'styled-system/css'

import type { PandaStyleProp } from '#/common/style/panda'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'

type BaseButtonProps = React.ComponentProps<typeof BaseButton>

type BigMenuButtonProps = Omit<
  BaseButtonProps,
  'children' | 'className' | 'style' | 'color' | 'render'
> & {
  children: React.ReactNode
  styleProps?: PandaStyleProp
  className?: string
  style?: React.CSSProperties
  color?: string
  variant?: string
  component?: 'button' | 'label'
}

const bigMenuButtonClassName = ({
  styleProps,
  className,
}: {
  styleProps?: PandaStyleProp
  className?: string
}) =>
  cx(
    css({
      textStyle: 'body1',
      width: '100%',
      height: '60px',
      margin: '0 0 0 0',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: '5px',
      backgroundColor: '#FBFBFB',
      border: '0.5px solid #D9D9D9',
      boxShadow: '1px 1px 7px 0px #EEECEC',
      color: 'inherit',
      pl: 3,
      pr: 3,
      cursor: 'pointer',
      textDecoration: 'none',
      appearance: 'none',
      outline: 'none !important',
      '&:focus': {
        outline: 'none !important',
        border: '0.5px solid #D9D9D9',
        boxShadow: '1px 1px 7px 0px #EEECEC',
      },
      '&:active': {
        outline: 'none !important',
        backgroundColor: 'primary.light',
        boxShadow: '1px 1px 7px 0px #EEECEC',
      },
      '&:hover': {
        backgroundColor: 'primary.lighter',
        borderColor: 'primary.main',
      },
      '&:focus-visible': {
        outline: 'none !important',
        border: '0.5px solid #C7C9B8',
        boxShadow: '1px 1px 7px 0px #EEECEC',
      },
      '&:disabled, &[aria-disabled="true"]': {
        cursor: 'not-allowed',
        opacity: 0.6,
      },
    }),
    css(...pandaStylePropsToArray(styleProps)),
    className
  )

const BigMenuButton = ({
  children,
  styleProps,
  className,
  style,
  component = 'label',
  color: _color,
  variant: _variant,
  'aria-label': ariaLabel,
  ...buttonProps
}: BigMenuButtonProps) => {
  void _color
  void _variant

  const resolvedAriaLabel =
    ariaLabel ??
    (typeof children === 'string' || typeof children === 'number'
      ? String(children)
      : undefined)

  const resolvedClassName = bigMenuButtonClassName({ styleProps, className })
  const resolvedStyle = mergePandaStyleProps({ styleProps, style })

  if (component === 'label') {
    return (
      <label
        {...(buttonProps as React.ComponentPropsWithoutRef<'label'>)}
        aria-label={resolvedAriaLabel}
        className={resolvedClassName}
        style={resolvedStyle}
      >
        {children}
      </label>
    )
  }

  return (
    <BaseButton
      {...buttonProps}
      aria-label={resolvedAriaLabel}
      className={resolvedClassName}
      style={resolvedStyle}
    >
      {children}
    </BaseButton>
  )
}

export default BigMenuButton
