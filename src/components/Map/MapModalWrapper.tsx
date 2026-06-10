'use client'

import React, { ReactNode, useEffect, useRef } from 'react'
import { useUIStore } from '#/common/store'
import type { PandaStyleProp } from '#/common/style/panda'
import { Box } from '#/components/common/PandaBox'

interface MapModalWrapperProps {
  children: ReactNode
  styleProps?: PandaStyleProp
  minWidthBeforeFullScreen?: number // Mininum width before collapsing to full screen width.
}

const ELEVATION_SHADOW_24 =
  '0px 11px 15px -7px rgba(0, 0, 0, 0.2), 0px 24px 38px 3px rgba(0, 0, 0, 0.14), 0px 9px 46px 8px rgba(0, 0, 0, 0.12)'

export const MapModalWrapper = ({
  children,
  styleProps,
  minWidthBeforeFullScreen = 500,
}: MapModalWrapperProps) => {
  const minMapDims = useUIStore((state) => state.mapDims.min)
  const popupModalViewMode = useUIStore((state) => state.popupModalViewMode)
  const setPopupModalViewMode = useUIStore((state) => state.setPopupModalViewMode)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = wrapperRef.current
    if (!element || !minMapDims) {
      return
    }

    const checkViewMode = () => {
      if (minMapDims.width <= minWidthBeforeFullScreen) {
        setPopupModalViewMode('fullscreen')
        return
      }
      if (element.offsetHeight >= minMapDims.height - 1) {
        setPopupModalViewMode('full-height')
        return
      }

      setPopupModalViewMode('constrained')
    }

    checkViewMode()

    const observer = new ResizeObserver(checkViewMode)
    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [minMapDims, minWidthBeforeFullScreen, setPopupModalViewMode])

  return (
    <>
      {minMapDims && (
        <Box
          className="map-modal-wrapper"
          ref={wrapperRef}
          styleProps={[
            {
              position: 'absolute',
              outline: 'none',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: minMapDims.height,
            },
            // Conditional styles
            popupModalViewMode === 'constrained'
              ? {
                  maxWidth: minMapDims.width,
                  left: minMapDims.centerX,
                  top: minMapDims.centerY,
                  transform: 'translate(-50%, -50%)',
                  boxShadow: ELEVATION_SHADOW_24,
                }
              : null,
            popupModalViewMode === 'fullscreen'
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
                    maxHeight: '100% !important',
                  },
                }
              : null,
            popupModalViewMode === 'full-height'
              ? {
                  maxWidth: minMapDims.width,
                  left: minMapDims.centerX,
                  top: minMapDims.centerY,
                  transform: 'translate(-50%, -50%)',
                  boxShadow: ELEVATION_SHADOW_24,
                  '& > *': {
                    borderRadius: '0 !important',
                    maxHeight: '100% !important',
                  },
                }
              : null,

            // Merge with styleProps prop passed to the component
            ...(Array.isArray(styleProps) ? styleProps : [styleProps]),
          ]}
        >
          {children}
        </Box>
      )}
    </>
  )
}
