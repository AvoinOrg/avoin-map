'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Box, SxProps, Theme } from '@mui/material'

import { useUIStore } from '#/common/store'
// import { MapPopup } from '../Map/MapPopup_old'
import Drawer from './Drawer'
import { SidebarHeader, SidebarToggleButton } from '#/components/Sidebar'
import { Navbar } from './Navbar'
import { LoadingSpinner } from '../Loading'
import { Slot } from '../context/slotsContext'

export const Sidebar = ({
  headerElement,
  navbarElement,
  sx,
  children,
}: {
  headerElement?: React.ReactNode
  navbarElement?: React.ReactNode
  sx?: SxProps<Theme>
  children: React.ReactNode
}) => {
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen)
  const isSidebarDrawerOpen = useUIStore((state) => state.isSidebarDrawerOpen)
  const setSidebarWidth = useUIStore((state) => state.setSidebarWidth)
  const isNavbarHidden = useUIStore((state) => state.isNavbarHidden)
  const isSidebarLoading = useUIStore((state) => state.isSidebarLoading)

  // const popupOpts = useMapStore((state) => state.popupOpts)

  const sidebarRef = useRef<HTMLDivElement | null>(null)
  const sidebarContainerRef = useRef<HTMLDivElement | null>(null)
  const drawerSlotRef = useRef<HTMLDivElement | null>(null)

  const [isDrawerOverlay, setIsDrawerOverlay] = useState(false)
  const [overlayWidth, setOverlayWidth] = useState<number | null>(null)
  const isDrawerOverlayRef = useRef(false)
  const drawerNaturalWidthRef = useRef(0)

  const evaluateLayout = useCallback(() => {
    if (!isSidebarDrawerOpen) {
      isDrawerOverlayRef.current = false
      drawerNaturalWidthRef.current = 0
      setIsDrawerOverlay(false)
      setOverlayWidth(null)
      return
    }

    const sidebarEl = sidebarRef.current
    const containerEl = sidebarContainerRef.current
    const slotEl = drawerSlotRef.current

    if (!sidebarEl || !containerEl || !slotEl) {
      isDrawerOverlayRef.current = false
      drawerNaturalWidthRef.current = 0
      setIsDrawerOverlay(false)
      setOverlayWidth(null)
      return
    }

    const containerWidth = containerEl.getBoundingClientRect().width
    const wasOverlay = isDrawerOverlayRef.current
    const slotChild = slotEl.firstElementChild as HTMLElement | null
    const measuredSlotWidth = slotChild
      ? slotChild.getBoundingClientRect().width
      : slotEl.getBoundingClientRect().width

    if (measuredSlotWidth <= 0) {
      drawerNaturalWidthRef.current = 0
      setIsDrawerOverlay(false)
      setOverlayWidth(null)
      return
    }

    if (!wasOverlay || drawerNaturalWidthRef.current === 0) {
      drawerNaturalWidthRef.current = measuredSlotWidth
    }

    const slotWidthForDecision = wasOverlay
      ? drawerNaturalWidthRef.current || measuredSlotWidth
      : measuredSlotWidth

    let availableWidth =
      typeof window !== 'undefined'
        ? window.innerWidth
        : slotWidthForDecision + containerWidth
    const parentWidth = sidebarEl.parentElement?.getBoundingClientRect().width
    if (parentWidth && parentWidth > 0) {
      availableWidth = Math.min(availableWidth, parentWidth)
    }

    const totalWidth = containerWidth + slotWidthForDecision
    const shouldOverlay = totalWidth > availableWidth

    isDrawerOverlayRef.current = shouldOverlay
    setIsDrawerOverlay((prev) =>
      prev === shouldOverlay ? prev : shouldOverlay
    )
    if (shouldOverlay) {
      const naturalDrawerWidth =
        drawerNaturalWidthRef.current || slotWidthForDecision || containerWidth
      const targetWidth = Math.min(
        availableWidth,
        Math.max(containerWidth, naturalDrawerWidth)
      )
      setOverlayWidth((prev) => (prev === targetWidth ? prev : targetWidth))
    } else {
      drawerNaturalWidthRef.current = measuredSlotWidth
      setOverlayWidth((prev) => (prev === null ? prev : null))
    }
  }, [isSidebarDrawerOpen])

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
      }}
    >
      <Box
        className="sidebar-container"
        ref={sidebarContainerRef}
        sx={[
          {
            display: 'flex',
            flexDirection: 'column',
            width: '30rem',
            maxWidth: '100%',
            // flex: '0 1 auto',
            flex: '0 0 auto',
            flexShrink: 0,
            minWidth: 0,
            height: '100%',
            minHeight: 0,
            pointerEvents:
              isSidebarOpen || isSidebarDrawerOpen ? 'auto' : 'none',
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        <SidebarToggleButton
          sx={(theme) => ({
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: theme.zIndex.drawer + 11,
            pointerEvents: 'auto',
          })}
        />
        <Box
          sx={{ display: 'flex', flexDirection: 'row', flex: 1, minHeight: 0 }}
        >
          <Drawer open={isSidebarOpen}>
            {headerElement ? (
              headerElement
            ) : (
              <SidebarHeader title={'avoin map'}></SidebarHeader>
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
                  maxWidth: '100vw',
                  backgroundColor: 'neutral.lighter',
                },
              ]}
            >
              {children}
            </Box>
            {!isNavbarHidden &&
              (navbarElement ? navbarElement : <Navbar></Navbar>)}
          </Drawer>
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
        sx={[
          {
            flex: '0 0 auto',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'stretch',
            pointerEvents: isSidebarDrawerOpen ? 'auto' : 'none',
          },
          isDrawerOverlay
            ? (theme: Theme) => ({
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: overlayWidth != null ? `${overlayWidth}px` : '100%',
                zIndex: theme.zIndex.drawer + 12,
                pointerEvents: 'auto',
                '& > *': {
                  width: '100%',
                  maxWidth: '100%',
                },
                '& > * > *': {
                  width: '100%',
                  maxWidth: '100%',
                },
              })
            : {
                position: 'relative',
              },
        ]}
      >
        <Slot name="sidebar-drawer" />
      </Box>
    </Box>
  )
}

export default Sidebar
