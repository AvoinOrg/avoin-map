'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Popover } from '@base-ui/react/popover'

import { useTranslate } from '@tolgee/react'

import {
  Box,
  toSxArray,
  type AppSxProps,
} from '#/common/style/theme/system'
import { ArrowUp, Tune } from '#/components/icons'
import { useUIStore } from '#/common/store/uiStore'
import { IntoSlot } from '../context/slotsContext'
import { MAP_BUTTON_SIZE, MapButton, MapButtonProps } from './MapButton'
import {
  MapButtonMenuPlacement,
  MapButtonMenuPositioner,
  MapButtonMenuSurface,
  assignMapButtonMenuRef,
  mapButtonMenuModal,
  mapButtonStickyHorizontalPlacement,
  mapButtonStickyVerticalPlacement,
} from './MapButtonMenu'

type MenuContentRenderer = (helpers: {
  closeMenu: () => void
}) => React.ReactNode

type MapButtonStickyMenuProps = {
  children: React.ReactElement<MapButtonProps>
  menuContent?: React.ReactNode | MenuContentRenderer
  isVertical: boolean
  isActive: boolean
  paperSx?: AppSxProps
  popperSx?: AppSxProps
  placement?: MapButtonMenuPlacement
  showTooltip?: string
  menuTitle?: string
  defaultOpen?: boolean
}

const STICKY_MENU_SLOT_NAME = 'map-sticky-menu-toggle'
type TriggerRenderProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onClick'
> & {
  ref?: React.Ref<HTMLButtonElement>
  onClick?: React.MouseEventHandler<HTMLElement>
  color?: string
}

