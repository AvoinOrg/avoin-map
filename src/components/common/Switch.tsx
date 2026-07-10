import * as React from 'react'

import {
  AppSxProps,
  AppTheme,
  Box,
  toSxArray,
} from '#/common/style/theme'

type BaseInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange'
>

export type SwitchProps = BaseInputProps & {
  sx?: AppSxProps
  className?: string
  focusVisibleClassName?: string
  disableRipple?: boolean
  inputRef?: React.Ref<HTMLInputElement>
  inputProps?: BaseInputProps
  onChange?: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void
}

const toTokens = (value?: string): string[] =>
  (value ?? '')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0)
    .map((token) => token.replace(/^\./, ''))

const toClassName = (tokens: Array<string | undefined>): string | undefined =>
  toTokens(tokens.join(' ')).join(' ') || undefined

const focusVisibleThumbBoxShadow = (theme: AppTheme) => ({
  boxShadow: `0 0 0 2px ${theme.palette.common.white}, 0 0 0 4px ${theme.palette.secondary.dark}`,
})

const baseSwitchSx = (theme: AppTheme) => ({
  width: 44,
  height: 24,
  padding: 0,
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  cursor: 'pointer',
  userSelect: 'none',
  '& .MuiSwitch-input': {
    position: 'absolute',
    inset: 0,
    margin: 0,
    padding: 0,
    opacity: 0,
    width: '100%',
    height: '100%',
    zIndex: 3,
    cursor: 'inherit',
    appearance: 'none',
    '&:focus-visible': {
      outline: 'none',
    },
    '&:focus-visible + .MuiSwitch-switchBase .MuiSwitch-thumb': focusVisibleThumbBoxShadow(
      theme
    ),
    '&[data-focus-visible="true"] + .MuiSwitch-switchBase .MuiSwitch-thumb': focusVisibleThumbBoxShadow(
      theme
    ),
  },
  '& .MuiSwitch-switchBase': {
    position: 'relative',
    zIndex: 2,
    boxSizing: 'border-box',
    width: 20,
    height: 20,
    margin: '2px',
    padding: 0,
    transitionDuration: '250ms',
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
    color: theme.palette.text.primary,
    '&.Mui-checked': {
      transform: 'translateX(20px)',
      color: theme.palette.common.white,
      '& + .MuiSwitch-track': {
        backgroundColor: theme.palette.secondary.dark,
        borderRadius: '999px',
        opacity: 1,
        border: 0,
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.5,
      },
    },
    '&.Mui-disabled': {
      pointerEvents: 'none',
      color: theme.palette.action.disabled,
    },
    '&.Mui-disabled .MuiSwitch-thumb': {
      backgroundColor: theme.palette.action.disabled,
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: 0.3,
    },
    '&.Mui-focusVisible': {
      color: theme.palette.common.white,
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 20,
    height: 20,
    borderRadius: '50%',
    backgroundColor: theme.palette.common.white,
    pointerEvents: 'none',
    position: 'relative',
    zIndex: 1,
  },
  '& .MuiSwitch-track': {
    position: 'absolute',
    inset: 0,
    borderRadius: '999px',
    backgroundColor: theme.palette.neutral.main,
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 250,
    }),
    pointerEvents: 'none',
    zIndex: 0,
  },
})

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

