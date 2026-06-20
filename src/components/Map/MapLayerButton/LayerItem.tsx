import React, { useEffect, useRef, useState } from 'react'
import { Slider } from '@base-ui/react/slider'
import Image from 'next/image'
import { useTranslate } from '@tolgee/react'

import { Box } from '#/common/style/theme'
import { ArrowDown } from '#/components/icons'
import { useLayerGroupOpacity } from '#/common/hooks/map/useLayerGroupOpacity'
import { ListedLayerGroup } from '#/common/types/map'
import { clampOpacity } from '#/common/utils/map'
import TText from '#/components/common/TText'

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
  const name = t(layerGroup.nameTranslationKey)
  const infoCardRadius = '0.3125rem'
  const baseShadow = '0 2px 4px 0 rgba(0, 0, 0, 0.10)'
  const headerHeight = 20
  const imageSpacing = 1.25
  const infoOverlap = '0.75rem'
  const storedOpacity = useLayerGroupOpacity(layerGroup.id)
  const defaultOpacity = clampOpacity(
    layerGroup.styleOptions?.defaultOpacity ?? 1
  )
  const resolvedOpacity = storedOpacity ?? defaultOpacity
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const hasToggledInfo = useRef(false)
  const hasInfo = Boolean(layerGroup.infoElement)
  const infoId = `layer-info-${layerGroup.id}`
  const buttonTypeProps = { type: 'button' } as const

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

  useEffect(() => {
    if (!hasInfo || !onInfoToggle || !hasToggledInfo.current) {
      return
    }

    const frameId = window.requestAnimationFrame(onInfoToggle)
    return () => window.cancelAnimationFrame(frameId)
  }, [hasInfo, isInfoOpen, onInfoToggle])

  const handleOpacityChange = (value: number | readonly number[]) => {
    if (!onOpacityChange) {
      return
    }

    const nextValue = Array.isArray(value) ? value[0] : value
    onOpacityChange(layerGroup.id, nextValue)
  }

  const imageMarginTop = hasInfo && isInfoOpen ? 0 : imageSpacing

  const renderImage = () => (
    <Box
      component="button"
      {...buttonTypeProps}
      aria-label={`Toggle layer ${name}`}
      onClick={() => onSelect(layerGroup.id)}
      sx={{
        p: 0,
        m: 0,
        width: '100%',
        background: 'none',
        border: 'none',
        textAlign: 'inherit',
        cursor: 'pointer',
        mt: imageMarginTop,
        position: 'relative',
        zIndex: 1,
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
            borderColor: isSelected ? 'secondary.dark' : 'transparent',
            boxSizing: 'border-box',
            pointerEvents: 'none',
            transition: 'border-color 0.2s ease, border-width 0.2s ease',
            zIndex: 1,
          },
          '&:hover::after': {
            borderWidth: 3,
            borderColor: isSelected ? 'secondary.dark' : 'primary.main',
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
        <Box
          component="h4"
          sx={{
            m: 0,
            typography: 'h4',
            whiteSpace: 'normal',
            overflowWrap: 'break-word',
            flex: 1,
            minWidth: 0,
          }}
        >
          <TText
            keyName={layerGroup.nameTranslationKey}
            ns={layerGroup.translationNs}
          />
        </Box>
        {hasInfo && (
          <Box
            component="button"
            {...buttonTypeProps}
            aria-label={`${name} info`}
            aria-expanded={isInfoOpen}
            aria-controls={infoId}
            onClick={() => {
              hasToggledInfo.current = true
              setIsInfoOpen((prev) => !prev)
            }}
            sx={{
              appearance: 'none',
              border: '1px solid transparent',
              p: 0,
              m: 0,
              width: 30,
              minWidth: 30,
              height: 30,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              borderRadius: '50%',
              backgroundColor: 'common.white',
              color: '#075CFF',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.12)',
              cursor: 'pointer',
              lineHeight: 1,
              '&:hover': {
                backgroundColor: 'common.white',
              },
              '&:focus-visible': {
                outline: '2px solid #075CFF',
                outlineOffset: 2,
              },
            }}
          >
            <ArrowDown
              sx={{
                transform: isInfoOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
                width: 9,
                height: 5,
              }}
            />
          </Box>
        )}
      </Box>
      {hasInfo && isInfoOpen && (
        <Box
          id={infoId}
          sx={{
            mt: imageSpacing,
            mb: `-${infoOverlap}`,
            width: '100%',
            backgroundColor: 'common.white',
            color: 'text.primary',
            boxShadow: baseShadow,
            borderRadius: infoCardRadius,
            position: 'relative',
            zIndex: 0,
          }}
        >
          <Box
            sx={{
              px: 1,
              pt: 1,
              pb: `calc(${infoOverlap} + 0.5rem)`,
            }}
          >
            {layerGroup.infoElement}
          </Box>
        </Box>
      )}
      {renderImage()}
      {showOpacitySlider && (
        <Box
          sx={{
            mt: 1.25,
            px: '1rem',
            position: 'relative',
            zIndex: 3,
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Slider.Root
            min={0}
            max={1}
            step={0.05}
            value={resolvedOpacity}
            onValueChange={handleOpacityChange}
            render={(rootProps) => (
              <Box {...rootProps} sx={{ width: '100%', minWidth: 0 }} />
            )}
          >
            <Slider.Control
              render={(controlProps) => (
                <Box
                  {...controlProps}
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    height: 20,
                    touchAction: 'none',
                  }}
                />
              )}
            >
              <Slider.Track
                render={(trackProps) => (
                  <Box
                    {...trackProps}
                    sx={{
                      position: 'relative',
                      width: '100%',
                      height: 4,
                      borderRadius: '999px',
                      backgroundColor: 'rgba(0, 0, 0, 0.18)',
                    }}
                  />
                )}
              >
                <Slider.Indicator
                  render={(indicatorProps) => (
                    <Box
                      {...indicatorProps}
                      sx={{
                        height: '100%',
                        borderRadius: 'inherit',
                        backgroundColor: 'primary.main',
                      }}
                    />
                  )}
                />
                <Slider.Thumb
                  getAriaLabel={() => opacityLabel || 'Opacity'}
                  getAriaValueText={(_formattedValue, value) =>
                    `${Math.round(value * 100)}%`
                  }
                  render={(thumbProps) => (
                    <Box
                      {...thumbProps}
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        backgroundColor: 'common.white',
                        border: '2px solid',
                        borderColor: 'primary.main',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.22)',
                        '&:focus-within, &:focus-visible, &[data-focus-visible="true"]':
                          {
                            outline: '2px solid #075CFF',
                            outlineOffset: 2,
                          },
                      }}
                    />
                  )}
                />
              </Slider.Track>
            </Slider.Control>
          </Slider.Root>
          <Box
            component="span"
            aria-hidden="true"
            sx={{
              minWidth: '2.5rem',
              color: 'text.secondary',
              fontSize: '0.75rem',
              fontWeight: 600,
              lineHeight: 1,
              textAlign: 'right',
            }}
          >
            {Math.round(resolvedOpacity * 100)}%
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default LayerItem
