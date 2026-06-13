import React from 'react'
import { Tooltip } from '@base-ui/react/tooltip'
import { css, cx } from 'styled-system/css'

import type { PandaStyleProp } from '#/common/style/panda'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'

export type SimpleTooltipOpenChangeHandler = NonNullable<
  React.ComponentProps<typeof Tooltip.Root>['onOpenChange']
>
type SimpleTooltipProps = {
  title?: React.ReactNode
  side?: React.ComponentProps<typeof Tooltip.Positioner>['side']
  align?: React.ComponentProps<typeof Tooltip.Positioner>['align']
  disabled?: boolean
  open?: React.ComponentProps<typeof Tooltip.Root>['open']
  defaultOpen?: React.ComponentProps<typeof Tooltip.Root>['defaultOpen']
  onOpenChange?: SimpleTooltipOpenChangeHandler
  sideOffset?: number
  collisionPadding?: number
  arrowPadding?: number
  positionMethod?: React.ComponentProps<typeof Tooltip.Positioner>['positionMethod']
  popupSx?: PandaStyleProp
  // arrowSx?: PandaStyleProp
  popupRef?: React.Ref<HTMLDivElement>
  triggerProps?: Omit<
    React.ComponentProps<typeof Tooltip.Trigger>,
    'render' | 'children'
  >
  children: React.ReactElement
}

type TooltipArrowSide = NonNullable<
  React.ComponentProps<typeof Tooltip.Positioner>['side']
>

const tooltipPositionerClass = css({
  zIndex: 'popup',
})

const tooltipPopupClass = css({
  position: 'relative',
  overflow: 'visible',
  maxWidth: 'min(18.75rem, calc(100vw - 1rem))',
  borderRadius: '4px',
  backgroundColor: 'rgba(97, 97, 97, 0.92)',
  color: '#ffffff',
  px: '0.5rem',
  py: '0.25rem',
  fontSize: '0.6875rem',
  lineHeight: 1.4,
  boxShadow: '0 2px 8px rgba(17, 17, 17, 0.18)',
})

const tooltipArrowClass = css({
  pointerEvents: 'none',
})

const getTooltipArrowStyle = (
  side: TooltipArrowSide,
  style?: React.CSSProperties
): React.CSSProperties => {
  const arrowStyle: React.CSSProperties = {
    ...style,
    display: 'block',
    width: '0.75rem',
    height: '0.375rem',
    color: 'rgba(97, 97, 97, 0.92)',
    pointerEvents: 'none',
  }

  if (side === 'top') {
    arrowStyle.bottom = '-0.375rem'
    arrowStyle.transform = 'rotate(180deg)'
  }

  if (side === 'bottom') {
    arrowStyle.top = '-0.375rem'
    arrowStyle.transform = 'rotate(0deg)'
  }

  if (side === 'left') {
    arrowStyle.right = '-0.5625rem'
    arrowStyle.transform = 'rotate(90deg)'
  }

  if (side === 'right') {
    arrowStyle.left = '-0.5625rem'
    arrowStyle.transform = 'rotate(-90deg)'
  }

  return arrowStyle
}

export const SimpleTooltip = ({
  title,
  side = 'top',
  align = 'center',
  disabled,
  open,
  defaultOpen,
  onOpenChange,
  sideOffset = 8,
  collisionPadding = 8,
  arrowPadding = 6,
  positionMethod = 'fixed',
  popupSx,
  // arrowSx,
  popupRef,
  triggerProps = {},
  children,
}: SimpleTooltipProps) => {
  if (title == null || title === '' || disabled) {
    return children
  }

  const {
    delay = 0,
    closeDelay = 0,
    ...restTriggerProps
  } = triggerProps

  const popupStyle = mergePandaStyleProps({ styleProps: popupSx })
  // const arrowStyle = mergePandaStyleProps({ styleProps: arrowSx })

  return (
    <Tooltip.Provider>
      <Tooltip.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
      >
        <Tooltip.Trigger
          render={children}
          delay={delay}
          closeDelay={closeDelay}
          {...restTriggerProps}
        />
        <Tooltip.Portal>
          <Tooltip.Positioner
            side={side}
            align={align}
            sideOffset={sideOffset}
            collisionPadding={collisionPadding}
            arrowPadding={arrowPadding}
            positionMethod={positionMethod}
            className={tooltipPositionerClass}
          >
            <Tooltip.Popup
              ref={popupRef}
              className={cx(tooltipPopupClass, css(...pandaStylePropsToArray(popupSx)))}
              style={popupStyle}
            >
              <Tooltip.Arrow
                className={cx(tooltipArrowClass)}
                render={(arrowProps, arrowState) => (
                  <div
                    {...arrowProps}
                    aria-hidden="true"
                    style={getTooltipArrowStyle(
                      arrowState.side,
                      arrowProps.style
                    )}
                  >
                    <svg
                      aria-hidden="true"
                      focusable="false"
                      viewBox="0 0 12 6"
                      style={{ display: 'block', width: '100%', height: '100%' }}
                    >
                      <path d="M0 6L6 0L12 6Z" fill="currentColor" />
                    </svg>
                  </div>
                )}
              />
              {title}
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}

export default SimpleTooltip
