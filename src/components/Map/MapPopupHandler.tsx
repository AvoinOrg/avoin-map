'use client'

import { useCallback } from 'react'
import { Dialog } from '@base-ui/react/dialog'

import { useMapStore } from '#/common/store/mapStore'
import { useUIStore } from '#/common/store'
import { Box } from '#/common/style/theme/system'

export const MapPopupHandler = () => {
  const activePopupData = useMapStore((state) => state.activePopupData)
  const removeSelectedFeatures = useMapStore(
    (state) => state.removeSelectedFeatures
  )
  const popupModalViewMode = useUIStore((state) => state.popupModalViewMode)

  const popupData = activePopupData[0] ?? null
  const isActive = popupData?.type === 'modal'

  const handleClose = useCallback(() => {
    if (popupData?.features) {
      removeSelectedFeatures({ features: popupData.features })
    }
  }, [popupData, removeSelectedFeatures])

  return (
    <>
      {popupData && popupData.type === 'modal' && (
        <Dialog.Root
          open={isActive}
          modal={popupModalViewMode === 'fullscreen' ? 'trap-focus' : false}
          disablePointerDismissal
          onOpenChange={(nextOpen) => {
            if (!nextOpen && isActive) {
              handleClose()
            }
          }}
        >
          <Dialog.Portal>
            <Dialog.Backdrop
              render={(backdropProps) => (
                <Box
                  {...backdropProps}
                  sx={(theme) => ({
                    position: 'fixed',
                    inset: 0,
                    zIndex: theme.zIndex.modal,
                    backgroundColor: 'transparent',
                    pointerEvents: 'none',
                  })}
                />
              )}
            />
            <Dialog.Popup
              aria-labelledby="map-popup-modal-title"
              aria-describedby="map-popup-modal-description"
              initialFocus={popupModalViewMode === 'fullscreen'}
              finalFocus={false}
              render={(popupProps) => (
                <Box
                  {...popupProps}
                  sx={(theme) => ({
                    position: 'fixed',
                    inset: 0,
                    zIndex: theme.zIndex.modal,
                    outline: 'none',
                    pointerEvents: 'none',
                  })}
                />
              )}
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
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </>
  )
}
