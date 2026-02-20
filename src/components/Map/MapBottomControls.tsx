'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import DOMPurify from 'dompurify'
import { Box, Button } from '@mui/material'
import { useMapStore, useUIStore } from '#/common/store'
import { useMapInstanceStore } from '#/common/store/mapStore/mapInstanceStore'
import { useIsMobile } from '#/common/hooks/ui/useIsMobile'
import { Cookie, AttributionInfo } from '#/components/icons'

const MAX_PANEL_WIDTH_FALLBACK_PX = 480

const MapBottomControls = () => {
  const _map = useMapInstanceStore((state) => state._map)
  const mapAttributionHtml = useMapStore((state) => state.mapAttributionHtml)
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen)
  const sidebarWidth = useUIStore((state) => state.sidebarWidth)
  const isMobile = useIsMobile('desktop')

  const [isPanelOpen, setIsPanelOpen] = useState(true)
  const [panelMaxWidth, setPanelMaxWidth] = useState<number>(
    MAX_PANEL_WIDTH_FALLBACK_PX
  )
  const [panelLeftOffset, setPanelLeftOffset] = useState<number>(84)
  const controlsRef = useRef<HTMLDivElement | null>(null)
  const buttonRowRef = useRef<HTMLDivElement | null>(null)

  const sanitizedAttributionHtml = useMemo(
    () =>
      DOMPurify.sanitize(mapAttributionHtml || '', {
        ADD_ATTR: ['target', 'rel'],
      }),
    [mapAttributionHtml]
  )

  const spacingLeftPx = isMobile ? 16 : 8
  const spacingBottomPx = 16
  const panelGapPx = 8

  const leftOffsetPx = isMobile
    ? spacingLeftPx
    : isSidebarOpen
      ? (sidebarWidth ?? 0) + spacingLeftPx
      : spacingLeftPx

  const updateMaxWidth = useCallback(() => {
    const controlsEl = controlsRef.current
    const buttonRowEl = buttonRowRef.current

    if (!controlsEl || !buttonRowEl || typeof window === 'undefined') {
      return
    }

    const controlsRect = controlsEl.getBoundingClientRect()
    const buttonRowRect = buttonRowEl.getBoundingClientRect()
    const nextPanelLeftOffset = Math.floor(buttonRowRect.width + panelGapPx)

    setPanelLeftOffset((prev) =>
      prev === nextPanelLeftOffset ? prev : nextPanelLeftOffset
    )

    const panelStartX = controlsRect.left + nextPanelLeftOffset
    const sidebarToggleButton = document.querySelector(
      '.sidebar-toggle-button'
    ) as HTMLElement | null

    if (sidebarToggleButton) {
      const toggleRect = sidebarToggleButton.getBoundingClientRect()
      const availableWidth = Math.floor(toggleRect.left - panelStartX - panelGapPx)

      setPanelMaxWidth(
        Math.min(MAX_PANEL_WIDTH_FALLBACK_PX, Math.max(0, availableWidth))
      )
      return
    }

    const viewportWidth = window.innerWidth
    const fallbackWidth = Math.floor(viewportWidth - panelStartX - spacingLeftPx)

    setPanelMaxWidth(
      Math.min(MAX_PANEL_WIDTH_FALLBACK_PX, Math.max(0, fallbackWidth))
    )
  }, [panelGapPx, spacingLeftPx])

  useEffect(() => {
    const closePanel = () => {
      setIsPanelOpen(false)
    }

    if (!_map) {
      return
    }

    _map.on('click', closePanel)
    _map.on('dragstart', closePanel)
    _map.on('zoomstart', closePanel)
    _map.on('rotatestart', closePanel)
    _map.on('pitchstart', closePanel)

    return () => {
      _map.off('click', closePanel)
      _map.off('dragstart', closePanel)
      _map.off('zoomstart', closePanel)
      _map.off('rotatestart', closePanel)
      _map.off('pitchstart', closePanel)
    }
  }, [_map])

  useEffect(() => {
    updateMaxWidth()

    window.addEventListener('resize', updateMaxWidth)
    return () => {
      window.removeEventListener('resize', updateMaxWidth)
    }
  }, [updateMaxWidth, isMobile, isSidebarOpen, sidebarWidth, isPanelOpen])

  return (
    <Box
      ref={controlsRef}
      sx={(theme) => ({
        position: 'fixed',
        left: leftOffsetPx,
        bottom: spacingBottomPx,
        pointerEvents: 'none',
        zIndex: theme.zIndex.mapButtons,
        transition:
          'left 220ms cubic-bezier(.2,0,.2,1), bottom 220ms cubic-bezier(.2,0,.2,1)',
      })}
    >
      {isPanelOpen && sanitizedAttributionHtml && (
        <Box
          sx={(theme) => ({
            position: 'absolute',
            left: `${panelLeftOffset}px`,
            bottom: 0,
            pointerEvents: 'auto',
            width: `${panelMaxWidth}px`,
            maxWidth: panelMaxWidth,
            px: theme.spacing(1),
            py: theme.spacing(0.5),
            borderRadius: '0.3125rem',
            color: '#FFFFFF',
            backgroundColor: '#4F4F4F',
            boxShadow: 'inset 2px 2px 2px rgba(0, 0, 0, 0.1)',
            fontSize: '0.5rem',
            lineHeight: 1.1,
            letterSpacing: '0.05rem',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            '& a': {
              color: '#FFFFFF',
              fontSize: 'inherit',
              textDecoration: 'underline',
            },
          })}
          dangerouslySetInnerHTML={{ __html: sanitizedAttributionHtml }}
        />
      )}
      <Box
        ref={buttonRowRef}
        sx={(theme) => ({
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing(1),
          pointerEvents: 'auto',
        })}
      >
        <Button
          type="button"
          aria-label="Cookie settings"
          disabled={true}
          tabIndex={-1}
          sx={(theme) => ({
            width: '2.125rem',
            minWidth: '2.125rem',
            height: '2.125rem',
            border: 0,
            p: 0,
            borderRadius: '0.3125rem',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(79, 79, 79, 0.55)',
            backgroundColor: 'rgba(244, 244, 244, 0.9)',
            boxShadow: 'inset 2px 2px 2px rgba(177, 177, 177, 0.25)',
            opacity: 0.75,
            '&.Mui-disabled': {
              color: 'rgba(79, 79, 79, 0.55)',
              backgroundColor: 'rgba(244, 244, 244, 0.9)',
              opacity: 0.75,
            },
            '& svg': {
              width: '1.15rem',
              height: '1.15rem',
            },
          })}
        >
          <Cookie />
        </Button>
        <Button
          type="button"
          onClick={() => setIsPanelOpen((prev) => !prev)}
          aria-label="Toggle attribution information"
          sx={{
            width: '2.125rem',
            minWidth: '2.125rem',
            height: '2.125rem',
            border: 0,
            p: 0,
            borderRadius: '0.3125rem',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(79, 79, 79, 0.85)',
            backgroundColor: 'rgba(244, 244, 244, 0.9)',
            boxShadow: 'inset 2px 2px 2px rgba(177, 177, 177, 0.25)',
            '& svg': {
              width: '1.15rem',
              height: '1.15rem',
            },
          }}
        >
          <AttributionInfo />
        </Button>
      </Box>
    </Box>
  )
}

export default MapBottomControls
