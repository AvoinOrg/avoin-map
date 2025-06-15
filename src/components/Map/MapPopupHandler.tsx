'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import { Modal } from '@mui/material'

import { useMapStore } from '#/common/store/mapStore'

export const MapPopupHandler = () => {
  const [isActive, setIsActive] = useState(false)
  const activePopupData = useMapStore((state) => state.activePopupData)
  const removeSelectedFeatures = useMapStore(
    (state) => state.removeSelectedFeatures
  )

  const popupData = useMemo(() => {
    if (!activePopupData || activePopupData.length === 0) {
      return null
    }

    const newPopupData = activePopupData[0]
    return newPopupData
  }, [activePopupData])

  useEffect(() => {
    console.log(popupData)
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
          slotProps={{
            backdrop: {
              sx: {
                backgroundColor: 'transparent',
              },
            },
          }}
          sx={{
            position: 'absolute' as const,
            bgColor: 'transparent',
            backgroundColor: 'transparent',
          }}
        >
          <Box sx={{ display: 'flex', flex: 1, height: '100%', width: '100%' }}>
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
