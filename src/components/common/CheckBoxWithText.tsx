import * as React from 'react'
import {
  Checkbox,
  Typography,
  SxProps,
  Theme,
  FormControlLabel, // Import FormControlLabel
} from '@mui/material'

import CheckboxIcon from '#/components/icons/Checkbox'
import CheckboxCheckedIcon from '#/components/icons/CheckboxChecked'

interface CheckBoxWithTextProps {
  checked: boolean
  onChange: (
    event: React.SyntheticEvent<Element, Event>,
    checked: boolean
  ) => void
  children?: React.ReactNode
  sx?: SxProps<Theme> // For the entire FormControlLabel wrapper
  checkboxSx?: SxProps<Theme> // Specific sx for the Checkbox component itself
  iconSx?: SxProps<Theme>
  iconCheckedSx?: SxProps<Theme>
  textSx?: SxProps<Theme>
  disabled?: boolean
  required?: boolean
  // Allow any other props to be passed to the underlying MUI Checkbox
  [key: string]: any
}

const CheckBoxWithText = ({
  checked,
  onChange,
  children,
  sx,
  checkboxSx,
  iconSx,
  iconCheckedSx,
  textSx,
  disabled = false,
  required = false,
  ...rest // Captures other props for the MUI Checkbox (e.g., name, value)
}: CheckBoxWithTextProps) => {
  return (
    <FormControlLabel
      sx={[
        {
          m: 0,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          '&:hover': {
            cursor: disabled ? 'not-allowed' : 'pointer',
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      control={
        <Checkbox
          icon={
            <CheckboxIcon
              sx={[
                {
                  backgroundColor: 'neutral.light', // Default icon style
                },
                ...(Array.isArray(iconSx) ? iconSx : [iconSx]), // User-provided icon styles
              ]}
            />
          }
          checkedIcon={
            <CheckboxCheckedIcon
              sx={[
                {
                  backgroundColor: '#97C68B',
                },
                ...(Array.isArray(iconCheckedSx) // User-provided checked icon styles
                  ? iconCheckedSx
                  : [iconCheckedSx]),
              ]}
            />
          }
          sx={[
            {
              p: 0, // Maintain zero padding from original Checkbox style
            },
            ...(Array.isArray(checkboxSx) ? checkboxSx : [checkboxSx]), // User-provided Checkbox styles
          ]}
          {...rest} // Spread other props like 'name', 'value', 'inputProps'
        />
      }
      label={
        <Typography
          variant="body2"
          sx={[
            {
              color: 'neutral.darker',
              userSelect: 'none',
              ml: 2,
            },
            ...(Array.isArray(textSx) ? textSx : [textSx]),
          ]}
        >
          {children}
          {required && ' *'}
        </Typography>
      }
      checked={checked}
      onChange={onChange}
      disabled={disabled}
    />
  )
}

export default CheckBoxWithText
