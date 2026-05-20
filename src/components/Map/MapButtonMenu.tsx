'use client'

import React, { useEffect, useRef, useState, ReactElement } from 'react'
import { Box, ClickAwayListener, Paper, Popper } from '@mui/material'
import type { PopperPlacementType } from '@mui/material/Popper'
import type { SxProps, Theme } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'

import { MapButtonProps } from './MapButton'

type MenuContentRenderer = (helpers: { closeMenu: () => void }) => React.ReactNode

type MapButtonMenuProps = {
  children: ReactElement<MapButtonProps>
  menuContent?: React.ReactNode | MenuContentRenderer
  isVertical: boolean
  placement?: PopperPlacementType
  paperSx?: SxProps<Theme>
  popperSx?: SxProps<Theme>
}

export const MapButtonMenu = ({
  children,
  menuContent,
  isVertical,
  placement,
  paperSx,
  popperSx,
}: MapButtonMenuProps) => {
  const anchorRef = useRef<HTMLButtonElement | null>(null)
  const [open, setOpen] = useState(false)
  const closeMenu = () => setOpen(false)
  const resolvedMenuContent =
    typeof menuContent === 'function' ? menuContent({ closeMenu }) : menuContent

  const hasMenuContent = React.Children.count(resolvedMenuContent) > 0
  const childDisabled = Boolean(children.props.disabled)

  useEffect(() => {
    if (!hasMenuContent && open) {
      setOpen(false)
    }
  }, [hasMenuContent, open])

  useEffect(() => {
    if (childDisabled && open) {
      setOpen(false)
    }
  }, [childDisabled, open])

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
      ;(childRef as React.MutableRefObject<HTMLButtonElement | null>).current =
        node
    }
  }

  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (typeof originalOnClick === 'function') {
      originalOnClick(event)
    }

    if (childDisabled) return

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

  const clonedChild = React.cloneElement(children, {
    onClick: handleButtonClick,
    ref: setChildRef,
    'aria-haspopup': 'menu',
    'aria-expanded': open ? 'true' : undefined,
  })

  return (
    <>
      {clonedChild}
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement={placement ?? (isVertical ? 'left-end' : 'bottom-start')}
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
            }),
            ...(Array.isArray(paperSx) ? paperSx : [paperSx]),
          ]}
        >
          <ClickAwayListener onClickAway={handleClose}>
            <Box>{resolvedMenuContent}</Box>
          </ClickAwayListener>
        </Paper>
      </Popper>
    </>
  )
}
