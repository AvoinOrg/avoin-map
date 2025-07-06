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

interface Props {
  isVertical?: boolean
}

export const MapButtons = ({ isVertical }: Props) => {
  const mapToggleTerrain = useMapStore((state) => state.mapToggleTerrain)
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
        <StyledButtonGroup
          orientation={isVertical ? 'vertical' : 'horizontal'}
          isVertical={isVertical}
        >
          {drawMode != null && (
            <Tooltip title={t('map.buttons.draw_delete')}>
              {/* The box acts as a wrapper for tooltip to function when the button is disabled */}
              <Box>
                <StyledButton
                  onClick={handleDrawDeleteClick}
                  size="small"
                  disabled={selectedDrawFeatures.length === 0}
                >
                  <Delete />
                </StyledButton>
              </Box>
            </Tooltip>
          )}
        </StyledButtonGroup>
      )}
      {isDrawEnabled && (
        <StyledButtonGroup
          orientation={isVertical ? 'vertical' : 'horizontal'}
          isVertical={isVertical}
        >
          {drawMode != null && (
            <Tooltip title={t('map.buttons.disable_draw')}>
              <StyledButton onClick={() => disableDraw()} size="small">
                <DoneIcon />
              </StyledButton>
            </Tooltip>
          )}
          {allowedDrawModes.includes('edit') && (
            <Tooltip title={t('map.buttons.draw_edit')}>
              {/* The box acts as a wrapper for tooltip to function when the button is disabled */}
              <Box>
                <StyledButton
                  onClick={() => setDrawMode('edit')}
                  size="small"
                  disabled={drawMode === 'edit'}
                >
                  <EditDocument />
                </StyledButton>
              </Box>
            </Tooltip>
          )}
          {allowedDrawModes.includes('polygon') && (
            <Tooltip title={t('map.buttons.draw_polygon')}>
              <StyledButton onClick={() => setDrawMode('polygon')} size="small">
                <Polygon />
              </StyledButton>
            </Tooltip>
          )}
        </StyledButtonGroup>
      )}
      <StyledButtonGroup
        orientation={isVertical ? 'vertical' : 'horizontal'}
        isVertical={isVertical}
      >
        <Tooltip title={t('map.buttons.background_map')}>
          <StyledButton onClick={mapToggleTerrain} size="small">
            <Terrain />
          </StyledButton>
        </Tooltip>
        <Tooltip title={t('map.buttons.reset_north')}>
          <StyledButton onClick={mapResetNorth} size="small">
            <ExploreIcon sx={{ fontSize: '27px' }} />
          </StyledButton>
        </Tooltip>
        {/* <Tooltip title={t('map.buttons.relocate')}>
          <StyledButton onClick={mapRelocate} size="small">
            <Bullseye />
          </StyledButton>
        </Tooltip> */}
        <Tooltip title={t('map.buttons.zoom_in')}>
          <StyledButton onClick={mapZoomIn} size="small">
            <Plus />
          </StyledButton>
        </Tooltip>
        <Tooltip title={t('map.buttons.zoom_out')}>
          <StyledButton onClick={mapZoomOut} size="small">
            <Minus />
          </StyledButton>
        </Tooltip>
      </StyledButtonGroup>
    </Box>
  )
}

// TODO: theme styling
const StyledButton = styled(Button)(({ theme }) => ({
  opacity: 0.9,
  color: theme.palette.neutral.darker,
  backgroundColor: theme.palette.neutral.light,
  border: 'none',
  boxShadow: 'none',
  '&:hover': {
    backgroundColor: theme.palette.neutral.main,
    border: 'none',
  },
  '&.Mui-disabled': {
    border: 'none',
    color: theme.palette.neutral.main, // you can adjust the color if you want
  },
  width: '40px',
  height: '40px',
}))

const StyledButtonGroup = styled(ButtonGroup, {
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
