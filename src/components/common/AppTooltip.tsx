import type React from 'react'
import { Tooltip } from '@base-ui/react/tooltip'

import { Box, type AppSxProps, toSxArray } from '#/common/style/theme'

export const APP_TOOLTIP_SURFACE_COLOR = '#454545'

const APP_TOOLTIP_ARROW_SIZE = 8
const APP_TOOLTIP_ARROW_OFFSET = APP_TOOLTIP_ARROW_SIZE / 2

type AppSxItem = Exclude<NonNullable<AppSxProps>, readonly unknown[]>

export type AppTooltipSide = 'top' | 'right' | 'bottom' | 'left'
export type AppTooltipAlign = 'start' | 'center' | 'end'
export type AppTooltipTriggerProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  'color' | 'type'
> & {
  ref?: React.Ref<HTMLElement>
}

export type AppTooltipProps = {
  title: React.ReactNode
  children: (props: AppTooltipTriggerProps) => React.ReactElement
  side?: AppTooltipSide
  align?: AppTooltipAlign
  collisionAvoidance?: React.ComponentProps<
    typeof Tooltip.Positioner
  >['collisionAvoidance']
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: React.ComponentProps<typeof Tooltip.Root>['onOpenChange']
  disabled?: boolean
  delay?: number
  closeDelay?: number
  sideOffset?: number
  popupId?: string
  popupSx?: AppSxProps
  popupDataSlot?: string
}

const getAppTooltipArrowSx = (side: string): AppSxItem => {
  if (side === 'right') {
    return { left: -APP_TOOLTIP_ARROW_OFFSET }
  }

  if (side === 'left') {
    return { right: -APP_TOOLTIP_ARROW_OFFSET }
  }

  if (side === 'bottom') {
    return { top: -APP_TOOLTIP_ARROW_OFFSET }
  }

  return { bottom: -APP_TOOLTIP_ARROW_OFFSET }
}

const appTooltipPopupSx = {
  position: 'relative',
  maxWidth: 240,
  px: 1.25,
  py: 0.75,
  borderRadius: '5px',
  border: 0,
  backgroundColor: APP_TOOLTIP_SURFACE_COLOR,
  color: '#ffffff',
  fontSize: '0.75rem',
  fontWeight: 400,
  lineHeight: 1.35,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.22)',
  pointerEvents: 'none',
} satisfies AppSxItem

export const AppTooltip = ({
  title,
  children,
  side = 'top',
  align = 'center',
  collisionAvoidance,
  open,
  defaultOpen,
  onOpenChange,
  disabled = false,
  delay = 0,
  closeDelay = 0,
  sideOffset = 8,
  popupId,
  popupSx,
  popupDataSlot,
}: AppTooltipProps) => (
  <Tooltip.Root
    open={open}
    defaultOpen={defaultOpen}
    onOpenChange={onOpenChange}
    disabled={disabled}
  >
    <Tooltip.Trigger
      delay={delay}
      closeDelay={closeDelay}
      render={(triggerProps) => {
        const {
          color: ignoredColor,
          type: ignoredType,
          ...resolvedTriggerProps
        } = triggerProps as AppTooltipTriggerProps & {
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
        align={align}
        collisionAvoidance={collisionAvoidance}
        sideOffset={sideOffset}
        style={{ zIndex: 1500, pointerEvents: 'none' }}
      >
        <Tooltip.Popup
          render={(popupProps) => (
            <Box
              {...popupProps}
              id={popupId ?? popupProps.id}
              data-slot={popupDataSlot}
              role={popupProps.role ?? 'tooltip'}
              sx={[appTooltipPopupSx, ...toSxArray(popupSx)]}
            >
              {title}
              <Tooltip.Arrow
                render={(arrowProps, arrowState) => (
                  <Box
                    {...arrowProps}
                    sx={{
                      width: APP_TOOLTIP_ARROW_SIZE,
                      height: APP_TOOLTIP_ARROW_SIZE,
                      backgroundColor: APP_TOOLTIP_SURFACE_COLOR,
                      transform: 'rotate(45deg)',
                      ...getAppTooltipArrowSx(arrowState.side),
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

export default AppTooltip
