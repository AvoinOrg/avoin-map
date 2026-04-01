'use client'

import React, { useCallback, useMemo, useRef, useState } from 'react'
import { Box, SxProps, Theme } from '@mui/material'
import { alpha } from '@mui/material/styles'
import type { EventListeners } from 'overlayscrollbars'

import {
  MOBILE_SIDEBAR_PADDING_REM,
  SIDEBAR_PADDING_REM,
} from '#/common/style/theme/constants'
import { useIsMobile } from '#/common/hooks/ui/useIsMobile'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import type { OverlayScrollbarsComponentRef } from 'overlayscrollbars-react'

const SIDEBAR_SCROLL_FADE_HEIGHT_REM = 3

const SidebarContentBox = ({
  sxOuter,
  sxInner,
  scrollFadeColor = '#f4f4f4',
  children,
}: {
  sxOuter?: SxProps<Theme>
  sxInner?: SxProps<Theme>
  scrollFadeColor?: string
  children?: React.ReactNode
}) => {
  const isMobile = useIsMobile()
  const scrollContainerRef = useRef<OverlayScrollbarsComponentRef<'div'> | null>(
    null
  )
  const [showScrollFade, setShowScrollFade] = useState(false)

  const updateScrollFade = useCallback(() => {
    const osInstance = scrollContainerRef.current?.osInstance()
    const viewport = osInstance?.elements().viewport

    if (!osInstance || !viewport) {
      setShowScrollFade(false)
      return
    }

    const nextShowScrollFade =
      osInstance.state().hasOverflow.y && viewport.scrollTop > 3

    setShowScrollFade((prev) =>
      prev === nextShowScrollFade ? prev : nextShowScrollFade
    )
  }, [])

  const scrollEvents = useMemo<EventListeners>(
    () => ({
      initialized: () => {
        updateScrollFade()
      },
      updated: () => {
        updateScrollFade()
      },
      scroll: () => {
        updateScrollFade()
      },
    }),
    [updateScrollFade]
  )

  return (
    <Box
      className="sidebar-children-container"
      sx={[
        {
          flexDirection: 'column',
          height: '100%',
          flexGrow: '1',
          minWidth: isMobile ? '100%' : '0',
          display: 'flex',
          minHeight: 0,
          maxWidth: '100%',
        },
        ...(Array.isArray(sxOuter) ? sxOuter : [sxOuter]),
      ]}
    >
      <Box sx={{ position: 'relative', flex: 1, minHeight: 0, height: '100%' }}>
        <OverlayScrollbarsComponent
          ref={scrollContainerRef}
          className="osScroll"
          options={{
            overflow: { x: 'hidden', y: 'scroll' },
            scrollbars: {
              theme: 'os-theme-dark',
              autoHide: 'leave',
              autoHideDelay: 600,
            },
          }}
          events={scrollEvents}
          style={{ flex: 1, minHeight: 0, height: '100%' }}
        >
          <Box
            className="sidebar-children-container-inner"
            sx={[
              {
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100%',
                flex: 1,
                p: SIDEBAR_PADDING_REM + 'rem',
                px: isMobile
                  ? MOBILE_SIDEBAR_PADDING_REM + 'rem'
                  : SIDEBAR_PADDING_REM + 'rem',
              },
              ...(Array.isArray(sxInner) ? sxInner : [sxInner]),
            ]}
          >
            {children}
          </Box>
        </OverlayScrollbarsComponent>
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: `${SIDEBAR_SCROLL_FADE_HEIGHT_REM}rem`,
            pointerEvents: 'none',
            opacity: showScrollFade ? 1 : 0,
            transition: 'opacity 180ms cubic-bezier(.2,0,.2,1)',
            background: `linear-gradient(180deg, ${alpha(scrollFadeColor, 0.98)} 0%, ${alpha(scrollFadeColor, 0.92)} 28%, ${alpha(scrollFadeColor, 0.72)} 52%, ${alpha(scrollFadeColor, 0.34)} 78%, ${alpha(scrollFadeColor, 0)} 100%)`,
          }}
        />
      </Box>
    </Box>
  )
}

export default SidebarContentBox
