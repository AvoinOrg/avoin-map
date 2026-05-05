'use client'

import React, { useMemo } from 'react'
import { Box, Typography } from '@mui/material'
import { T, useTranslate } from '@tolgee/react'
import { useRouter } from 'next/navigation'

import { SidebarContentBox } from '#/components/Sidebar'
import { getRoute } from '#/common/routing/routing-client'
import { useMapStore } from '#/common/store'
import { useVisibleLayerGroupIds } from '#/common/hooks/map/useVisibleLayerGroupIds'
import { LayerToggleRow } from '#/components/common/LayerToggleRow'
import { IntoSlot } from '#/components/context/slotsContext'

import { routeTree } from '#/common/routing/routes/hiilikartta'
import { listedLayerGroups } from '../common/constants'
import PlanOutlineIcon from '../components/PlanOutlineIcon'

const HOME_SIDEBAR_HEADER_PADDING_REM = 0.75
const HOME_SIDEBAR_LEFT_WALL_REM = 2
const HOME_SIDEBAR_LOGO_ROW_PADDING_REM = 0.5

const HomeSidebarHeader = () => {
  return (
    <Box
      sx={{
        px: {
          mobile: `${HOME_SIDEBAR_HEADER_PADDING_REM}rem`,
          desktop: `${HOME_SIDEBAR_HEADER_PADDING_REM}rem`,
        },
        pt: { mobile: '0.625rem', desktop: '0.625rem' },
        pb: { mobile: '0.375rem', desktop: '0.5rem' },
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          minHeight: { mobile: '6rem', desktop: '6.25rem' },
          borderRadius: '0.625rem',
          overflow: 'hidden',
          backgroundImage:
            'url(/files/img/hiilikartta/sidebar/main-hero.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, rgba(244,244,244,1) 0%, rgba(244,244,244,0.98) 24%, rgba(244,244,244,0.48) 46%, rgba(244,244,244,0) 72%)',
          }}
        />
        <Typography
          sx={{
            position: 'relative',
            zIndex: 1,
            px: '1.25rem',
            pt: { mobile: '2.5rem', desktop: '2.625rem' },
            color: '#111111',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            lineHeight: '1.125rem',
            textTransform: 'uppercase',
          }}
        >
          Hiilikartta
        </Typography>
      </Box>
    </Box>
  )
}

const Page = () => {
  const { t } = useTranslate('hiilikartta')
  const router = useRouter()
  const toggleLayerGroup = useMapStore((state) => state.toggleLayerGroup)
  const visibleLayerGroupIds = useVisibleLayerGroupIds()
  const introText = t('sidebar.main.intro')

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
    <>
      <IntoSlot name="sidebar-header">
        <HomeSidebarHeader />
      </IntoSlot>
      <IntoSlot name="sidebar-footer">
        <Box
          component="button"
          type="button"
          aria-label="Open plans page"
          onClick={() =>
            router.push(getRoute({ routeNode: routeTree.plans, routeTree }))
          }
          sx={{
            width: '100%',
            height: '5rem',
            px: {
              mobile: `${HOME_SIDEBAR_LEFT_WALL_REM}rem`,
              desktop: `${HOME_SIDEBAR_LEFT_WALL_REM}rem`,
            },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: { mobile: '1.375rem', desktop: '1.625rem' },
            border: 'none',
            borderRadius: { mobile: 0, desktop: '6px 6px 10px 10px' },
            backgroundColor: '#b0ff6b',
            color: '#111111',
            cursor: 'pointer',
            boxShadow: '0px 1px 1px rgba(189, 189, 189, 0.25)',
            '&:hover': {
              backgroundColor: '#b0ff6b',
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
          <Typography
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
          </Typography>
        </Box>
      </IntoSlot>
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
              <Typography
                sx={{
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
                {introText}
              </Typography>

              {vegetationLayerGroup && (
                <LayerToggleRow
                  ariaLabel="Toggle vegetation carbon layer"
                  color="#2D7A3A"
                  status={isVegetationLayerVisible ? 'visible' : 'hidden'}
                  label={
                    <T keyName="sidebar.main.vegetation_layer" ns="hiilikartta" />
                  }
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
              <Typography
                sx={{
                  color: '#111111',
                  fontSize: '0.625rem',
                  fontWeight: 400,
                  lineHeight: '1rem',
                  letterSpacing: '0.03125rem',
                  whiteSpace: 'normal',
                  maxWidth: '18.625rem',
                }}
              >
                <T keyName="sidebar.main.attribution" ns="hiilikartta" />
              </Typography>

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
                  src="/files/img/Avoinlogo_Pysty_Green_Rek2024.svg"
                  alt="Avoin"
                  sx={{
                    width: '3.5rem',
                    height: '2.25rem',
                    objectFit: 'contain',
                    objectPosition: 'left center',
                  }}
                />
                <Box
                  component="img"
                  src="/files/img/hiilikartta/sidebar/syke-logo.png"
                  alt="Syke"
                  sx={{
                    width: '3.1rem',
                    objectFit: 'contain',
                  }}
                />
                <Box
                  component="img"
                  src="/files/img/hiilikartta/sidebar/luke-logo.png"
                  alt="Luke"
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
    </>
  )
}

export default Page
