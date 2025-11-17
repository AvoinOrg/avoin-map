'use client'

import React, { useMemo } from 'react'
import ButtonGroup, { ButtonGroupProps } from '@mui/material/ButtonGroup'
import ExploreIcon from '@mui/icons-material/ExploreOutlined'
import DoneIcon from '@mui/icons-material/Done'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import {
  Box,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material'
import { useTranslate } from '@tolgee/react'

import { useMapStore } from '#/common/store'
import { useDrawMode } from '#/common/hooks/map/useDrawMode'
import {
  Terrain,
  Bullseye,
  Minus,
  Plus,
  Polygon,
  EditDocument,
  Delete,
  LayersDark,
  Layers,
  Line,
} from '#/components/icons'
import { useIsDrawEnabled } from '#/common/hooks/map/useIsDrawEnabled'
import { useAllowedDrawModes } from '#/common/hooks/map/useAllowedDrawModes'
import { useSelectedDrawFeatures } from '#/common/hooks/map/useSelectedDrawFeature'
import { useIsDrawDeleteAllowed } from '#/common/hooks/map/useIsDrawDeleteAllowed'
import { MapLayerButton } from './MapLayerButton'
import { MapButton } from './MapButton'
import { MapButtonMenu } from './MapButtonMenu'
import { LayerOrderLevel } from '#/common/types/map'
import { MapButtonStickyMenu } from './MapButtonStickyMenu'

const IS_DEV = process.env.NODE_ENV === 'development'

interface Props {
  isVertical: boolean
}

export const MapButtons = ({ isVertical }: Props) => {
  const mapResetNorth = useMapStore((state) => state.mapResetNorth)
  const mapZoomIn = useMapStore((state) => state.mapZoomIn)
  const mapZoomOut = useMapStore((state) => state.mapZoomOut)
  const mapRelocate = useMapStore((state) => state.mapRelocate)
  const setDrawMode = useMapStore((state) => state.setDrawMode)
  const disableDraw = useMapStore((state) => state.disableDraw)
  const deleteDrawFeatures = useMapStore((state) => state.deleteDrawFeatures)
  const drawMode = useDrawMode()
  const isDrawEnabled = useIsDrawEnabled()
  const allowedDrawModes = useAllowedDrawModes()
  const selectedDrawFeatures = useSelectedDrawFeatures()
  const isDrawDeleteAllowed = useIsDrawDeleteAllowed()
  const listedLayerGroups = useMapStore((state) => state.listedLayerGroups)
  const { t } = useTranslate('avoin-map')
  // const setIsDrawPolygon = useMapStore((state) => state.setIsDrawPolygon)

  // useEffect(() => {
  //   document.addEventListener('keydown', handleKeyPress)

  //   // Cleanup the event listener when the component unmounts
  //   return () => {
  //     document.removeEventListener('keydown', handleKeyPress)
  //   }
  // }, [])

  const handleDrawDeleteClick = () => {
    deleteDrawFeatures(selectedDrawFeatures)
  }

  // const handleKeyPress = (event: KeyboardEvent) => {
  //   // Check if "Delete" or "Backspace" key is pressed
  //   if (
  //     (event.key === 'Delete' || event.key === 'Backspace') &&
  //     isDrawEnabled &&
  //     isDrawDeleteAllowed &&
  //     selectedDrawFeatures.length > 0
  //   ) {
  //     handleDrawDeleteClick()
  //   }
  // }

  const hasBackgroundLayers = useMemo(
    () =>
      listedLayerGroups.some(
        (layerGroup) =>
          layerGroup.addOptions.layerOrderOptions.layerOrderLevel ===
          LayerOrderLevel.BACKGROUND
      ),
    [listedLayerGroups]
  )

  const hasBackgroundOverlayLayers = useMemo(
    () =>
      listedLayerGroups.some(
        (layerGroup) =>
          layerGroup.addOptions.layerOrderOptions.layerOrderLevel ===
          LayerOrderLevel.BACKGROUND_OVERLAY
      ),
    [listedLayerGroups]
  )

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isVertical ? 'column' : 'row',
        gap: 1,
        pointerEvents: 'auto',
      }}
    >
      {isDrawEnabled && isDrawDeleteAllowed && (
        <MapButtonGroup
          orientation={isVertical ? 'vertical' : 'horizontal'}
          isVertical={isVertical}
        >
          {drawMode != null && (
            <MapButton
              onClick={handleDrawDeleteClick}
              size="small"
              disabled={selectedDrawFeatures.length === 0}
              tooltip={t('map.buttons.draw_delete')}
              isVertical={isVertical}
            >
              <Delete />
            </MapButton>
          )}
        </MapButtonGroup>
      )}
      {isDrawEnabled && (
        <MapButtonGroup
          orientation={isVertical ? 'vertical' : 'horizontal'}
          isVertical={isVertical}
        >
          {drawMode != null && (
            <MapButton
              onClick={() => disableDraw()}
              size="small"
              tooltip={t('map.buttons.disable_draw')}
              isVertical={isVertical}
            >
              <DoneIcon />
            </MapButton>
          )}
          {allowedDrawModes.includes('edit') && (
            <MapButton
              onClick={() => setDrawMode('edit')}
              size="small"
              disabled={drawMode === 'edit'}
              tooltip={t('map.buttons.draw_edit')}
              isVertical={isVertical}
            >
              <EditDocument />
            </MapButton>
          )}
          {allowedDrawModes.includes('polygon') && (
            <MapButton
              onClick={() => setDrawMode('polygon')}
              size="small"
              tooltip={t('map.buttons.draw_polygon')}
              isVertical={isVertical}
            >
              <Polygon />
            </MapButton>
          )}
          {allowedDrawModes.includes('corridor') && (
            <MapButtonStickyMenu
              isVertical={isVertical}
              isActive={drawMode === 'corridor'}
              menuContent={<CorridorBufferMenu />}
            >
              <MapButton
                onClick={() => setDrawMode('corridor')}
                size="small"
                tooltip={t('map.buttons.draw_corridor', 'Draw corridor')}
                isVertical={isVertical}
              >
                <Line />
              </MapButton>
            </MapButtonStickyMenu>
          )}
        </MapButtonGroup>
      )}
      {(hasBackgroundLayers || hasBackgroundOverlayLayers) && (
        <MapButtonGroup
          orientation={isVertical ? 'vertical' : 'horizontal'}
          isVertical={isVertical}
        >
          {hasBackgroundLayers && (
            <MapLayerButton
              isVertical={isVertical}
              shownLayerLevels={[LayerOrderLevel.BACKGROUND]}
              headerLabel={t('map.menus.background_layers')}
              tooltipLabel={t('map.buttons.background_layers')}
              mapMenuState="backgroundLayers"
              icon={<LayersDark />}
            />
          )}
          {hasBackgroundOverlayLayers && (
            <MapLayerButton
              isVertical={isVertical}
              shownLayerLevels={[LayerOrderLevel.BACKGROUND_OVERLAY]}
              headerLabel={t('map.menus.background_overlay_layers')}
              tooltipLabel={t('map.buttons.background_overlay_layers')}
              mapMenuState="backgroundOverlayLayers"
              icon={<Layers />}
            />
          )}
        </MapButtonGroup>
      )}
      <MapButtonGroup
        orientation={isVertical ? 'vertical' : 'horizontal'}
        isVertical={isVertical}
      >
        <MapButton
          onClick={mapResetNorth}
          size="small"
          tooltip={t('map.buttons.reset_north')}
          isVertical={isVertical}
        >
          <ExploreIcon sx={{ fontSize: '27px' }} />
        </MapButton>
        {/* <MapButton
          onClick={mapRelocate}
          size="small"
          tooltip={t('map.buttons.relocate')}
          isVertical={isVertical}
        >
          <Bullseye />
        </MapButton> */}
        <MapButton
          onClick={mapZoomIn}
          size="small"
          tooltip={t('map.buttons.zoom_in')}
          isVertical={isVertical}
        >
          <Plus />
        </MapButton>
        <MapButton
          onClick={mapZoomOut}
          size="small"
          tooltip={t('map.buttons.zoom_out')}
          isVertical={isVertical}
        >
          <Minus />
        </MapButton>
      </MapButtonGroup>
      {IS_DEV && (
        <MapButtonGroup
          orientation={isVertical ? 'vertical' : 'horizontal'}
          isVertical={isVertical}
        >
          <MapButton
            onClick={() => useMapStore.getState()._toggleSnapshotBox()}
            size="small"
            tooltip="Toggle box for snapshot"
            isVertical={isVertical}
          >
            TB
          </MapButton>
          <MapButton
            onClick={() => useMapStore.getState()._toggleCoordinatePrint()}
            size="small"
            tooltip="Toggle coordinate print"
            isVertical={isVertical}
          >
            TC
          </MapButton>
          <MapButton
            onClick={() =>
              useMapStore.getState()._takeSnapshot({
                center: [25.6251, 60.353],
                zoom: 12.5, // 14.5 was used for some layers
                filename: 'snapshot.png',
              })
            }
            size="small"
            tooltip="Take snapshot"
            isVertical={isVertical}
          >
            TS
          </MapButton>
        </MapButtonGroup>
      )}
    </Box>
  )
}

