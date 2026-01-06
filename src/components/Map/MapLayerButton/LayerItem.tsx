import React, { useEffect, useState } from 'react'
import {
  Box,
  Collapse,
  IconButton,
  Slider,
  Typography,
} from '@mui/material'
import Image from 'next/image'
import { useTranslate } from '@tolgee/react'

import { DownArrowRounded } from '#/components/icons'
import { useLayerGroupOpacity } from '#/common/hooks/map/useLayerGroupOpacity'
import { ListedLayerGroup } from '#/common/types/map'
import { clampOpacity } from '#/common/utils/map'

type LayerItemProps = {
  layerGroup: ListedLayerGroup
  isSelected: boolean
  onSelect: (id: string) => void
  showOpacitySlider?: boolean
  opacityLabel?: string
  onOpacityChange?: (layerGroupId: string, opacity: number) => void
  onInfoToggle?: () => void
}

const LayerItem = ({
  layerGroup,
  isSelected,
  onSelect,
  showOpacitySlider,
  opacityLabel,
  onOpacityChange,
  onInfoToggle,
}: LayerItemProps) => {
  const { t } = useTranslate(layerGroup.translationNs)
  const name = t(layerGroup.nameTranslationKey, layerGroup.name)
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
          width: '100%',
          aspectRatio: '3 / 1',
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
    <Box sx={{ width: '100%', textAlign: 'left' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          width: '100%',
          minHeight: headerHeight,
        }}
      >
        <Typography
          sx={{
            typography: 'h4',
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
              width: '100%',
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
        <Box sx={{ mt: 0.75, px: 1.5 }}>
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
            sx={{
              width: '100%',
              overflow: 'visible',
              '& .MuiSlider-valueLabel': {
                zIndex: 2,
              },
            }}
          />
        </Box>
      )}
    </Box>
  )
}

export default LayerItem
