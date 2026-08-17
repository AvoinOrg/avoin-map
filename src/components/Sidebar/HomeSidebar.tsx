import React, { useEffect, useRef } from 'react'

import { useUIStore } from '#/common/store'
import type { AppBoxProps } from '#/common/style/theme/system'
import { Box } from '#/common/style/theme/system'
import { LoadingSpinner } from '../Loading'

import SidebarToggleButton from './SidebarToggleButton'

type SidebarStyleProps = AppBoxProps['sx']

export type HomeSidebarProps = {
  sx?: SidebarStyleProps
  children: React.ReactNode
}

export const HomeSidebar = ({ sx, children }: HomeSidebarProps) => {
  const isSidebarDisabled = useUIStore((state) => state.isSidebarDisabled)
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen)
  const isSidebarLoading = useUIStore((state) => state.isSidebarLoading)
  const setSidebarWidth = useUIStore((state) => state.setSidebarWidth)

  const sidebarPanelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const measureWidth = () => {
      if (sidebarPanelRef.current) {
        setSidebarWidth(sidebarPanelRef.current.getBoundingClientRect().width)
      }
    }

    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            measureWidth()
          })
        : null

    if (observer && sidebarPanelRef.current) {
      observer.observe(sidebarPanelRef.current)
    }

    window.addEventListener('resize', measureWidth)
    measureWidth()

    return () => {
      if (observer) {
        observer.disconnect()
      }
      window.removeEventListener('resize', measureWidth)
    }
  }, [setSidebarWidth])

  if (isSidebarDisabled) {
    return <>{children}</>
  }

  return (
    <>
      <SidebarToggleButton />
      <Box
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
          ref={sidebarPanelRef}
          sx={[
            (theme) => ({
              display: 'flex',
              flexDirection: 'column',
              flex: '0 0 auto',
              width: { mobile: '100vw', desktop: '42rem' },
              maxWidth: {
                mobile: '100vw',
                desktop: 'min(42rem, calc(100vw - 2rem))',
              },
              flexShrink: 0,
              minWidth: 0,
              height: '100%',
              minHeight: 0,
              zIndex: (theme.zIndex?.drawer ?? 1200) + 1,
              pt: { mobile: 0, desktop: 2 },
              pb: { mobile: 0, desktop: 2 },
              ml: { mobile: 0, desktop: 2 },
              pointerEvents: 'none',
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
            ...(Array.isArray(sx) ? sx : [sx]),
          ]}
        >
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              minHeight: 0,
              height: '100%',
            }}
          >
            {isSidebarLoading && (
              <Box
                sx={(theme) => ({
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: (theme.zIndex?.drawer ?? 1200) + 10,
                  borderRadius: { mobile: 0, desktop: '10px' },
                  pointerEvents: 'auto',
                })}
              >
                <LoadingSpinner size="5rem" />
              </Box>
            )}
            {children}
          </Box>
        </Box>
      </Box>
    </>
  )
}

export default HomeSidebar