interface MapButtonGroupProps extends ButtonGroupProps {
  isVertical?: boolean
}

const MapButtonGroup = ({ isVertical, sx, ...props }: MapButtonGroupProps) => (
  <ButtonGroup
    {...props}
    sx={{
      // Tooltip wraps each button in a span, so target the wrapper first.
      '& > *:not(style) .MuiButton-root': {
        border: 0,
        borderRadius: 0,
      },
      '& > *:not(style):first-of-type .MuiButton-root': {
        borderTopLeftRadius: '0.3125rem',
        borderBottomLeftRadius: isVertical ? 0 : '0.3125rem',
        borderTopRightRadius: isVertical ? '0.3125rem' : 0,
      },
      '& > *:not(style):last-of-type .MuiButton-root': {
        borderTopRightRadius: isVertical ? 0 : '0.3125rem',
        borderBottomLeftRadius: isVertical ? '0.3125rem' : 0,
        borderBottomRightRadius: '0.3125rem',
      },
      '& > *:not(style):only-child .MuiButton-root': {
        borderRadius: '0.3125rem',
      },
      ...sx,
    }}
  />
)

const CORRIDOR_BUFFER_STEP = 0.5

const normalizeCorridorBuffer = (value: number) => {
  if (!Number.isFinite(value)) {
    return 0
  }
  const stepped =
    Math.round(value / CORRIDOR_BUFFER_STEP) * CORRIDOR_BUFFER_STEP
  return Math.max(0, Number(stepped.toFixed(2)))
}

