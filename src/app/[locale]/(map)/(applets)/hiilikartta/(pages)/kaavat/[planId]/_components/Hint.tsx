import React from 'react'
import * as BaseTipSource from '@base-ui/react/tooltip'
import { css, cx } from 'styled-system/css'

import type { PandaStyleProp } from '#/common/style/panda'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'

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

const Hint = ({
  title,
  side = 'top',
  align = 'center',
  disabled,
  sideOffset = 6,
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
          collisionPadding={8}
          positionMethod="fixed"
          className={positionerClass}
        >
          <BaseTip.Popup
            className={cx(popupClass, css(...pandaStylePropsToArray(popupSx)))}
            style={mergePandaStyleProps({ sx: popupSx })}
          >
            {title}
            <BaseTip.Arrow
              className={cx(arrowClass, css(...pandaStylePropsToArray(arrowSx)))}
              style={mergePandaStyleProps({ sx: arrowSx })}
            />
          </BaseTip.Popup>
        </BaseTip.Positioner>
      </BaseTip.Portal>
    </BaseTip.Root>
  )
}

export default Hint
