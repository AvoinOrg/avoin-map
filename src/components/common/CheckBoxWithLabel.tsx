import * as React from 'react'

import {
  AppSxProps,
  AppTheme,
  Box,
  toSxArray,
} from '#/common/style/theme'
import CheckboxCheckedIcon from '#/components/icons/CheckboxChecked'
import CheckboxIcon from '#/components/icons/Checkbox'

type BaseInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange'
>

type CheckBoxWithLabelProps = BaseInputProps & {
  checked?: boolean
  defaultChecked?: boolean
  onChange?: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void
  children?: React.ReactNode
  sx?: AppSxProps
  checkboxSx?: AppSxProps
  iconSx?: AppSxProps
  iconCheckedSx?: AppSxProps
  textSx?: AppSxProps
  inputProps?: BaseInputProps
  required?: boolean
  icon?: React.ReactNode
  checkedIcon?: React.ReactNode
  inputRef?: React.Ref<HTMLInputElement>
}

const toTokens = (value?: string): string[] =>
  (value ?? '')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0)
    .map((token) => token.replace(/^\./, ''))

const toClassName = (tokens: Array<string | undefined>): string | undefined =>
  toTokens(tokens.join(' ')).join(' ') || undefined

const focusVisibleCheckboxBoxShadow = (theme: AppTheme) => ({
  boxShadow: `0 0 0 2px ${theme.palette.common.white}, 0 0 0 4px ${theme.palette.secondary.dark}`,
})

const checkboxIconSlotSx = {
  width: '100%',
  height: '100%',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  boxSizing: 'border-box',
  borderRadius: '0.125rem',
  lineHeight: 0,
  overflow: 'hidden',
  '& > svg': {
    width: '100%',
    height: '100%',
    display: 'block',
    flexShrink: 0,
  },
}

const mergeEventHandlers = <T extends React.SyntheticEvent>(
  ...handlers: Array<((event: T) => void) | undefined>
) =>
  handlers.some(Boolean)
    ? (event: T) => {
        for (const handler of handlers) {
          handler?.(event)
        }
      }
    : undefined

