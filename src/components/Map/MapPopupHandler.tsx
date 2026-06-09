'use client'

import React, { useMemo } from 'react'
import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import { css } from 'styled-system/css'

import { useMapStore } from '#/common/store/mapStore'
import { useUIStore } from '#/common/store'

const backdropClass = css({
  position: 'fixed',
  inset: 0,
  backgroundColor: 'transparent',
  pointerEvents: 'none',
})

const popupClass = css({
  position: 'fixed',
  inset: 0,
  zIndex: 'modal',
  pointerEvents: 'none',
  outline: 'none',
})

const popupContentClass = css({
  pointerEvents: 'auto',
})

export const MapPopupHandler = () => {
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

  const handleClose = () => {
    if (popupData?.features) {
      removeSelectedFeatures({ features: popupData.features })
    }
  }

  return (
    <>
      {popupData && popupData.type === 'modal' && (
        <BaseDialog.Root
          open={true}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              handleClose()
            }
          }}
          modal={popupModalViewMode === 'fullscreen'}
          disablePointerDismissal
        >
          <BaseDialog.Portal>
            <BaseDialog.Backdrop className={backdropClass} />
            <BaseDialog.Popup
              aria-labelledby="map-popup-modal-title"
              aria-describedby="map-popup-modal-description"
              className={popupClass}
            >
              <div className={popupContentClass}>
                {popupData && (
                  <popupData.component
                    features={popupData.features}
                    onClose={handleClose}
                    {...popupData.componentProps}
                  />
                )}
              </div>
            </BaseDialog.Popup>
          </BaseDialog.Portal>
        </BaseDialog.Root>
      )}
    </>
  )
}
