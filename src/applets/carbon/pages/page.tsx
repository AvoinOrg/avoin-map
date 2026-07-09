'use client'

import React, { useMemo } from 'react'
import { useTranslate } from '@tolgee/react'

import { useAppRouteHrefBuilder } from '#/common/navigation/appRouteLinks'
import { useAppRouter } from '#/common/navigation/navigation'
import { Box, type AppSystemStyleObject } from '#/common/style/theme'
import {
  IntoSidebarFooterSlot,
  IntoSidebarHeaderSlot,
  SidebarBoundary,
  SidebarContentBox,
  SidebarHeader,
} from '#/components/Sidebar'
import { APP_ROUTE_KEYS } from '#/common/routing/routeMetadata'
import { useMapStore } from '#/common/store'
import { useVisibleLayerGroupIds } from '#/common/hooks/map/useVisibleLayerGroupIds'
import { LayerToggleRow } from '#/components/common/LayerToggleRow'

import { listedLayerGroups } from '../common/constants'
import PlanOutlineIcon from '../components/PlanOutlineIcon'

const HOME_SIDEBAR_LEFT_WALL_REM = 2
const HOME_SIDEBAR_LOGO_ROW_PADDING_REM = 0.5
const HOME_INTRO_BASELINE_LINE_WORD_COUNTS = [3, 4, 2, 2, 2, 2, 1]
const AVOIN_LOGO_PROPS: React.ImgHTMLAttributes<HTMLImageElement> = {
  src: '/files/img/Avoinlogo_Pysty_Green_Rek2024.svg',
  alt: 'Avoin',
}
const SYKE_LOGO_PROPS: React.ImgHTMLAttributes<HTMLImageElement> = {
  src: '/files/img/hiilikartta/sidebar/syke-logo.png',
  alt: 'Syke',
}
const LUKE_LOGO_PROPS: React.ImgHTMLAttributes<HTMLImageElement> = {
  src: '/files/img/hiilikartta/sidebar/luke-logo.png',
  alt: 'Luke',
}
const ButtonBox = Box as unknown as React.ComponentType<
  React.ComponentProps<'button'> & {
    component?: 'button'
    sx?: AppSystemStyleObject
  }
>

const getHomeIntroLines = (text: string) => {
  const words = text.trim().split(/\s+/)
  const expectedWordCount = HOME_INTRO_BASELINE_LINE_WORD_COUNTS.reduce(
    (sum, count) => sum + count,
    0
  )

  if (words.length !== expectedWordCount) {
    return [text]
  }

  let index = 0
  return HOME_INTRO_BASELINE_LINE_WORD_COUNTS.map((wordCount) => {
    const line = words.slice(index, index + wordCount).join(' ')
    index += wordCount
    return line
  })
}

