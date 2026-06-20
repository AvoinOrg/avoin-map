'use client'

import React from 'react'
import { Tooltip } from '@base-ui/react/tooltip'

import { Box } from '#/common/style/theme/system'

type TooltipSide = React.ComponentProps<typeof Tooltip.Positioner>['side']
type TooltipButtonTriggerProps = Omit<
  React.HTMLAttributes<HTMLButtonElement>,
  'color'
> & {
  ref?: React.Ref<HTMLButtonElement>
}

export type SidebarPanelExtensionTooltipProps = {
  title: React.ReactNode
  side?: TooltipSide
  children: (props: TooltipButtonTriggerProps) => React.ReactElement
}

export const SidebarPanelExtensionTooltip = ({
  title,
  side = 'right',
  children,
}: SidebarPanelExtensionTooltipProps) => (
  <Tooltip.Root>
    <Tooltip.Trigger
      delay={0}
      closeDelay={0}
      render={(triggerProps) => {
        const { color: ignoredColor, ...resolvedTriggerProps } = triggerProps
        void ignoredColor

        return children(resolvedTriggerProps as TooltipButtonTriggerProps)
      }}
    />
    <Tooltip.Portal>
      <Tooltip.Positioner side={side} sideOffset={8}>
        <Tooltip.Popup
          style={{ zIndex: 1500, pointerEvents: 'none' }}
          render={(popupProps) => (
            <Box
              {...popupProps}
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
              {title}
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
                      ...(side === 'right'
                        ? { left: -4, top: 'calc(50% - 4px)' }
                        : { bottom: -4, left: 'calc(50% - 4px)' }),
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

export default SidebarPanelExtensionTooltip
