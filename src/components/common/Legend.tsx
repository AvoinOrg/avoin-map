import React from 'react'
import { useTranslate } from '@tolgee/react'

import { Box, toSxArray } from '#/common/style/theme'

type StyleProp = React.ComponentProps<typeof Box>['sx']
type StyleItem = Exclude<NonNullable<StyleProp>, readonly unknown[]>

const toStyleArray = (sx?: StyleProp) => toSxArray(sx) as StyleItem[]

interface LegendProps {
  children: React.ReactNode
  sx?: StyleProp
}

export const Legend = ({ children, sx }: LegendProps) => {
  const { t } = useTranslate('avoin-map')

  return (
    <Box sx={[{ pt: 2 }, ...toStyleArray(sx)]}>
      <Box component="p" sx={{ m: 0, fontWeight: 'bold' }}>
        {t('sidebar.legend.title')}
      </Box>
      <Box
        component="legend"
        sx={{ display: 'flex', flexDirection: 'column', pt: 1 }}
      >
        {children}
      </Box>
    </Box>
  )
}
