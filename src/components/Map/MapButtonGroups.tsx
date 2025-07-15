'use client'

import React from 'react'
import { styled } from '@mui/material/styles'
import ButtonGroup from '@mui/material/ButtonGroup'
import ExploreIcon from '@mui/icons-material/ExploreOutlined'
import DoneIcon from '@mui/icons-material/Done'
import { Box, Button, Tooltip } from '@mui/material'

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
} from '#/components/icons'
import { useIsDrawEnabled } from '#/common/hooks/map/useIsDrawEnabled'
import { useAllowedDrawModes } from '#/common/hooks/map/useAllowedDrawModes'
import { useSelectedDrawFeatures } from '#/common/hooks/map/useSelectedDrawFeature'
import { useIsDrawDeleteAllowed } from '#/common/hooks/map/useIsDrawDeleteAllowed'
import { useTranslate } from '@tolgee/react'
import { BackgroundLayerButton } from './BackgroundLayerButton'
import { MapButton } from './MapButton'

const IS_DEV = process.env.NODE_ENV === 'development'

interface Props {
  isVertical?: boolean
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

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isVertical ? 'column' : 'row',
        gap: 1,
      }}
    >
      {isDrawEnabled && isDrawDeleteAllowed && (
        <MapButtonGroup
          orientation={isVertical ? 'vertical' : 'horizontal'}
          isVertical={isVertical}
        >
          {drawMode != null && (
            <Tooltip title={t('map.buttons.draw_delete')}>
              {/* The box acts as a wrapper for tooltip to function when the button is disabled */}
              <Box>
                <MapButton
                  onClick={handleDrawDeleteClick}
                  size="small"
                  disabled={selectedDrawFeatures.length === 0}
                >
                  <Delete />
                </MapButton>
              </Box>
            </Tooltip>
          )}
        </MapButtonGroup>
      )}
      {isDrawEnabled && (
        <MapButtonGroup
          orientation={isVertical ? 'vertical' : 'horizontal'}
          isVertical={isVertical}
        >
          {drawMode != null && (
            <Tooltip title={t('map.buttons.disable_draw')}>
              <MapButton onClick={() => disableDraw()} size="small">
                <DoneIcon />
              </MapButton>
            </Tooltip>
          )}
          {allowedDrawModes.includes('edit') && (
            <Tooltip title={t('map.buttons.draw_edit')}>
              {/* The box acts as a wrapper for tooltip to function when the button is disabled */}
              <Box>
                <MapButton
                  onClick={() => setDrawMode('edit')}
                  size="small"
                  disabled={drawMode === 'edit'}
                >
                  <EditDocument />
                </MapButton>
              </Box>
            </Tooltip>
          )}
          {allowedDrawModes.includes('polygon') && (
            <Tooltip title={t('map.buttons.draw_polygon')}>
              <MapButton onClick={() => setDrawMode('polygon')} size="small">
                <Polygon />
              </MapButton>
            </Tooltip>
          )}
        </MapButtonGroup>
      )}
      <MapButtonGroup
        orientation={isVertical ? 'vertical' : 'horizontal'}
        isVertical={isVertical}
      >
        <BackgroundLayerButton isVertical={isVertical} />
        <Tooltip title={t('map.buttons.reset_north')}>
          <MapButton onClick={mapResetNorth} size="small">
            <ExploreIcon sx={{ fontSize: '27px' }} />
          </MapButton>
        </Tooltip>
        {/* <Tooltip title={t('map.buttons.relocate')}>
          <MapButton onClick={mapRelocate} size="small">
            <Bullseye />
          </MapButton>
        </Tooltip> */}
        <Tooltip title={t('map.buttons.zoom_in')}>
          <MapButton onClick={mapZoomIn} size="small">
            <Plus />
          </MapButton>
        </Tooltip>
        <Tooltip title={t('map.buttons.zoom_out')}>
          <MapButton onClick={mapZoomOut} size="small">
            <Minus />
          </MapButton>
        </Tooltip>
      </MapButtonGroup>
      {IS_DEV && (
        <MapButtonGroup
          orientation={isVertical ? 'vertical' : 'horizontal'}
          isVertical={isVertical}
        >
          <Tooltip title="Toggle box for snapshot">
            <MapButton
              onClick={() => useMapStore.getState()._toggleSnapshotBox()}
              size="small"
            >
              TB
            </MapButton>
          </Tooltip>
          <Tooltip title="Toggle coordinate print">
            <MapButton
              onClick={() => useMapStore.getState()._toggleCoordinatePrint()}
              size="small"
            >
              TC
            </MapButton>
          </Tooltip>
          <Tooltip title="Take snapshot">
            <MapButton
              onClick={() =>
                useMapStore.getState()._takeSnapshot({
                  center: [25.6251, 60.353],
                  zoom: 12.5,
                  filename: 'snapshot.jpg',
                })
              }
              size="small"
            >
              TS
            </MapButton>
          </Tooltip>
        </MapButtonGroup>
      )}
    </Box>
  )
}

const MapButtonGroup = styled(ButtonGroup, {
  shouldForwardProp: (prop) => prop !== 'isVertical',
})<{ isVertical?: boolean }>(({ theme, isVertical }) => ({
  // boxShadow: '1px 1px 7px 0px #EEECEC',
  '& .MuiButton-root:first-of-type': {
    borderTopLeftRadius: '0.3125rem',
    borderBottomLeftRadius: isVertical ? 0 : '0.3125rem',
    borderTopRightRadius: isVertical ? '0.3125rem' : 0,
  },
  '& .MuiButton-root:last-of-type': {
    borderTopRightRadius: isVertical ? 0 : '0.3125rem',
    borderBottomLeftRadius: isVertical ? '0.3125rem' : 0,
    borderBottomRightRadius: '0.3125rem',
  },
}))
