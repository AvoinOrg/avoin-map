import React from 'react'
import { Box, Typography, SxProps, Theme } from '@mui/material'
import { useTranslate } from '@tolgee/react'

export type LayerLegendItem = {
  color: string
  label?: string
  labelTranslationKey?: string
  translationNs?: string
}

type Props = {
  items: LayerLegendItem[]
  sx?: SxProps<Theme>
}

const LayerLegendItemRow = ({ item }: { item: LayerLegendItem }) => {
  const { color, label, labelTranslationKey, translationNs } = item
  const { t } = useTranslate(translationNs || 'avoin-map')
  const resolvedLabel =
    translationNs && labelTranslationKey ? t(labelTranslationKey) : label

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Box
        sx={{
          width: '1.25rem',
          height: '0.5rem',
          borderRadius: '0.25rem',
          backgroundColor: color,
          flexShrink: 0,
        }}
      />
      {resolvedLabel && (
        <Typography sx={{ fontSize: '0.65rem', lineHeight: 1.2 }}>
          {resolvedLabel}
        </Typography>
      )}
    </Box>
  )
}

const LayerLegend = ({ items, sx }: Props) => (
  <Box
    sx={[
      { display: 'flex', flexDirection: 'column', gap: 0.5 },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {items.map((item, index) => (
      <LayerLegendItemRow key={`${item.color}-${index}`} item={item} />
    ))}
  </Box>
)

export default LayerLegend
