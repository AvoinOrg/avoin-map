import React from 'react'
import { Box, IconButton, SxProps, Theme, Typography } from '@mui/material'
import { useTranslate } from '@tolgee/react'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'

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
  scrollMaxHeight?: string
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
  scrollMaxHeight,
}: Props) => {
  const { t } = useTranslate('avoin-map')

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          px: 3,
          py: 2,
          boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.10)',
          backgroundColor: 'inherit',
          zIndex: 1,
        }}
      >
        {headerLabel ? (
          <Typography variant="h3" sx={{ textAlign: 'left' }}>
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
      <OverlayScrollbarsComponent
        className="osScroll"
        options={{
          overflow: { x: 'hidden', y: 'scroll' },
          scrollbars: {
            theme: 'os-theme-dark',
            autoHide: 'leave',
            autoHideDelay: 600,
          },
        }}
        style={{
          flex: 1,
          minHeight: 0,
          width: '100%',
          height: '100%',
          ...(scrollMaxHeight ? { maxHeight: scrollMaxHeight } : {}),
        }}
        defer
      >
        <Box
          sx={[
            {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              gap: '1.5rem',
              width: '100%',
              px: 3,
              py: 4,
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
      </OverlayScrollbarsComponent>
    </Box>
  )
}

export default LayerMenuContent
