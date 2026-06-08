import React from 'react'
import { Field as BaseField } from '@base-ui/react/field'
import { Input as BaseInput } from '@base-ui/react/input'
import { css, cx } from 'styled-system/css'

import type { PandaStyleProp } from '#/common/style/panda'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'
import type { NativeInputProps } from './formControlEvents'
import { sharedInputControlStyle } from './formControlStyles'

type TextFieldWithLabelProps = Omit<
  NativeInputProps,
  'children' | 'className' | 'style' | 'size'
> & {
  label: React.ReactNode
  ariaLabel?: string
  sx?: PandaStyleProp
  labelSx?: PandaStyleProp
  textFieldSx?: PandaStyleProp
  trailing?: React.ReactNode
  fullWidth?: boolean
  size?: 'small' | 'medium'
  variant?: string
  multiline?: boolean
  rows?: number
  minRows?: number
  maxRows?: number
}

const wrapperClass = css({
  width: '100%',
})

const headerClass = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  maxWidth: '100%',
  px: '1rem',
  minHeight: '1.5rem',
  mb: '0.2rem',
})

const labelClass = css({
  fontFamily: 'var(--font-arimo)',
  fontSize: '0.625rem',
  fontWeight: 400,
  lineHeight: '0.8125rem',
  letterSpacing: '0.11em',
  color: '#111111',
})

const rowClass = css({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  width: '100%',
})

const inputWrapClass = css({
  flex: 1,
  minWidth: 0,
})

const inputClass = css(sharedInputControlStyle, {
  minHeight: '2rem',
  px: '1rem',
  py: '0.1875rem',
})

const textareaClass = css(sharedInputControlStyle, {
  borderRadius: '1rem',
  px: '1rem',
  py: '0.5rem',
  resize: 'vertical',
})

const trailingClass = css({
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
  lineHeight: 0,
})

const TextFieldWithLabel = ({
  label,
  ariaLabel,
  sx,
  labelSx,
  textFieldSx,
  trailing,
  fullWidth = true,
  size: _size = 'small',
  variant: _variant = 'outlined',
  multiline = false,
  onKeyDown,
  rows,
  minRows,
  maxRows,
  id,
  ...textFieldProps
}: TextFieldWithLabelProps) => {
  const generatedId = React.useId()
  const inputId = id ?? generatedId
  void _size
  void _variant

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onKeyDown?.(event as React.KeyboardEvent<HTMLInputElement>)

    if (event.defaultPrevented || multiline || event.key !== 'Enter') {
      return
    }

    event.preventDefault()
    if (event.target instanceof HTMLElement) {
      event.target.blur()
    }
  }

  return (
    <BaseField.Root
      className={cx(wrapperClass, css(...pandaStylePropsToArray(sx)))}
      style={{
        width: fullWidth ? '100%' : undefined,
        ...mergePandaStyleProps({ sx }),
      }}
    >
      <div className={headerClass}>
        {ariaLabel ? (
          <span
            className={cx(labelClass, css(...pandaStylePropsToArray(labelSx)))}
            style={mergePandaStyleProps({ sx: labelSx })}
          >
            {label}
          </span>
        ) : (
          <BaseField.Label
            htmlFor={inputId}
            className={cx(labelClass, css(...pandaStylePropsToArray(labelSx)))}
            style={mergePandaStyleProps({ sx: labelSx })}
          >
            {label}
          </BaseField.Label>
        )}
      </div>

      <div className={rowClass}>
        <div className={inputWrapClass}>
          {multiline ? (
            <textarea
              {...(textFieldProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
              id={inputId}
              aria-label={ariaLabel}
              rows={rows}
              onKeyDown={handleKeyDown}
              className={cx(
                textareaClass,
                css(...pandaStylePropsToArray(textFieldSx))
              )}
              style={{
                minHeight: minRows ? `${minRows * 1.5}rem` : undefined,
                maxHeight: maxRows ? `${maxRows * 1.5}rem` : undefined,
                ...mergePandaStyleProps({ sx: textFieldSx }),
              }}
            />
          ) : (
            <BaseInput
              {...(textFieldProps as React.ComponentPropsWithoutRef<
                typeof BaseInput
              >)}
              id={inputId}
              aria-label={ariaLabel}
              onKeyDown={handleKeyDown}
              className={cx(
                inputClass,
                css(...pandaStylePropsToArray(textFieldSx))
              )}
              style={mergePandaStyleProps({ sx: textFieldSx })}
            />
          )}
        </div>

        {trailing && <div className={trailingClass}>{trailing}</div>}
      </div>
    </BaseField.Root>
  )
}

export default TextFieldWithLabel
