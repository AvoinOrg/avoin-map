import * as React from 'react'
import { Switch as MuiSwitch, SwitchProps, Theme } from '@mui/material'

const Switch = ({ sx, ...switchProps }: SwitchProps) => {
  return (
    <MuiSwitch
      focusVisibleClassName=".Mui-focusVisible"
      disableRipple
      {...switchProps}
      sx={[
        (theme: Theme) => ({
          width: 44,
          height: 24,
          p: 0,
          '& .MuiSwitch-switchBase': {
            p: 0,
            m: 4,
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
            borderRadius: 24 / 2,
            backgroundColor: theme.palette.neutral.main,
            opacity: 1,
            transition: theme.transitions.create(['background-color'], {
              duration: 250,
            }),
          },
        }),
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    />
  )
}

export default Switch
