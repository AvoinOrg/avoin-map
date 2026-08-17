import React from 'react'
import { useTranslate } from '@tolgee/react'

import { Box, toSxArray } from '#/common/style/theme'

type StyleProp = React.ComponentProps<typeof Box>['sx']
type StyleItem = Exclude<NonNullable<StyleProp>, readonly unknown[]>

const toStyleArray = (sx?: StyleProp) => toSxArray(sx) as StyleItem[]

export type LayerLegendItem = {
  color: string
  label?: string
  labelTranslationKey?: string
  translationNs?: string
}

type Props = {
  items: LayerLegendItem[]
  sx?: StyleProp
}

const LayerLegendItemRow = ({ item }: { item: LayerLegendItem }) => {
  const { color, label, labelTranslationKey, translationNs } = item
  const { t } = useTranslate(translationNs || 'avoin-map')
  const resolvedLabel =
    translationNs && labelTranslationKey ? t(labelTranslationKey) : label

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box
        sx={{
          width: '1.75rem',
          height: '1rem',
          borderRadius: '0.5rem',
          border: '1px solid black',
          backgroundColor: color,
          flexShrink: 0,
        }}
      />
      {resolvedLabel && (
        <Box component="span" sx={{ typography: 'body2' }}>
          {resolvedLabel}
        </Box>
      )}
    </Box>
  )
}

const LayerLegend = ({ items, sx }: Props) => (
  <Box
    sx={[
      { display: 'flex', flexDirection: 'column', gap: 1.5, p: 0.5 },
      ...toStyleArray(sx),
    ]}
  >
    {items.map((item, index) => (
      <LayerLegendItemRow key={`${item.color}-${index}`} item={item} />
    ))}
  </Box>
)

export default LayerLegend
