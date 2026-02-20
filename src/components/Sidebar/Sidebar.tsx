'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Box, SxProps, Theme } from '@mui/material'

import { useUIStore } from '#/common/store'
import { LoadingSpinner } from '../Loading'
import { Slot, useSlotContent } from '../context/slotsContext'
import SidebarHeader from './SidebarHeader'
import SidebarToggleButton from './SidebarToggleButton'

export const Sidebar = ({
  sx,
  children,
}: {
  sx?: SxProps<Theme>
  children: React.ReactNode
}) => {
  const isSidebarDisabled = useUIStore((state) => state.isSidebarDisabled)
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen)
  const isSidebarDrawerOpen = useUIStore((state) => state.isSidebarDrawerOpen)
  const setSidebarWidth = useUIStore((state) => state.setSidebarWidth)
  const isSidebarLoading = useUIStore((state) => state.isSidebarLoading)
  const sidebarHeaderConfig = useUIStore((state) => state.sidebarHeaderConfig)

  const hasCustomHeader = useSlotContent('sidebar-header')

  // If sidebar is disabled, just return children without any sidebar wrapper
  if (isSidebarDisabled) {
    return <>{children}</>
  }

  // const popupOpts = useMapStore((state) => state.popupOpts)

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

  // Close the extra drawer when the sidebar is closed.
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
      containerWidth: number
    ) => {
      // Drawer is visible - no transform needed
      if (sidebarOpen && drawerOpen) {
        return 'translateX(0)'
      }

      // Drawer is hidden
      // In overlay mode: slide just offscreen
      // In side-by-side mode: slide offscreen + sidebar width
      if (isOverlay) {
        return 'translateX(-100%)'
      } else {
        return `translateX(calc(-100% - ${containerWidth}px))`
      }
    },
    []
  )

  const evaluateLayout = useCallback(() => {
    // if (!isSidebarOpen || !isSidebarDrawerOpen) {
    //   clearOverlay()
    //   return
    // }

    const sidebarEl = sidebarRef.current
    const containerEl = sidebarContainerRef.current
    const slotEl = drawerSlotRef.current

    if (!sidebarEl || !containerEl || !slotEl) {
      drawerNaturalWidthRef.current = 0
      clearOverlay()
      return
    }

    const containerWidth = containerEl.getBoundingClientRect().width
    setSidebarContainerWidth(containerWidth)
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

    const fallbackWidth = slotWidthForDecision + containerWidth
    const windowWidth =
      typeof window !== 'undefined' ? window.innerWidth : fallbackWidth
    const parentWidth = sidebarEl.parentElement?.getBoundingClientRect().width
    const availableWidth = Math.min(windowWidth, parentWidth ?? windowWidth)

    const totalWidth = containerWidth + slotWidthForDecision
    const shouldOverlay = totalWidth > availableWidth

    if (shouldOverlay) {
      const targetWidth = Math.min(
        availableWidth,
        Math.max(containerWidth, naturalDrawerWidth)
      )
      applyOverlay(targetWidth)
    } else {
      drawerNaturalWidthRef.current = measuredSlotWidth
      clearOverlay()
    }
  }, [applyOverlay, clearOverlay, isSidebarDrawerOpen, isSidebarOpen])

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

  return (
    <>
      <SidebarToggleButton />
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
          pt: { mobile: 0, desktop: 2 },
          pb: { mobile: 0, desktop: 2 },
        }}
      >
        <Box
          className="sidebar-container"
          ref={sidebarContainerRef}
          sx={[
            (theme: Theme) => ({
              display: 'flex',
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
              pointerEvents: isSidebarOpen ? 'auto' : 'none',
              ml: { mobile: 0, desktop: 2 },
            }),
            ...(Array.isArray(sx) ? sx : [sx]),
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
                width: '100%', // rail keeps its width
                overflow: 'hidden',
                boxSizing: 'border-box',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  transform: isSidebarOpen
                    ? 'translateX(0)'
                    : 'translateX(calc(-100% - 4px))',
                  transition: isSidebarOpen
                    ? 'transform 220ms cubic-bezier(.2,0,.2,1), visibility 0ms linear 0ms'
                    : 'transform 220ms cubic-bezier(.2,0,.2,1), visibility 0ms linear 220ms',
                  willChange: 'transform',
                  display: 'flex',
                  flexDirection: 'column',
                  minWidth: 0,
                  whiteSpace: 'normal',
                  visibility: isSidebarOpen ? 'visible' : 'hidden',
                  borderRadius: { mobile: 0, desktop: '10px' },
                  overflow: 'hidden',
                  backgroundColor: '#f4f4f4',
                  boxShadow: 'none',
                }}
              >
                {/* Header slot - content comes from AppletWrapper */}
                {hasCustomHeader ? (
                  <Slot name="sidebar-header" />
                ) : (
                  <SidebarHeader
                    title={sidebarHeaderConfig.title}
                    backgroundImage={sidebarHeaderConfig.backgroundImage}
                  >
                    <Slot name="sidebar-header-children" />
                  </SidebarHeader>
                )}
                {isSidebarLoading && (
                  <Box
                    sx={(theme) => ({
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: theme.zIndex.drawer + 10,
                      borderRadius: 'inherit', // Inherit border radius from parent if needed
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
                  ]}
                >
                  {children}
                </Box>
              </Box>
            </Box>
          </Box>
          {/* {mode === 'full' && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              width: '100%',
              height: '100%',
            }}
          >
            {children}
          </Box>
        )} */}
        </Box>
        <Box
          ref={drawerSlotRef}
          className="sidebar-drawer-container"
          sx={[
            (theme: Theme) => ({
              // flex: '0 0 auto',
              // flexShrink: 0,
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
                // visibility: 'hidden',
              },
            // isSidebarDrawerOverlay
            //   ? (theme: Theme) => ({
            //       position: 'absolute',
            //       top: 0,
            //       left: 0,
            //       height: '100%',
            //       width: overlayWidth != null ? `${overlayWidth}px` : '100%',
            //       zIndex: theme.zIndex.drawer + 10,
            //       pointerEvents: 'auto',
            //       '& > *': {
            //         width: '100%',
            //         maxWidth: '100%',
            //       },
            //     })
            //   : {
            //       position: 'relative',
            //     },
          ]}
        >
          {/* <Box
            sx={{
              transform:
                isSidebarOpen && isSidebarDrawerOpen
                  ? 'translateX(0)'
                  : 'translateX(-100%)',
              transition: 'transform 220ms cubic-bezier(.2,0,.2,1)',
              willChange: 'transform',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          > */}
          <Slot name="sidebar-drawer" />
          {/* </Box> */}
        </Box>
      </Box>
    </>
  )
}

export default Sidebar
