import React from 'react'
import { NumberField as BaseNumberField } from '@base-ui/react/number-field'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import {
  Box,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
} from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'
import { useTranslate } from '@tolgee/react'
import { useLocaleFormatter } from '#/common/hooks/useLocaleFormatter'

type BaseNumberFieldRootProps = React.ComponentPropsWithoutRef<
  typeof BaseNumberField.Root
>

type SSRInitialFilledComponent = ((props: BaseNumberFieldRootProps) => null) & {
  muiName?: string
}

// Ensures the InputLabel shrinks correctly during SSR.
const SSRInitialFilled: SSRInitialFilledComponent = () => null
SSRInitialFilled.muiName = 'Input'

const getStepPrecision = (stepValue: number) => {
  if (!Number.isFinite(stepValue)) {
    return 0
  }

  const valueString = stepValue.toString()
  if (valueString.includes('e-')) {
    const [, exponent] = valueString.split('e-')
    const precision = Number(exponent)
    return Number.isNaN(precision) ? 0 : precision
  }

  const decimalIndex = valueString.indexOf('.')
  if (decimalIndex === -1) {
    return 0
  }

  return valueString.length - decimalIndex - 1
}

const normalizeStepValue = <T extends number | null | undefined>(
  inputValue: T,
  stepValue?: number | 'any'
): T => {
  if (inputValue == null) {
    return inputValue
  }

  if (
    typeof stepValue !== 'number' ||
    !Number.isFinite(stepValue) ||
    stepValue === 0
  ) {
    return inputValue
  }

  const nearest = Math.round(inputValue / stepValue) * stepValue
  if (Math.abs(inputValue - nearest) > 1e-6) {
    return inputValue
  }

  const precision = getStepPrecision(stepValue)
  return Number(nearest.toFixed(precision)) as T
}

type NumberInputFieldProps = Omit<
  BaseNumberFieldRootProps,
  'children' | 'render'
> & {
  label?: React.ReactNode
  helperText?: React.ReactNode
  size?: 'small' | 'medium'
  error?: boolean
  containerSx?: SxProps<Theme>
  formControlSx?: SxProps<Theme>
  inputRowSx?: SxProps<Theme>
  inputSx?: SxProps<Theme>
  adornmentSx?: SxProps<Theme>
  helperTextSx?: SxProps<Theme>
  inputSlotProps?: React.ComponentPropsWithoutRef<'input'>
  minValue?: number
  maxValue?: number
  incrementStepValue?: number
}

