'use client'

import React, { useEffect, useRef, useState, ReactElement } from 'react'
import { Popover } from '@base-ui/react/popover'

import {
  Box,
  toSxArray,
  type AppSxProps,
  type AppTheme,
} from '#/common/style/theme/system'
import { MapButtonProps } from './MapButton'

type MenuContentRenderer = (helpers: { closeMenu: () => void }) => React.ReactNode
type PopoverPositionerProps = React.ComponentProps<typeof Popover.Positioner>
type PopoverSide = 'top' | 'bottom' | 'left' | 'right'
type PopoverAlign = NonNullable<PopoverPositionerProps['align']>
type AppSxItem = Exclude<NonNullable<AppSxProps>, readonly unknown[]>
type TriggerRenderProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onClick'
> & {
  ref?: React.Ref<HTMLButtonElement>
  onClick?: React.MouseEventHandler<HTMLElement>
  color?: string
}

export type MapButtonMenuPlacement =
  | PopoverSide
  | `${PopoverSide}-${PopoverAlign}`

type MapButtonMenuProps = {
  children: ReactElement<MapButtonProps>
  menuContent?: React.ReactNode | MenuContentRenderer
  isVertical: boolean
  placement?: MapButtonMenuPlacement
  paperSx?: AppSxProps
  popperSx?: AppSxProps
  defaultOpen?: boolean
}

const toMapMenuSxArray = (sx?: AppSxProps) => toSxArray(sx) as AppSxItem[]

const assignRef = <TElement,>(
  ref: React.Ref<TElement> | undefined,
  value: TElement | null
) => {
  if (!ref) return
  if (typeof ref === 'function') {
    ref(value)
    return
  }
  ;(ref as React.MutableRefObject<TElement | null>).current = value
}

export const getMapButtonMenuPlacement = ({
  placement,
  fallback,
}: {
  placement?: MapButtonMenuPlacement
  fallback: MapButtonMenuPlacement
}): { side: PopoverSide; align: PopoverAlign } => {
  const [side, align = 'center'] = (placement ?? fallback).split('-') as [
    PopoverSide,
    PopoverAlign?,
  ]

  return { side, align }
}

export const getMapButtonMenuSurfaceSx = ({
  isVertical,
}: {
  isVertical: boolean
}) =>
  (theme: AppTheme) => ({
    maxWidth: 'calc(100vw - 78px)',
    maxHeight: isVertical
      ? 'calc(100vh - 32px)'
      : 'calc(100vh - 78px)',
    overflowY: 'auto',
    p: '1rem',
    backgroundColor: isVertical
      ? theme.palette.neutral.light
      : 'rgba(246, 244, 244, 0.9)',
    borderRadius: '0.3125rem',
    width: 'fit-content',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.18)',
    outline: 0,
  })

export const getMapButtonMenuPositionerSx =
  (zIndex: (theme: AppTheme) => number) => (theme: AppTheme) => ({
    zIndex: zIndex(theme),
  })

export { assignRef as assignMapButtonMenuRef }

const renderMapButtonMenuPopup = ({
  children,
  isVertical,
  paperSx,
}: {
  children: React.ReactNode
  isVertical: boolean
  paperSx?: AppSxProps
}) => (
  <Popover.Popup
    render={(popupProps) => (
      <Box
        {...popupProps}
        role={undefined}
        data-slot="map-button-menu-surface"
        sx={[
          getMapButtonMenuSurfaceSx({ isVertical }),
          ...toMapMenuSxArray(paperSx),
        ]}
      />
    )}
  >
    <Box data-slot="map-button-menu-content">{children}</Box>
  </Popover.Popup>
)

export const MapButtonMenuSurface = renderMapButtonMenuPopup

export const mapButtonMenuCollisionAvoidance = {
  side: 'none',
  align: 'shift',
  fallbackAxisSide: 'none',
} as const

export const mapButtonMenuCollisionPadding = 16

export const mapButtonMenuOffset = 8

export const mapButtonMenuVerticalPlacement = 'left-end' as const
export const mapButtonMenuHorizontalPlacement = 'bottom-start' as const

export const mapButtonStickyVerticalPlacement = 'bottom-end' as const
export const mapButtonStickyHorizontalPlacement = 'bottom-start' as const

export const mapButtonMenuPositionMethod = 'absolute' as const

export const mapButtonMenuModal = false

