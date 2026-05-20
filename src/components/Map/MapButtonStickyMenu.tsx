'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  Box,
  Paper,
  Popper,
  Tooltip,
  Typography,
} from '@mui/material'
import type { PopperPlacementType } from '@mui/material/Popper'
import type { SxProps, Theme } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'
import TuneIcon from '@mui/icons-material/Tune'

import { useTranslate } from '@tolgee/react'

import { ArrowUp } from '#/components/icons'
import { useUIStore } from '#/common/store'
import { IntoSlot } from '../context/slotsContext'
import { MAP_BUTTON_SIZE, MapButton, MapButtonProps } from './MapButton'

type MenuContentRenderer = (helpers: {
  closeMenu: () => void
}) => React.ReactNode

type MapButtonStickyMenuProps = {
  children: React.ReactElement<MapButtonProps>
  menuContent?: React.ReactNode | MenuContentRenderer
  isVertical: boolean
  isActive: boolean
  paperSx?: SxProps<Theme>
  popperSx?: SxProps<Theme>
  placement?: PopperPlacementType
  showTooltip?: string
  menuTitle?: string
}

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

  const anchorRef = useRef<HTMLButtonElement | null>(null)
  const childDisabled = Boolean(children.props.disabled)
  const hasRawMenuContent =
    typeof menuContent === 'function'
      ? true
      : React.Children.count(menuContent) > 0
  const [open, setOpen] = useState(
    () => isActive && hasRawMenuContent && !childDisabled
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
    if (!hasMenuContent || childDisabled) {
      setOpen(false)
      return
    }
    setOpen(isActive)
  }, [isActive, hasMenuContent, childDisabled])

  useEffect(() => {
    if (isVertical && activeMapMenu === 'search') {
      setOpen(false)
    }
  }, [activeMapMenu, isVertical])

  useEffect(() => {
    if (
      activeMapMenu === 'backgroundLayers' ||
      activeMapMenu === 'backgroundOverlayLayers'
    ) {
      setOpen(false)
    }
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

    setOpen((prev) => !prev)
  }

  const handleToggleFromIcon = () => {
    if (childDisabled) return
    setOpen((prev) => !prev)
  }

  const clonedChild = React.cloneElement(children, {
    onClick: handleChildClick,
  })

  const anchorEl =
    typeof document !== 'undefined' && anchorRef.current
      ? document.body.contains(anchorRef.current)
        ? anchorRef.current
        : null
      : anchorRef.current

  const isSearchOpenVertical = isVertical && activeMapMenu === 'search'
  const effectiveOpen = open && !isSearchOpenVertical && Boolean(anchorEl)
  const hideLabel = t('map.menu.hide')

  return (
    <>
      {clonedChild}

      <IntoSlot name={STICKY_MENU_SLOT_NAME}>
        <Box
          sx={{
            visibility: open ? 'hidden' : 'visible',
          }}
        >
          <MapButton
            ref={anchorRef}
            onClick={handleToggleFromIcon}
            size="small"
            tooltip={showTooltip ?? t('map.buttons.menu.show')}
            isVertical={isVertical}
          >
            <TuneIcon />
          </MapButton>
        </Box>
      </IntoSlot>

      <Popper
        open={effectiveOpen}
        anchorEl={anchorEl}
        placement={placement ?? (isVertical ? 'bottom-end' : 'bottom-start')}
        modifiers={[
          {
            name: 'offset',
            options: {
              // Move popper up by button height so it visually
              // replaces the toggle button instead of appearing below it.
              offset: [0, -MAP_BUTTON_SIZE],
            },
          },
          {
            name: 'flip',
            enabled: false,
          },
          {
            name: 'preventOverflow',
            options: {
              padding: 16,
              tether: false,
            },
          },
        ]}
        sx={[
          (theme) => ({
            zIndex: theme.zIndex.drawer - 1,
          }),
          ...(Array.isArray(popperSx) ? popperSx : [popperSx]),
        ]}
      >
        <Paper
          sx={[
            (theme) => ({
              maxWidth: `calc(100vw - 78px)`,
              maxHeight: isVertical
                ? `calc(100vh - 32px)`
                : 'calc(100vh - 78px)',
              overflowY: 'auto',
              p: '1rem',
              backgroundColor: isVertical
                ? theme.palette.neutral.light
                : alpha(theme.palette.neutral.light, 0.9),
              borderRadius: '0.3125rem',
              width: 'fit-content',
              position: 'relative',
            }),
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
            sx={{
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
              <Typography
                variant="body7"
                sx={{ fontWeight: 500, textAlign: 'left', color: 'text.primary' }}
              >
                {menuTitle}
              </Typography>
            ) : (
              <Box sx={{ flex: 1 }} />
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', p: '5px' }}>
              <ArrowUp sx={{ color: 'text.primary' }} />
            </Box>
          </Box>
          <Box>{resolvedMenuContent}</Box>
        </Paper>
      </Popper>
    </>
  )
}
