import * as React from 'react'
import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox'
import { css, cx } from 'styled-system/css'

import type { PandaStyleProp } from '#/common/style/panda'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'
import CheckboxIcon from '#/components/icons/Checkbox'
import CheckboxCheckedIcon from '#/components/icons/CheckboxChecked'
import {
  createCheckedChangeEvent,
  type FormCheckedChangeEvent,
} from './formControlEvents'

type CheckBoxWithLabelProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseCheckbox.Root>,
  'children' | 'className' | 'onCheckedChange' | 'onChange' | 'style'
> & {
  checked: boolean
  onChange: (
    event: FormCheckedChangeEvent,
    checked: boolean
  ) => void
  children?: React.ReactNode
  styleProps?: PandaStyleProp
  checkboxSx?: PandaStyleProp
  iconSx?: PandaStyleProp
  iconCheckedSx?: PandaStyleProp
  textSx?: PandaStyleProp
  inputProps?: React.InputHTMLAttributes<HTMLInputElement> & {
    ref?: React.Ref<HTMLInputElement>
  }
  style?: React.CSSProperties
}

const wrapperClass = css({
  m: 0,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  cursor: 'pointer',
  '&[data-disabled]': {
    cursor: 'not-allowed',
  },
})

const rootClass = css({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '1.5rem',
  height: '1.5rem',
  p: 0,
  border: 0,
  backgroundColor: 'transparent',
  color: 'neutral.darker',
  flexShrink: 0,
  outline: 'none',
  cursor: 'pointer',
  '&[data-disabled]': {
    cursor: 'not-allowed',
    color: 'text.disabled',
    opacity: 0.6,
  },
  '&[data-focus-visible]': {
    outline: '2px solid var(--colors-secondary-dark)',
    outlineOffset: '2px',
    borderRadius: '0.125rem',
  },
})

const indicatorClass = css({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  lineHeight: 0,
})

const textClass = css({
  color: 'neutral.darker',
  userSelect: 'none',
  ml: 2,
  opacity: 1,
  fontFamily: 'var(--font-arimo)',
  fontSize: '0.875rem',
  fontWeight: 400,
  lineHeight: 'normal',
  letterSpacing: '0.0875rem',
  '[data-disabled] &': {
    color: 'text.disabled',
    opacity: 0.8,
  },
})

const CheckBoxWithLabel = ({
  checked,
  onChange,
  children,
  styleProps,
  checkboxSx,
  iconSx,
  iconCheckedSx,
  textSx,
  disabled = false,
  required = false,
  inputProps,
  name,
  value,
  style,
  ...checkboxRest
}: CheckBoxWithLabelProps) => {
  const resolvedAriaLabel =
    inputProps?.['aria-label'] ??
    checkboxRest['aria-label'] ??
    (typeof children === 'string' || typeof children === 'number'
      ? String(children)
      : undefined)

  const handleCheckedChange = React.useCallback<
    NonNullable<
      React.ComponentPropsWithoutRef<
        typeof BaseCheckbox.Root
      >['onCheckedChange']
    >
  >(
    (nextChecked, eventDetails) => {
      const nextCheckedBoolean = Boolean(nextChecked)
      const changeEvent = createCheckedChangeEvent({
        checked: nextCheckedBoolean,
        name,
        value,
        eventDetails,
      })

      onChange(changeEvent, nextCheckedBoolean)
    },
    [name, onChange, value]
  )

  return (
    <label
      className={cx(wrapperClass, css(...pandaStylePropsToArray(styleProps)))}
      data-disabled={disabled ? '' : undefined}
      style={mergePandaStyleProps({ styleProps, style })}
    >
      <BaseCheckbox.Root
        {...checkboxRest}
        checked={checked}
        disabled={disabled}
        required={required}
        name={name}
        value={value}
        inputRef={inputProps?.ref}
        aria-label={resolvedAriaLabel}
        className={cx(rootClass, css(...pandaStylePropsToArray(checkboxSx)))}
        style={mergePandaStyleProps({ styleProps: checkboxSx })}
        onCheckedChange={handleCheckedChange}
      >
        <span
          className={indicatorClass}
          aria-hidden="true"
        >
          {checked ? (
            <CheckboxCheckedIcon
              styleProps={[
                {
                  backgroundColor: disabled ? 'action.disabledBackground' : '#97C68B',
                  color: disabled ? 'text.disabled' : 'neutral.darker',
                  opacity: disabled ? 0.6 : 1,
                },
                ...pandaStylePropsToArray(iconCheckedSx),
              ]}
            />
          ) : (
            <CheckboxIcon
              styleProps={[
                {
                  backgroundColor: 'transparent',
                  color: disabled ? 'text.disabled' : 'neutral.darker',
                  opacity: disabled ? 0.6 : 1,
                },
                ...pandaStylePropsToArray(iconSx),
              ]}
            />
          )}
        </span>
      </BaseCheckbox.Root>
      <span className={cx(textClass, css(...pandaStylePropsToArray(textSx)))} style={mergePandaStyleProps({ styleProps: textSx })}>
        {children}
        {required && ' *'}
      </span>
    </label>
  )
}

export default CheckBoxWithLabel
