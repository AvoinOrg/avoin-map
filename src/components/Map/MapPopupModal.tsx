'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
// import { MapGeoJSONFeature } from 'maplibre-gl'
// import Feature from 'ol/Feature'
// import { PopupOpts } from '#/common/types/map'
import { PopupOpts } from '#/common/types/map'
import { useMapStore } from '#/common/store/mapStore'
import { IconButton, Modal } from '@mui/material'
import { Cross } from '../icons'

export const MapPopupModal = () => {
  const [popupFeatures, setPopupFeatures] = useState<any[]>()
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
          sx={{
            position: 'absolute' as const,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: {
              xs: '90%',
              sm: '70%',
              md: '500px',
            },
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 1,
            outline: 'none',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              {/* <Typography id="area-modal-title" variant="h6" component="h2">
                  {title}
                </Typography> */}
              <IconButton
                aria-label="close"
                onClick={handleClose}
                sx={{
                  // Position to top-right if preferred, or remove for default flow if title is on left
                  // position: 'absolute',
                  // right: (theme) => theme.spacing(1),
                  // top: (theme) => theme.spacing(1),
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <Cross />
              </IconButton>
            </Box>

            {popupData && <popupData.component features={popupData.features} />}
          </Box>
        </Modal>
      )}
    </>
  )
}
