'use client'

import React, { useRef, useState } from 'react'

import { useTranslate } from '@tolgee/react'

import type { PandaStyleProp } from '#/common/style/panda'
import { Box } from '#/components/common/PandaBox'
import { ArrowUp, Tune } from '#/components/icons'
import { useUIStore } from '#/common/store'
import { IntoSlot } from '../context/slotsContext'
import { MAP_BUTTON_SIZE, MapButton, MapButtonProps } from './MapButton'
import MapFloatingPanel, { type MapFloatingPlacement } from './MapFloatingPanel'

type MenuContentRenderer = (helpers: {
  closeMenu: () => void
}) => React.ReactNode

type MapButtonStickyMenuProps = {
  children: React.ReactElement<MapButtonProps>
  menuContent?: React.ReactNode | MenuContentRenderer
  isVertical: boolean
  isActive: boolean
  paperSx?: PandaStyleProp
  popperSx?: PandaStyleProp
  placement?: MapFloatingPlacement
  showTooltip?: string
  menuTitle?: string
}

type MapButtonClickEvent = Parameters<NonNullable<MapButtonProps['onClick']>>[0]

const STICKY_MENU_SLOT_NAME = 'map-sticky-menu-toggle'

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
}: MapButtonStickyMenuProps) => {
  const { t } = useTranslate('avoin-map')
  const activeMapMenu = useUIStore((state) => state.activeMapMenu)

  const wasActiveRef = useRef(false)
  const [anchorElement, setAnchorElement] = useState<HTMLButtonElement | null>(
    null
  )
  const childDisabled = Boolean(children.props.disabled)
  const [requestedOpen, setRequestedOpen] = useState(true)
  const closeMenu = React.useCallback(() => {
    setRequestedOpen(false)
  }, [])
  const resolvedMenuContent = React.useMemo(() => {
    if (typeof menuContent === 'function') {
      return menuContent({ closeMenu })
    }
    return menuContent
  }, [menuContent, closeMenu])
  const hasMenuContent = React.Children.count(resolvedMenuContent) > 0
  const suppressedByActiveMapMenu =
    (isVertical && activeMapMenu === 'search') ||
    activeMapMenu === 'backgroundLayers' ||
    activeMapMenu === 'backgroundOverlayLayers'
  React.useEffect(() => {
    const isEnteringActiveMode = isActive && !wasActiveRef.current
    wasActiveRef.current = isActive

    if (
      !isActive ||
      !hasMenuContent ||
      childDisabled ||
      suppressedByActiveMapMenu
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Keep local hide/show intent synchronized with external draw/menu activation.
      setRequestedOpen(false)
      return
    }

    if (isEnteringActiveMode) {
      setRequestedOpen(true)
    }
  }, [childDisabled, hasMenuContent, isActive, suppressedByActiveMapMenu])

  const open =
    requestedOpen &&
    isActive &&
    hasMenuContent &&
    !childDisabled &&
    !suppressedByActiveMapMenu
  const setAnchorRef = React.useCallback((node: HTMLButtonElement | null) => {
    setAnchorElement((current) => (current === node ? current : node))
  }, [])
  const getAnchor = React.useCallback(() => {
    if (
      typeof document !== 'undefined' &&
      anchorElement &&
      !document.body.contains(anchorElement)
    ) {
      return null
    }

    return anchorElement
  }, [anchorElement])

  if (!isActive || !hasMenuContent) {
    return children
  }

  const originalOnClick = children.props.onClick

  const handleChildClick = (event: MapButtonClickEvent) => {
    if (typeof originalOnClick === 'function') {
      originalOnClick(event)
    }

    if (childDisabled) return

    setRequestedOpen((prev) => !prev)
  }

  const handleToggleFromIcon = () => {
    if (childDisabled) return
    setRequestedOpen((prev) => !prev)
  }

  const clonedChild = React.cloneElement(children, {
    onClick: handleChildClick,
  })

  const hideLabel = t('map.menu.hide')

  return (
    <>
      {clonedChild}

      <IntoSlot name={STICKY_MENU_SLOT_NAME}>
        <Box
          styleProps={{
            visibility: open ? 'hidden' : 'visible',
          }}
        >
          <MapButton
            ref={setAnchorRef}
            onClick={handleToggleFromIcon}
            size="small"
            tooltip={showTooltip ?? t('map.buttons.menu.show')}
            isVertical={isVertical}
          >
            <Tune />
          </MapButton>
        </Box>
      </IntoSlot>

      <MapFloatingPanel
        open={open}
        anchor={getAnchor}
        placement={placement ?? (isVertical ? 'bottom-end' : 'bottom-start')}
        offset={[0, -MAP_BUTTON_SIZE]}
        collisionPadding={16}
        onClose={closeMenu}
        positionerSx={[
          { zIndex: 'calc(var(--z-index-drawer) - 1)' },
          ...(Array.isArray(popperSx) ? popperSx : [popperSx]),
        ]}
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
            position: 'relative',
          },
          ...(Array.isArray(paperSx) ? paperSx : [paperSx]),
        ]}
      >
        <Box
          role="button"
          tabIndex={0}
          onClick={closeMenu}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') closeMenu()
          }}
          aria-label={hideLabel}
          styleProps={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            mb: 0.5,
            cursor: 'pointer',
            userSelect: 'none',
            opacity: 1,
            '&:hover': {
              opacity: 0.55,
            },
          }}
        >
          {menuTitle ? (
            <Box
              component="span"
              styleProps={{
                textStyle: 'body7',
                fontWeight: 500,
                textAlign: 'left',
                color: 'neutral.darker',
              }}
            >
              {menuTitle}
            </Box>
          ) : (
            <Box styleProps={{ flex: 1 }} />
          )}
          <Box styleProps={{ display: 'flex', alignItems: 'center', p: '5px' }}>
            <ArrowUp styleProps={{ color: 'neutral.darker' }} />
          </Box>
        </Box>
        <Box>{resolvedMenuContent}</Box>
      </MapFloatingPanel>
    </>
  )
}