export const NumberInputField = ({
  label,
  helperText,
  size = 'medium',
  error = false,
  containerSx,
  formControlSx,
  inputRowSx,
  inputSx,
  adornmentSx,
  helperTextSx,
  inputSlotProps,
  minValue,
  maxValue,
  incrementStepValue,
  id: idProp,
  locale: localeProp,
  value,
  defaultValue,
  min,
  max,
  step,
  smallStep,
  largeStep,
  format,
  onValueChange,
  onValueCommitted,
  ...rootProps
}: NumberInputFieldProps) => {
  const hasLabel = Boolean(label)
  const generatedId = React.useId()
  const id = idProp ?? generatedId
  const { t } = useTranslate('avoin-map')
  const { numberLocale } = useLocaleFormatter()
  const effectiveMin = minValue ?? min
  const effectiveMax = maxValue ?? max
  const effectiveStep = incrementStepValue ?? step
  const effectiveFormat =
    format ??
    (typeof effectiveStep === 'number'
      ? { maximumFractionDigits: Math.max(getStepPrecision(effectiveStep), 2) }
      : undefined)
  const normalizedValue = normalizeStepValue(value, effectiveStep)
  const normalizedDefaultValue = normalizeStepValue(
    defaultValue,
    effectiveStep
  )
  const isControlled = value !== undefined
  const [localValue, setLocalValue] =
    React.useState<BaseNumberFieldRootProps['value']>(normalizedValue)

  React.useEffect(() => {
    if (!isControlled) {
      return
    }
    if (normalizedValue !== localValue) {
      setLocalValue(normalizedValue)
    }
  }, [isControlled, normalizedValue, localValue])

  const handleValueChange = React.useCallback<
    BaseNumberFieldRootProps['onValueChange']
  >(
    (nextValue, details) => {
      if (isControlled) {
        setLocalValue(nextValue)
      }
      onValueChange?.(nextValue, details)
    },
    [isControlled, onValueChange]
  )

  return (
    <Box
      sx={[
        {
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        },
        ...(Array.isArray(containerSx) ? containerSx : [containerSx]),
      ]}
    >
      <Box
        sx={[
          {
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          },
          ...(Array.isArray(inputRowSx) ? inputRowSx : [inputRowSx]),
        ]}
      >
        <BaseNumberField.Root
          {...rootProps}
          id={id}
          value={isControlled ? localValue : undefined}
          defaultValue={normalizedDefaultValue}
          min={effectiveMin}
          max={effectiveMax}
          step={effectiveStep}
          smallStep={smallStep}
          largeStep={largeStep}
          locale={localeProp ?? numberLocale}
          format={effectiveFormat}
          onValueChange={handleValueChange}
          onValueCommitted={onValueCommitted}
          render={(props, state) => (
            <FormControl
              size={size}
              ref={props.ref}
              disabled={state.disabled}
              required={state.required}
              error={error}
              variant="outlined"
              sx={[
                {
                  minWidth: 0,
                },
                ...(Array.isArray(formControlSx)
                  ? formControlSx
                  : [formControlSx]),
              ]}
            >
              {props.children}
            </FormControl>
          )}
        >
          <SSRInitialFilled
            {...rootProps}
            id={id}
            value={normalizedValue}
            defaultValue={normalizedDefaultValue}
          />
          {hasLabel && <InputLabel htmlFor={id}>{label}</InputLabel>}
          <BaseNumberField.Input
            id={id}
            render={(props, state) => (
              <OutlinedInput
                label={label}
                size={size}
                inputRef={props.ref}
                value={state.inputValue}
                onBlur={props.onBlur}
                onChange={props.onChange}
                onKeyUp={props.onKeyUp}
                onKeyDown={props.onKeyDown}
                onFocus={props.onFocus}
                slotProps={{
                  input: {
                    ...props,
                    ...inputSlotProps,
                  },
                }}
                endAdornment={
                  <InputAdornment
                    position="end"
                    sx={[
                      {
                        display: 'flex',
                        alignSelf: 'stretch',
                        maxHeight: 'unset',
                        borderLeft: '1px solid',
                        borderColor: 'divider',
                        ml: 0,
                        px: 0,
                        alignItems: 'stretch',
                        '& button': {
                          py: 0,
                          pl: 0.5,
                          pr: 1.25,
                          flex: 1,
                          borderRadius: 0,
                          overflow: 'hidden',
                        },
                        '& button:first-of-type': {
                          borderTopRightRadius: '999px',
                        },
                        '& button:last-of-type': {
                          borderBottomRightRadius: '999px',
                        },
                      },
                      ...(Array.isArray(adornmentSx)
                        ? adornmentSx
                        : [adornmentSx]),
                    ]}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignSelf: 'stretch',
                      }}
                    >
                      <BaseNumberField.Increment
                        render={
                          <IconButton
                            size={size}
                            aria-label={t('components.number_input.increase')}
                          />
                        }
                      >
                        <KeyboardArrowUpIcon
                          fontSize={size}
                          sx={{ transform: 'translateY(2px)' }}
                        />
                      </BaseNumberField.Increment>
                      <BaseNumberField.Decrement
                        render={
                          <IconButton
                            size={size}
                            aria-label={t('components.number_input.decrease')}
                          />
                        }
                      >
                        <KeyboardArrowDownIcon
                          fontSize={size}
                          sx={{ transform: 'translateY(-2px)' }}
                        />
                      </BaseNumberField.Decrement>
                    </Box>
                  </InputAdornment>
                }
                sx={[
                  {
                    pr: 0,
                    borderRadius: '999px',
                    overflow: 'hidden',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderRadius: '999px',
                    },
                  },
                  ...(Array.isArray(inputSx) ? inputSx : [inputSx]),
                ]}
              />
            )}
          />
          {helperText !== undefined && (
            <FormHelperText
              sx={[
                {
                  ml: 0,
                  '&:empty': { mt: 0 },
                },
                ...(Array.isArray(helperTextSx)
                  ? helperTextSx
                  : [helperTextSx]),
              ]}
            >
              {helperText}
            </FormHelperText>
          )}
        </BaseNumberField.Root>
      </Box>
    </Box>
  )
}
