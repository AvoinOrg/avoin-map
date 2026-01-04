'use client'
// Grid grid grid, why are you so shit
// The layout and styling is complete spaghetti.
// TODO: figure out how to make it neat.

import React, { useRef, useMemo, useCallback, useEffect, useState } from 'react'
import {
  Box,
  IconButton,
  Popper,
  Paper,
  Typography,
  Grid,
  ClickAwayListener,
  Slider,
  Collapse,
} from '@mui/material'
import type { Instance } from '@popperjs/core'
import { alpha } from '@mui/material/styles'
import Image from 'next/image'

import { useMapStore, useUIStore } from '#/common/store'
import { DownArrowRounded, Layers } from '#/components/icons'
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
  onInfoToggle?: () => void
}

const LayerItem = ({
  layerGroup,
  isSelected,
  isVertical,
  onSelect,
  showOpacitySlider,
  opacityLabel,
  onOpacityChange,
  onInfoToggle,
}: LayerItemProps) => {
  const { t } = useTranslate(layerGroup.translationNs)
  const name = t(layerGroup.nameTranslationKey, layerGroup.name)
  const tileWidth = isVertical ? '10rem' : '12rem'
  const tileHeight = `calc(${tileWidth} / 3)`
  const textWidth = tileWidth
  const infoCardRadius = '0.3125rem'
  const baseShadow = '0 2px 4px 0 rgba(0, 0, 0, 0.10)'
  const headerHeight = 20
  const imageSpacing = 0.75
  const storedOpacity = useLayerGroupOpacity(layerGroup.id)
  const defaultOpacity = clampOpacity(
    layerGroup.styleOptions?.defaultOpacity ?? 1
  )
  const resolvedOpacity = storedOpacity ?? defaultOpacity
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const hasInfo = Boolean(layerGroup.infoElement)
  const infoId = `layer-info-${layerGroup.id}`

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

  const renderImage = (variant: 'standalone' | 'card') => (
    <Box
      onClick={() => onSelect(layerGroup.id)}
      sx={{
        cursor: 'pointer',
        mt: variant === 'standalone' ? imageSpacing : 0,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          borderRadius: infoCardRadius,
          overflow: 'hidden',
          lineHeight: 0,
          width: tileWidth,
          height: tileHeight,
          boxShadow: baseShadow,
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: infoCardRadius,
            borderStyle: 'solid',
            borderWidth: isSelected ? 2 : 0,
            borderColor: (theme) =>
              isSelected ? theme.palette.secondary.dark : 'transparent',
            boxSizing: 'border-box',
            pointerEvents: 'none',
            transition: 'border-color 0.2s ease, border-width 0.2s ease',
            zIndex: 1,
          },
          '&:hover::after': {
            borderWidth: 3,
            borderColor: (theme) =>
              isSelected
                ? theme.palette.secondary.dark
                : theme.palette.primary.main,
          },
        }}
      >
        <Image
          src={layerGroup.thumbnail || ''}
          alt={name}
          width={256}
          height={256}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
      </Box>
    </Box>
  )

  return (
    <Box sx={{ width: tileWidth, textAlign: 'left' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          width: textWidth,
          minHeight: headerHeight,
        }}
      >
        <Typography
          sx={{
            typography: 'body1',
            fontSize: '0.60rem',
            letterSpacing: '0.040rem',
            lineHeight: 1.2,
            whiteSpace: 'normal',
            overflowWrap: 'break-word',
            flex: 1,
            minWidth: 0,
          }}
        >
          {name}
        </Typography>
        {hasInfo && (
          <IconButton
            size="small"
            aria-label={`${name} info`}
            aria-expanded={isInfoOpen}
            aria-controls={infoId}
            onClick={() => setIsInfoOpen((prev) => !prev)}
            sx={{
              p: 0,
              width: 20,
              height: 20,
              borderRadius: '50%',
              backgroundColor: 'common.white',
              color: '#075CFF',
              '&:hover': {
                backgroundColor: 'common.white',
              },
            }}
          >
            <DownArrowRounded
              sx={{
                transform: isInfoOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            />
          </IconButton>
        )}
      </Box>
      {hasInfo && (
        <Collapse
          in={isInfoOpen}
          timeout="auto"
          unmountOnExit
          onEntered={onInfoToggle}
          onExited={onInfoToggle}
        >
          <Box
            id={infoId}
            sx={{
              mt: imageSpacing,
              width: tileWidth,
              backgroundColor: 'common.white',
              color: 'text.primary',
              boxShadow: baseShadow,
              borderRadius: infoCardRadius,
            }}
          >
            <Box sx={{ p: 1 }}>{layerGroup.infoElement}</Box>
            {renderImage('card')}
          </Box>
        </Collapse>
      )}
      {(!hasInfo || !isInfoOpen) && renderImage('standalone')}
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
  const popperRef = useRef<Instance | null>(null)
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

  const handlePopperUpdate = useCallback(() => {
    popperRef.current?.update()
  }, [])

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
        popperRef={popperRef}
        placement={isVertical ? 'left-start' : 'bottom-start'}
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
              tether: true,
              altAxis: true,
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
            p: '1rem',
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
                      onInfoToggle={handlePopperUpdate}
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
