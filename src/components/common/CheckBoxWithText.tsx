import * as React from 'react'
import { Box, Checkbox, Typography, SxProps, Theme } from '@mui/material'

import CheckboxIcon from '#/components/icons/Checkbox'
import CheckboxCheckedIcon from '#/components/icons/CheckboxChecked'

interface CheckBoxWithTextProps {
  checked: boolean
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => void
  children?: React.ReactNode
  sx?: SxProps<Theme>
  iconSx?: SxProps<Theme>
  iconCheckedSx?: SxProps<Theme>
  textSx?: SxProps<Theme>
  disabled?: boolean
  required?: boolean
}

const CheckBoxWithText = ({
  checked,
  onChange,
  children,
  sx,
  iconSx,
  iconCheckedSx,
  textSx,
  disabled = false,
  required = false,
  ...checkboxProps
}: CheckBoxWithTextProps) => {
  return (
    <Box
      sx={[
        {
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          mb: 1,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Checkbox
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        required={required}
        icon={
          <CheckboxIcon
            sx={[
              {
                backgroundColor: 'neutral.light',
              },
              ...(Array.isArray(iconSx) ? iconSx : [iconSx]),
            ]}
          />
        }
        checkedIcon={
          <CheckboxCheckedIcon
            sx={[
              {
                backgroundColor: '#97C68B',
              },
              ...(Array.isArray(iconCheckedSx)
                ? iconCheckedSx
                : [iconCheckedSx]),
            ]}
          />
        }
        sx={[
          {
            p: 0,
            mr: '1rem',
            color: 'white',
          },
        ]}
        {...checkboxProps}
      />
      <Typography
        variant="body2"
        sx={[
          {
            color: 'neutral.darker',
            userSelect: 'none',
          },
          ...(Array.isArray(textSx) ? textSx : [textSx]),
        ]}
      >
        {children}
        {required && ' *'}
      </Typography>
    </Box>
  )
}

export default CheckBoxWithText
