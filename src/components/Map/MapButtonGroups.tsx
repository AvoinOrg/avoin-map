// Map toolbar buttons and draw controls grouped by map state and layout.
'use client'

import { useMemo } from 'react'
import ButtonGroup, { ButtonGroupProps } from '@mui/material/ButtonGroup'
import ExploreIcon from '@mui/icons-material/ExploreOutlined'
import DoneIcon from '@mui/icons-material/Done'
import { Box } from '@mui/material'
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
import {
  MapLayerButtonHorizontal,
  MapLayerButtonVertical,
} from './MapLayerButton'
import { MapButton } from './MapButton'
import { LayerOrderLevel } from '#/common/types/map'
import { MapButtonStickyMenu } from './MapButtonStickyMenu'
import { MapUserButtons } from './MapUserButtons'
import { CorridorBufferMenu } from './CorridorBufferMenu'

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
  const selectedFeatures = useMapStore((state) => state.selectedFeatures)
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
    if (drawMode != null) {
      deleteDrawFeatures(selectedDrawFeatures)
    } else {
      deleteDrawFeatures(selectedFeatures)
    }
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
  const LayerMenuButton = isVertical
    ? MapLayerButtonVertical
    : MapLayerButtonHorizontal

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isVertical ? 'column' : 'row',
        gap: 1,
        pointerEvents: 'auto',
      }}
    >
      <MapButtonGroup
        orientation={isVertical ? 'vertical' : 'horizontal'}
        isVertical={isVertical}
      >
        <MapUserButtons isVertical={isVertical} />
      </MapButtonGroup>
      {isDrawEnabled && isDrawDeleteAllowed && (
        <MapButtonGroup
          orientation={isVertical ? 'vertical' : 'horizontal'}
          isVertical={isVertical}
        >
          <MapButton
            onClick={handleDrawDeleteClick}
            size="small"
            disabled={
              selectedDrawFeatures.length === 0 && selectedFeatures.length === 0
            }
            tooltip={t('map.buttons.draw_delete')}
            isVertical={isVertical}
          >
            <Delete />
          </MapButton>
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
              showTooltip={t(
                'map.buttons.corridor_menu_show',
                'Show corridor menu'
              )}
              menuTitle={t('map.menus.corridor.title', 'Corridor')}
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
            <LayerMenuButton
              shownLayerLevels={[LayerOrderLevel.BACKGROUND]}
              headerLabel={t('map.menus.background_layers')}
              tooltipLabel={t('map.buttons.background_layers')}
              mapMenuState="backgroundLayers"
              icon={<LayersDark />}
            />
          )}
          {hasBackgroundOverlayLayers && (
            <LayerMenuButton
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
      '& > .MuiButton-root, & > *:not(style) .MuiButton-root': {
        border: 0,
        borderRadius: 0,
      },
      '& .MuiButtonGroup-grouped': {
        border: 0,
      },
      '& .MuiButtonGroup-middleButton, & .MuiButtonGroup-lastButton': {
        marginLeft: 0,
        marginTop: 0,
      },
      '& > .MuiButton-root:first-child, & > *:not(style):first-child .MuiButton-root': {
        borderTopLeftRadius: '0.3125rem',
        borderBottomLeftRadius: isVertical ? 0 : '0.3125rem',
        borderTopRightRadius: isVertical ? '0.3125rem' : 0,
      },
      '& > .MuiButton-root:last-child, & > *:not(style):last-child .MuiButton-root': {
        borderTopRightRadius: isVertical ? 0 : '0.3125rem',
        borderBottomLeftRadius: isVertical ? '0.3125rem' : 0,
        borderBottomRightRadius: '0.3125rem',
      },
      '& > .MuiButton-root:only-child, & > *:not(style):only-child .MuiButton-root': {
        borderRadius: '0.3125rem',
      },
      ...sx,
    }}
  />
)
