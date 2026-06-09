'use client'

import React, { useRef, useState, ReactElement } from 'react'

import type { PandaStyleProp } from '#/common/style/panda'
import { Box } from '#/components/common/PandaBox'
import { MapButtonProps } from './MapButton'
import MapFloatingPanel, { type MapFloatingPlacement } from './MapFloatingPanel'

type MenuContentRenderer = (helpers: { closeMenu: () => void }) => React.ReactNode

type MapButtonMenuProps = {
  children: ReactElement<MapButtonProps>
  menuContent?: React.ReactNode | MenuContentRenderer
  isVertical: boolean
  placement?: MapFloatingPlacement
  paperSx?: PandaStyleProp
  popperSx?: PandaStyleProp
}

type MapButtonClickEvent = Parameters<NonNullable<MapButtonProps['onClick']>>[0]

export const MapButtonMenu = ({
  children,
  menuContent,
  isVertical,
  placement,
  paperSx,
  popperSx,
}: MapButtonMenuProps) => {
  const anchorRef = useRef<HTMLButtonElement | null>(null)
  const [requestedOpen, setRequestedOpen] = useState(false)
  const closeMenu = () => setRequestedOpen(false)
  const resolvedMenuContent =
    typeof menuContent === 'function' ? menuContent({ closeMenu }) : menuContent

  const hasMenuContent = React.Children.count(resolvedMenuContent) > 0
  const childDisabled = Boolean(children.props.disabled)
  const open = requestedOpen && hasMenuContent && !childDisabled
  const getAnchor = React.useCallback(() => anchorRef.current, [])

  if (!hasMenuContent) {
    return children
  }

  const originalOnClick = children.props.onClick
  const childRef = (
    children as React.ReactElement & {
      ref?: React.Ref<HTMLButtonElement>
    }
  ).ref

  const setChildRef = (node: HTMLButtonElement | null) => {
    anchorRef.current = node
    if (!childRef) return
    if (typeof childRef === 'function') {
      childRef(node)
    } else if (typeof childRef === 'object') {
      // eslint-disable-next-line react-hooks/immutability -- preserve a cloned trigger's existing object ref.
      ;(childRef as React.MutableRefObject<HTMLButtonElement | null>).current =
        node
    }
  }

  const handleButtonClick = (event: MapButtonClickEvent) => {
    if (typeof originalOnClick === 'function') {
      originalOnClick(event)
    }

    if (childDisabled) return

    setRequestedOpen((prev) => !prev)
  }

  const clonedChild = React.cloneElement(children, {
    onClick: handleButtonClick,
    ref: setChildRef,
    'aria-haspopup': 'menu',
    'aria-expanded': open ? 'true' : undefined,
  })

  return (
    <>
      {clonedChild}
      <MapFloatingPanel
        open={open}
        anchor={getAnchor}
        placement={placement ?? (isVertical ? 'left-end' : 'bottom-start')}
        offset={[0, 8]}
        collisionPadding={16}
        onClose={closeMenu}
        positionerSx={popperSx}
        paperSx={[
          {
            maxWidth: 'calc(100vw - 78px)',
            maxHeight: isVertical
              ? 'calc(100vh - 32px)'
              : 'calc(100vh - 78px)',
            overflowY: 'auto',
            p: '1rem',
            backgroundColor: isVertical
              ? 'neutral.light'
              : 'rgba(246, 244, 244, 0.9)',
            borderRadius: '0.3125rem',
            width: 'fit-content',
          },
          ...(Array.isArray(paperSx) ? paperSx : [paperSx]),
        ]}
      >
        <Box>{resolvedMenuContent}</Box>
      </MapFloatingPanel>
    </>
  )
}
