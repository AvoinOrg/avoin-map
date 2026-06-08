import * as React from 'react'
import { Switch as BaseSwitch } from '@base-ui/react/switch'
import { css, cx } from 'styled-system/css'

import type { PandaStyleProp } from '#/common/style/panda'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'
import {
  createCheckedChangeEvent,
  type FormCheckedChangeEvent,
} from './formControlEvents'

export type SwitchChangeEvent = ReturnType<typeof createCheckedChangeEvent>

export type SwitchProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseSwitch.Root>,
  'children' | 'className' | 'onCheckedChange' | 'onChange' | 'style'
> & {
  sx?: PandaStyleProp
  onChange?: (event: FormCheckedChangeEvent, checked: boolean) => void
  inputProps?: React.InputHTMLAttributes<HTMLInputElement> & {
    ref?: React.Ref<HTMLInputElement>
  }
  checkedTrackColor?: string
  thumbSize?: string
  thumbTranslateX?: string
  thumbMargin?: string
  style?: React.CSSProperties
}

const switchClass = css({
  '--switch-width': '44px',
  '--switch-height': '24px',
  '--switch-thumb-size': '20px',
  '--switch-thumb-margin': '2px',
  '--switch-thumb-translate-x': '20px',
  '--switch-track-color': 'var(--colors-neutral-main)',
  '--switch-track-checked-color': 'var(--colors-secondary-dark)',
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  width: 'var(--switch-width)',
  height: 'var(--switch-height)',
  p: 0,
  border: 0,
  borderRadius: '999px',
  backgroundColor: 'var(--switch-track-color)',
  boxSizing: 'border-box',
  cursor: 'pointer',
  flexShrink: 0,
  opacity: 1,
  transition: 'background-color 250ms ease',
  outline: 'none',
  '&[data-checked]': {
    backgroundColor: 'var(--switch-track-checked-color)',
  },
  '&[data-disabled]': {
    cursor: 'not-allowed',
    opacity: 0.3,
  },
  '&[data-disabled][data-checked]': {
    opacity: 0.5,
  },
  '&[data-focus-visible]': {
    outline: '2px solid var(--colors-secondary-dark)',
    outlineOffset: '2px',
  },
})

const thumbClass = css({
  position: 'absolute',
  left: 'var(--switch-thumb-margin)',
  top: 'var(--switch-thumb-margin)',
  width: 'var(--switch-thumb-size)',
  height: 'var(--switch-thumb-size)',
  borderRadius: '50%',
  backgroundColor: '#FFFFFF',
  boxSizing: 'border-box',
  transition: 'transform 250ms ease, background-color 250ms ease',
  '[data-checked] &': {
    transform: 'translateX(var(--switch-thumb-translate-x))',
  },
  '[data-disabled] &': {
    backgroundColor: 'var(--colors-action-disabled)',
  },
})

const Switch = ({
  sx,
  onChange,
  inputProps,
  checkedTrackColor,
  thumbSize,
  thumbTranslateX,
  thumbMargin,
  style,
  name,
  value,
  ...switchProps
}: SwitchProps) => {
  const handleCheckedChange = React.useCallback<
    NonNullable<
      React.ComponentPropsWithoutRef<typeof BaseSwitch.Root>['onCheckedChange']
    >
  >(
    (checked, eventDetails) => {
      const changeEvent = createCheckedChangeEvent({
        checked,
        name,
        value,
        eventDetails,
      })
      onChange?.(changeEvent, checked)
    },
    [name, onChange, value]
  )

  const cssVariables = {
    '--switch-track-checked-color': checkedTrackColor,
    '--switch-thumb-size': thumbSize,
    '--switch-thumb-translate-x': thumbTranslateX,
    '--switch-thumb-margin': thumbMargin,
  } as React.CSSProperties

  return (
    <BaseSwitch.Root
      {...switchProps}
      name={name}
      value={value}
      inputRef={inputProps?.ref}
      className={cx(switchClass, css(...pandaStylePropsToArray(sx)))}
      style={{
        ...cssVariables,
        ...mergePandaStyleProps({ sx, style }),
      }}
      onCheckedChange={handleCheckedChange}
    >
      <BaseSwitch.Thumb className={thumbClass} />
    </BaseSwitch.Root>
  )
}

export default Switch
