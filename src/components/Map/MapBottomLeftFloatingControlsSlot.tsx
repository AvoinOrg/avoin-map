'use client'

import { MAP_BOTTOM_LEFT_FLOATING_CONTROLS_SLOT } from '#/common/constants/map'
import { Box } from '#/components/common/PandaBox'
import { Slot } from '#/components/context/slotsContext'

export const MapBottomLeftFloatingControlsSlot = () => {
  return (
    <Box
      data-map-bottom-left-floating-controls-slot="true"
      styleProps={{
        position: 'absolute',
        left: '0.5rem',
        bottom: 'calc(100% + 2.5rem)',
        pointerEvents: 'none',
        '& > div': {
          pointerEvents: 'auto',
        },
      }}
    >
      <Slot name={MAP_BOTTOM_LEFT_FLOATING_CONTROLS_SLOT} />
    </Box>
  )
}

export default MapBottomLeftFloatingControlsSlot
