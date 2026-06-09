import React from 'react'
import { Tooltip } from '@base-ui/react/tooltip'
import { css } from 'styled-system/css'

type SimpleTooltipProps = {
  title?: React.ReactNode
  side?: React.ComponentProps<typeof Tooltip.Positioner>['side']
  align?: React.ComponentProps<typeof Tooltip.Positioner>['align']
  disabled?: boolean
  children: React.ReactElement
}

const positionerClass = css({
  zIndex: 'popup',
})

const popupClass = css({
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

const arrowClass = css({
  width: '0.5rem',
  height: '0.5rem',
  backgroundColor: 'rgba(97, 97, 97, 0.92)',
  transform: 'rotate(45deg)',
})

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
          sideOffset={6}
          collisionPadding={8}
          positionMethod="fixed"
          className={positionerClass}
        >
          <Tooltip.Popup className={popupClass}>
            {title}
            <Tooltip.Arrow className={arrowClass} />
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

export default SimpleTooltip
