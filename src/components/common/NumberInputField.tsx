import React from 'react'
import { NumberField as BaseNumberField } from '@base-ui/react/number-field'
import { useTranslate } from '@tolgee/react'

import { useLocaleFormatter } from '#/common/hooks/useLocaleFormatter'
import { SHARED_CONTROL_BORDER_RADIUS } from '#/common/style/theme/constants'
import { Box, toSxArray } from '#/common/style/theme/system'
import { ArrowDown, ArrowUp } from '#/components/icons'

type BaseNumberFieldRootProps = React.ComponentPropsWithoutRef<
  typeof BaseNumberField.Root
>
type BaseNumberFieldValueChange = NonNullable<
  BaseNumberFieldRootProps['onValueChange']
>

type StyleProps = Parameters<typeof toSxArray>[0]
type StyleItem = Exclude<NonNullable<StyleProps>, readonly unknown[]>
const toStyleArray = (sx?: StyleProps) => toSxArray(sx) as StyleItem[]

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

const disabledSelector = '&:disabled, &[data-disabled], &[aria-disabled="true"]'

const arrowIconSx = (size: NumberInputFieldProps['size']) =>
  ({
    width: size === 'small' ? 8 : 9,
    height: size === 'small' ? 5 : 6,
    color: 'currentColor',
  }) satisfies StyleItem

type NumberInputFieldProps = Omit<
  BaseNumberFieldRootProps,
  'children' | 'render'
