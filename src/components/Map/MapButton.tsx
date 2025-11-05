import React from 'react'
import { Button, Tooltip, ButtonProps } from '@mui/material'

export const MAP_BUTTON_SIZE = 40

interface MapButtonProps extends ButtonProps {
  tooltip?: string
  isVertical?: boolean
}

export const MapButton = ({
  children,
  tooltip,
  isVertical,
  sx,
  className,
  style,
  ...props
}: MapButtonProps) => {
  const button = (
    <Button
      {...props}
      className={className}
      style={style}
      sx={{
        width: MAP_BUTTON_SIZE,
        height: MAP_BUTTON_SIZE,
        backgroundColor: 'neutral.light',
        color: 'text.primary',
        boxShadow: 'none',
        opacity: 0.9,
        '&:hover': {
          backgroundColor: 'neutral.main',
          opacity: 1,
        },
        '&.Mui-disabled': {
          backgroundColor: 'neutral.light',
          opacity: 0.5,
        },
        ...sx,
      }}
    >
      {children}
    </Button>
  )

  if (tooltip) {
    return (
      <Tooltip title={tooltip} placement={isVertical ? 'left' : 'bottom'}>
        <span>{button}</span>
      </Tooltip>
    )
  }

  return button
}
