import * as React from 'react'
import { SwitchProps, SxProps, Theme } from '@mui/material'

import SwitchWithLabel from '#/components/common/SwitchWithLabel'

type SquishedSwitchWithLabelProps = Omit<SwitchProps, 'sx'> & {
  children?: React.ReactNode
  ariaLabel?: string
  checkedTrackColor?: string
  sx?: SxProps<Theme>
  controlSx?: SxProps<Theme>
  labelSx?: SxProps<Theme>
}

const SquishedSwitchWithLabel = ({
  children,
  ariaLabel,
  checkedTrackColor,
  sx,
  controlSx,
  labelSx,
  inputProps,
  ...rest
}: SquishedSwitchWithLabelProps) => {
  return (
    <SwitchWithLabel
      {...rest}
      ariaLabel={ariaLabel}
      inputProps={{
        ...inputProps,
        role: 'switch',
      }}
      sx={[
        {
          m: 0,
          width: '100%',
          minHeight: '0.875rem',
          display: 'flex',
          alignItems: 'center',
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
      controlSx={[
        (theme: Theme) => ({
          width: '2.125rem',
          height: '0.875rem',
          padding: 0,
          flexShrink: 0,
          '& .MuiSwitch-switchBase': {
            padding: 0,
            margin: '0.25rem',
            transitionDuration: '250ms',
            '&.Mui-checked': {
              transform: 'translateX(20px)',
              color: theme.palette.common.white,
              '& + .MuiSwitch-track': {
                backgroundColor:
                  checkedTrackColor ?? theme.palette.secondary.dark,
                borderRadius: '999px',
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
            width: '0.375rem',
            height: '0.375rem',
            borderRadius: '50%',
            backgroundColor: theme.palette.common.white,
          },
          '& .MuiSwitch-track': {
            borderRadius: '999px',
            backgroundColor: theme.palette.neutral.main,
            opacity: 1,
            boxShadow: '0px 1px 1px rgba(189, 189, 189, 0.25)',
            transition: theme.transitions.create(['background-color'], {
              duration: 250,
            }),
          },
        }),
        ...(Array.isArray(controlSx)
          ? controlSx
          : controlSx
            ? [controlSx]
            : []),
      ]}
      labelSx={[
        {
          ml: '0.625rem',
        },
        ...(Array.isArray(labelSx) ? labelSx : labelSx ? [labelSx] : []),
      ]}
    >
      {children}
    </SwitchWithLabel>
  )
}

export default SquishedSwitchWithLabel
