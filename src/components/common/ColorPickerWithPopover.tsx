import React, { useEffect, useId, useRef, useState } from 'react'
import { Popover } from '@base-ui/react/popover'
import { HexColorPicker } from 'react-colorful'

import {
  Box,
  type AppSxProps,
  toSxArray,
} from '#/common/style/theme/system'

type AppSxItem = Exclude<NonNullable<AppSxProps>, readonly unknown[]>
type DataAttributes = {
  [key: `data-${string}`]: string | number | boolean | undefined
}
type ColorBoxProps = Omit<
  React.ComponentPropsWithoutRef<'span'>,
  'children' | 'onClick' | 'style' | 'aria-describedby'
> &
  DataAttributes
type HexColorPickerComponent = React.ComponentType<{
  style?: React.CSSProperties
  color: string
  onChange: (nextColor: string) => void
}>

const toComponentSxArray = (sx?: AppSxProps) =>
  toSxArray(sx) as AppSxItem[]
const AppHexColorPicker =
  HexColorPicker as unknown as HexColorPickerComponent

type PopoverSlotProps = {
  rootProps?: Omit<
    React.ComponentPropsWithoutRef<typeof Popover.Root>,
    | 'open'
    | 'onOpenChange'
    | 'children'
    | 'defaultOpen'
    | 'triggerId'
    | 'defaultTriggerId'
  > & {
    defaultOpen?: boolean
  }
  positionerProps?: Omit<
    React.ComponentPropsWithoutRef<typeof Popover.Positioner>,
    'children'
  >
  popupProps?: Omit<
    React.ComponentPropsWithoutRef<typeof Popover.Popup>,
    'children' | 'id' | 'render'
  >
}

interface ColorPickerWithPopoverProps {
  color: string
  onChange: (newColor: string) => void
  labelText?: string
  ariaLabel?: string
  sx?: AppSxProps
  colorBoxSx?: AppSxProps
  labelSx?: AppSxProps
  popoverSx?: AppSxProps
  pickerContainerSx?: AppSxProps
  popoverProps?: PopoverSlotProps
  colorBoxProps?: ColorBoxProps
}

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
  const {
    defaultOpen = false,
    ...rootProps
  } = popoverProps?.rootProps ?? {}
  const [open, setOpen] = useState(defaultOpen)
  const [internalColor, setInternalColor] = useState(color)
  const draftColorRef = useRef(color)
  const generatedId = useId()
  const triggerId = `color-picker-trigger-${generatedId}`
  const popupId = `color-picker-popover-${generatedId}`
  const activePopupId = open ? popupId : undefined

  const handlePickerChange = (nextColor: string) => {
    draftColorRef.current = nextColor
    setInternalColor(nextColor)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      draftColorRef.current = color
      setInternalColor(color)
      setOpen(true)
      return
    }

    setOpen(false)

    if (draftColorRef.current !== color) {
      onChange(draftColorRef.current)
    }
  }

  useEffect(() => {
    if (!open) {
      draftColorRef.current = color
    }
  }, [color, open])

  return (
    <Popover.Root
      open={open}
      onOpenChange={handleOpenChange}
      triggerId={triggerId}
      {...rootProps}
    >
      <Popover.Trigger
        id={triggerId}
        type="button"
        aria-label={ariaLabel ?? labelText ?? 'Open color picker'}
        aria-describedby={activePopupId}
        render={
          <Box
            component="button"
            sx={[
              {
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
                font: 'inherit',
              },
              ...toComponentSxArray(sx),
            ]}
          />
        }
      >
        <Box
          component="span"
          sx={[
            {
              width: 24,
              height: 24,
              backgroundColor: color,
              border: '2.4px solid rgb(0, 0, 0)',
              borderRadius: '2px',
              flex: '0 0 auto',
            },
            ...toComponentSxArray(colorBoxSx),
          ]}
          {...colorBoxProps}
        />
        {labelText && (
          <Box
            component="span"
            sx={[
              {
                userSelect: 'none',
                color: 'neutral.darker',
                fontSize: '0.875rem',
                lineHeight: 1.43,
              },
              ...toComponentSxArray(labelSx),
            ]}
          >
            {labelText}
          </Box>
        )}
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner
          side="bottom"
          align="start"
          sideOffset={0}
          {...popoverProps?.positionerProps}
        >
          <Popover.Popup
            id={popupId}
            render={
              <Box
                sx={[
                  {
                    p: '14px',
                    backgroundColor: '#ffffff',
                    borderRadius: 1,
                    boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.2)',
                    outline: 'none',
                    zIndex: 1300,
                  },
                  ...toComponentSxArray(popoverSx),
                ]}
              />
            }
            {...popoverProps?.popupProps}
          >
            <Box sx={[...toComponentSxArray(pickerContainerSx)]}>
              <AppHexColorPicker
                style={{ width: '200px' }}
                color={internalColor}
                onChange={handlePickerChange}
              />
            </Box>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}

export default ColorPickerWithPopover
