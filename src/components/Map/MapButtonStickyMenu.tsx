'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Box, IconButton, Paper, Popper, Tooltip } from '@mui/material'
import type { PopperPlacementType } from '@mui/material/Popper'
import type { SxProps, Theme } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'
import TuneIcon from '@mui/icons-material/Tune'

import { useTranslate } from '@tolgee/react'

import { ArrowUp } from '#/components/icons'
import { useUIStore } from '#/common/store'
import { IntoSlot } from '../context/slotsContext'
import { MapButton, MapButtonProps } from './MapButton'

type MapButtonStickyMenuProps = {
  children: React.ReactElement<MapButtonProps>
  menuContent?: React.ReactNode
  isVertical: boolean
  isActive: boolean
  paperSx?: SxProps<Theme>
  popperSx?: SxProps<Theme>
  placement?: PopperPlacementType
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
}: MapButtonStickyMenuProps) => {
  const { t } = useTranslate('avoin-map')
  const activeMapMenu = useUIStore((state) => state.activeMapMenu)

  const anchorRef = useRef<HTMLButtonElement | null>(null)
  const [open, setOpen] = useState(false)

  const hasMenuContent = React.Children.count(menuContent) > 0
  const childDisabled = Boolean(children.props.disabled)

  useEffect(() => {
    if (!isActive || !hasMenuContent) {
      setOpen(false)
    }
  }, [isActive, hasMenuContent])

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

  const handleCollapse = () => {
    setOpen(false)
  }

  const clonedChild = React.cloneElement(children, {
    onClick: handleChildClick,
  })

  return (
    <>
      {clonedChild}

      <IntoSlot name={STICKY_MENU_SLOT_NAME}>
        <MapButton
          ref={anchorRef}
          onClick={handleToggleFromIcon}
          size="small"
          tooltip={t('map.buttons.menu.show', 'Show menu')}
          isVertical={isVertical}
        >
          <TuneIcon />
        </MapButton>
      </IntoSlot>

      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement={placement ?? (isVertical ? 'left-start' : 'bottom-end')}
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 8],
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
            zIndex: theme.zIndex.drawer + 3,
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
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              mb: 0.5,
            }}
          >
            <Tooltip
              title={t('map.buttons.menu.hide', 'Hide menu')}
              placement="left"
            >
              <IconButton size="small" onClick={handleCollapse}>
                <ArrowUp sx={{ color: 'text.secondary' }} />
              </IconButton>
            </Tooltip>
          </Box>
          <Box>{menuContent}</Box>
        </Paper>
      </Popper>
    </>
  )
}
