import React from 'react'
import { Tooltip } from '@base-ui/react/tooltip'

import {
  TOOLTIP_ARROW_PADDING,
  TOOLTIP_COLLISION_PADDING,
  TOOLTIP_SIDE_OFFSET,
  tooltipArrowClass,
  tooltipPopupClass,
  tooltipPositionerClass,
} from '#/components/common/tooltipStyles'

type SimpleTooltipProps = {
  title?: React.ReactNode
  side?: React.ComponentProps<typeof Tooltip.Positioner>['side']
  align?: React.ComponentProps<typeof Tooltip.Positioner>['align']
  disabled?: boolean
  children: React.ReactElement
}

export const SimpleTooltip = ({
  title,
  side = 'top',
  align = 'center',
  disabled,
  children,
}: SimpleTooltipProps) => {
  if (title == null || title === '' || disabled) {
    return children
  }

  return (
    <Tooltip.Root disabled={disabled}>
      <Tooltip.Trigger render={children} delay={0} closeDelay={0} />
      <Tooltip.Portal>
        <Tooltip.Positioner
          side={side}
          align={align}
          sideOffset={TOOLTIP_SIDE_OFFSET}
          collisionPadding={TOOLTIP_COLLISION_PADDING}
          arrowPadding={TOOLTIP_ARROW_PADDING}
          positionMethod="fixed"
          className={tooltipPositionerClass}
        >
          <Tooltip.Popup className={tooltipPopupClass}>
            {title}
            <Tooltip.Arrow className={tooltipArrowClass} />
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

export default SimpleTooltip
