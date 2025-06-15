'use client'

import React, { ReactNode, useMemo } from 'react'
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

  return (
    <>
      {minMapDims && (
        <Box
          className="map-modal-wrapper"
          sx={[
            {
              position: 'absolute',
              outline: 'none',
              display: 'flex',
              flexDirection: 'column',
            },
            // Conditional styles
            minMapDims.width > minWidthBeforeFullScreen
              ? {
                  maxWidth: minMapDims.width,
                  left: minMapDims.centerX,
                  top: minMapDims.centerY,
                  transform: 'translate(-50%, -50%)',
                  boxShadow: 24,
                }
              : {
                  maxWidth: '100%',
                  width: '100%',
                  height: '100%',
                  '& > *': {
                    width: '100%',
                    flexGrow: 1,
                    minHeight: 0,
                    minWidth: '0 !important', // to allow it to scale down if it has minWidth set when drawn over the map as modal
                  },
                },
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
