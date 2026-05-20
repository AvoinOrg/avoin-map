'use client'

import { Box } from '@mui/material'

import { MAP_BOTTOM_LEFT_FLOATING_CONTROLS_SLOT } from '#/common/constants/map'
import { Slot } from '#/components/context/slotsContext'

export const MapBottomLeftFloatingControlsSlot = () => {
  return (
    <Box
      data-map-bottom-left-floating-controls-slot="true"
      sx={{
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
