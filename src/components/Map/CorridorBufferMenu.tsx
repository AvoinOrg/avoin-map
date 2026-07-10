import { useTranslate } from '@tolgee/react'

import { useMapStore } from '#/common/store'
import { NumberInputField } from '#/components/common/NumberInputField'
import { Box } from '#/common/style/theme/system'

const CORRIDOR_BUFFER_STEP = 0.5
const NUMBER_FIELD_WIDTH = '6rem'

const numberFieldInputSx = {
  width: NUMBER_FIELD_WIDTH,
  '&[data-slot="number-input-control"]': {
    minHeight: '1.5rem',
    borderRadius: '999px',
    backgroundColor: '#FFFFFF',
    boxShadow: 'inset 0px 0.5px 1px 0px #D9D9D9',
    borderColor: '#D6D6D6',
  },
  '& [data-slot="number-input-input"]': {
    px: '0.625rem',
    py: '0.125rem',
    fontSize: '0.6875rem',
    lineHeight: 'normal',
    letterSpacing: '0.04em',
    textAlign: 'center',
  },
} as const

const numberFieldAdornmentSx = {
  '& [data-slot="number-input-increment"], & [data-slot="number-input-decrement"]':
    {
      pl: 0.25,
      pr: 0.625,
    },
  '& [data-slot="number-input-increment"]': {
    borderTopRightRadius: '999px',
  },
  '& [data-slot="number-input-decrement"]': {
    borderBottomRightRadius: '999px',
  },
} as const

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

  const corridorBufferLabel = t('map.menus.corridor.corridor_buffer')

  return (
    <Box sx={{ pt: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
        }}
      >
        <Box
          component="span"
          sx={{
            flex: 1,
            minWidth: 0,
            fontSize: '0.625rem',
            lineHeight: '0.875rem',
            letterSpacing: '0.04em',
            color: '#111111',
          }}
        >
          {corridorBufferLabel}
        </Box>

        <NumberInputField
          size="small"
          value={corridorBuffer}
          min={0}
          step={CORRIDOR_BUFFER_STEP}
          snapOnStep
          format={{ maximumFractionDigits: 2 }}
          onValueChange={handleValueChange}
          containerSx={{ width: NUMBER_FIELD_WIDTH }}
          inputRowSx={{ width: NUMBER_FIELD_WIDTH }}
          formControlSx={{ width: NUMBER_FIELD_WIDTH }}
          inputSx={numberFieldInputSx}
          adornmentSx={numberFieldAdornmentSx}
          inputSlotProps={{
            inputMode: 'decimal',
            'aria-label': corridorBufferLabel,
          }}
        />
      </Box>
    </Box>
  )
}
