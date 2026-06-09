import React, { forwardRef } from 'react'
import { Button as BaseButton } from '@base-ui/react/button'
import { css, cx } from 'styled-system/css'

import type { PandaStyleProp } from '#/common/style/panda'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'
import SimpleTooltip from '#/components/common/SimpleTooltip'

export const MAP_BUTTON_SIZE = 40

type BaseButtonProps = React.ComponentProps<typeof BaseButton>

export interface MapButtonProps
  extends Omit<BaseButtonProps, 'className' | 'style' | 'color'> {
  tooltip?: string
  isVertical?: boolean
  sx?: PandaStyleProp
  className?: string
  style?: React.CSSProperties
  size?: 'small' | 'medium' | 'large'
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
      'aria-label': ariaLabel,
      size: _size,
      ...props
    },
    ref
  ) => {
    void _size

    const button = (
      <BaseButton
        {...props}
        type={props.type ?? 'button'}
        aria-label={ariaLabel ?? tooltip}
        className={cx(
          'map-button',
          css(
            {
              width: MAP_BUTTON_SIZE,
              height: MAP_BUTTON_SIZE,
              minWidth: MAP_BUTTON_SIZE,
              p: 0,
              border: 0,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '0.3125rem',
              backgroundColor: 'neutral.light',
              color: 'neutral.darker',
              boxShadow: 'none',
              opacity: 0.9,
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'neutral.main',
                opacity: 1,
              },
              '&:disabled': {
                backgroundColor: 'neutral.light',
                opacity: 0.5,
                cursor: 'default',
              },
              '&:focus-visible': {
                outline: '2px solid var(--colors-secondary-dark)',
                outlineOffset: '2px',
              },
              '& svg': {
                flexShrink: 0,
              },
            },
            ...pandaStylePropsToArray(sx)
          ),
          className
        )}
        style={mergePandaStyleProps({ sx, style })}
        ref={ref}
      >
        {children}
      </BaseButton>
    )

    if (tooltip) {
      return (
        <SimpleTooltip title={tooltip} side={isVertical ? 'left' : 'bottom'}>
          {button}
        </SimpleTooltip>
      )
    }

    return button
  }
)

MapButton.displayName = 'MapButton'
