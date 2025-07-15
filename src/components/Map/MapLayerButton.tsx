'use client'

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
  onSelect: (id: string) => void
}

const LayerItem = ({ layerGroup, isSelected, onSelect }: LayerItemProps) => (
  <Box
    onClick={() => onSelect(layerGroup.id)}
    sx={{
      cursor: 'pointer',
      border: `2px solid transparent`,
      borderRadius: '4px',
      padding: '4px',
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
      }}
    >
      <Image
        src={layerGroup.thumbnail || ''}
        alt={layerGroup.name || ''}
        width={100}
        height={100}
        style={{
          width: '100%',
          height: 'auto',
          aspectRatio: '1 / 1',
          objectFit: 'cover',
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
      }}
    >
      {layerGroup.name}
    </Typography>
  </Box>
)

const mapMenuState: MapMenuState = 'backgroundLayers'

type Props = {
  isVertical: boolean
  shownLayerLevels: LayerOrderLevel[]
  tooltipLabel: string
  icon?: React.ReactNode
}

export const MapLayerButton = ({
  isVertical,
  shownLayerLevels,
  tooltipLabel,
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
              padding: { right: 16, top: 16 },
            },
          },
        ]}
        sx={(theme) => ({
          zIndex: theme.zIndex.drawer + 3,
        })}
      >
        <Paper
          sx={(theme) => ({
            width: filteredLayerGroups.length > 1 ? 320 : 150,
            maxHeight: 400,
            overflowY: 'auto',
            p: 2,
            backgroundColor: alpha(theme.palette.neutral.light, 0.9),
            borderRadius: '0.3125rem',
          })}
        >
          <ClickAwayListener onClickAway={handleClose}>
            <Grid container spacing={2}>
              {filteredLayerGroups.map((layerGroup: ListedLayerGroup) => (
                <Grid
                  size={filteredLayerGroups.length > 1 ? 6 : 12}
                  key={layerGroup.id}
                >
                  <LayerItem
                    layerGroup={layerGroup}
                    isSelected={visibleLayerGroupIds.includes(layerGroup.id)}
                    onSelect={() => {
                      toggleLayerGroup(layerGroup.id, layerGroup.addOptions)
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </ClickAwayListener>
        </Paper>
      </Popper>
    </>
  )
}
