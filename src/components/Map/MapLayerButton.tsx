'use client'
// Grid grid grid, why are you so shit
// The layout and styling is complete spaghetti.
// TODO: figure out how to make it neat.

import React, { useRef, useMemo, useCallback, useEffect } from 'react'
import {
  Box,
  IconButton,
  Popper,
  Paper,
  Typography,
  Grid,
  ClickAwayListener,
  Slider,
  Tooltip,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import Image from 'next/image'

import { useMapStore, useUIStore } from '#/common/store'
import { Info, Layers } from '#/components/icons'
import { MapButton } from './MapButton'
import { useVisibleLayerGroupIds } from '#/common/hooks/map/useVisibleLayerGroupIds'
import { useLayerGroupOpacity } from '#/common/hooks/map/useLayerGroupOpacity'
import { LayerOrderLevel, ListedLayerGroup } from '#/common/types/map'
import { MapMenuState } from '#/common/types/state'
import { useTranslate } from '@tolgee/react'
import { clampOpacity } from '#/common/utils/map'

type LayerItemProps = {
  layerGroup: ListedLayerGroup
  isSelected: boolean
  isVertical: boolean
  onSelect: (id: string) => void
  showOpacitySlider?: boolean
  opacityLabel?: string
  onOpacityChange?: (layerGroupId: string, opacity: number) => void
}

const LayerItem = ({
  layerGroup,
  isSelected,
  isVertical,
  onSelect,
  showOpacitySlider,
  opacityLabel,
  onOpacityChange,
}: LayerItemProps) => {
  const { t } = useTranslate(layerGroup.translationNs)
  const name = t(layerGroup.nameTranslationKey, layerGroup.name)
  const tileSize = isVertical ? '10rem' : '12rem'
  const textWidth = isVertical ? '120px' : '180px'
  const storedOpacity = useLayerGroupOpacity(layerGroup.id)
  const defaultOpacity = clampOpacity(
    layerGroup.styleOptions?.defaultOpacity ?? 1
  )
  const resolvedOpacity = storedOpacity ?? defaultOpacity

  useEffect(() => {
    if (!showOpacitySlider || !onOpacityChange) {
      return
    }
    if (storedOpacity == null) {
      onOpacityChange(layerGroup.id, defaultOpacity)
    }
  }, [
    defaultOpacity,
    layerGroup.id,
    onOpacityChange,
    showOpacitySlider,
    storedOpacity,
  ])

  const handleOpacityChange = (_event: Event, value: number | number[]) => {
    if (!onOpacityChange) {
      return
    }

    const nextValue = Array.isArray(value) ? value[0] : value
    onOpacityChange(layerGroup.id, nextValue)
  }

  return (
    <Box sx={{ width: tileSize, textAlign: 'left' }}>
      <Box
        onClick={() => onSelect(layerGroup.id)}
        sx={{
          cursor: 'pointer',
        }}
      >
        <Box
          sx={{
            border: isSelected
              ? (theme) => `2px solid ${theme.palette.secondary.dark}`
              : '2px solid transparent',
            borderRadius: '0.3125rem',
            overflow: 'hidden',
            lineHeight: 0,
            '&:hover': {
              borderWidth: '3px',
              borderColor: (theme) =>
                isSelected
                  ? theme.palette.secondary.dark
                  : theme.palette.primary.main,
            },
            width: tileSize,
            height: tileSize,
          }}
        >
          <Image
            src={layerGroup.thumbnail || ''}
            alt={name}
            width={256}
            height={256}
            style={{
              width: '100%',
              height: 'auto',
              aspectRatio: '1 / 1',
              objectFit: 'contain',
            }}
          />
        </Box>
      </Box>
      {showOpacitySlider && (
        <Box sx={{ mt: 0.75 }}>
          <Slider
            size="small"
            min={0}
            max={1}
            step={0.05}
            value={resolvedOpacity}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
            onChange={handleOpacityChange}
            aria-label={opacityLabel || 'Opacity'}
            sx={{ width: '100%' }}
          />
        </Box>
      )}
      <Box
        sx={{
          mt: showOpacitySlider ? 0.5 : 1,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 0.5,
          width: textWidth,
        }}
      >
        <Typography
          sx={{
            typography: 'body1',
            fontSize: '0.60rem',
            letterSpacing: '0.040rem',
            whiteSpace: 'normal',
            overflowWrap: 'break-word',
            flex: 1,
            minWidth: 0,
          }}
        >
          {name}
        </Typography>
        {layerGroup.infoElement && (
          <Tooltip
            arrow
            placement="right"
            title={layerGroup.infoElement}
            enterTouchDelay={0}
            disableInteractive={false}
            slotProps={{
              tooltip: {
                sx: {
                  maxWidth: 260,
                  backgroundColor: 'neutral.light',
                  color: 'text.primary',
                  boxShadow: 3,
                  p: 1,
                },
              },
              arrow: {
                sx: {
                  color: 'neutral.light',
                },
              },
            }}
          >
            <IconButton
              size="small"
              aria-label={`${name} info`}
              sx={{
                p: 0.25,
                mt: '1px',
                color: 'text.secondary',
                '&:hover': {
                  color: 'text.primary',
                },
              }}
            >
              <Info sx={{ width: 14, height: 14 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  )
}

type Props = {
  isVertical: boolean
  shownLayerLevels: LayerOrderLevel[]
  mapMenuState: MapMenuState
  tooltipLabel: string
  headerLabel?: string
  icon?: React.ReactNode
}

export const MapLayerButton = ({
  isVertical,
  shownLayerLevels,
  mapMenuState,
  tooltipLabel,
  headerLabel,
  icon,
}: Props) => {
  const listedLayerGroups = useMapStore((state) => state.listedLayerGroups)
  const toggleLayerGroup = useMapStore((state) => state.toggleLayerGroup)
  const setLayerGroupOpacity = useMapStore(
    (state) => state.setLayerGroupOpacity
  )
  const visibleLayerGroupIds = useVisibleLayerGroupIds()
  const activeMapMenu = useUIStore((state) => state.activeMapMenu)
  const setMapMenuState = useUIStore((state) => state.setMapMenuState)
  const anchorRef = useRef<HTMLButtonElement>(null)
  const { t } = useTranslate('avoin-map')
  const opacityLabel = t('map.menus.layer_opacity')

  const isActive = useMemo(() => {
    return activeMapMenu === mapMenuState
  }, [activeMapMenu])

  const filteredLayerGroups = useMemo(() => {
    return listedLayerGroups.filter((layerGroup) =>
      shownLayerLevels.includes(
        layerGroup.addOptions.layerOrderOptions.layerOrderLevel
      )
    )
  }, [listedLayerGroups, shownLayerLevels])

  const handleOpacityChange = useCallback(
    (layerGroupId: string, nextOpacity: number) => {
      void setLayerGroupOpacity(layerGroupId, nextOpacity, { skipQueue: true })
    },
    [setLayerGroupOpacity]
  )

  const handleToggle = () => {
    setMapMenuState(mapMenuState, !isActive)
  }

  const handleClose = (event: Event | React.SyntheticEvent) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return
    }
    setMapMenuState(mapMenuState, false)
  }

  return (
    <>
      <MapButton
        onClick={handleToggle}
        ref={anchorRef}
        size="small"
        tooltip={tooltipLabel}
        isVertical={isVertical}
        sx={{
          backgroundColor: isActive ? 'neutral.main' : 'neutral.light',
        }}
      >
        {icon || <Layers />}
      </MapButton>
      <Popper
        open={isActive}
        anchorEl={anchorRef.current}
        placement={isVertical ? 'left-end' : 'bottom-start'}
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 8],
            },
          },
          {
            name: 'flip',
            enabled: false,
          },
          {
            name: 'preventOverflow',
            options: {
              padding: 16,
              tether: false,
              // altAxis: true,
            },
          },
        ]}
        sx={(theme) => ({
          zIndex: theme.zIndex.drawer + 3,
        })}
      >
        <Paper
          sx={(theme) => ({
            maxWidth: `calc(100vw - 78px)`,
            maxHeight: isVertical ? `calc(100vh - 32px)` : 'calc(100vh - 78px)',
            overflowY: 'auto',
            p: '2rem',
            backgroundColor: isVertical
              ? theme.palette.neutral.light
              : alpha(theme.palette.neutral.light, 0.9),
            borderRadius: '0.3125rem',
            width: 'fit-content',
          })}
        >
          <ClickAwayListener onClickAway={handleClose}>
            <Box>
              {headerLabel && (
                <Typography
                  variant="body1"
                  sx={{ mb: 3, ml: 0.5, textAlign: 'left' }}
                >
                  {headerLabel}
                </Typography>
              )}
              <Grid
                container
                spacing={'1rem'}
                sx={{
                  width: 'max-content',
                  display: 'inline-flex',
                  wrap: 'wrap',
                  maxWidth: isVertical
                    ? '10rem'
                    : filteredLayerGroups.length > 1
                    ? '25.5rem'
                    : '12rem',
                }}
              >
                {filteredLayerGroups.map((layerGroup: ListedLayerGroup) => (
                  <Grid sx={{ flex: '0 0 auto' }} key={layerGroup.id}>
                    <LayerItem
                      layerGroup={layerGroup}
                      isSelected={visibleLayerGroupIds.includes(layerGroup.id)}
                      isVertical={isVertical}
                      showOpacitySlider={
                        layerGroup.styleOptions?.showOpacitySlider
                      }
                      opacityLabel={opacityLabel}
                      onOpacityChange={handleOpacityChange}
                      onSelect={() => {
                        toggleLayerGroup(layerGroup.id, layerGroup.addOptions)
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </ClickAwayListener>
        </Paper>
      </Popper>
    </>
  )
}
