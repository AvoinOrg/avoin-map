import React, { useState, useEffect } from 'react' // Import useEffect
import {
  Popover,
  Box,
  Typography,
  SxProps,
  Theme,
  PopoverProps,
  BoxProps,
} from '@mui/material'
import { HexColorPicker } from 'react-colorful'

// Props interface remains the same
interface ColorPickerWithPopoverProps {
  color: string
  onChange: (newColor: string) => void
  labelText?: string
  ariaLabel?: string
  sx?: SxProps<Theme>
  colorBoxSx?: SxProps<Theme>
  labelSx?: SxProps<Theme>
  popoverSx?: SxProps<Theme>
  pickerContainerSx?: SxProps<Theme>
  popoverProps?: Omit<
    PopoverProps,
    'open' | 'anchorEl' | 'onClose' | 'sx' | 'children'
  >
  colorBoxProps?: Omit<BoxProps, 'onClick' | 'sx' | 'aria-describedby'>
}

const ColorPickerWithPopover = ({
  color, // The final color value from the parent
  onChange, // The callback to update the parent's state
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
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  // Internal state to hold the color while the popover is open
  const [internalColor, setInternalColor] = useState<string>(color)

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    // Reset internal color to the current parent color when opening
    setInternalColor(color)
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
    // Only call the parent's onChange when closing, if the color actually changed
    if (internalColor !== color) {
      onChange(internalColor)
    }
  }

  // Effect to update internal color if the external color prop changes while popover is closed
  useEffect(() => {
    if (!anchorEl) {
      setInternalColor(color)
    }
  }, [color, anchorEl])

  const open = Boolean(anchorEl)
  const id = open ? 'color-picker-popover' : undefined

  return (
    <>
      {/* Root container - unchanged */}
      <Box
        component="button"
        type="button"
        aria-label={ariaLabel ?? labelText ?? 'Open color picker'}
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
          },
          ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
        ]}
        onClick={handleOpen}
        aria-describedby={id}
      >
        {/* Color Box Trigger - uses the final 'color' prop */}
        <Box
          sx={[
            {
              width: 24,
              height: 24,
              backgroundColor: color, // Display the final color
              border: '2.4px solid rgb(0, 0, 0)',
              borderRadius: '2px',
            },
            ...(Array.isArray(colorBoxSx)
              ? colorBoxSx
              : colorBoxSx
              ? [colorBoxSx]
              : []),
          ]}
          {...colorBoxProps}
        />
        {/* Label Text - unchanged */}
        {labelText && (
          <Typography
            variant="body2"
            sx={[
              { userSelect: 'none', color: 'neutral.darker' },
              ...(Array.isArray(labelSx) ? labelSx : labelSx ? [labelSx] : []),
            ]}
          >
            {labelText}
          </Typography>
        )}
      </Box>

      {/* Popover */}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose} // handleClose now triggers the final onChange
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        sx={[
          { '& .MuiPaper-root': { padding: '14px' } },
          ...(Array.isArray(popoverSx)
            ? popoverSx
            : popoverSx
            ? [popoverSx]
            : []),
        ]}
        {...popoverProps}
      >
        <Box
          sx={[
            ...(Array.isArray(pickerContainerSx)
              ? pickerContainerSx
              : pickerContainerSx
              ? [pickerContainerSx]
              : []),
          ]}
        >
          {/* HexColorPicker now updates the internal state */}
          <HexColorPicker
            style={{ width: '200px' }}
            color={internalColor} // Picker controlled by internal state
            onChange={setInternalColor} // Update internal state directly
          />
        </Box>
      </Popover>
    </>
  )
}

export default ColorPickerWithPopover
