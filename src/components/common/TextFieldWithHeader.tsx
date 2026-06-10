import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Field as BaseField } from '@base-ui/react/field'
import { Input as BaseInput } from '@base-ui/react/input'
import { debounce } from 'lodash-es'
import { css, cx } from 'styled-system/css'

import type { PandaStyleProp } from '#/common/style/panda'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'
import type { NativeInputProps } from './formControlEvents'
import { sharedInputControlStyle } from './formControlStyles'

type TextFieldWithHeaderProps = Omit<
  NativeInputProps,
  | 'value'
  | 'onChange'
  | 'placeholder'
  | 'name'
  | 'disabled'
  | 'required'
  | 'size'
> & {
  headerText: string
  placeholderText?: string
  ariaLabel?: string
  value: string
  onChange: (value: string) => void
  debounceTimeout?: number
  name?: string
  styleProps?: PandaStyleProp
  headerSx?: PandaStyleProp
  textSx?: PandaStyleProp
  required?: boolean
  fullWidth?: boolean
  disabled?: boolean
  error?: boolean
  helperText?: string
  multiline?: boolean
  rows?: number
  minRows?: number
  maxRows?: number
}

const wrapperClass = css({
  display: 'flex',
  flexDirection: 'column',
  mb: 2,
})

const headerClass = css({
  mb: 1,
  fontFamily: 'var(--font-arimo)',
  fontSize: '0.875rem',
  fontWeight: 700,
  lineHeight: 'normal',
  letterSpacing: '0.0875rem',
  color: '#111111',
})

const inputClass = css(sharedInputControlStyle, {
  border: '0.5px solid',
  borderColor: 'neutral.main',
  backgroundColor: 'neutral.light',
  color: 'neutral.darker',
  boxShadow: '0px 4px 7px 0px rgba(217, 217, 217, 0.50) inset',
  px: '1rem',
  py: '0.75rem',
  fontSize: '0.9rem',
  letterSpacing: '1.1px',
  '&::placeholder': {
    fontFamily: 'var(--font-arimo)',
    fontSize: '1rem',
    opacity: 1,
    color: 'neutral.dark',
    letterSpacing: '1.1px',
  },
})

const textareaClass = css(sharedInputControlStyle, {
  border: '0.5px solid',
  borderColor: 'neutral.main',
  backgroundColor: 'neutral.light',
  color: 'neutral.darker',
  boxShadow: '0px 4px 7px 0px rgba(217, 217, 217, 0.50) inset',
  px: '1rem',
  py: '0.75rem',
  fontSize: '0.9rem',
  letterSpacing: '1.1px',
  resize: 'vertical',
  borderRadius: '1rem',
  minHeight: '2.5rem',
  '&::placeholder': {
    fontFamily: 'var(--font-arimo)',
    fontSize: '1rem',
    opacity: 1,
    color: 'neutral.dark',
    letterSpacing: '1.1px',
  },
})

const helperClass = css({
  mt: '0.25rem',
  ml: 0,
  fontFamily: 'var(--font-arimo)',
  fontSize: '0.75rem',
  lineHeight: '1rem',
  color: 'neutral.dark',
  '&[data-error]': {
    color: 'error.main',
  },
})

const TextFieldWithHeader = ({
  headerText,
  placeholderText,
  ariaLabel,
  value: propValue,
  onChange: onParentChange,
  debounceTimeout = 300,
  name,
  styleProps,
  headerSx,
  textSx,
  required = false,
  fullWidth = true,
  disabled = false,
  error = false,
  helperText,
  multiline = false,
  rows,
  minRows,
  maxRows,
  id,
  ...restTextFieldProps
}: TextFieldWithHeaderProps) => {
  const [internalValue, setInternalValue] = useState(propValue)
  const lastPropValueRef = useRef(propValue)
  const generatedId = React.useId()
  const inputId = id ?? generatedId
  const helperId = helperText ? `${inputId}-helper` : undefined

  useEffect(() => {
    if (propValue !== lastPropValueRef.current) {
      lastPropValueRef.current = propValue
      setInternalValue(propValue)
    }
  }, [propValue])

  const debouncedParentOnChange = useMemo(
    () =>
      debounce((newValue: string) => {
        onParentChange(newValue)
      }, debounceTimeout),
    [debounceTimeout, onParentChange]
  )

  useEffect(() => {
    return () => {
      debouncedParentOnChange.cancel()
    }
  }, [debouncedParentOnChange])

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newValue = event.target.value
    setInternalValue(newValue)
    debouncedParentOnChange(newValue)
  }

  const commonControlProps = {
    ...restTextFieldProps,
    id: inputId,
    name,
    placeholder: placeholderText,
    disabled,
    required,
    'aria-label': ariaLabel ?? headerText,
    'aria-invalid': error || undefined,
    'aria-describedby': helperId,
  } as const

  return (
    <BaseField.Root
      disabled={disabled}
      invalid={error}
      name={name}
      className={cx(wrapperClass, css(...pandaStylePropsToArray(styleProps)))}
      style={{
        width: fullWidth ? '100%' : undefined,
        ...mergePandaStyleProps({ styleProps }),
      }}
    >
      {ariaLabel ? (
        <span
          className={cx(headerClass, css(...pandaStylePropsToArray(headerSx)))}
          style={mergePandaStyleProps({ styleProps: headerSx })}
        >
          {headerText}
          {required && ' *'}
        </span>
      ) : (
        <BaseField.Label
          className={cx(headerClass, css(...pandaStylePropsToArray(headerSx)))}
          style={mergePandaStyleProps({ styleProps: headerSx })}
        >
          {headerText}
          {required && ' *'}
        </BaseField.Label>
      )}
      {multiline ? (
        <textarea
          {...(commonControlProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          value={internalValue}
          onChange={handleInputChange}
          rows={rows}
          style={{
            minHeight: minRows ? `${minRows * 1.5}rem` : undefined,
            maxHeight: maxRows ? `${maxRows * 1.5}rem` : undefined,
            ...mergePandaStyleProps({ styleProps: textSx }),
          }}
          className={cx(textareaClass, css(...pandaStylePropsToArray(textSx)))}
        />
      ) : (
        <BaseInput
          {...(commonControlProps as React.ComponentPropsWithoutRef<typeof BaseInput>)}
          value={internalValue}
          render={(inputProps) => (
            <input
              {...inputProps}
              value={internalValue}
              onChange={(event) => {
                inputProps.onChange?.(event)
                handleInputChange(event)
              }}
              className={cx(
                inputClass,
                css(...pandaStylePropsToArray(textSx))
              )}
              style={mergePandaStyleProps({ styleProps: textSx })}
            />
          )}
        />
      )}
      {helperText !== undefined && (
        <BaseField.Description
          id={helperId}
          data-error={error ? '' : undefined}
          className={helperClass}
        >
          {helperText}
        </BaseField.Description>
      )}
    </BaseField.Root>
  )
}

export default TextFieldWithHeader
