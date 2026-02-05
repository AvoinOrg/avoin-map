import * as React from 'react'
import {
  FormControlLabel,
  Switch,
  SwitchProps,
  Typography,
  SxProps,
  Theme,
} from '@mui/material'
import { styled } from '@mui/material/styles'

interface SwitchWithLabelProps {
  checked: boolean
  onChange: (
    event: React.SyntheticEvent<Element, Event>,
    checked: boolean
  ) => void
  children?: React.ReactNode
  sx?: SxProps<Theme> // For the entire FormControlLabel wrapper
  switchSx?: SxProps<Theme> // Specific sx for the Switch component itself
  checkboxSx?: SxProps<Theme> // Backwards-compatible alias for switchSx
  textSx?: SxProps<Theme>
  disabled?: boolean
  required?: boolean
  // Allow any other props to be passed to the underlying MUI Switch
  [key: string]: any
}

const CustomSwitch = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 44,
  height: 24,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 4,
    transitionDuration: '250ms',
    '&.Mui-checked': {
      transform: 'translateX(16px)',
      color: theme.palette.common.white,
      '& + .MuiSwitch-track': {
        backgroundColor: theme.palette.secondary.dark,
        opacity: 1,
        border: 0,
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.5,
      },
    },
    '&.Mui-disabled .MuiSwitch-thumb': {
      backgroundColor: theme.palette.action.disabled,
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: 0.3,
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 20,
    height: 16,
    borderRadius: 8,
  },
  '& .MuiSwitch-track': {
    position: 'relative',
    borderRadius: 24 / 2,
    backgroundColor: theme.palette.neutral.main,
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 250,
    }),
  },
}))

const SwitchWithLabel = ({
  checked,
  onChange,
  children,
  sx,
  switchSx,
  checkboxSx,
  textSx,
  disabled = false,
  required = false,
  ...rest
}: SwitchWithLabelProps) => {
  const controlSx = switchSx ?? checkboxSx

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
        <CustomSwitch
          sx={[
            ...(Array.isArray(controlSx)
              ? controlSx
              : controlSx
                ? [controlSx]
                : []),
          ]}
          disabled={disabled}
          {...rest}
        />
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
            ...(Array.isArray(textSx) ? textSx : textSx ? [textSx] : []),
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

export default SwitchWithLabel