const formatCorridorBuffer = (value: number) =>
  Number(value.toFixed(2)).toString()

const CorridorBufferMenu = () => {
  const { t } = useTranslate('avoin-map')
  const corridorBuffer =
    useMapStore((state) => state._drawOptions.corridorHalfWidthMeters) ?? 0
  const setCorridorBuffer = useMapStore(
    (state) => state.setCorridorHalfWidthMeters
  )
  const [inputValue, setInputValue] = React.useState(() =>
    formatCorridorBuffer(corridorBuffer)
  )

  React.useEffect(() => {
    setInputValue(formatCorridorBuffer(corridorBuffer))
  }, [corridorBuffer])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value
    setInputValue(rawValue)
    const parsed = parseFloat(rawValue.replace(',', '.'))
    if (!Number.isNaN(parsed)) {
      setCorridorBuffer(normalizeCorridorBuffer(parsed))
    }
  }

  const handleBlur = () => {
    const parsed = parseFloat(inputValue.replace(',', '.'))
    if (Number.isNaN(parsed)) {
      setInputValue(formatCorridorBuffer(corridorBuffer))
      return
    }
    const normalized = normalizeCorridorBuffer(parsed)
    setCorridorBuffer(normalized)
    setInputValue(formatCorridorBuffer(normalized))
  }

  const adjustBuffer = (delta: number) => {
    const normalized = normalizeCorridorBuffer(corridorBuffer + delta)
    setCorridorBuffer(normalized)
    setInputValue(formatCorridorBuffer(normalized))
  }

  return (
    <Box
      sx={{
        minWidth: '14rem',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <Typography variant="body1" sx={{ fontWeight: 600, textAlign: 'left' }}>
        {t('map.buttons.corridor_buffer', 'Corridor buffer')}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          size="small"
          type="number"
          inputProps={{
            min: 0,
            step: CORRIDOR_BUFFER_STEP,
            inputMode: 'decimal',
            'aria-label': t('map.buttons.corridor_buffer', 'Corridor buffer'),
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {t('map.buttons.meters_suffix', 'm')}
              </InputAdornment>
            ),
          }}
          sx={{ width: '7rem' }}
        />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            borderRadius: '0.25rem',
            overflow: 'hidden',
          }}
        >
          <IconButton
            size="small"
            onClick={() => adjustBuffer(CORRIDOR_BUFFER_STEP)}
            aria-label={t(
              'map.buttons.corridor_buffer_increase',
              'Increase buffer'
            )}
            sx={{ p: 0 }}
          >
            <KeyboardArrowUpIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => adjustBuffer(-CORRIDOR_BUFFER_STEP)}
            aria-label={t(
              'map.buttons.corridor_buffer_decrease',
              'Decrease buffer'
            )}
            disabled={corridorBuffer <= 0}
            sx={{ p: 0 }}
          >
            <KeyboardArrowDownIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  )
}
