import React, { useState } from 'react'
import { Popover as BasePopover } from '@base-ui/react/popover'
import { HexColorPicker } from 'react-colorful'
import { css, cx } from 'styled-system/css'

import type { PandaStyleProp } from '#/common/style/panda'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'

const HexColorPickerComponent = HexColorPicker as React.ComponentType<{
  color: string
  onChange: (newColor: string) => void
  style?: React.CSSProperties
}>

type ColorBoxProps = Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  'onClick' | 'style' | 'aria-describedby'
>

type BasePopoverProps = Pick<
  React.ComponentPropsWithoutRef<typeof BasePopover.Root>,
  'modal' | 'defaultOpen'
>

interface ColorPickerWithPopoverProps {
  color: string
  onChange: (newColor: string) => void
  labelText?: string
  ariaLabel?: string
  sx?: PandaStyleProp
  colorBoxSx?: PandaStyleProp
  labelSx?: PandaStyleProp
  popoverSx?: PandaStyleProp
  pickerContainerSx?: PandaStyleProp
  popoverProps?: BasePopoverProps
  colorBoxProps?: ColorBoxProps
}

const triggerClass = css({
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  p: 0,
  m: 0,
  border: 'none',
  background: 'none',
  color: 'inherit',
  textAlign: 'inherit',
  cursor: 'pointer',
  '&:focus-visible': {
    outline: '2px solid var(--colors-secondary-dark)',
    outlineOffset: '2px',
  },
})

const swatchClass = css({
  width: 24,
  height: 24,
  border: '2.4px solid rgb(0, 0, 0)',
  borderRadius: '2px',
  flexShrink: 0,
})

const labelClass = css({
  userSelect: 'none',
  color: 'neutral.darker',
  fontFamily: 'var(--font-arimo)',
  fontSize: '0.875rem',
  fontWeight: 400,
  lineHeight: 'normal',
  letterSpacing: '0.0875rem',
})

const positionerClass = css({
  zIndex: 'modal',
})

const popupClass = css({
  padding: '14px',
  borderRadius: '0.625rem',
  backgroundColor: '#FFFFFF',
  boxShadow: '0px 8px 24px rgba(17, 17, 17, 0.12)',
  outline: 'none',
})

const ColorPickerWithPopover = ({
  color,
  onChange,
  labelText,
  ariaLabel,
  sx,
  colorBoxSx,
  labelSx,
  popoverSx,
  pickerContainerSx,
  popoverProps,
  colorBoxProps,
}: ColorPickerWithPopoverProps) => {
  const [open, setOpen] = useState(Boolean(popoverProps?.defaultOpen))
  const [internalColor, setInternalColor] = useState<string>(color)
  const generatedId = React.useId()
  const id = open ? `${generatedId}-color-picker-popover` : undefined

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setInternalColor(color)
      setOpen(true)
      return
    }

    setOpen(false)
    if (internalColor !== color) {
      onChange(internalColor)
    }
  }

  return (
    <BasePopover.Root
      {...popoverProps}
      open={open}
      onOpenChange={handleOpenChange}
    >
      <BasePopover.Trigger
        type="button"
        aria-label={ariaLabel ?? labelText ?? 'Open color picker'}
        aria-describedby={id}
        className={cx(triggerClass, css(...pandaStylePropsToArray(sx)))}
        style={mergePandaStyleProps({ sx })}
      >
        <span
          className={cx(swatchClass, css(...pandaStylePropsToArray(colorBoxSx)))}
          style={{
            backgroundColor: color,
            ...mergePandaStyleProps({ sx: colorBoxSx }),
          }}
          {...colorBoxProps}
        />
        {labelText && (
          <span
            className={cx(labelClass, css(...pandaStylePropsToArray(labelSx)))}
            style={mergePandaStyleProps({ sx: labelSx })}
          >
            {labelText}
          </span>
        )}
      </BasePopover.Trigger>
      <BasePopover.Portal>
        <BasePopover.Positioner
          side="bottom"
          align="start"
          sideOffset={4}
          className={positionerClass}
        >
          <BasePopover.Popup
            id={id}
            className={cx(popupClass, css(...pandaStylePropsToArray(popoverSx)))}
            style={mergePandaStyleProps({ sx: popoverSx })}
          >
            <div
              className={css(...pandaStylePropsToArray(pickerContainerSx))}
              style={mergePandaStyleProps({ sx: pickerContainerSx })}
            >
              <HexColorPickerComponent
                style={{ width: '200px' }}
                color={internalColor}
                onChange={setInternalColor}
              />
            </div>
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  )
}

export default ColorPickerWithPopover
