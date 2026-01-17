'use client'

import { useTranslate } from '@tolgee/react'

import { useMapStore } from '#/common/store'
import { NumberInputField } from '#/components/common/NumberInputField'
import { Box } from '@mui/material'

const CORRIDOR_BUFFER_STEP = 0.5

export const CorridorBufferMenu = () => {
  const { t } = useTranslate('avoin-map')
  const corridorBuffer =
    useMapStore((state) => state._drawOptions.corridorHalfWidthMeters) ?? 0
  const setCorridorBuffer = useMapStore(
    (state) => state.setCorridorHalfWidthMeters
  )

  const handleValueChange = (value: number | null) => {
    if (value == null) {
      return
    }
    setCorridorBuffer(value)
  }

  const corridorBufferLabel = t(
    'map.menus.corridor.corridor_buffer',
    'Corridor buffer'
  )

  return (
    <Box sx={{ pt: 2 }}>
      <NumberInputField
        label={corridorBufferLabel}
        containerSx={{ width: '100%' }}
        inputSx={{ width: '100%' }}
        size="small"
        value={corridorBuffer}
        min={0}
        step={CORRIDOR_BUFFER_STEP}
        snapOnStep
        format={{ maximumFractionDigits: 2 }}
        onValueChange={handleValueChange}
        inputSlotProps={{
          inputMode: 'decimal',
          'aria-label': corridorBufferLabel,
        }}
      />
    </Box>
  )
}
