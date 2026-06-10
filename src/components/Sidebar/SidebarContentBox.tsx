'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { EventListeners } from 'overlayscrollbars'

import type { PandaStyleProp } from '#/common/style/panda'
import {
  MOBILE_SIDEBAR_PADDING_REM,
  SIDEBAR_PADDING_REM,
} from '#/common/style/theme/constants'
import { useIsMobile } from '#/common/hooks/ui/useIsMobile'
import { Box } from '#/components/common/PandaBox'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import type { OverlayScrollbarsComponentRef } from 'overlayscrollbars-react'
import { useSimpleSidebarContext } from './SimpleSidebarContext'

const SIDEBAR_SCROLL_FADE_HEIGHT_REM = 3

const withAlpha = (color: string, opacity: number) => {
  const hex = color.trim()
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex)

  if (!match) {
    return color
  }

  const raw = match[1]
  const expanded =
    raw.length === 3
      ? raw
          .split('')
          .map((char) => `${char}${char}`)
          .join('')
      : raw
  const int = Number.parseInt(expanded, 16)
  const r = (int >> 16) & 255
  const g = (int >> 8) & 255
  const b = int & 255

  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

const SidebarContentBox = ({
  outerStyleProps,
  innerStyleProps,
  scrollFadeColor = '#f4f4f4',
  scrollbarSide = 'right',
  children,
}: {
  outerStyleProps?: PandaStyleProp
  innerStyleProps?: PandaStyleProp
  scrollFadeColor?: string
  scrollbarSide?: 'left' | 'right'
  children?: React.ReactNode
}) => {
  const isMobile = useIsMobile()
  const simpleSidebarContext = useSimpleSidebarContext()
  const isSimpleSidebar = simpleSidebarContext.isSimpleSidebar
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

  useEffect(() => {
    updateScrollFade()
  }, [isSimpleSidebar, updateScrollFade])

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
      styleProps={[
        {
          flexDirection: 'column',
          height: '100%',
          flexGrow: '1',
          minWidth: isMobile ? '100%' : '0',
          display: 'flex',
          minHeight: 0,
          maxWidth: '100%',
        },
        ...(Array.isArray(outerStyleProps) ? outerStyleProps : [outerStyleProps]),
      ]}
    >
      <Box
        styleProps={{
          position: 'relative',
          flex: 1,
          minHeight: 0,
          height: '100%',
          ...(scrollbarSide === 'left' && {
            '& .os-scrollbar-vertical': {
              left: 0,
              right: 'auto',
            },
            '& .os-scrollbar-corner': {
              left: 0,
              right: 'auto',
            },
          }),
        }}
      >
        <OverlayScrollbarsComponent
          ref={scrollContainerRef}
          className={`osScroll${scrollbarSide === 'left' ? ' osLeft' : ''}`}
          options={{
            overflow: { x: 'hidden', y: 'scroll' },
            scrollbars: {
              theme: 'os-theme-dark',
              autoHide: 'leave',
              autoHideDelay: 600,
            },
          }}
          events={scrollEvents}
          style={{
            flex: 1,
            minHeight: 0,
            height: '100%',
            direction: scrollbarSide === 'left' ? 'rtl' : 'ltr',
          }}
        >
          <Box
            className="sidebar-children-container-inner"
            styleProps={[
              {
                direction: 'ltr',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100%',
                flex: 1,
                p: SIDEBAR_PADDING_REM + 'rem',
                px: isMobile
                  ? MOBILE_SIDEBAR_PADDING_REM + 'rem'
                  : SIDEBAR_PADDING_REM + 'rem',
              },
              ...(Array.isArray(innerStyleProps) ? innerStyleProps : [innerStyleProps]),
            ]}
          >
            {simpleSidebarContext.mobileStackedContentBefore}
            {children}
            {simpleSidebarContext.mobileStackedContentAfter}
          </Box>
        </OverlayScrollbarsComponent>
        <Box
          aria-hidden="true"
          styleProps={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: isSimpleSidebar ? '1px' : `${SIDEBAR_SCROLL_FADE_HEIGHT_REM}rem`,
            pointerEvents: 'none',
            opacity: showScrollFade ? 1 : 0,
            transition: 'opacity 180ms cubic-bezier(.2,0,.2,1)',
            ...(isSimpleSidebar
              ? {
                  overflow: 'visible',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    boxShadow: '0 4px 10px rgba(17, 17, 17, 0.05)',
                  },
                }
              : {
                  background: `linear-gradient(180deg, ${withAlpha(scrollFadeColor, 0.98)} 0%, ${withAlpha(scrollFadeColor, 0.92)} 28%, ${withAlpha(scrollFadeColor, 0.72)} 52%, ${withAlpha(scrollFadeColor, 0.34)} 78%, ${withAlpha(scrollFadeColor, 0)} 100%)`,
                }),
          }}
        />
      </Box>
    </Box>
  )
}

export default SidebarContentBox