const CheckBoxWithLabel = ({
  checked: checkedProp,
  defaultChecked: defaultCheckedProp,
  onChange,
  children,
  sx,
  checkboxSx,
  icon,
  checkedIcon,
  iconSx,
  iconCheckedSx,
  textSx,
  disabled: disabledProp,
  required: requiredProp,
  inputProps,
  inputRef,
  onFocus: onFocusFromProps,
  onBlur: onBlurFromProps,
  onMouseDown: onMouseDownFromProps,
  onMouseUp: onMouseUpFromProps,
  onPointerDown: onPointerDownFromProps,
  onPointerUp: onPointerUpFromProps,
  onClick: onClickFromProps,
  onKeyDown: onKeyDownFromProps,
  onKeyUp: onKeyUpFromProps,
  onKeyPress: onKeyPressFromProps,
  onMouseEnter: onMouseEnterFromProps,
  onMouseLeave: onMouseLeaveFromProps,
  onMouseMove: onMouseMoveFromProps,
  onMouseOver: onMouseOverFromProps,
  onMouseOut: onMouseOutFromProps,
  name: nameProp,
  value: valueProp,
  id: idProp,
  role: roleProp,
  autoFocus: autoFocusProp,
  style: checkboxInputStyle,
  'aria-label': ariaLabelFromProps,
  onInput: onInputFromProps,
  ...checkboxNativeProps
}: CheckBoxWithLabelProps) => {
  const {
    onChange: inputOnChange,
    onFocus: onFocusFromInputProps,
    onBlur: onBlurFromInputProps,
    onMouseDown: onMouseDownFromInputProps,
    onMouseUp: onMouseUpFromInputProps,
    onPointerDown: onPointerDownFromInputProps,
    onPointerUp: onPointerUpFromInputProps,
    onClick: onClickFromInputProps,
    onKeyDown: onKeyDownFromInputProps,
    onKeyUp: onKeyUpFromInputProps,
    onKeyPress: onKeyPressFromInputProps,
    onInput: onInputFromInputProps,
    className: inputClassName,
    checked: inputChecked,
    defaultChecked: inputDefaultChecked,
    disabled: inputDisabled,
    required: inputRequired,
    name: inputName,
    value: inputValue,
    id: inputId,
    role: inputRole,
    autoFocus: inputAutoFocus,
    style: inputStyle,
    onMouseEnter: onMouseEnterFromInputProps,
    onMouseLeave: onMouseLeaveFromInputProps,
    onMouseMove: onMouseMoveFromInputProps,
    onMouseOver: onMouseOverFromInputProps,
    onMouseOut: onMouseOutFromInputProps,
    ...inputNativeProps
  } = (inputProps as React.InputHTMLAttributes<HTMLInputElement>) ?? {}

  const safeInputNativeProps = checkboxNativeProps as BaseInputProps & {
    style?: React.CSSProperties
  }
  const safeInputProps = inputNativeProps as BaseInputProps & {
    style?: React.CSSProperties
    'aria-label'?: string
  }

  const resolvedChecked = checkedProp ?? inputChecked
  const resolvedDefaultChecked = defaultCheckedProp ?? inputDefaultChecked
  const resolvedDisabled = disabledProp ?? inputDisabled ?? false
  const resolvedRequired = requiredProp ?? inputRequired ?? false
  const resolvedName = nameProp ?? inputName
  const resolvedValue = valueProp ?? inputValue
  const resolvedId = idProp ?? inputId
  const resolvedRole = roleProp ?? inputRole ?? 'checkbox'
  const resolvedAutoFocus = autoFocusProp ?? inputAutoFocus

  const isControlled = resolvedChecked !== undefined
  const mergedInputNativeProps = {
    ...safeInputNativeProps,
    ...safeInputProps,
  } as BaseInputProps & {
    style?: React.CSSProperties
    defaultChecked?: boolean
  }

  const cleanInputNativeProps = { ...mergedInputNativeProps } as BaseInputProps
  delete cleanInputNativeProps.checked
  delete cleanInputNativeProps.defaultChecked

  const [internalChecked, setInternalChecked] = React.useState(
    Boolean(resolvedDefaultChecked)
  )
  const isChecked = isControlled ? resolvedChecked : internalChecked
  const nativeCheckedProps = isControlled
    ? { checked: isChecked }
    : { defaultChecked: resolvedDefaultChecked }

  const resolvedAriaLabel =
    inputProps?.['aria-label'] ??
    ariaLabelFromProps ??
    safeInputProps['aria-label'] ??
    (typeof children === 'string' || typeof children === 'number'
      ? String(children)
      : undefined)

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    inputOnChange?.(event)

    if (event.defaultPrevented) {
      return
    }

    if (!isControlled) {
      setInternalChecked(event.target.checked)
    }

    onChange?.(event, event.target.checked)
  }

  const rootClassName = toClassName([
    'MuiCheckbox-root',
    isChecked ? 'Mui-checked' : undefined,
    resolvedDisabled ? 'Mui-disabled' : undefined,
  ])

  const inputClassNameResolved = toClassName([
    'MuiCheckbox-input',
    inputClassName,
  ])

  const iconClassName = toClassName([
    'MuiCheckbox-icon',
    isChecked ? 'Mui-checked' : undefined,
  ])

  const iconStyle = isChecked
    ? [
        (theme: AppTheme) => ({
          backgroundColor: resolvedDisabled
            ? theme.palette.action.disabledBackground
            : '#97C68B',
          color: resolvedDisabled
            ? theme.palette.text.disabled
            : theme.palette.neutral.darker ?? theme.palette.text.primary,
          opacity: resolvedDisabled ? 0.6 : 1,
        }),
        ...(toSxArray(iconCheckedSx)),
      ]
    : [
        (theme: AppTheme) => ({
          backgroundColor: 'transparent',
          color: resolvedDisabled
            ? theme.palette.text.disabled
            : theme.palette.neutral.darker ?? theme.palette.text.primary,
          opacity: resolvedDisabled ? 0.6 : 1,
        }),
        ...(toSxArray(iconSx)),
      ]

  const renderIcon = isChecked
    ? checkedIcon ?? <CheckboxCheckedIcon />
    : icon ?? <CheckboxIcon />

  return (
    <Box
      component="label"
      sx={[
        {
          m: 0,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          '&:hover': {
            cursor: resolvedDisabled ? 'not-allowed' : 'pointer',
          },
          '& .MuiCheckbox-input:focus-visible + .MuiCheckbox-icon':
            focusVisibleCheckboxBoxShadow,
          '& .MuiCheckbox-input[data-focus-visible="true"] + .MuiCheckbox-icon':
            focusVisibleCheckboxBoxShadow,
          '& .MuiCheckbox-input.Mui-focusVisible + .MuiCheckbox-icon':
            focusVisibleCheckboxBoxShadow,
        },
        ...toSxArray(sx),
      ]}
      className={rootClassName}
      data-slot="checkbox-root"
      data-checked={isChecked ? '' : undefined}
      data-unchecked={isChecked ? undefined : ''}
      data-disabled={resolvedDisabled ? '' : undefined}
      data-required={resolvedRequired ? '' : undefined}
    >
      <Box
        component="span"
        sx={[
          {
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            flexShrink: 0,
          },
          ...toSxArray(checkboxSx),
        ]}
        data-slot="checkbox-control"
      >
        <input
          {...cleanInputNativeProps}
          ref={inputRef}
          role={resolvedRole}
          className={inputClassNameResolved}
          type="checkbox"
          disabled={resolvedDisabled}
          required={resolvedRequired}
          aria-label={resolvedAriaLabel}
          name={resolvedName}
          value={resolvedValue}
          id={resolvedId}
          autoFocus={resolvedAutoFocus}
          {...nativeCheckedProps}
          onFocus={mergeEventHandlers(onFocusFromInputProps, onFocusFromProps)}
          onBlur={mergeEventHandlers(onBlurFromInputProps, onBlurFromProps)}
          onMouseDown={mergeEventHandlers(
            onMouseDownFromInputProps,
            onMouseDownFromProps
          )}
          onMouseUp={mergeEventHandlers(
            onMouseUpFromInputProps,
            onMouseUpFromProps
          )}
          onPointerDown={mergeEventHandlers(
            onPointerDownFromInputProps,
            onPointerDownFromProps
          )}
          onPointerUp={mergeEventHandlers(
            onPointerUpFromInputProps,
            onPointerUpFromProps
          )}
          onClick={mergeEventHandlers(onClickFromInputProps, onClickFromProps)}
          onKeyDown={mergeEventHandlers(
            onKeyDownFromInputProps,
            onKeyDownFromProps
          )}
          onKeyUp={mergeEventHandlers(onKeyUpFromInputProps, onKeyUpFromProps)}
          onKeyPress={mergeEventHandlers(
            onKeyPressFromInputProps,
            onKeyPressFromProps
          )}
          onInput={mergeEventHandlers(onInputFromInputProps, onInputFromProps)}
          onMouseEnter={mergeEventHandlers(
            onMouseEnterFromInputProps,
            onMouseEnterFromProps
          )}
          onMouseLeave={mergeEventHandlers(onMouseLeaveFromInputProps, onMouseLeaveFromProps)}
          onMouseMove={mergeEventHandlers(onMouseMoveFromInputProps, onMouseMoveFromProps)}
          onMouseOver={mergeEventHandlers(onMouseOverFromInputProps, onMouseOverFromProps)}
          onMouseOut={mergeEventHandlers(onMouseOutFromInputProps, onMouseOutFromProps)}
          onChange={handleInputChange}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            margin: 0,
            padding: 0,
            opacity: 0,
            cursor: 'inherit',
            zIndex: 2,
            appearance: 'none',
            ...(inputStyle && typeof inputStyle === 'object' ? inputStyle : {}),
            ...(safeInputProps.style &&
              typeof safeInputProps.style === 'object'
                ? safeInputProps.style
                : {}),
            ...(checkboxInputStyle &&
              typeof checkboxInputStyle === 'object'
                ? checkboxInputStyle
                : {}),
          }}
          data-slot="checkbox-input"
        />
        <Box
          component="span"
          className={iconClassName}
          sx={[checkboxIconSlotSx, ...iconStyle]}
        >
          {renderIcon}
        </Box>
      </Box>
      <Box
        component="span"
        sx={[
          {
            typography: 'body2',
            color: (theme) =>
              resolvedDisabled
                ? theme.palette.text.disabled
                : theme.palette.neutral.darker ??
                  theme.palette.text.primary,
            userSelect: 'none',
            ml: 2,
            opacity: resolvedDisabled ? 0.8 : 1,
          },
          ...toSxArray(textSx),
        ]}
        data-slot="checkbox-text"
      >
        {children}
        {resolvedRequired && <Box component="span">{' *'}</Box>}
      </Box>
    </Box>
  )
}

export default CheckBoxWithLabel
