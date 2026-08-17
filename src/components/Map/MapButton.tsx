import React, { forwardRef } from 'react'

import {
  Box,
  toSxArray,
  type AppSxProps,
  type AppTheme,
} from '#/common/style/theme/system'
import AppTooltip from '#/components/common/AppTooltip'
import { IconButton, type IconButtonProps } from '#/components/common/Button'

export const MAP_BUTTON_SIZE = 40

export interface MapButtonProps extends IconButtonProps {
  tooltip?: string
  tooltipOpen?: boolean
  isVertical?: boolean
  sx?: AppSxProps
}

export const MapButton = forwardRef<HTMLButtonElement, MapButtonProps>(
  (
    {
      children,
      tooltip,
      tooltipOpen,
      isVertical,
      sx,
      className,
      style,
      'aria-label': ariaLabel,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const button = (
      <IconButton
        {...props}
        type={type}
        aria-label={ariaLabel ?? tooltip}
        className={className}
        data-slot="map-button"
        style={style}
        ref={ref}
        sx={[
          {
            width: MAP_BUTTON_SIZE,
            height: MAP_BUTTON_SIZE,
            minWidth: MAP_BUTTON_SIZE,
            p: 0,
            borderRadius: '0.3125rem',
            backgroundColor: 'neutral.light',
            color: 'text.primary',
            boxShadow: 'none',
            opacity: 0.9,
            '&:hover': {
              backgroundColor: 'neutral.main',
              opacity: 1,
            },
            '&:disabled, &[data-disabled], &[aria-disabled="true"]': {
              backgroundColor: 'neutral.light',
              opacity: 0.5,
            },
            '&:focus-visible, &[data-focus-visible="true"]': {
              outline: (theme: AppTheme) =>
                `2px solid ${theme.palette.secondary.dark}`,
              outlineOffset: 2,
            },
          },
          ...toSxArray(sx),
        ]}
      >
        {children}
      </IconButton>
    )

    if (tooltip) {
      return (
        <AppTooltip
          title={tooltip}
          open={tooltipOpen}
          side={isVertical ? 'left' : 'bottom'}
          sideOffset={8}
          delay={0}
          closeDelay={0}
          popupDataSlot="map-button-tooltip"
          popupSx={{ px: 1 }}
        >
          {(triggerProps) => (
            <Box
              {...triggerProps}
              component="span"
              sx={{
                display: 'inline-flex',
                lineHeight: 0,
              }}
            >
              {button}
            </Box>
          )}
        </AppTooltip>
      )
    }

    return button
  }
)

MapButton.displayName = 'MapButton'
