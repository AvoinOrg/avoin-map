import React from 'react'
import { Box, IconButton, SxProps, Theme, Typography } from '@mui/material'
import { useTranslate } from '@tolgee/react'

import { Cross } from '#/components/icons'
import { ListedLayerGroup } from '#/common/types/map'
import LayerItem from './LayerItem'

type Props = {
  headerLabel?: string
  items: ListedLayerGroup[]
  visibleLayerGroupIds: string[]
  opacityLabel: string
  onOpacityChange?: (layerGroupId: string, opacity: number) => void
  onToggleLayer: (layerGroup: ListedLayerGroup) => void
  onInfoToggle?: () => void
  onClose: () => void
  listSx?: SxProps<Theme>
}

const LayerMenuContent = ({
  headerLabel,
  items,
  visibleLayerGroupIds,
  opacityLabel,
  onOpacityChange,
  onToggleLayer,
  onInfoToggle,
  onClose,
  listSx,
}: Props) => {
  const { t } = useTranslate('avoin-map')

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          pt: 0,
          pr: 0,
          pb: 1,
          pl: 1,
          boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.10)',
          backgroundColor: 'inherit',
          zIndex: 1,
        }}
      >
        {headerLabel ? (
          <Typography variant="body1" sx={{ textAlign: 'left' }}>
            {headerLabel}
          </Typography>
        ) : (
          <Box sx={{ flex: 1 }} />
        )}
        <IconButton
          size="small"
          aria-label={t('map.buttons.menu.close', 'Close menu')}
          onClick={onClose}
          sx={{ p: 0.25, mr: 0 }}
        >
          <Cross sx={{ width: 18, height: 18 }} />
        </IconButton>
      </Box>
      <Box
        sx={[
          {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            gap: '1rem',
            width: '100%',
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            pb: 1,
          },
          ...(Array.isArray(listSx) ? listSx : [listSx]),
        ]}
      >
        {items.map((layerGroup) => (
          <LayerItem
            key={layerGroup.id}
            layerGroup={layerGroup}
            isSelected={visibleLayerGroupIds.includes(layerGroup.id)}
            showOpacitySlider={layerGroup.styleOptions?.showOpacitySlider}
            opacityLabel={opacityLabel}
            onOpacityChange={onOpacityChange}
            onInfoToggle={onInfoToggle}
            onSelect={(_id) => {
              onToggleLayer(layerGroup)
            }}
          />
        ))}
      </Box>
    </Box>
  )
}

export default LayerMenuContent