const Switch = ({
  sx,
  className,
  focusVisibleClassName,
  disableRipple = false,
  inputRef,
  inputProps,
  onChange,
  checked: checkedProp,
  defaultChecked: defaultCheckedProp,
  disabled: disabledProp,
  required: requiredProp,
  name: nameProp,
  value: valueProp,
  id: idProp,
  role: roleProp,
  autoFocus: autoFocusProp,
  style: styleFromProps,
  onFocus: onFocusFromProps,
  onBlur: onBlurFromProps,
  onMouseDown: onMouseDownFromProps,
  onMouseUp: onMouseUpFromProps,
  onPointerDown: onPointerDownFromProps,
  onPointerUp: onPointerUpFromProps,
  onTouchStart: onTouchStartFromProps,
  onTouchMove: onTouchMoveFromProps,
  onTouchEnd: onTouchEndFromProps,
  onKeyDown: onKeyDownFromProps,
  onKeyUp: onKeyUpFromProps,
  onKeyPress: onKeyPressFromProps,
  onClick: onClickFromProps,
  onDoubleClick: onDoubleClickFromProps,
  onMouseEnter: onMouseEnterFromProps,
  onMouseLeave: onMouseLeaveFromProps,
  onMouseMove: onMouseMoveFromProps,
  onMouseOver: onMouseOverFromProps,
  onMouseOut: onMouseOutFromProps,
  onInput: onInputFromProps,
  onInvalid: onInvalidFromProps,
  ...nativeInputProps
}: SwitchProps) => {
  void disableRipple
  const {
    onChange: inputOnChange,
    onFocus: onFocusFromInputProps,
    onBlur: onBlurFromInputProps,
    onMouseDown: onMouseDownFromInputProps,
    onMouseUp: onMouseUpFromInputProps,
    onPointerDown: onPointerDownFromInputProps,
    onPointerUp: onPointerUpFromInputProps,
    onTouchStart: onTouchStartFromInputProps,
    onTouchMove: onTouchMoveFromInputProps,
    onTouchEnd: onTouchEndFromInputProps,
    onKeyDown: onKeyDownFromInputProps,
    onKeyUp: onKeyUpFromInputProps,
    onKeyPress: onKeyPressFromInputProps,
    onClick: onClickFromInputProps,
    onDoubleClick: onDoubleClickFromInputProps,
    onMouseEnter: onMouseEnterFromInputProps,
    onMouseLeave: onMouseLeaveFromInputProps,
    onMouseMove: onMouseMoveFromInputProps,
    onMouseOver: onMouseOverFromInputProps,
    onMouseOut: onMouseOutFromInputProps,
    onInput: onInputFromInputProps,
    onInvalid: onInvalidFromInputProps,
    checked: inputCheckedProp,
    defaultChecked: inputDefaultCheckedProp,
    disabled: inputDisabledProp,
    required: inputRequiredProp,
    name: inputNameProp,
    value: inputValueProp,
    id: inputIdProp,
    role: inputRoleProp,
    autoFocus: inputAutoFocusProp,
    className: inputClassName,
    style: styleFromInputProps,
    ...inputNativeProps
  } = (inputProps as React.InputHTMLAttributes<HTMLInputElement>) ?? {}

  const nativeInputBaseProps = nativeInputProps as BaseInputProps & {
    style?: React.CSSProperties
  }
  const inputNativeBaseProps = inputNativeProps as BaseInputProps & {
    style?: React.CSSProperties
  }

  const resolvedChecked = checkedProp ?? inputCheckedProp
  const resolvedDefaultChecked = defaultCheckedProp ?? inputDefaultCheckedProp
  const resolvedDisabled = disabledProp ?? inputDisabledProp ?? false
  const resolvedRequired = requiredProp ?? inputRequiredProp ?? false
  const resolvedName = nameProp ?? inputNameProp
  const resolvedValue = valueProp ?? inputValueProp
  const resolvedId = idProp ?? inputIdProp
  const resolvedRole = roleProp ?? inputRoleProp ?? 'switch'
  const resolvedAutoFocus = autoFocusProp ?? inputAutoFocusProp

  const isControlled = resolvedChecked !== undefined
  const mergedInputNativeProps = {
    ...nativeInputBaseProps,
    ...inputNativeBaseProps,
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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    inputOnChange?.(event)

    if (event.defaultPrevented) {
      return
    }

    if (!isControlled) {
      setInternalChecked(event.target.checked)
    }

    onChange?.(event, event.target.checked)
  }

  const rootClassName = toClassName(['MuiSwitch-root', className])
  const switchBaseClassName = toClassName([
    'MuiSwitch-switchBase',
    isChecked ? 'Mui-checked' : undefined,
    resolvedDisabled ? 'Mui-disabled' : undefined,
  ])
  const inputClassNameResolved = toClassName(['MuiSwitch-input', inputClassName])

  return (
    <Box
      component="span"
      className={rootClassName}
      data-slot="switch-root"
      data-checked={isChecked ? '' : undefined}
      data-unchecked={isChecked ? undefined : ''}
      data-disabled={resolvedDisabled ? '' : undefined}
      data-required={resolvedRequired ? '' : undefined}
      data-focus-visible-class={focusVisibleClassName ?? undefined}
      sx={[
        baseSwitchSx,
        resolvedDisabled ? { cursor: 'not-allowed', opacity: 0.65 } : null,
        ...toSxArray(sx),
      ]}
    >
      <input
        {...cleanInputNativeProps}
        ref={inputRef}
        type="checkbox"
        role={resolvedRole}
        className={inputClassNameResolved}
        disabled={resolvedDisabled}
        required={resolvedRequired}
        name={resolvedName}
        value={resolvedValue}
        id={resolvedId}
        autoFocus={resolvedAutoFocus}
        {...nativeCheckedProps}
        style={{
          ...(styleFromInputProps && typeof styleFromInputProps === 'object'
            ? styleFromInputProps
            : {}),
          ...(nativeInputBaseProps.style &&
          typeof nativeInputBaseProps.style === 'object'
            ? nativeInputBaseProps.style
            : {}),
          ...(styleFromProps && typeof styleFromProps === 'object'
            ? styleFromProps
            : {}),
        }}
        onBlur={mergeEventHandlers(onBlurFromInputProps, onBlurFromProps)}
        onFocus={mergeEventHandlers(
          onFocusFromInputProps,
          onFocusFromProps
        )}
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
        onTouchStart={mergeEventHandlers(
          onTouchStartFromInputProps,
          onTouchStartFromProps
        )}
        onTouchMove={mergeEventHandlers(
          onTouchMoveFromInputProps,
          onTouchMoveFromProps
        )}
        onTouchEnd={mergeEventHandlers(
          onTouchEndFromInputProps,
          onTouchEndFromProps
        )}
        onKeyDown={mergeEventHandlers(
          onKeyDownFromInputProps,
          onKeyDownFromProps
        )}
        onKeyUp={mergeEventHandlers(onKeyUpFromInputProps, onKeyUpFromProps)}
        onKeyPress={mergeEventHandlers(
          onKeyPressFromInputProps,
          onKeyPressFromProps
        )}
        onClick={mergeEventHandlers(onClickFromInputProps, onClickFromProps)}
        onDoubleClick={mergeEventHandlers(
          onDoubleClickFromInputProps,
          onDoubleClickFromProps
        )}
        onMouseEnter={mergeEventHandlers(
          onMouseEnterFromProps,
          onMouseEnterFromInputProps
        )}
        onMouseLeave={mergeEventHandlers(
          onMouseLeaveFromProps,
          onMouseLeaveFromInputProps
        )}
        onMouseMove={mergeEventHandlers(
          onMouseMoveFromProps,
          onMouseMoveFromInputProps
        )}
        onMouseOver={mergeEventHandlers(
          onMouseOverFromProps,
          onMouseOverFromInputProps
        )}
        onMouseOut={mergeEventHandlers(
          onMouseOutFromProps,
          onMouseOutFromInputProps
        )}
        onInput={mergeEventHandlers(onInputFromInputProps, onInputFromProps)}
        onInvalid={mergeEventHandlers(onInvalidFromInputProps, onInvalidFromProps)}
        onChange={handleChange}
        aria-disabled={resolvedDisabled ? 'true' : undefined}
        data-disabled={resolvedDisabled ? '' : undefined}
      />
      <Box component="span" className={switchBaseClassName}>
        <Box component="span" className="MuiSwitch-thumb" />
      </Box>
      <Box component="span" className="MuiSwitch-track" />
    </Box>
  )
}

export default Switch
