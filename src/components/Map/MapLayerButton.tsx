'use client'
// Grid grid grid, why are you so shit
// The layout and styling is complete spaghetti.
// TODO: figure out how to make it neat. 

import React, { useRef, useMemo } from 'react'
import {
  Box,
  Popper,
  Paper,
  Typography,
  Grid,
  ClickAwayListener,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import Image from 'next/image'

import { useMapStore, useUIStore } from '#/common/store'
import { Layers } from '#/components/icons'
import { MapButton } from './MapButton'
import { useVisibleLayerGroupIds } from '#/common/hooks/map/useVisibleLayerGroupIds'
import { LayerOrderLevel, ListedLayerGroup } from '#/common/types/map'
import { MapMenuState } from '#/common/types/state'

type LayerItemProps = {
  layerGroup: ListedLayerGroup
  isSelected: boolean
  isVertical: boolean
  onSelect: (id: string) => void
}

const LayerItem = ({
  layerGroup,
  isSelected,
  isVertical,
  onSelect,
}: LayerItemProps) => (
  <Box
    onClick={() => onSelect(layerGroup.id)}
    sx={{
      cursor: 'pointer',
      border: `2px solid transparent`,
      borderRadius: '4px',
      textAlign: 'left',
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
        width: isVertical ? '10rem' : '12rem',
        height: isVertical ? '10rem' : '12rem',
      }}
    >
      <Image
        src={layerGroup.thumbnail || ''}
        alt={layerGroup.name || ''}
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
    <Typography
      sx={{
        typography: 'body1',
        fontSize: '0.60rem',
        letterSpacing: '0.040rem',
        mt: 1,
        whiteSpace: 'normal',
        overflowWrap: 'break-word',
        width: isVertical ? '120px' : '180px',
      }}
    >
      {layerGroup.name}
    </Typography>
  </Box>
)

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
  const visibleLayerGroupIds = useVisibleLayerGroupIds()
  const activeMapMenu = useUIStore((state) => state.activeMapMenu)
  const setMapMenuState = useUIStore((state) => state.setMapMenuState)
  const anchorRef = useRef<HTMLButtonElement>(null)

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
