import * as React from 'react'
import {
  FormControlLabel,
  SwitchProps,
  Typography,
  SxProps,
  Theme,
} from '@mui/material'

import Switch from '#/components/common/Switch'

type SwitchWithLabelProps = Omit<SwitchProps, 'sx'> & {
  children?: React.ReactNode
  sx?: SxProps<Theme> // For the entire FormControlLabel wrapper
  controlSx?: SxProps<Theme>
  labelSx?: SxProps<Theme>
  required?: boolean
}

const SwitchWithLabel = ({
  children,
  sx,
  controlSx,
  labelSx,
  disabled,
  required = false,
  ...rest
}: SwitchWithLabelProps) => {
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
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
      control={
        <Switch sx={controlSx} disabled={disabled} {...rest} />
      }
      label={
        <Typography
          variant="body2"
          sx={[
            {
              color: (theme: Theme) =>
                disabled
                  ? theme.palette.text.disabled
                  : (theme.palette.neutral.darker ??
                    theme.palette.text.primary),
              userSelect: 'none',
              ml: 2,
              opacity: disabled ? 0.8 : 1,
            },
            ...(Array.isArray(labelSx) ? labelSx : labelSx ? [labelSx] : []),
          ]}
        >
          {children}
          {required && ' *'}
        </Typography>
      }
      disabled={disabled}
    />
  )
}

export default SwitchWithLabel
