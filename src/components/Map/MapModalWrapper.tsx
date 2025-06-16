'use client'

import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import { SxProps, Theme } from '@mui/material'
import { useUIStore } from '#/common/store'

interface MapModalWrapperProps {
  children: ReactNode
  sx?: SxProps<Theme>
  minWidthBeforeFullScreen?: number // Mininum width before collapsing to full screen width.
}

export const MapModalWrapper = ({
  children,
  sx,
  minWidthBeforeFullScreen = 500,
}: MapModalWrapperProps) => {
  const minMapDims = useUIStore((state) => state.mapDims.min)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [viewMode, setViewMode] = useState<
    'constrained' | 'fullscreen' | 'full-height'
  >('constrained')

  useEffect(() => {
    const element = wrapperRef.current
    if (!element || !minMapDims) {
      return
    }

    let observer: ResizeObserver | undefined

    const checkViewMode = () => {
      if (minMapDims.width <= minWidthBeforeFullScreen) {
        setViewMode('fullscreen')
        return
      }
      if (element.offsetHeight >= minMapDims.height - 1) {
        setViewMode('full-height')
        return
      }

      setViewMode('constrained')
    }

    checkViewMode()

    observer = new ResizeObserver(checkViewMode)
    observer.observe(element)

    return () => {
      if (observer) {
        observer.disconnect()
      }
    }
  }, [minMapDims, wrapperRef.current, minWidthBeforeFullScreen])

  return (
    <>
      {minMapDims && (
        <Box
          className="map-modal-wrapper"
          ref={wrapperRef}
          sx={[
            {
              position: 'absolute',
              outline: 'none',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: minMapDims.height,
            },
            // Conditional styles
            viewMode === 'constrained'
              ? {
                  maxWidth: minMapDims.width,
                  left: minMapDims.centerX,
                  top: minMapDims.centerY,
                  transform: 'translate(-50%, -50%)',
                  boxShadow: 24,
                }
              : null,
            viewMode === 'fullscreen'
              ? {
                  maxWidth: '100%',
                  width: '100%',
                  height: '100%',
                  '& > *': {
                    width: '100%',
                    flexGrow: 1,
                    minHeight: 0,
                    minWidth: '0 !important', // to allow it to scale down if it has minWidth set when drawn over the map as modal
                    borderRadius: '0 !important',
                  },
                }
              : null,
            viewMode === 'full-height'
              ? {
                  maxWidth: minMapDims.width,
                  left: minMapDims.centerX,
                  top: minMapDims.centerY,
                  transform: 'translate(-50%, -50%)',
                  boxShadow: 24,
                  '& > *': {
                    borderRadius: '0 !important',
                  },
                }
              : null,

            // Merge with sx prop passed to the component
            ...(Array.isArray(sx) ? sx : [sx]),
          ]}
        >
          {children}
        </Box>
      )}
    </>
  )
}