> & {
  label?: React.ReactNode
  helperText?: React.ReactNode
  size?: 'small' | 'medium'
  error?: boolean
  containerSx?: StyleProps
  formControlSx?: StyleProps
  inputRowSx?: StyleProps
  inputSx?: StyleProps
  adornmentSx?: StyleProps
  helperTextSx?: StyleProps
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
  const inputHeight = size === 'small' ? '1.5rem' : '2rem'
  const spinButtonHeight = `calc(${inputHeight} / 2)`
  const spinButtonWidth = size === 'small' ? '1.5rem' : '1.75rem'
  const hasLabel = Boolean(label)
  const generatedId = React.useId()
  const id = idProp ?? generatedId
  const helperTextId = helperText !== undefined ? `${id}-helper-text` : undefined
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
  const inputAriaInvalid =
    inputSlotProps?.['aria-invalid'] ?? (error ? true : undefined)
  const inputAriaDescribedBy = [inputSlotProps?.['aria-describedby'], helperTextId]
    .filter(Boolean)
    .join(' ') || undefined

  if (isControlled && normalizedValue !== localValue) {
    setLocalValue(normalizedValue)
  }

  const handleValueChange = React.useCallback<BaseNumberFieldValueChange>(
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
      data-slot="number-input-container"
      sx={[
        {
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        },
        ...toStyleArray(containerSx),
      ]}
    >
      <Box
        data-slot="number-input-row"
        sx={[
          {
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          },
          ...toStyleArray(inputRowSx),
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
            <Box
              {...props}
              data-error={error ? '' : undefined}
              data-size={size}
              data-slot="number-input-root"
              sx={[
                {
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0,
                },
                ...(state.disabled
                  ? [
                      {
                        opacity: 0.65,
                      } satisfies StyleItem,
                    ]
                  : []),
                ...toStyleArray(formControlSx),
              ]}
            >
              {props.children}
            </Box>
          )}
        >
          {hasLabel && (
            <Box
              component="label"
              data-slot="number-input-label"
              {...({ htmlFor: id } as { htmlFor: string })}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                width: 'fit-content',
                maxWidth: '100%',
                px: '1rem',
                minHeight: '1.5rem',
                mb: '0.2rem',
                fontSize: '0.625rem',
                fontWeight: 400,
                lineHeight: '0.8125rem',
                letterSpacing: '0.11em',
                color: error ? '#B3261E' : '#111111',
                '[data-slot="number-input-root"]:focus-within &': {
                  color: error ? '#B3261E' : 'secondary.dark',
                },
              }}
            >
              {label}
              {rootProps.required && (
                <Box
                  component="span"
                  aria-hidden="true"
                  sx={{ color: '#B3261E' }}
                >
                  *
                </Box>
              )}
            </Box>
          )}
          <BaseNumberField.Group
            render={(props, state) => (
              <Box
                {...props}
                data-error={error ? '' : undefined}
                data-size={size}
                data-slot="number-input-control"
                sx={[
                  {
                    width: 'fit-content',
                    minWidth: 0,
                    height: inputHeight,
                    minHeight: inputHeight,
                    display: 'flex',
                    alignItems: 'stretch',
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: error ? '#B3261E' : '#D6D6D6',
                    borderRadius: SHARED_CONTROL_BORDER_RADIUS,
                    backgroundColor: state.disabled ? '#F2F2F2' : '#FFFFFF',
                    boxShadow: state.disabled
                      ? 'none'
                      : 'inset 0px 0.5px 1px 0px #D9D9D9',
                    transition:
                      'border-color 120ms ease, box-shadow 120ms ease, background-color 120ms ease',
                    '&:focus-within': {
                      borderColor: error ? '#B3261E' : 'secondary.dark',
                    },
                  },
                  ...toStyleArray(inputSx),
                ]}
              >
                {props.children}
              </Box>
            )}
          >
            <BaseNumberField.Input
              {...inputSlotProps}
              id={id}
              aria-describedby={inputAriaDescribedBy}
              aria-invalid={inputAriaInvalid}
              render={(props) => (
                <Box
                  {...props}
                  component="input"
                  data-slot="number-input-input"
                  sx={{
                    width: '100%',
                    minWidth: 0,
                    flex: 1,
                    boxSizing: 'border-box',
                    px: '1rem',
                    py: 0,
                    border: 0,
                    outline: 0,
                    appearance: 'none',
                    backgroundColor: 'transparent',
                    color: '#111111',
                    font: 'inherit',
                    fontSize: '0.6875rem',
                    fontWeight: 400,
                    lineHeight: 'normal',
                    letterSpacing: '0.04em',
                    [disabledSelector]: {
                      color: 'text.disabled',
                      cursor: 'default',
                    },
                  }}
                />
              )}
            />
            <Box
              data-slot="number-input-adornment"
              sx={[
                {
                  width: spinButtonWidth,
                  minWidth: spinButtonWidth,
                  display: 'flex',
                  flexDirection: 'column',
                  alignSelf: 'stretch',
                  borderLeft: '1px solid',
                  borderColor: 'divider',
                  color: '#111111',
                },
                ...toStyleArray(adornmentSx),
              ]}
            >
              <BaseNumberField.Increment
                aria-label={t('components.number_input.increase')}
                render={(props) => (
                  <Box
                    {...props}
                    component="button"
                    data-slot="number-input-increment"
                    sx={{
                      width: '100%',
                      minWidth: '100%',
                      height: spinButtonHeight,
                      minHeight: spinButtonHeight,
                      m: 0,
                      p: 0,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 0,
                      borderRadius: 0,
                      appearance: 'none',
                      backgroundColor: 'transparent',
                      color: 'inherit',
                      cursor: 'pointer',
                      lineHeight: 0,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                      '&:focus-visible': {
                        outline: '2px solid',
                        outlineColor: 'secondary.dark',
                        outlineOffset: -2,
                      },
                      [disabledSelector]: {
                        color: 'text.disabled',
                        cursor: 'default',
                        pointerEvents: 'none',
                      },
                    }}
                  >
                    <ArrowUp aria-hidden="true" sx={arrowIconSx(size)} />
                  </Box>
                )}
              />
              <BaseNumberField.Decrement
                aria-label={t('components.number_input.decrease')}
                render={(props) => (
                  <Box
                    {...props}
                    component="button"
                    data-slot="number-input-decrement"
                    sx={{
                      width: '100%',
                      minWidth: '100%',
                      height: spinButtonHeight,
                      minHeight: spinButtonHeight,
                      m: 0,
                      p: 0,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 0,
                      borderTop: '1px solid',
                      borderTopColor: 'divider',
                      borderRadius: 0,
                      appearance: 'none',
                      backgroundColor: 'transparent',
                      color: 'inherit',
                      cursor: 'pointer',
                      lineHeight: 0,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                      '&:focus-visible': {
                        outline: '2px solid',
                        outlineColor: 'secondary.dark',
                        outlineOffset: -2,
                      },
                      [disabledSelector]: {
                        color: 'text.disabled',
                        cursor: 'default',
                        pointerEvents: 'none',
                      },
                    }}
                  >
                    <ArrowDown aria-hidden="true" sx={arrowIconSx(size)} />
                  </Box>
                )}
              />
            </Box>
          </BaseNumberField.Group>
          {helperText !== undefined && (
            <Box
              component="p"
              data-slot="number-input-helper"
              id={helperTextId}
              sx={[
                {
                  m: 0,
                  mt: '0.25rem',
                  minHeight: helperText ? undefined : 0,
                  fontSize: '0.6875rem',
                  lineHeight: 1.3,
                  letterSpacing: '0.04em',
                  color: error ? '#B3261E' : 'text.secondary',
                },
                ...toStyleArray(helperTextSx),
              ]}
            >
              {helperText}
            </Box>
          )}
        </BaseNumberField.Root>
      </Box>
    </Box>
  )
}
