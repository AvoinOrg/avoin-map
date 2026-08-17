import * as React from 'react'

import {
  AppSxProps,
  toSxArray,
} from '#/common/style/theme'
import type { SwitchProps } from '#/components/common/Switch'

import SwitchWithLabel from '#/components/common/SwitchWithLabel'

const COMPACT_SWITCH_WIDTH_REM = 2.125
const COMPACT_SWITCH_HEIGHT_REM = 0.875
const COMPACT_SWITCH_BASE_MARGIN_REM = 0.25
const COMPACT_SWITCH_THUMB_SIZE_REM = 0.375
const COMPACT_SWITCH_TRANSLATE_REM =
  COMPACT_SWITCH_WIDTH_REM -
  COMPACT_SWITCH_THUMB_SIZE_REM -
  COMPACT_SWITCH_BASE_MARGIN_REM * 2

type SquishedSwitchWithLabelProps = Omit<SwitchProps, 'sx'> & {
  children?: React.ReactNode
  ariaLabel?: string
  checkedTrackColor?: string
  sx?: AppSxProps
  controlSx?: AppSxProps
  labelSx?: AppSxProps
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
        ...toSxArray(sx),
      ]}
      controlSx={[
        (theme) => ({
          width: `${COMPACT_SWITCH_WIDTH_REM}rem`,
          height: `${COMPACT_SWITCH_HEIGHT_REM}rem`,
          padding: 0,
          flexShrink: 0,
          '& .MuiSwitch-switchBase': {
            padding: 0,
            margin: `${COMPACT_SWITCH_BASE_MARGIN_REM}rem`,
            width: `${COMPACT_SWITCH_THUMB_SIZE_REM}rem`,
            height: `${COMPACT_SWITCH_THUMB_SIZE_REM}rem`,
            transitionDuration: '250ms',
            '&.Mui-checked': {
              transform: `translateX(${COMPACT_SWITCH_TRANSLATE_REM}rem)`,
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
            width: `${COMPACT_SWITCH_THUMB_SIZE_REM}rem`,
            height: `${COMPACT_SWITCH_THUMB_SIZE_REM}rem`,
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
        ...toSxArray(controlSx),
      ]}
      labelSx={[
        {
          ml: '0.625rem',
        },
        ...toSxArray(labelSx),
      ]}
    >
      {children}
    </SwitchWithLabel>
  )
}

export default SquishedSwitchWithLabel
