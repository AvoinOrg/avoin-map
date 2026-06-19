'use client'

import * as React from 'react'

import { AppSxProps, Box, toSxArray } from '#/common/style/theme'
import type { SwitchProps } from '#/components/common/Switch'

import Switch from '#/components/common/Switch'

type SwitchWithLabelProps = Omit<SwitchProps, 'sx'> & {
  children?: React.ReactNode
  ariaLabel?: string
  sx?: AppSxProps
  controlSx?: AppSxProps
  labelSx?: AppSxProps
  required?: boolean
}

const SwitchWithLabel = ({
  children,
  ariaLabel,
  sx,
  controlSx,
  labelSx,
  disabled,
  required = false,
  ...rest
}: SwitchWithLabelProps) => {
  const { inputProps: switchInputProps, ...switchRest } = rest
  const resolvedAriaLabel =
    switchInputProps?.['aria-label'] ??
    ariaLabel ??
    (typeof children === 'string' || typeof children === 'number'
      ? String(children)
      : undefined)

  return (
    <Box
      component="label"
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
        ...toSxArray(sx),
      ]}
    >
      <Switch
        {...switchRest}
        sx={controlSx}
        disabled={disabled}
        required={required}
        inputProps={{
          ...switchInputProps,
          'aria-label': resolvedAriaLabel,
          required,
          disabled,
          role: switchInputProps?.role ?? 'switch',
        }}
      />
      <Box
        component="span"
        sx={[
          {
            typography: 'body2',
            color: (theme) =>
              disabled
                ? theme.palette.text.disabled
                : (theme.palette.neutral.darker ??
                    theme.palette.text.primary),
            userSelect: 'none',
            ml: 2,
            opacity: disabled ? 0.8 : 1,
          },
          ...toSxArray(labelSx),
        ]}
      >
        {children}
        {required && <Box component="span">{' *'}</Box>}
      </Box>
    </Box>
  )
}

export default SwitchWithLabel
