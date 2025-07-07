'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import { Modal } from '@mui/material'

import { useMapStore } from '#/common/store/mapStore'
import { useUIStore } from '#/common/store'

export const MapPopupHandler = () => {
  const [isActive, setIsActive] = useState(false)
  const activePopupData = useMapStore((state) => state.activePopupData)
  const removeSelectedFeatures = useMapStore(
    (state) => state.removeSelectedFeatures
  )
  const popupModalViewMode = useUIStore((state) => state.popupModalViewMode)

  const popupData = useMemo(() => {
    if (!activePopupData || activePopupData.length === 0) {
      return null
    }

    const newPopupData = activePopupData[0]
    return newPopupData
  }, [activePopupData])

  useEffect(() => {
    if (!popupData) {
      setIsActive(false)
      return
    }

    setIsActive(true)
  }, [popupData])

  const handleClose = () => {
    setIsActive(false)
    if (popupData?.features) {
      removeSelectedFeatures({ features: popupData.features })
    }
  }

  return (
    <>
      {popupData && popupData.type === 'modal' && (
        <Modal
          open={isActive}
          onClose={handleClose}
          aria-labelledby="map-popup-modal-title"
          aria-describedby="map-popup-modal-description"
          disableEnforceFocus={popupModalViewMode !== 'fullscreen'}
          slotProps={{
            backdrop: {
              sx: {
                backgroundColor: 'transparent',
                pointerEvents: 'none',
              },
            },
          }}
          sx={{
            zIndex: 'modal',
            pointerEvents: 'none',
          }}
        >
          <Box
            sx={{
              pointerEvents: 'auto',
            }}
          >
            {popupData && (
              <popupData.component
                features={popupData.features}
                onClose={handleClose}
                {...popupData.componentProps}
              />
            )}
          </Box>
        </Modal>
      )}
    </>
  )
}
