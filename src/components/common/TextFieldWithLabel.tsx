import React, { useId } from 'react'
import { Box, type AppSxProps, toSxArray } from '#/common/style/theme/system'

type ComponentSxArrayItem = Exclude<NonNullable<AppSxProps>, readonly unknown[]>

const toComponentSxArray = (sx?: AppSxProps) =>
  toSxArray(sx) as ComponentSxArrayItem[]

const CONTROL_CLASS_NAME = 'text-field-with-label-control'
const REQUIRED_MARKER_CLASS = 'text-field-with-label-required-marker'

type TextFieldWithLabelBaseProps = {
  label: React.ReactNode
  ariaLabel?: string
  sx?: AppSxProps
  labelSx?: AppSxProps
  textFieldSx?: AppSxProps
  trailing?: React.ReactNode
  fullWidth?: boolean
  size?: 'small' | 'medium'
  variant?: 'outlined' | 'filled' | 'standard'
  /** @deprecated Public multiline usage should go through TextFieldMultilineWithLabel. */
  multiline?: boolean
  rows?: number
  minRows?: number
  maxRows?: number
  helperText?: React.ReactNode
  error?: boolean
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>['inputMode']
  maxLength?: number
  minLength?: number
  pattern?: string
  autoComplete?: string
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>
  onFocus?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>
  onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement>
}

type TextFieldWithLabelProps = TextFieldWithLabelBaseProps &
  Omit<
    React.ComponentPropsWithoutRef<'input'>,
    keyof TextFieldWithLabelBaseProps | 'children'
  >

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
  id: idProp,
  name,
  value,
  defaultValue,
  placeholder,
  required = false,
  disabled = false,
  readOnly = false,
  autoFocus = false,
  type = 'text',
  inputMode,
  autoComplete,
  maxLength,
  minLength,
  pattern,
  rows,
  minRows,
  maxRows,
  helperText,
  error = false,
  onChange,
  onFocus,
  onBlur,
  ...textFieldProps
}: TextFieldWithLabelProps) => {
  const generatedId = useId()
  const controlId = idProp ?? generatedId
  const helperTextId = `${controlId}-helper-text`
  const hasHelperText = helperText != null

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onKeyDown?.(event)

    if (event.defaultPrevented || multiline || event.key !== 'Enter') {
      return
    }

    event.preventDefault()
    if (event.currentTarget instanceof HTMLElement) {
      event.currentTarget.blur()
    }
  }

  const handleSingleLineKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (
    event
  ) => {
    handleKeyDown(event)
  }

  const handleMultilineKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (
    event
  ) => {
    handleKeyDown(event)
  }

  const wrapperSx: ComponentSxArrayItem[] = [
    {
      width: '100%',
      minWidth: 0,
    },
    ...toComponentSxArray(sx),
  ]

  const labelSxFinal: AppSxProps[] = [
    {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      maxWidth: '100%',
      px: '1rem',
      minHeight: '1.5rem',
      mb: '0.2rem',
      fontSize: '0.625rem',
      fontWeight: 400,
      lineHeight: '0.8125rem',
      letterSpacing: '0.11em',
      color: '#111111',
      [`& .${REQUIRED_MARKER_CLASS}`]: {
        color: 'error.main',
      },
    },
    ...toComponentSxArray(labelSx),
  ]

  const controlSx: AppSxProps[] = [
    {
      flex: 1,
      minWidth: 0,
      [`& .${CONTROL_CLASS_NAME}`]: {
        width: fullWidth ? '100%' : 'auto',
        minHeight: multiline ? 'auto' : '2rem',
        minWidth: 0,
        resize: multiline ? 'vertical' : 'none',
        borderRadius: '999px',
        border: '1px solid',
        borderColor: error ? 'error.main' : '#D6D6D6',
        backgroundColor: '#FFFFFF',
        boxShadow: 'inset 0px 0.5px 1px 0px #D9D9D9',
        boxSizing: 'border-box',
        px: '1rem',
        py: multiline ? '0.5rem' : '0.1875rem',
        fontSize: '0.6875rem',
        fontWeight: 400,
        lineHeight: 'normal',
        letterSpacing: '0.04em',
        color: '#111111',
        outline: 'none',
        '&:focus-visible': {
          borderColor: error ? 'error.main' : 'neutral.darker',
        },
        '&:disabled': {
          opacity: 0.55,
          cursor: 'not-allowed',
          backgroundColor: '#F6F6F6',
        },
        '&::placeholder': {
          color: 'neutral.dark',
          opacity: 1,
        },
        ...(multiline && minRows != null
          ? { minHeight: `${minRows * 1.5}rem` }
          : {}),
        ...(multiline && maxRows != null
          ? { maxHeight: `${maxRows * 1.5}rem` }
          : {}),
      },
    },
    ...toComponentSxArray(textFieldSx).map(
      (slotSx) =>
        ({
          [`& .${CONTROL_CLASS_NAME}`]: slotSx,
        }) as ComponentSxArrayItem
    ),
  ]

  const commonControlProps = {
    id: controlId,
    name,
    value,
    defaultValue,
    placeholder,
    required,
    disabled,
    readOnly,
    autoFocus,
    'aria-label': ariaLabel,
    'aria-describedby': hasHelperText ? helperTextId : undefined,
    'aria-invalid': error || undefined,
  } as React.ComponentPropsWithoutRef<'input'>

  const singleLineControlProps: React.ComponentPropsWithoutRef<'input'> = {
    ...commonControlProps,
    ...textFieldProps,
    type,
    inputMode,
    autoComplete,
    maxLength,
    minLength,
    pattern,
    onChange: onChange as React.ChangeEventHandler<HTMLInputElement>,
    onFocus: onFocus as React.FocusEventHandler<HTMLInputElement>,
    onBlur: onBlur as React.FocusEventHandler<HTMLInputElement>,
    onKeyDown: handleSingleLineKeyDown,
  }

  const multilineControlProps = {
    ...commonControlProps,
    ...textFieldProps,
    rows,
    onChange: onChange as React.ChangeEventHandler<HTMLTextAreaElement>,
    onFocus: onFocus as React.FocusEventHandler<HTMLTextAreaElement>,
    onBlur: onBlur as React.FocusEventHandler<HTMLTextAreaElement>,
    onKeyDown: handleMultilineKeyDown,
  } as React.ComponentPropsWithoutRef<'textarea'>

  void _size
  void _variant

  return (
    <Box sx={wrapperSx}>
      <label htmlFor={controlId}>
        <Box sx={labelSxFinal as AppSxProps}>
          {label}
          {required ? <span className={REQUIRED_MARKER_CLASS}>*</span> : null}
        </Box>
      </label>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          width: '100%',
        }}
      >
        <Box sx={controlSx as AppSxProps}>
          {multiline ? (
            <textarea className={CONTROL_CLASS_NAME} {...multilineControlProps} />
          ) : (
            <input className={CONTROL_CLASS_NAME} {...singleLineControlProps} />
          )}
        </Box>

        {trailing != null ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
              lineHeight: 0,
            }}
          >
            {trailing}
          </Box>
        ) : null}
      </Box>

      {hasHelperText ? (
        <Box
          component="p"
          id={helperTextId}
          role="note"
          sx={{
            mt: '0.25rem',
            mx: 0,
            fontSize: '0.625rem',
            lineHeight: '0.8125rem',
            color: error ? 'error.main' : 'neutral.dark',
            minHeight: '0.8125rem',
          }}
        >
          {helperText}
        </Box>
      ) : null}
    </Box>
  )
}

export default TextFieldWithLabel
