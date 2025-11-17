import React, { forwardRef } from 'react'
import { Button, Tooltip, ButtonProps } from '@mui/material'

export const MAP_BUTTON_SIZE = 40

export interface MapButtonProps extends ButtonProps {
  tooltip?: string
  isVertical?: boolean
}

export const MapButton = forwardRef<HTMLButtonElement, MapButtonProps>(
  (
    {
      children,
      tooltip,
      isVertical,
      sx,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const button = (
      <Button
        {...props}
        className={className}
        style={style}
        ref={ref}
        sx={{
          width: MAP_BUTTON_SIZE,
          height: MAP_BUTTON_SIZE,
          minWidth: MAP_BUTTON_SIZE,
          borderRadius: '0.3125rem',
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
)

MapButton.displayName = 'MapButton'
