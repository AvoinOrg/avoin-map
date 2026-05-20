'use client'

import React, { useEffect, useRef } from 'react'
import { Box, SxProps, Theme } from '@mui/material'

import { useUIStore } from '#/common/store'
import { LoadingSpinner } from '../Loading'

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
  const setSidebarWidth = useUIStore((state) => state.setSidebarWidth)
  const isSidebarLoading = useUIStore((state) => state.isSidebarLoading)

  const sidebarRef = useRef<HTMLDivElement | null>(null)
  const sidebarContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const measure = () => {
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
    }

    window.addEventListener('resize', measure)
    measure()

    return () => {
      if (observer) {
        observer.disconnect()
      }
      window.removeEventListener('resize', measure)
    }
  }, [setSidebarWidth])

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
      {actionRail}
    </Box>
  )
}

export default SidebarScaffold