const Page = () => {
  const { t } = useTranslate('hiilikartta')
  const router = useAppRouter()
  const buildAppRouteHref = useAppRouteHrefBuilder()
  const toggleLayerGroup = useMapStore((state) => state.toggleLayerGroup)
  const visibleLayerGroupIds = useVisibleLayerGroupIds()
  const introText = t('sidebar.main.intro')
  const introLines = useMemo(() => getHomeIntroLines(introText), [introText])

  const vegetationLayerGroup = useMemo(
    () =>
      listedLayerGroups.find(
        (layerGroup) => layerGroup.nameTranslationKey === 'layers.vegetation_co2.name'
      ),
    []
  )
  const isVegetationLayerVisible =
    vegetationLayerGroup != null &&
    visibleLayerGroupIds.includes(vegetationLayerGroup.id)

  return (
    <SidebarBoundary
      id="carbon-home"
      mode="floating"
      config={{ width: 'compact' }}
    >
      <IntoSidebarHeaderSlot>
        <SidebarHeader
          title="Hiilikartta"
          backgroundImage="/files/img/hiilikartta/sidebar/main-hero.jpg"
        />
      </IntoSidebarHeaderSlot>
      <IntoSidebarFooterSlot>
        <Box
          sx={{
            width: '100%',
            height: '5rem',
            display: 'flex',
            alignItems: 'center',
            borderRadius: { mobile: 0, desktop: '6px 6px 10px 10px' },
            backgroundColor: '#b0ff6b',
            boxShadow: '0px 1px 1px rgba(189, 189, 189, 0.25)',
          }}
        >
          <ButtonBox
            component="button"
            type="button"
            aria-label="Open plans page"
            onClick={() =>
              router.push(
                buildAppRouteHref({
                  routeKey: APP_ROUTE_KEYS.CARBON_PLANS,
                })
              )
            }
            sx={{
              width: { mobile: 'calc(100% - 4.75rem)', desktop: '100%' },
              height: '100%',
              pl: {
                mobile: `${HOME_SIDEBAR_LEFT_WALL_REM}rem`,
                desktop: `${HOME_SIDEBAR_LEFT_WALL_REM}rem`,
              },
              pr: { mobile: 0, desktop: `${HOME_SIDEBAR_LEFT_WALL_REM}rem` },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: { mobile: '1.375rem', desktop: '1.625rem' },
              border: 'none',
              borderRadius: { mobile: 0, desktop: '6px 6px 10px 10px' },
              backgroundColor: 'transparent',
              color: '#111111',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'transparent',
              },
            }}
          >
            <PlanOutlineIcon
              variant="large"
              sx={{
                width: '1.375rem',
                height: '1rem',
                flexShrink: 0,
                color: '#111111',
              }}
            />
            <Box
              component="span"
              sx={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                lineHeight: '0.8125rem',
                letterSpacing: '0.1em',
                textAlign: 'left',
                textTransform: 'none',
              }}
            >
              Luo Kaava & laske hiilivaikutukset
            </Box>
          </ButtonBox>
        </Box>
      </IntoSidebarFooterSlot>
      <SidebarContentBox
        sxOuter={{
          height: '100%',
        }}
        scrollbarSide="left"
        sxInner={{
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100%',
          height: '100%',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100%',
            height: '100%',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              px: {
                mobile: `${HOME_SIDEBAR_LEFT_WALL_REM}rem`,
                desktop: `${HOME_SIDEBAR_LEFT_WALL_REM}rem`,
              },
              pt: 0,
              pb: '1rem',
            }}
          >
            <Box>
              <Box
                component="p"
                sx={{
                  m: 0,
                  mt: { mobile: '1.125rem', desktop: '1.25rem' },
                  color: '#111111',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  lineHeight: '1.25rem',
                  textTransform: 'uppercase',
                  whiteSpace: 'normal',
                  maxWidth: '18.2rem',
                }}
              >
                {introLines.map((line, index) => (
                  <Box
                    component="span"
                    key={`${index}-${line}`}
                    sx={{ display: 'block' }}
                  >
                    {line}
                  </Box>
                ))}
              </Box>

              {vegetationLayerGroup && (
                <LayerToggleRow
                  ariaLabel="Toggle vegetation carbon layer"
                  color="#2D7A3A"
                  status={isVegetationLayerVisible ? 'visible' : 'hidden'}
                  label={t('sidebar.main.vegetation_layer')}
                  onToggle={() =>
                    toggleLayerGroup(
                      vegetationLayerGroup.id,
                      vegetationLayerGroup.addOptions
                    )
                  }
                  sx={{
                    mt: { mobile: '4rem', desktop: '5.25rem' },
                  }}
                  labelSx={{
                    color: '#111111',
                    fontSize: '0.6875rem',
                    fontWeight: 400,
                    lineHeight: '1.125rem',
                    letterSpacing: '0.1em',
                  }}
                />
              )}
            </Box>

            <Box sx={{ mt: 'auto', pt: { mobile: '2.5rem', desktop: '3rem' } }}>
              <Box
                component="p"
                sx={{
                  m: 0,
                  color: '#111111',
                  fontSize: '0.625rem',
                  fontWeight: 400,
                  lineHeight: '1rem',
                  letterSpacing: '0.03125rem',
                  whiteSpace: 'normal',
                  maxWidth: '18.625rem',
                }}
              >
                {t('sidebar.main.attribution')}
              </Box>

              <Box
                sx={{
                  mt: { mobile: '2.5rem', desktop: '3rem' },
                  width: '100%',
                  px: {
                    mobile: `${HOME_SIDEBAR_LOGO_ROW_PADDING_REM}rem`,
                    desktop: `${HOME_SIDEBAR_LOGO_ROW_PADDING_REM}rem`,
                  },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}
              >
                <Box
                  component="img"
                  {...AVOIN_LOGO_PROPS}
                  sx={{
                    width: '3.5rem',
                    height: '2.25rem',
                    objectFit: 'contain',
                    objectPosition: 'left center',
                  }}
                />
                <Box
                  component="img"
                  {...SYKE_LOGO_PROPS}
                  sx={{
                    width: '3.1rem',
                    objectFit: 'contain',
                  }}
                />
                <Box
                  component="img"
                  {...LUKE_LOGO_PROPS}
                  sx={{
                    width: '2.8rem',
                    objectFit: 'contain',
                    objectPosition: 'right center',
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </SidebarContentBox>
    </SidebarBoundary>
  )
}

export default Page
