'use client'

import React, { useMemo } from 'react'
import { Box, Button, Typography } from '@mui/material'
import { T } from '@tolgee/react'
import { useRouter } from 'next/navigation'

import { SidebarContentBox, SidebarHeaderVisibilityBoundary } from '#/components/Sidebar'
import { getRoute } from '#/common/routing/routing-client'
import { useMapStore } from '#/common/store'
import { useVisibleLayerGroupIds } from '#/common/hooks/map/useVisibleLayerGroupIds'
import { EyeClosed, EyeOpen, ArrowNextBig } from '#/components/icons'

import { routeTree } from '#/common/routing/routes/hiilikartta'
import { listedLayerGroups } from '../common/constants'

const Page = () => {
  const router = useRouter()
  const toggleLayerGroup = useMapStore((state) => state.toggleLayerGroup)
  const visibleLayerGroupIds = useVisibleLayerGroupIds()

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
    <SidebarHeaderVisibilityBoundary hidden={true}>
      <SidebarContentBox
        sxInner={{
          px: { mobile: '1.25rem', desktop: '1.25rem' },
          pt: { mobile: '1.25rem', desktop: '1.25rem' },
          pb: { mobile: '1.25rem', desktop: '1.5rem' },
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        <Box
          component="img"
          src="/files/img/hiilikartta/sidebar/main-hero.jpg"
          alt="Hiilikartta"
          sx={{
            width: '100%',
            minHeight: { mobile: '6.25rem', desktop: '6.25rem' },
            borderRadius: '0.875rem',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />

        <Typography
          sx={{
            typography: 'body2',
            color: 'neutral.dark',
            letterSpacing: '0.04rem',
            lineHeight: '1.5rem',
            whiteSpace: 'normal',
          }}
        >
          <T keyName="sidebar.main.intro" ns="hiilikartta" />
        </Typography>

        {vegetationLayerGroup && (
          <Box
            component="button"
            type="button"
            aria-label="Toggle vegetation carbon layer"
            onClick={() =>
              toggleLayerGroup(
                vegetationLayerGroup.id,
                vegetationLayerGroup.addOptions
              )
            }
            sx={{
              width: '100%',
              p: 0,
              border: 'none',
              background: 'none',
              textAlign: 'inherit',
              cursor: 'pointer',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                px: 0.75,
                py: 0.85,
                borderBottom: '1px solid',
                borderColor: 'rgba(17, 17, 17, 0.12)',
                color: 'neutral.darker',
              }}
            >
              <Typography
                sx={{
                  typography: 'body2',
                  letterSpacing: '0.07rem',
                  color: 'inherit',
                  textAlign: 'left',
                }}
              >
                <T keyName="sidebar.main.vegetation_layer" ns="hiilikartta" />
              </Typography>
              {isVegetationLayerVisible ? (
                <EyeOpen sx={{ width: 18, height: 18, color: 'inherit' }} />
              ) : (
                <EyeClosed sx={{ width: 18, height: 18, color: 'inherit' }} />
              )}
            </Box>
          </Box>
        )}

        <Box sx={{ flex: 1 }} />

        <Typography
          sx={{
            typography: 'body3',
            color: 'neutral.dark',
            letterSpacing: '0.04rem',
            lineHeight: '1rem',
            whiteSpace: 'normal',
          }}
        >
          <T keyName="sidebar.main.attribution" ns="hiilikartta" />
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            flexWrap: 'wrap',
          }}
        >
          <Box
            component="img"
            src="/files/img/hiilikartta/sidebar/nappaa-logo.png"
            alt="Nappaa hiilesta kiinni"
            sx={{ height: '2.25rem', width: 'auto', objectFit: 'contain' }}
          />
          <Box
            component="img"
            src="/files/img/hiilikartta/sidebar/syke-logo.png"
            alt="Syke"
            sx={{ height: '2.4rem', width: 'auto', objectFit: 'contain' }}
          />
          <Box
            component="img"
            src="/files/img/hiilikartta/sidebar/luke-logo.png"
            alt="Luke"
            sx={{ height: '2.4rem', width: 'auto', objectFit: 'contain' }}
          />
        </Box>

        <Button
          variant="contained"
          aria-label="Open plans page"
          onClick={() =>
            router.push(getRoute({ routeNode: routeTree.plans, routeTree }))
          }
          sx={{
            width: '100%',
            minHeight: '5rem',
            justifyContent: 'space-between',
            borderRadius: '0.875rem',
            textTransform: 'uppercase',
            typography: 'h4',
            backgroundColor: '#B0FF6B',
            color: '#111',
            boxShadow: '0 1px 1px rgba(189, 189, 189, 0.25)',
            '&:hover': {
              backgroundColor: '#B0FF6B',
              boxShadow: '0 1px 1px rgba(189, 189, 189, 0.25)',
            },
          }}
        >
          <T keyName="sidebar.main.add_new" ns="hiilikartta" />
          <ArrowNextBig sx={{ width: 20, height: 20, color: 'inherit' }} />
        </Button>
      </SidebarContentBox>
    </SidebarHeaderVisibilityBoundary>
  )
}

export default Page
