'use client'

import React, { useMemo } from 'react'
import { Box, Typography } from '@mui/material'
import { T, useTranslate } from '@tolgee/react'
import { useRouter } from 'next/navigation'

import { SidebarContentBox } from '#/components/Sidebar'
import { getRoute } from '#/common/routing/routing-client'
import { useMapStore } from '#/common/store'
import { useVisibleLayerGroupIds } from '#/common/hooks/map/useVisibleLayerGroupIds'
import { EyeButton } from '#/components/common/EyeButton'
import { IntoSlot } from '#/components/context/slotsContext'

import { routeTree } from '#/common/routing/routes/hiilikartta'
import { listedLayerGroups } from '../common/constants'

const HomeSidebarHeader = () => {
  return (
    <Box
      sx={{
        px: { mobile: '0.625rem', desktop: '0.625rem' },
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
  const firstSentenceEndIndex = introText.indexOf('. ')
  const leadingIntroSentence =
    firstSentenceEndIndex >= 0
      ? introText.slice(0, firstSentenceEndIndex + 1)
      : introText
  const trailingIntroSentence =
    firstSentenceEndIndex >= 0
      ? introText.slice(firstSentenceEndIndex + 2)
      : ''

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
            px: { mobile: '1.5rem', desktop: '1.6875rem' },
            display: 'flex',
            alignItems: 'center',
            gap: '1.625rem',
            border: 'none',
            borderRadius: { mobile: 0, desktop: '6px 6px 10px 10px' },
            backgroundColor: '#b0ff6b',
            color: '#111111',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: '#b0ff6b',
            },
          }}
        >
          <Box
            component="img"
            src="/files/img/hiilikartta/sidebar/home-footer-icon.svg"
            alt=""
            aria-hidden="true"
            sx={{
              width: '1.375rem',
              height: '1rem',
              flexShrink: 0,
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
            Katsele omat kaavat tai luo uusia tästä
          </Typography>
        </Box>
      </IntoSlot>
      <SidebarContentBox
        sxOuter={{
          height: '100%',
        }}
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
              px: '1.25rem',
              pt: 0,
              pb: '1rem',
            }}
          >
            <Box>
              <Typography
                sx={{
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
                <Box component="span" sx={{ color: '#979797' }}>
                  {leadingIntroSentence}
                  {trailingIntroSentence ? ' ' : ''}
                </Box>
                {trailingIntroSentence}
              </Typography>

              {vegetationLayerGroup && (
                <Box
                  sx={{
                    mt: { mobile: '4rem', desktop: '5.25rem' },
                    py: '0.4rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                    borderBottom: '1px solid rgba(17, 17, 17, 0.1)',
                  }}
                >
                  <Typography
                    sx={{
                      color: '#111111',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      lineHeight: '1.125rem',
                      letterSpacing: '0.02em',
                      whiteSpace: 'normal',
                    }}
                  >
                    <T keyName="sidebar.main.vegetation_layer" ns="hiilikartta" />
                  </Typography>
                  <EyeButton
                    ariaLabel="Toggle vegetation carbon layer"
                    color="#B0FF6B"
                    status={isVegetationLayerVisible ? 'visible' : 'hidden'}
                    onClick={(event) => {
                      event.preventDefault()
                      toggleLayerGroup(
                        vegetationLayerGroup.id,
                        vegetationLayerGroup.addOptions
                      )
                    }}
                  />
                </Box>
              )}
            </Box>

            <Box sx={{ mt: 'auto', pt: '2rem' }}>
              <Typography
                sx={{
                  color: '#4b4b4b',
                  fontSize: '0.5rem',
                  fontWeight: 400,
                  lineHeight: '1rem',
                  letterSpacing: '0.04em',
                  whiteSpace: 'normal',
                  maxWidth: '18.625rem',
                }}
              >
                <T keyName="sidebar.main.attribution" ns="hiilikartta" />
              </Typography>

              <Box
                sx={{
                  mt: '2.85rem',
                  width: '100%',
                  maxWidth: '15.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                }}
              >
                <Box
                  component="img"
                  src="/files/img/hiilikartta/sidebar/nappaa-logo.png"
                  alt="Nappaa hiilesta kiinni"
                  sx={{ height: '2.375rem', width: 'auto', objectFit: 'contain' }}
                />
                <Box
                  component="img"
                  src="/files/img/hiilikartta/sidebar/syke-logo.png"
                  alt="Syke"
                  sx={{ height: '2.5rem', width: 'auto', objectFit: 'contain' }}
                />
                <Box
                  component="img"
                  src="/files/img/hiilikartta/sidebar/luke-logo.png"
                  alt="Luke"
                  sx={{ height: '2.5rem', width: 'auto', objectFit: 'contain' }}
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
