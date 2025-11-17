'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Box,
  ClickAwayListener,
  IconButton,
  Paper,
  Tooltip,
} from '@mui/material'
import TuneIcon from '@mui/icons-material/Tune'

import { useTranslate } from '@tolgee/react'

import { ArrowUp } from '#/components/icons'
import { useUIStore } from '#/common/store'
import {
  MAP_SEARCH_BAR_HORIZONTAL_MODE_WIDTH,
  MAP_SEARCH_BAR_VERTICAL_MODE_WIDTH,
} from './MapSearchBar'
import { MapButton, MapButtonProps } from './MapButton'

type Props = {
  children: React.ReactElement<MapButtonProps>
  menuContent?: React.ReactNode
  isVertical: boolean
  paperProps?: React.ComponentProps<typeof Paper>
}

const EDGE_SPACING_PX = 16 // matches MapActionsWrapper spacing(2)
const GAP_PX = 8

export const MapButtonStickyMenu = ({
  children,
  menuContent,
  isVertical,
  paperProps,
}: Props) => {
  const { t } = useTranslate('avoin-map')
  const activeMapMenu = useUIStore((state) => state.activeMapMenu)

  const anchorRef = useRef<HTMLButtonElement | null>(null)
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null)
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const hasMenuContent = React.Children.count(menuContent) > 0
  const childDisabled = Boolean(children.props.disabled)

  useEffect(() => {
    if (!hasMenuContent && open) {
      setOpen(false)
    }
  }, [hasMenuContent, open])

  useEffect(() => {
    if (isVertical && activeMapMenu === 'search') {
      setOpen(false)
      setCollapsed(true)
    }
  }, [activeMapMenu, isVertical])

  useEffect(() => {
    const updateRect = () => {
      if (!anchorRef.current) return
      setAnchorRect(anchorRef.current.getBoundingClientRect())
    }

    updateRect()
    window.addEventListener('resize', updateRect)
    return () => window.removeEventListener('resize', updateRect)
  }, [])

  if (!hasMenuContent) return children

  const originalOnClick = children.props.onClick
  const childRef = (children as React.ReactElement & {
    ref?: React.Ref<HTMLButtonElement>
  }).ref

  const setChildRef = (node: HTMLButtonElement | null) => {
    anchorRef.current = node
    if (!childRef) return
    if (typeof childRef === 'function') {
      childRef(node)
    } else if (typeof childRef === 'object') {
      ;(childRef as React.MutableRefObject<HTMLButtonElement | null>).current =
        node
    }
  }

  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (typeof originalOnClick === 'function') {
      originalOnClick(event)
    }

    if (childDisabled) return

    setCollapsed(false)
    setOpen((prev) => !prev)
  }

  const handleClose = (event: MouseEvent | TouchEvent) => {
    if (
      anchorRef.current &&
      event.target instanceof HTMLElement &&
      anchorRef.current.contains(event.target)
    ) {
      return
    }
    setOpen(false)
  }

  const handleCollapse = () => {
    setOpen(false)
    setCollapsed(true)
  }

  const handleExpandFromToggle = () => {
    if (childDisabled) return
    setCollapsed(false)
    setOpen(true)
  }

  const clonedChild = React.cloneElement(children, {
    onClick: handleButtonClick,
    ref: setChildRef,
    'aria-haspopup': 'menu',
    'aria-expanded': open ? 'true' : undefined,
  })

  const searchWidthPx = isVertical
    ? activeMapMenu === 'search'
      ? MAP_SEARCH_BAR_HORIZONTAL_MODE_WIDTH
      : MAP_SEARCH_BAR_VERTICAL_MODE_WIDTH
    : 0

  const menuPosition = useMemo(() => {
    if (isVertical) {
      const anchorLeft = anchorRect?.left
      const right = anchorLeft
        ? window.innerWidth - anchorLeft + GAP_PX
        : EDGE_SPACING_PX
      return {
        top: EDGE_SPACING_PX,
        right,
      }
    }

    const anchorBottom = anchorRect?.bottom
    const top =
      (anchorBottom ?? EDGE_SPACING_PX + 40) + // fallback with button height
      GAP_PX
    return {
      top,
      right: EDGE_SPACING_PX,
    }
  }, [anchorRect, isVertical])

  const collapsedButtonPosition = useMemo(() => {
    if (isVertical) {
      return {
        top: EDGE_SPACING_PX,
        right: EDGE_SPACING_PX + searchWidthPx + GAP_PX,
      }
    }

    const anchorBottom = anchorRect?.bottom
    const top =
      (anchorBottom ?? EDGE_SPACING_PX + 40) + // fallback with button height
      GAP_PX
    return {
      top,
      right: EDGE_SPACING_PX,
    }
  }, [anchorRect, isVertical, searchWidthPx])

  return (
    <>
      {clonedChild}

      {collapsed && (
        <Box
          sx={{
            position: 'fixed',
            zIndex: (theme) => theme.zIndex.mapButtons + 1,
            pointerEvents: 'auto',
            ...collapsedButtonPosition,
          }}
        >
          <MapButton
            onClick={handleExpandFromToggle}
            size="small"
            tooltip={t('map.buttons.menu.show', 'Show menu')}
            isVertical={isVertical}
          >
            <TuneIcon />
          </MapButton>
        </Box>
      )}

      {!collapsed && open && (
        <Box
          sx={{
            position: 'fixed',
            top: menuPosition.top,
            right: menuPosition.right,
            zIndex: (theme) => theme.zIndex.mapButtons + 2,
            pointerEvents: 'auto',
          }}
        >
          <ClickAwayListener onClickAway={handleClose}>
            <Paper
              elevation={3}
              {...paperProps}
              sx={[
                {
                  maxWidth: `calc(100vw - ${EDGE_SPACING_PX * 2}px)`,
                  maxHeight: `calc(100vh - ${EDGE_SPACING_PX * 2}px)`,
                  overflowY: 'auto',
                  p: '1rem',
                  borderRadius: '0.3125rem',
                  position: 'relative',
                },
                paperProps?.sx,
              ]}
            >
              <Box sx={{ position: 'relative', minWidth: '12rem' }}>
                <Box
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
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
                {menuContent}
              </Box>
            </Paper>
          </ClickAwayListener>
        </Box>
      )}
    </>
  )
}
