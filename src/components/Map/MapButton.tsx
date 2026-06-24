import React, { forwardRef } from 'react'
import { Tooltip } from '@base-ui/react/tooltip'

import {
  Box,
  toSxArray,
  type AppSxProps,
  type AppTheme,
} from '#/common/style/theme/system'
import { IconButton, type IconButtonProps } from '#/components/common/Button'

export const MAP_BUTTON_SIZE = 40

export interface MapButtonProps extends IconButtonProps {
  tooltip?: string
  tooltipOpen?: boolean
  isVertical?: boolean
  sx?: AppSxProps
}

type TooltipTriggerProps = Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  'color'
> & {
  ref?: React.Ref<HTMLSpanElement>
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
        <Tooltip.Root open={tooltipOpen}>
          <Tooltip.Trigger
            delay={0}
            closeDelay={0}
            render={(triggerProps) => {
              const {
                color: ignoredColor,
                type: ignoredType,
                ...resolvedTriggerProps
              } = triggerProps as TooltipTriggerProps & {
                color?: string
                type?: string
              }
              void ignoredColor
              void ignoredType

              return (
                <Box
                  {...resolvedTriggerProps}
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    lineHeight: 0,
                  }}
                >
                  {button}
                </Box>
              )
            }}
          />
          <Tooltip.Portal>
            <Tooltip.Positioner
              side={isVertical ? 'left' : 'bottom'}
              sideOffset={8}
            >
              <Tooltip.Popup
                style={{ zIndex: 1500, pointerEvents: 'none' }}
                render={(popupProps) => (
                  <Box
                    {...popupProps}
                    data-slot="map-button-tooltip"
                    sx={{
                      maxWidth: 240,
                      px: 1,
                      py: 0.75,
                      borderRadius: '5px',
                      backgroundColor: '#111111',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 400,
                      lineHeight: 1.35,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.22)',
                    }}
                  >
                    {tooltip}
                    <Tooltip.Arrow
                      render={(arrowProps) => (
                        <Box
                          {...arrowProps}
                          sx={{
                            position: 'absolute',
                            width: 8,
                            height: 8,
                            backgroundColor: '#111111',
                            transform: 'rotate(45deg)',
                            ...(isVertical
                              ? { right: -4, top: 'calc(50% - 4px)' }
                              : { top: -4, left: 'calc(50% - 4px)' }),
                          }}
                        />
                      )}
                    />
                  </Box>
                )}
              />
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip.Root>
      )
    }

    return button
  }
)

MapButton.displayName = 'MapButton'
