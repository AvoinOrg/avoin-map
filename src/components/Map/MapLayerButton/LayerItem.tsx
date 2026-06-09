import React, { useEffect, useRef, useState } from 'react'
import { Button as BaseButton } from '@base-ui/react/button'
import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible'
import { Slider as BaseSlider } from '@base-ui/react/slider'
import { css } from 'styled-system/css'
import Image from 'next/image'
import { useTranslate } from '@tolgee/react'

import { ArrowDown } from '#/components/icons'
import { Box } from '#/components/common/PandaBox'
import { useLayerGroupOpacity } from '#/common/hooks/map/useLayerGroupOpacity'
import { ListedLayerGroup } from '#/common/types/map'
import { clampOpacity } from '#/common/utils/map'
import TText from '#/components/common/TText'
import styles from './LayerItem.module.css'

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
  const hasHandledInitialInfoStateRef = useRef(false)
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

  const handleSliderValueChange = (nextValue: number) => {
    onOpacityChange?.(layerGroup.id, nextValue)
  }

  useEffect(() => {
    if (!hasInfo || !onInfoToggle) {
      return
    }

    if (!hasHandledInitialInfoStateRef.current) {
      hasHandledInitialInfoStateRef.current = true
      return
    }

    const animationFrameId = window.requestAnimationFrame(() => {
      onInfoToggle()
    })

    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [hasInfo, isInfoOpen, onInfoToggle])

  const imageMarginTop = hasInfo && isInfoOpen ? 0 : imageSpacing

  const renderImage = () => (
    <Box
      component="button"
      type="button"
      aria-label={`Toggle layer ${name}`}
      aria-pressed={isSelected}
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
        data-layer-selected={isSelected ? 'true' : 'false'}
        className={styles.imageFrame}
        sx={{
          position: 'relative',
          borderRadius: infoCardRadius,
          overflow: 'hidden',
          lineHeight: 0,
          width: '100%',
          aspectRatio: '3 / 1',
          boxShadow: baseShadow,
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
          component="span"
          sx={{
            textStyle: 'h4',
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
          <BaseButton
            type="button"
            aria-label={`${name} info`}
            aria-expanded={isInfoOpen}
            aria-controls={infoId}
            onClick={() => setIsInfoOpen((prev) => !prev)}
            className={css({
              p: 0,
              width: 30,
              height: 30,
              border: 0,
              borderRadius: '50%',
              backgroundColor: 'common.white',
              color: '#075CFF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.12)',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'common.white',
              },
              '&:focus-visible': {
                outline: '2px solid var(--colors-secondary-dark)',
                outlineOffset: '2px',
              },
            })}
          >
            <ArrowDown
              sx={{
                transform: isInfoOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
                width: 9,
                height: 5,
              }}
            />
          </BaseButton>
        )}
      </Box>
      {hasInfo && (
        <BaseCollapsible.Root open={isInfoOpen}>
          <BaseCollapsible.Panel keepMounted={false}>
            <Box
              id={infoId}
              sx={{
                mt: imageSpacing,
                mb: `-${infoOverlap}`,
                width: '100%',
                backgroundColor: 'common.white',
                color: 'neutral.darker',
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
          </BaseCollapsible.Panel>
        </BaseCollapsible.Root>
      )}
      {renderImage()}
      {showOpacitySlider && (
        <Box sx={{ mt: 1.25, px: '1rem', position: 'relative', zIndex: 3 }}>
          <BaseSlider.Root
            min={0}
            max={1}
            step={0.05}
            value={resolvedOpacity}
            onValueChange={handleSliderValueChange}
            className={css({
              width: '100%',
              position: 'relative',
              zIndex: 3,
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: '0.5rem',
              alignItems: 'center',
            })}
          >
            <BaseSlider.Control
              className={css({
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                height: '1rem',
                cursor: 'pointer',
              })}
            >
              <BaseSlider.Track
                className={css({
                  width: '100%',
                  height: '0.25rem',
                  borderRadius: '999px',
                  backgroundColor: 'neutral.main',
                })}
              >
                <BaseSlider.Indicator
                  className={css({
                    height: '100%',
                    borderRadius: '999px',
                    backgroundColor: 'secondary.dark',
                  })}
                />
              </BaseSlider.Track>
              <BaseSlider.Thumb
                getAriaLabel={() => opacityLabel || 'Opacity'}
                getAriaValueText={(_formattedValue, value) =>
                  `${Math.round(value * 100)}%`
                }
                className={css({
                  width: '0.875rem',
                  height: '0.875rem',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  border: '2px solid var(--colors-secondary-dark)',
                  boxShadow: '0 1px 3px rgba(17, 17, 17, 0.2)',
                  '&:focus-visible': {
                    outline: '2px solid var(--colors-secondary-dark)',
                    outlineOffset: '2px',
                  },
                })}
              />
            </BaseSlider.Control>
            <span
              className={css({
                minWidth: '2.25rem',
                textAlign: 'right',
                fontSize: '0.625rem',
                lineHeight: 1,
                letterSpacing: '0.04em',
                color: 'neutral.darker',
              })}
            >
              {Math.round(resolvedOpacity * 100)}%
            </span>
          </BaseSlider.Root>
        </Box>
      )}
    </Box>
  )
}

export default LayerItem
