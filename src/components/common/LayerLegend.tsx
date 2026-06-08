import React from 'react'
import { useTranslate } from '@tolgee/react'
import { css, cx } from 'styled-system/css'

import type { PandaStyleProp } from '#/common/style/panda'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'

export type LayerLegendItem = {
  color: string
  label?: string
  labelTranslationKey?: string
  translationNs?: string
}

type Props = {
  items: LayerLegendItem[]
  sx?: PandaStyleProp
}

const rootClass = css({
  display: 'flex',
  flexDirection: 'column',
  gap: 1.5,
  p: 0.5,
})

const rowClass = css({
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
})

const colorBoxClass = css({
  width: '1.75rem',
  height: '1rem',
  borderRadius: '0.5rem',
  border: '1px solid black',
  flexShrink: 0,
})

const labelClass = css({
  fontFamily: 'var(--font-arimo)',
  fontSize: '0.875rem',
  fontWeight: 400,
  lineHeight: 'normal',
  letterSpacing: '0.0875rem',
})

const LayerLegendItemRow = ({ item }: { item: LayerLegendItem }) => {
  const { color, label, labelTranslationKey, translationNs } = item
  const { t } = useTranslate(translationNs || 'avoin-map')
  const resolvedLabel =
    translationNs && labelTranslationKey ? t(labelTranslationKey) : label

  return (
    <div className={rowClass}>
      <span className={colorBoxClass} style={{ backgroundColor: color }} />
      {resolvedLabel && <span className={labelClass}>{resolvedLabel}</span>}
    </div>
  )
}

const LayerLegend = ({ items, sx }: Props) => (
  <div
    className={cx(rootClass, css(...pandaStylePropsToArray(sx)))}
    style={mergePandaStyleProps({ sx })}
  >
    {items.map((item, index) => (
      <LayerLegendItemRow key={`${item.color}-${index}`} item={item} />
    ))}
  </div>
)

export default LayerLegend
