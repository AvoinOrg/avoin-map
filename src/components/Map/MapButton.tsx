import { Button } from '@mui/material'
import React from 'react'

export const MapButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>((props, ref) => {
  const { sx, ...otherProps } = props
  return (
    <Button
      {...otherProps}
      ref={ref}
      sx={[
        (theme) => ({
          opacity: 0.9,
          color: theme.palette.neutral.darker,
          backgroundColor: theme.palette.neutral.light,
          border: 'none',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: theme.palette.neutral.main,
            border: 'none',
          },
          '&.Mui-disabled': {
            border: 'none',
            color: theme.palette.neutral.main, // you can adjust the color if you want
          },
          width: '40px',
          height: '40px',
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  )
})

MapButton.displayName = 'MapButton'