export const MapButtonStickyMenu = ({
  children,
  menuContent,
  isVertical,
  isActive,
  paperSx,
  popperSx,
  placement,
  showTooltip,
  menuTitle,
  defaultOpen,
}: MapButtonStickyMenuProps) => {
  const { t } = useTranslate('avoin-map')
  const activeMapMenu = useUIStore((state) => state.activeMapMenu)

  const anchorRef = useRef<HTMLButtonElement | null>(null)
  const [anchorElement, setAnchorElement] = useState<HTMLButtonElement | null>(
    null
  )
  const childDisabled = Boolean(children.props.disabled)
  const hasRawMenuContent =
    typeof menuContent === 'function'
      ? true
      : React.Children.count(menuContent) > 0
  const [open, setOpen] = useState(
    () => defaultOpen ?? (isActive && hasRawMenuContent && !childDisabled)
  )
  const closeMenu = React.useCallback(() => {
    setOpen(false)
  }, [])
  const resolvedMenuContent = React.useMemo(() => {
    if (typeof menuContent === 'function') {
      return menuContent({ closeMenu })
    }
    return menuContent
  }, [menuContent, closeMenu])
  const hasMenuContent = React.Children.count(resolvedMenuContent) > 0

  useEffect(() => {
    const nextOpen =
      !hasMenuContent || childDisabled
        ? false
        : defaultOpen != null
          ? defaultOpen && isActive
          : isActive

    const timeoutId = window.setTimeout(() => setOpen(nextOpen), 0)
    return () => window.clearTimeout(timeoutId)
  }, [isActive, hasMenuContent, childDisabled, defaultOpen])

  useEffect(() => {
    if (!hasMenuContent || childDisabled) {
      return undefined
    }

    if (isVertical && activeMapMenu === 'search') {
      const timeoutId = window.setTimeout(() => setOpen(false), 0)
      return () => window.clearTimeout(timeoutId)
    }
    return undefined
  }, [activeMapMenu, isVertical, hasMenuContent, childDisabled])

  useEffect(() => {
    if (
      activeMapMenu === 'backgroundLayers' ||
      activeMapMenu === 'backgroundOverlayLayers'
    ) {
      const timeoutId = window.setTimeout(() => setOpen(false), 0)
      return () => window.clearTimeout(timeoutId)
    }
    return undefined
  }, [activeMapMenu])

  if (!isActive || !hasMenuContent) {
    return children
  }

  const originalOnClick = children.props.onClick

  const handleChildClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (typeof originalOnClick === 'function') {
      originalOnClick(event)
    }

    if (childDisabled) return

    setOpen(!open)
  }

  const clonedChild = React.cloneElement(children, {
    onClick: handleChildClick,
  })

  const anchorEl =
    typeof document !== 'undefined' && anchorElement
      ? document.body.contains(anchorElement)
        ? anchorElement
        : null
      : anchorElement

  const isSearchOpenVertical = isVertical && activeMapMenu === 'search'
  const effectiveOpen = open && !isSearchOpenVertical && Boolean(anchorEl)
  const hideLabel = t('map.menu.hide')

  const setToggleRef = (
    triggerRef: React.Ref<HTMLButtonElement> | undefined,
    node: HTMLButtonElement | null
  ) => {
    anchorRef.current = node
    setAnchorElement((previous) => (previous === node ? previous : node))
    assignMapButtonMenuRef(triggerRef, node)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen && (childDisabled || !hasMenuContent || !isActive)) {
      return
    }
    setOpen(nextOpen)
  }

  return (
    <Popover.Root
      open={effectiveOpen}
      onOpenChange={handleOpenChange}
      modal={mapButtonMenuModal}
    >
      {clonedChild}

      <IntoSlot name={STICKY_MENU_SLOT_NAME}>
        <Box
          sx={{
            visibility: open ? 'hidden' : 'visible',
          }}
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

              return (
                <MapButton
                  {...resolvedTriggerProps}
                  ref={(node) => setToggleRef(triggerRef, node)}
                  onClick={(event) => {
                    if (childDisabled) return
                    triggerOnClick?.(event)
                  }}
                  size="small"
                  tooltip={showTooltip ?? t('map.buttons.menu.show')}
                  isVertical={isVertical}
                  aria-haspopup="menu"
                  aria-expanded={effectiveOpen ? 'true' : undefined}
                >
                  <Tune aria-hidden="true" />
                </MapButton>
              )
            }}
          />
        </Box>
      </IntoSlot>

      <MapButtonMenuPositioner
        anchor={anchorEl}
        isVertical={isVertical}
        placement={
          placement ??
          (isVertical
            ? mapButtonStickyVerticalPlacement
            : mapButtonStickyHorizontalPlacement)
        }
        popperSx={popperSx}
        sideOffset={-MAP_BUTTON_SIZE}
        zIndex={(theme) => theme.zIndex.drawer - 1}
      >
        <MapButtonMenuSurface
          isVertical={isVertical}
          paperSx={[{ position: 'relative' }, ...toSxArray(paperSx)]}
        >
          <Box
            role="button"
            tabIndex={0}
            onClick={closeMenu}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                closeMenu()
              }
            }}
            aria-label={hideLabel}
            data-slot="map-button-sticky-menu-close"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              mb: 0.5,
              cursor: 'pointer',
              userSelect: 'none',
              opacity: 1,
              outline: 0,
              '&:hover': {
                opacity: 0.55,
              },
              '&:focus-visible, &[data-focus-visible="true"]': {
                outline: (theme) => `2px solid ${theme.palette.secondary.dark}`,
                outlineOffset: 2,
              },
            }}
          >
            {menuTitle ? (
              <Box
                component="span"
                sx={{
                  fontSize: '0.75rem',
                  lineHeight: 1.35,
                  fontWeight: 500,
                  textAlign: 'left',
                  color: 'text.primary',
                }}
              >
                {menuTitle}
              </Box>
            ) : (
              <Box sx={{ flex: 1 }} />
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', p: '5px' }}>
              <ArrowUp sx={{ color: 'text.primary' }} />
            </Box>
          </Box>
          <Box>{resolvedMenuContent}</Box>
        </MapButtonMenuSurface>
      </MapButtonMenuPositioner>
    </Popover.Root>
  )
}
