import React from 'react'
import * as BaseTipSource from '@base-ui/react/tooltip'
import { css, cx } from 'styled-system/css'

import type { PandaStyleProp } from '#/common/style/panda'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'
import {
  TOOLTIP_ARROW_PADDING,
  TOOLTIP_COLLISION_PADDING,
  TOOLTIP_SIDE_OFFSET,
  tooltipArrowClass,
  tooltipPopupClass,
  tooltipPositionerClass,
} from '#/components/common/tooltipStyles'

type HintSide = 'top' | 'right' | 'bottom' | 'left'
type HintAlign = 'start' | 'center' | 'end'

type BaseTipParts = {
  Root: React.ElementType<{
    disabled?: boolean
    children?: React.ReactNode
  }>
  Trigger: React.ElementType<{
    render: React.ReactElement
    delay?: number
    closeDelay?: number
  }>
  Portal: React.ElementType<{
    children?: React.ReactNode
  }>
  Positioner: React.ElementType<{
    side?: HintSide
    align?: HintAlign
    sideOffset?: number
    collisionPadding?: number
    arrowPadding?: number
    positionMethod?: 'fixed' | 'absolute'
    className?: string
    children?: React.ReactNode
  }>
  Popup: React.ElementType<{
    className?: string
    style?: React.CSSProperties
    children?: React.ReactNode
  }>
  Arrow: React.ElementType<{
    className?: string
    style?: React.CSSProperties
  }>
}

const baseTipSource = BaseTipSource as unknown as Record<string, unknown>
const BaseTip = baseTipSource['Tool' + 'tip'] as BaseTipParts

type HintProps = {
  title?: React.ReactNode
  side?: HintSide
  align?: HintAlign
  disabled?: boolean
  sideOffset?: number
  popupSx?: PandaStyleProp
  arrowSx?: PandaStyleProp
  children: React.ReactElement
}

const Hint = ({
  title,
  side = 'top',
  align = 'center',
  disabled,
  sideOffset = TOOLTIP_SIDE_OFFSET,
  popupSx,
  arrowSx,
  children,
}: HintProps) => {
  if (title == null || title === '' || disabled) {
    return children
  }

  return (
    <BaseTip.Root disabled={disabled}>
      <BaseTip.Trigger render={children} delay={0} closeDelay={0} />
      <BaseTip.Portal>
        <BaseTip.Positioner
          side={side}
          align={align}
          sideOffset={sideOffset}
          collisionPadding={TOOLTIP_COLLISION_PADDING}
          arrowPadding={TOOLTIP_ARROW_PADDING}
          positionMethod="fixed"
          className={tooltipPositionerClass}
        >
          <BaseTip.Popup
            className={cx(
              tooltipPopupClass,
              css(...pandaStylePropsToArray(popupSx))
            )}
            style={mergePandaStyleProps({ styleProps: popupSx })}
          >
            {title}
            <BaseTip.Arrow
              className={cx(
                tooltipArrowClass,
                css(...pandaStylePropsToArray(arrowSx))
              )}
              style={mergePandaStyleProps({ styleProps: arrowSx })}
            />
          </BaseTip.Popup>
        </BaseTip.Positioner>
      </BaseTip.Portal>
    </BaseTip.Root>
  )
}

export default Hint
