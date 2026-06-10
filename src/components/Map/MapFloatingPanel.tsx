'use client'

import React, { useEffect, useRef } from 'react'
import { Popover as BasePopover } from '@base-ui/react/popover'
import { css, cx } from 'styled-system/css'

import type { PandaStyleProp } from '#/common/style/panda'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'

export type MapFloatingPlacement =
  | 'bottom-start'
  | 'bottom-end'
  | 'left-start'
  | 'left-end'

type PositionerAnchor = React.ComponentProps<
  typeof BasePopover.Positioner
>['anchor']
type PositionerAnchorResolver = Extract<
  NonNullable<PositionerAnchor>,
  () => unknown
>
export type MapFloatingResolvedAnchor = ReturnType<PositionerAnchorResolver>
export type MapFloatingAnchor = PositionerAnchor | null

type MapFloatingPanelProps = {
  open: boolean
  anchor: MapFloatingAnchor
  placement?: MapFloatingPlacement
  offset?: [number, number]
  collisionPadding?: number
  onClose: () => void
  paperSx?: PandaStyleProp
  positionerSx?: PandaStyleProp
  children: React.ReactNode
}

const getSideAndAlign = (placement: MapFloatingPlacement) => {
  const [side, align] = placement.split('-') as [
    'bottom' | 'left',
    'start' | 'end',
  ]

  return { side, align }
}

const positionerBaseClass = css({
  zIndex: 'calc(var(--z-index-drawer) + 3)',
})

const popupBaseClass = css({
  maxWidth: 'calc(100vw - 78px)',
  overflowY: 'auto',
  borderRadius: '0.3125rem',
  width: 'fit-content',
  outline: 'none',
  boxShadow: '0 8px 24px rgba(17, 17, 17, 0.18)',
})

const isRefAnchor = (
  anchor: MapFloatingAnchor
): anchor is React.RefObject<Element | null> =>
  anchor != null && typeof anchor === 'object' && 'current' in anchor

const resolveFloatingAnchor = (
  anchor: MapFloatingAnchor
): MapFloatingResolvedAnchor => {
  if (typeof anchor === 'function') {
    return anchor()
  }

  if (isRefAnchor(anchor)) {
    return anchor.current
  }

  return anchor ?? null
}

export const MapFloatingPanel = ({
  open,
  anchor,
  placement = 'bottom-start',
  offset = [0, 8],
  collisionPadding = 16,
  onClose,
  paperSx,
  positionerSx,
  children,
}: MapFloatingPanelProps) => {
  const popupRef = useRef<HTMLDivElement | null>(null)
  const { side, align } = getSideAndAlign(placement)
  const resolvedAnchor = resolveFloatingAnchor(anchor)
  const mounted = open && resolvedAnchor != null

  useEffect(() => {
    if (!mounted) {
      return
    }

    const closeOnPointerDown = (event: PointerEvent) => {
      const target = event.target

      if (!(target instanceof Node)) {
        return
      }

      const currentAnchor = resolveFloatingAnchor(anchor)
      const anchorElement =
        currentAnchor instanceof Element ? currentAnchor : null

      if (
        popupRef.current?.contains(target) ||
        anchorElement?.contains(target)
      ) {
        return
      }

      onClose()
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('pointerdown', closeOnPointerDown, true)
    document.addEventListener('keydown', closeOnEscape, true)

    return () => {
      document.removeEventListener('pointerdown', closeOnPointerDown, true)
      document.removeEventListener('keydown', closeOnEscape, true)
    }
  }, [anchor, mounted, onClose])

  if (!mounted) {
    return null
  }

  return (
    <BasePopover.Root
      open={mounted}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose()
        }
      }}
      modal={false}
    >
      <BasePopover.Portal>
        <BasePopover.Positioner
          anchor={resolvedAnchor}
          side={side}
          align={align}
          sideOffset={offset[1]}
          alignOffset={offset[0]}
          positionMethod="fixed"
          collisionPadding={collisionPadding}
          collisionAvoidance={{
            side: 'shift',
            align: 'shift',
            fallbackAxisSide: 'none',
          }}
          className={cx(
            positionerBaseClass,
            css(...pandaStylePropsToArray(positionerSx))
          )}
          style={mergePandaStyleProps({ styleProps: positionerSx })}
        >
          <BasePopover.Popup
            ref={popupRef}
            className={cx(popupBaseClass, css(...pandaStylePropsToArray(paperSx)))}
            style={mergePandaStyleProps({ styleProps: paperSx })}
          >
            {children}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  )
}

export default MapFloatingPanel
