'use client'

import React from 'react'
import { Tooltip } from '@base-ui/react/tooltip'

import { Box } from '#/common/style/theme/system'
import type { AppSxProps } from '#/common/style/theme/system'

export type SidebarPanelExtensionTooltipSide = React.ComponentProps<
  typeof Tooltip.Positioner
>['side']
export type SidebarPanelExtensionTooltipTriggerProps = Omit<
  React.HTMLAttributes<HTMLButtonElement>,
  'color'
> & {
  ref?: React.Ref<HTMLButtonElement>
}

export type SidebarPanelExtensionTooltipProps = {
  title: React.ReactNode
  side?: SidebarPanelExtensionTooltipSide
  children: (
    props: SidebarPanelExtensionTooltipTriggerProps
  ) => React.ReactElement
}

const getSidebarPanelExtensionTooltipArrowSx = (
  side: SidebarPanelExtensionTooltipSide
): AppSxProps => {
  if (side === 'right') {
    return { left: -4, top: 'calc(50% - 4px)' }
  }

  if (side === 'left') {
    return { right: -4, top: 'calc(50% - 4px)' }
  }

  if (side === 'bottom') {
    return { top: -4, left: 'calc(50% - 4px)' }
  }

  return { bottom: -4, left: 'calc(50% - 4px)' }
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
        const {
          color: ignoredColor,
          type: ignoredType,
          ...resolvedTriggerProps
        } = triggerProps as SidebarPanelExtensionTooltipTriggerProps & {
          color?: string
          type?: string
        }
        void ignoredColor
        void ignoredType

        return children(resolvedTriggerProps)
      }}
    />
    <Tooltip.Portal>
      <Tooltip.Positioner
        side={side}
        sideOffset={8}
        style={{ zIndex: 1500, pointerEvents: 'none' }}
      >
        <Tooltip.Popup
          style={{ position: 'relative', pointerEvents: 'none' }}
          render={(popupProps) => (
            <Box
              {...popupProps}
              role="tooltip"
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
                      ...getSidebarPanelExtensionTooltipArrowSx(side),
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
