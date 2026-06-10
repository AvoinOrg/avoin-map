import React from 'react'
import { NumberField as BaseNumberField } from '@base-ui/react/number-field'
import { useTranslate } from '@tolgee/react'
import { css, cx } from 'styled-system/css'

import { useLocaleFormatter } from '#/common/hooks/useLocaleFormatter'
import type { PandaStyleProp } from '#/common/style/panda'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'
import { ArrowDown, ArrowUp } from '#/components/icons'

type BaseNumberFieldRootProps = React.ComponentPropsWithoutRef<
  typeof BaseNumberField.Root
>

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
  containerSx?: PandaStyleProp
  formControlSx?: PandaStyleProp
  inputRowSx?: PandaStyleProp
  inputSx?: PandaStyleProp
  adornmentSx?: PandaStyleProp
  helperTextSx?: PandaStyleProp
  inputSlotProps?: React.ComponentPropsWithoutRef<'input'>
  minValue?: number
  maxValue?: number
  incrementStepValue?: number
}

const containerClass = css({
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
})

const inputRowClass = css({
  display: 'flex',
  alignItems: 'center',
  gap: 1,
})

const rootClass = css({
  minWidth: 0,
})

const labelClass = css({
  display: 'inline-block',
  mb: '0.25rem',
  px: 0.5,
  backgroundColor: 'background.main',
  color: '#111111',
  fontFamily: 'var(--font-arimo)',
  fontSize: '0.625rem',
  fontWeight: 400,
  lineHeight: '0.8125rem',
  letterSpacing: '0.11em',
})

const groupClass = css({
  display: 'flex',
  alignItems: 'stretch',
  width: '100%',
  minWidth: 0,
  height: '2rem',
  minHeight: '2rem',
  borderRadius: '999px',
  border: '0.5px solid #D6D6D6',
  overflow: 'hidden',
  backgroundColor: '#FFFFFF',
  boxShadow: 'inset 0px 0.5px 1px 0px #D9D9D9',
  '&:focus-within': {
    borderColor: 'secondary.dark',
  },
  '&[data-disabled]': {
    opacity: 0.7,
  },
})

const inputClass = css({
  boxSizing: 'border-box',
  flex: 1,
  minWidth: 0,
  width: '100%',
  border: 0,
  outline: 'none',
  backgroundColor: 'transparent',
  px: '1rem',
  py: 0,
  fontFamily: 'var(--font-arimo)',
  fontSize: '0.6875rem',
  fontWeight: 400,
  lineHeight: 'normal',
  letterSpacing: '0.04em',
  color: '#111111',
  '&:disabled': {
    color: 'text.disabled',
    cursor: 'not-allowed',
  },
})

const stepperClass = css({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'stretch',
  height: '100%',
  borderLeft: '1px solid',
  borderColor: 'divider',
})

const stepperButtonClass = css({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  p: 0,
  width: '1.75rem',
  minWidth: '1.75rem',
  height: '1rem',
  minHeight: '1rem',
  border: 0,
  backgroundColor: 'transparent',
  color: '#111111',
  cursor: 'pointer',
  lineHeight: 0,
  '&:hover': {
    backgroundColor: 'primary.lighter',
  },
  '&:disabled, &[data-disabled]': {
    cursor: 'not-allowed',
    color: 'text.disabled',
    opacity: 0.6,
  },
  '&:first-of-type': {
    borderTopRightRadius: '999px',
  },
  '&:last-of-type': {
    borderBottomRightRadius: '999px',
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
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Base UI keeps a local editing value for controlled number fields.
      setLocalValue(normalizedValue)
    }
  }, [isControlled, normalizedValue, localValue])

  const handleValueChange = React.useCallback<
    NonNullable<BaseNumberFieldRootProps['onValueChange']>
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
    <div
      className={cx(containerClass, css(...pandaStylePropsToArray(containerSx)))}
      style={mergePandaStyleProps({ styleProps: containerSx })}
    >
      <div
        className={cx(inputRowClass, css(...pandaStylePropsToArray(inputRowSx)))}
        style={mergePandaStyleProps({ styleProps: inputRowSx })}
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
          className={cx(rootClass, css(...pandaStylePropsToArray(formControlSx)))}
          style={mergePandaStyleProps({ styleProps: formControlSx })}
        >
          {label && (
            <label
              htmlFor={id}
              className={labelClass}
            >
              {label}
            </label>
          )}
          <BaseNumberField.Group
            data-size={size}
            data-error={error ? '' : undefined}
            className={cx(groupClass, css(...pandaStylePropsToArray(inputSx)))}
            style={mergePandaStyleProps({ styleProps: inputSx })}
          >
            <BaseNumberField.Input
              {...inputSlotProps}
              id={id}
              aria-invalid={error || undefined}
              className={inputClass}
            />
            <div
              className={cx(
                stepperClass,
                css(...pandaStylePropsToArray(adornmentSx))
              )}
              style={mergePandaStyleProps({ styleProps: adornmentSx })}
            >
              <BaseNumberField.Increment
                aria-label={t('components.number_input.increase')}
                className={stepperButtonClass}
              >
                <ArrowUp
                  styleProps={{
                    width: size === 'small' ? '0.75rem' : '0.875rem',
                    height: size === 'small' ? '0.75rem' : '0.875rem',
                  }}
                  aria-hidden="true"
                />
              </BaseNumberField.Increment>
              <BaseNumberField.Decrement
                aria-label={t('components.number_input.decrease')}
                className={stepperButtonClass}
              >
                <ArrowDown
                  styleProps={{
                    width: size === 'small' ? '0.75rem' : '0.875rem',
                    height: size === 'small' ? '0.75rem' : '0.875rem',
                  }}
                  aria-hidden="true"
                />
              </BaseNumberField.Decrement>
            </div>
          </BaseNumberField.Group>
          {helperText !== undefined && (
            <div
              data-error={error ? '' : undefined}
              className={cx(
                helperClass,
                css(...pandaStylePropsToArray(helperTextSx))
              )}
              style={mergePandaStyleProps({ styleProps: helperTextSx })}
            >
              {helperText}
            </div>
          )}
        </BaseNumberField.Root>
      </div>
    </div>
  )
}
