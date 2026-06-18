import React, {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import { debounce } from 'lodash-es'
import { Box, type AppSxProps, toSxArray } from '#/common/style/theme/system'

type ComponentSxArrayItem = Exclude<NonNullable<AppSxProps>, readonly unknown[]>

const toComponentSxArray = (sx?: AppSxProps) =>
  toSxArray(sx) as ComponentSxArrayItem[]

const CONTROL_CLASS_NAME = 'text-field-with-header-control'
const REQUIRED_MARKER_CLASS = 'text-field-with-header-required-marker'

type TextFieldWithHeaderProps = Omit<
  React.ComponentPropsWithoutRef<'input'>,
  'children' | 'onChange'
> & {
  headerText: string
  placeholderText?: string
  ariaLabel?: string
  value: string
  onChange: (value: string) => void
  debounceTimeout?: number
  sx?: AppSxProps
  headerSx?: AppSxProps
  textSx?: AppSxProps
  required?: boolean
  fullWidth?: boolean
  helperText?: React.ReactNode
  disabled?: boolean
  error?: boolean
  multiline?: boolean
  rows?: number
  minRows?: number
  maxRows?: number
  onFocus?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>
  onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>
}

const TextFieldWithHeader = ({
  headerText,
  placeholderText,
  ariaLabel,
  value: propValue,
  onChange: onParentChange,
  debounceTimeout = 300,
  name,
  id: idProp,
  sx,
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
  onFocus,
  onBlur,
  ...restProps
}: TextFieldWithHeaderProps) => {
  const generatedId = useId()
  const controlId = idProp ?? generatedId
  const helperTextId = `${controlId}-helper-text`

  const [internalValue, setInternalValue] = useState(propValue)
  const syncedPropValueRef = useRef(propValue)

  useEffect(() => {
    if (syncedPropValueRef.current !== propValue) {
      syncedPropValueRef.current = propValue
      setInternalValue(propValue)
    }
  }, [propValue])

  const onParentChangeRef = useRef(onParentChange)
  useEffect(() => {
    onParentChangeRef.current = onParentChange
  }, [onParentChange])

  const invokeParentOnChange = useCallback((nextValue: string) => {
    onParentChangeRef.current(nextValue)
  }, [])

  const debouncedParentOnChange = useRef<ReturnType<typeof debounce> | null>(null)

  useEffect(() => {
    debouncedParentOnChange.current?.cancel()
    const nextDebounced = debounce(invokeParentOnChange, debounceTimeout)
    debouncedParentOnChange.current = nextDebounced

    return () => {
      nextDebounced.cancel()
    }
  }, [debounceTimeout, invokeParentOnChange])

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newValue = event.target.value
    setInternalValue(newValue)
    debouncedParentOnChange.current?.(newValue)
  }

  const controlStyles: AppSxProps[] = [
    {
      width: fullWidth ? '100%' : 'auto',
      [`& .${CONTROL_CLASS_NAME}`]: {
        borderRadius: multiline ? '8px' : '999px',
        border: '0.5px solid',
        borderColor: error ? 'error.main' : 'neutral.main',
        backgroundColor: 'neutral.light',
        boxShadow: '0px 4px 7px 0px rgba(217, 217, 217, 0.50) inset',
        boxSizing: 'border-box',
        fontFamily: 'Arimo',
        fontSize: '0.9rem',
        color: 'neutral.darker',
        fontStyle: 'normal',
        fontWeight: 400,
        lineHeight: 'normal',
        letterSpacing: '1.1px',
        minHeight: multiline ? 'auto' : '2rem',
        resize: multiline ? 'vertical' : 'none',
        outline: 'none',
        px: '1rem',
        py: multiline ? '0.75rem' : '0.4rem',
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
        ...(minRows != null ? { minHeight: `${minRows * 1.5}rem` } : {}),
        ...(maxRows != null ? { maxHeight: `${maxRows * 1.5}rem` } : {}),
      },
    },
    ...toComponentSxArray(textSx).map(
      (slotSx) =>
        ({
          [`& .${CONTROL_CLASS_NAME}`]: slotSx,
        }) as ComponentSxArrayItem
    ),
  ]

  const commonControlProps = {
    id: controlId,
    name,
    value: internalValue,
    placeholder: placeholderText,
    required,
    disabled,
    onFocus: onFocus as React.FocusEventHandler<HTMLInputElement>,
    onBlur: onBlur as React.FocusEventHandler<HTMLInputElement>,
    'aria-invalid': error || undefined,
    'aria-label': ariaLabel ?? headerText,
    'aria-describedby': helperText != null ? helperTextId : undefined,
  } as React.ComponentPropsWithoutRef<'input'>

  const inputControlProps: React.ComponentPropsWithoutRef<'input'> = {
    ...restProps,
    ...commonControlProps,
    onChange: handleInputChange as React.ChangeEventHandler<HTMLInputElement>,
  }

  const textareaControlProps = {
    ...restProps,
    ...commonControlProps,
    rows,
    onChange: handleInputChange as React.ChangeEventHandler<HTMLTextAreaElement>,
    onFocus: onFocus as React.FocusEventHandler<HTMLTextAreaElement>,
    onBlur: onBlur as React.FocusEventHandler<HTMLTextAreaElement>,
  } as React.ComponentPropsWithoutRef<'textarea'>

  const labelSxFinal: AppSxProps[] = [
    {
      mb: 1,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: '1.1',
      letterSpacing: '0.02em',
      [`& .${REQUIRED_MARKER_CLASS}`]: {
        color: 'error.main',
      },
    },
    ...toComponentSxArray(headerSx),
  ]

  return (
    <Box
      sx={[
        {
          display: 'flex',
          flexDirection: 'column',
          mb: 2,
        },
        ...toComponentSxArray(sx),
      ]}
    >
      <label htmlFor={controlId} style={{ width: '100%' }}>
        <Box sx={labelSxFinal as AppSxProps}>
          {headerText}
          {required ? (
            <span className={REQUIRED_MARKER_CLASS} aria-hidden="true">
              *
            </span>
          ) : null}
        </Box>
      </label>

      <Box sx={controlStyles as AppSxProps}>
        {multiline ? (
          <textarea className={CONTROL_CLASS_NAME} {...textareaControlProps} />
        ) : (
          <input className={CONTROL_CLASS_NAME} {...inputControlProps} />
        )}
      </Box>

      {helperText != null ? (
        <Box
          component="p"
          id={helperTextId}
          role="note"
          sx={{
            mt: '0.25rem',
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

export default TextFieldWithHeader
