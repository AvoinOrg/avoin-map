'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Box, SxProps, Theme } from '@mui/material'

import { useUIStore } from '#/common/store'
import { LoadingSpinner } from '../Loading'
import { Slot } from '../context/slotsContext'

type SidebarScaffoldProps = {
  children: React.ReactNode
  topContent?: React.ReactNode
  bottomContent?: React.ReactNode
  trailingContent?: React.ReactNode
  actionRail?: React.ReactNode
  hideMainContainer?: boolean
  containerSx?: SxProps<Theme>
  panelSx?: SxProps<Theme>
  contentSx?: SxProps<Theme>
}

const SidebarScaffold = ({
  children,
  topContent,
  bottomContent,
  trailingContent,
  actionRail,
  hideMainContainer = false,
  containerSx,
  panelSx,
  contentSx,
}: SidebarScaffoldProps) => {
  const isSidebarDisabled = useUIStore((state) => state.isSidebarDisabled)
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen)
  const isSidebarDrawerOpen = useUIStore((state) => state.isSidebarDrawerOpen)
  const setSidebarWidth = useUIStore((state) => state.setSidebarWidth)
  const isSidebarLoading = useUIStore((state) => state.isSidebarLoading)

  const sidebarRef = useRef<HTMLDivElement | null>(null)
  const sidebarContainerRef = useRef<HTMLDivElement | null>(null)
  const drawerSlotRef = useRef<HTMLDivElement | null>(null)

  const isSidebarDrawerOverlay = useUIStore(
    (state) => state.isSidebarDrawerOverlay
  )
  const setIsSidebarDrawerOverlay = useUIStore(
    (state) => state.setIsSidebarDrawerOverlay
  )
  const [overlayWidth, setOverlayWidth] = useState<number | null>(null)
  const [sidebarContainerWidth, setSidebarContainerWidth] = useState<number>(0)
  const isDrawerOverlayRef = useRef(isSidebarDrawerOverlay)
  const drawerNaturalWidthRef = useRef(0)

  const closeExtraDrawerWithSidebar = true

  const clearOverlay = useCallback(() => {
    if (isDrawerOverlayRef.current) {
      isDrawerOverlayRef.current = false
      setIsSidebarDrawerOverlay(false)
    }
    setOverlayWidth((prev) => (prev === null ? prev : null))
  }, [setIsSidebarDrawerOverlay])

  const applyOverlay = useCallback(
    (width: number) => {
      if (!isDrawerOverlayRef.current) {
        isDrawerOverlayRef.current = true
        setIsSidebarDrawerOverlay(true)
      }
      setOverlayWidth((prev) => (prev === width ? prev : width))
    },
    [setIsSidebarDrawerOverlay]
  )

  const getDrawerTransform = useCallback(
    (
      sidebarOpen: boolean,
      drawerOpen: boolean,
      isOverlay: boolean,
      panelWidth: number
    ) => {
      if (sidebarOpen && drawerOpen) {
        return 'translateX(0)'
      }

      if (isOverlay) {
        return 'translateX(-100%)'
      }

      return `translateX(calc(-100% - ${panelWidth}px))`
    },
    []
  )

  const evaluateLayout = useCallback(() => {
    const sidebarEl = sidebarRef.current
    const containerEl = sidebarContainerRef.current
    const slotEl = drawerSlotRef.current

    if (!sidebarEl || !containerEl || !slotEl) {
      drawerNaturalWidthRef.current = 0
      clearOverlay()
      return
    }

    const panelWidth = containerEl.getBoundingClientRect().width
    setSidebarContainerWidth(panelWidth)
    const wasOverlay = isDrawerOverlayRef.current
    const slotChild = slotEl.firstElementChild as HTMLElement | null
    const measuredSlotWidth = slotChild
      ? slotChild.getBoundingClientRect().width
      : slotEl.getBoundingClientRect().width

    if (measuredSlotWidth <= 0) {
      drawerNaturalWidthRef.current = 0
      clearOverlay()
      return
    }

    if (!wasOverlay || drawerNaturalWidthRef.current === 0) {
      drawerNaturalWidthRef.current = measuredSlotWidth
    }

    const naturalDrawerWidth =
      drawerNaturalWidthRef.current || measuredSlotWidth
    const slotWidthForDecision = wasOverlay
      ? naturalDrawerWidth
      : measuredSlotWidth

    const fallbackWidth = slotWidthForDecision + panelWidth
    const windowWidth =
      typeof window !== 'undefined' ? window.innerWidth : fallbackWidth
    const parentWidth = sidebarEl.parentElement?.getBoundingClientRect().width
    const availableWidth = Math.min(windowWidth, parentWidth ?? windowWidth)

    const totalWidth = panelWidth + slotWidthForDecision
    const shouldOverlay = totalWidth > availableWidth

    if (shouldOverlay) {
      const targetWidth = Math.min(
        availableWidth,
        Math.max(panelWidth, naturalDrawerWidth)
      )
      applyOverlay(targetWidth)
      return
    }

    drawerNaturalWidthRef.current = measuredSlotWidth
    clearOverlay()
  }, [applyOverlay, clearOverlay])

  useEffect(() => {
    const measure = () => {
      evaluateLayout()
      if (sidebarRef.current) {
        setSidebarWidth(sidebarRef.current.getBoundingClientRect().width)
      }
    }

    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            measure()
          })
        : null

    if (observer) {
      if (sidebarRef.current) {
        observer.observe(sidebarRef.current)
      }
      if (sidebarContainerRef.current) {
        observer.observe(sidebarContainerRef.current)
      }
      if (drawerSlotRef.current) {
        observer.observe(drawerSlotRef.current)
      }
    }

    window.addEventListener('resize', measure)
    measure()

    return () => {
      if (observer) {
        observer.disconnect()
      }
      window.removeEventListener('resize', measure)
    }
  }, [evaluateLayout, setSidebarWidth])

  useEffect(() => {
    evaluateLayout()
  }, [evaluateLayout, isSidebarDrawerOpen, isSidebarOpen])

  if (isSidebarDisabled) {
    return <>{children}</>
  }

  return (
    <Box
      ref={sidebarRef}
      sx={{
        zIndex: 'drawer',
        display: 'inline-flex',
        flexDirection: 'row',
        height: '100%',
        width: 'max-content',
        maxWidth: '100%',
        minWidth: 0,
        minHeight: 0,
        position: 'relative',
        boxSizing: 'border-box',
        pointerEvents: 'none',
      }}
    >
      <Box
        className="sidebar-container"
        ref={sidebarContainerRef}
        sx={[
          (theme: Theme) => ({
            display: hideMainContainer ? 'none' : 'flex',
            flexDirection: 'column',
            flex: '0 0 auto',
            width: { mobile: '100vw', desktop: '30rem' },
            maxWidth: {
              mobile: '100vw',
              desktop: 'min(30rem, calc(100vw - 2rem))',
            },
            flexShrink: 0,
            minWidth: 0,
            height: '100%',
            minHeight: 0,
            zIndex: theme.zIndex.drawer + 1,
            pt: { mobile: 0, desktop: 2 },
            pb: { mobile: 0, desktop: 2 },
            ml: { mobile: 0, desktop: 2 },
            pointerEvents: isSidebarOpen ? 'auto' : 'none',
            transform: isSidebarOpen
              ? 'translateX(0)'
              : {
                  mobile: 'translateX(calc(-100% - 4px))',
                  desktop: `translateX(calc(-100% - ${theme.spacing(2)} - 4px))`,
                },
            transition: isSidebarOpen
              ? 'transform 220ms cubic-bezier(.2,0,.2,1), visibility 0ms linear 0ms'
              : 'transform 220ms cubic-bezier(.2,0,.2,1), visibility 0ms linear 220ms',
            willChange: 'transform',
            visibility: isSidebarOpen ? 'visible' : 'hidden',
          }),
          ...(Array.isArray(containerSx) ? containerSx : [containerSx]),
        ]}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            flex: 1,
            minHeight: 0,
          }}
        >
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              overflow: 'hidden',
              boxSizing: 'border-box',
            }}
          >
            <Box
              sx={[
                {
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  minWidth: 0,
                  whiteSpace: 'normal',
                  borderRadius: { mobile: 0, desktop: '10px' },
                  overflow: 'hidden',
                  backgroundColor: '#f4f4f4',
                  boxShadow: 'none',
                },
                ...(Array.isArray(panelSx) ? panelSx : [panelSx]),
              ]}
            >
              {topContent}
              {isSidebarLoading && (
                <Box
                  sx={(theme) => ({
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: theme.zIndex.drawer + 10,
                    borderRadius: 'inherit',
                  })}
                >
                  <LoadingSpinner size="5rem" />
                </Box>
              )}
              <Box
                sx={[
                  {
                    overflow: 'auto',
                    display: 'flex',
                    flexGrow: 1,
                    backgroundColor: '#f4f4f4',
                  },
                  ...(Array.isArray(contentSx) ? contentSx : [contentSx]),
                ]}
              >
                {children}
              </Box>
              {bottomContent && (
                <Box
                  sx={{
                    flexShrink: 0,
                    backgroundColor: '#f4f4f4',
                  }}
                >
                  {bottomContent}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
      {trailingContent}
      <Box
        ref={drawerSlotRef}
        className="sidebar-drawer-container"
        sx={[
          (theme: Theme) => ({
            display: 'flex',
            flex: 1,
            alignItems: 'stretch',
            pointerEvents: isSidebarOpen ? 'auto' : 'none',
            position: 'relative',
            minHeight: 0,
            zIndex: theme.zIndex.drawer - 1,
            transform: getDrawerTransform(
              isSidebarOpen,
              isSidebarDrawerOpen,
              isSidebarDrawerOverlay,
              sidebarContainerWidth
            ),
            transition: 'transform 220ms cubic-bezier(.2,0,.2,1)',
            willChange: 'transform',
          }),
          isSidebarDrawerOverlay &&
            ((theme: Theme) => ({
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: overlayWidth != null ? `${overlayWidth}px` : '100%',
              zIndex: theme.zIndex.drawer + 2,
              pointerEvents: 'auto',
              '& > *': {
                width: '100%',
                maxWidth: '100%',
              },
            })),
          !isSidebarOpen &&
            closeExtraDrawerWithSidebar && {
              pointerEvents: 'none',
            },
        ]}
      >
        <Slot name="sidebar-drawer" />
      </Box>
      {actionRail}
    </Box>
  )
}

export default SidebarScaffold