export const MapButtonMenuPositioner = ({
  children,
  isVertical,
  placement,
  popperSx,
  zIndex,
  sideOffset = mapButtonMenuOffset,
  anchor,
}: {
  children: React.ReactNode
  isVertical: boolean
  placement?: MapButtonMenuPlacement
  popperSx?: AppSxProps
  zIndex: (theme: AppTheme) => number
  sideOffset?: number
  anchor?: PopoverPositionerProps['anchor']
}) => {
  const { side, align } = getMapButtonMenuPlacement({
    placement,
    fallback: isVertical
      ? mapButtonMenuVerticalPlacement
      : mapButtonMenuHorizontalPlacement,
  })

  return (
    <Popover.Portal>
      <Popover.Positioner
        anchor={anchor}
        side={side}
        align={align}
        sideOffset={sideOffset}
        collisionAvoidance={mapButtonMenuCollisionAvoidance}
        collisionPadding={mapButtonMenuCollisionPadding}
        positionMethod={mapButtonMenuPositionMethod}
        render={(positionerProps) => (
          <Box
            {...positionerProps}
            data-slot="map-button-menu-positioner"
            sx={[
              getMapButtonMenuPositionerSx(zIndex),
              ...toMapMenuSxArray(popperSx),
            ]}
          />
        )}
      >
        {children}
      </Popover.Positioner>
    </Popover.Portal>
  )
}

export const MapButtonMenu = ({
  children,
  menuContent,
  isVertical,
  placement,
  paperSx,
  popperSx,
  defaultOpen = false,
}: MapButtonMenuProps) => {
  const anchorRef = useRef<HTMLButtonElement | null>(null)
  const [open, setOpen] = useState(defaultOpen)
  const closeMenu = React.useCallback(() => setOpen(false), [])
  const resolvedMenuContent =
    typeof menuContent === 'function' ? menuContent({ closeMenu }) : menuContent

  const hasMenuContent = React.Children.count(resolvedMenuContent) > 0
  const childDisabled = Boolean(children.props.disabled)

  useEffect(() => {
    if (!hasMenuContent && open) {
      const timeoutId = window.setTimeout(() => setOpen(false), 0)
      return () => window.clearTimeout(timeoutId)
    }
  }, [hasMenuContent, open])

  useEffect(() => {
    if (childDisabled && open) {
      const timeoutId = window.setTimeout(() => setOpen(false), 0)
      return () => window.clearTimeout(timeoutId)
    }
  }, [childDisabled, open])

  if (!hasMenuContent) {
    return children
  }

  const childRef = (
    children as React.ReactElement & {
      ref?: React.Ref<HTMLButtonElement>
    }
  ).ref

  const setChildRef = (
    triggerRef: React.Ref<HTMLButtonElement> | undefined,
    node: HTMLButtonElement | null
  ) => {
    anchorRef.current = node
    assignRef(triggerRef, node)
    assignRef(childRef, node)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen && (childDisabled || !hasMenuContent)) {
      return
    }
    setOpen(nextOpen)
  }

  return (
    <Popover.Root
      open={open}
      onOpenChange={handleOpenChange}
      modal={mapButtonMenuModal}
    >
      <Popover.Trigger
        disabled={childDisabled}
        render={(triggerProps) => {
          const {
            color: ignoredColor,
            onClick: triggerOnClick,
            ref: triggerRef,
            ...resolvedTriggerProps
          } = triggerProps as TriggerRenderProps
          void ignoredColor

          return React.cloneElement(
            children as React.ReactElement<
              MapButtonProps & React.RefAttributes<HTMLButtonElement>
            >,
            {
              ...resolvedTriggerProps,
              onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
                children.props.onClick?.(event)
                if (childDisabled) return
                triggerOnClick?.(event)
              },
              ref: (node: HTMLButtonElement | null) =>
                setChildRef(triggerRef, node),
              'aria-haspopup': 'menu',
              'aria-expanded': open ? 'true' : undefined,
            }
          )
        }}
      />
      <MapButtonMenuPositioner
        isVertical={isVertical}
        placement={placement}
        popperSx={popperSx}
        zIndex={(theme) => theme.zIndex.drawer + 3}
      >
        <MapButtonMenuSurface isVertical={isVertical} paperSx={paperSx}>
          {resolvedMenuContent}
        </MapButtonMenuSurface>
      </MapButtonMenuPositioner>
    </Popover.Root>
  )
}
