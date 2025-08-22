import React from 'react'
import {
  CircularProgress,
  CircularProgressProps,
  SxProps,
  Theme,
} from '@mui/material'

interface LoadingSpinnerProps extends Omit<CircularProgressProps, 'ref'> {
  sx?: SxProps<Theme>
}

export const LoadingSpinner = ({
  sx,
  size = "4rem",
  color = 'primary',
  variant = 'indeterminate',
  thickness = 3.6,
  disableShrink = false,
  value = 0,
  ...rest
}: LoadingSpinnerProps) => {
  return (
    <CircularProgress
      size={size}
      color={color}
      variant={variant}
      thickness={thickness}
      disableShrink={disableShrink}
      value={value}
      sx={[...(Array.isArray(sx) ? sx : [sx])]}
      {...rest}
    />
  )
}
