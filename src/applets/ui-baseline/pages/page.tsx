'use client'

import React from 'react'
import { useTranslate } from '@tolgee/react'

import { AppRouteLink } from '#/common/navigation/appRouteLinks'
import { Box } from '#/common/style/theme'
import TText from '#/components/common/TText'
import {
  IntoSidebarHeaderSlot,
  SidebarContentBox,
} from '#/components/Sidebar'

import {
  UI_BASELINE_CATEGORIES,
  UI_BASELINE_NAMESPACE,
} from '../common/categories'

const HomeSidebarHeader = () => (
  <Box
    sx={{
      px: { mobile: '0.375rem', desktop: '0.375rem' },
      pt: { mobile: '0.4375rem', desktop: '0.5rem' },
      pb: { mobile: '0.375rem', desktop: '0.5rem' },
      flexShrink: 0,
    }}
  >
    <Box
      sx={{
        position: 'relative',
        minHeight: { mobile: '5.125rem', desktop: '5.625rem' },
        borderRadius: '0.625rem',
        overflow: 'hidden',
        backgroundImage: 'url(/files/img/hiilikartta/sidebar/main-hero.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(90deg, rgba(244,244,244,1) 0%, rgba(244,244,244,0.98) 24%, rgba(244,244,244,0.48) 48%, rgba(244,244,244,0) 76%)',
        }}
      />
      <Box
        component="h1"
        sx={{
          position: 'relative',
          zIndex: 1,
          m: 0,
          px: { mobile: '1rem', desktop: '1.25rem' },
          pt: { mobile: '2rem', desktop: '2rem' },
          color: '#111111',
          fontSize: '0.75rem',
          fontWeight: 700,
          lineHeight: '1.125rem',
          textTransform: 'uppercase',
        }}
      >
        <TText ns={UI_BASELINE_NAMESPACE} keyName="home.title" />
      </Box>
    </Box>
  </Box>
)

const Page = () => {
  const { t } = useTranslate(UI_BASELINE_NAMESPACE)

  return (
    <>
      <IntoSidebarHeaderSlot>
        <HomeSidebarHeader />
      </IntoSidebarHeaderSlot>
      <SidebarContentBox
        sxOuter={{ height: '100%' }}
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
            px: { mobile: '2rem', desktop: '2rem' },
            pt: { mobile: '1.125rem', desktop: '1.25rem' },
            pb: { mobile: '1.5rem', desktop: '1.75rem' },
            display: 'flex',
            flexDirection: 'column',
            gap: '1.375rem',
          }}
        >
          <Box
            component="p"
            sx={{
              m: 0,
              color: '#111111',
              fontSize: '0.75rem',
              fontWeight: 700,
              lineHeight: '1.25rem',
              textTransform: 'uppercase',
            }}
          >
            <TText ns={UI_BASELINE_NAMESPACE} keyName="home.intro" />
          </Box>

          <Box
            component="nav"
            aria-label={t('home.category_list_aria')}
            sx={{ width: '100%' }}
          >
            <Box
              component="ul"
              sx={{
                m: 0,
                p: 0,
                display: 'flex',
                flexDirection: 'column',
                listStyle: 'none',
                gap: '0.5rem',
              }}
            >
              {UI_BASELINE_CATEGORIES.map((category) => (
                <Box component="li" key={category.id}>
                  <AppRouteLink
                    routeKey={category.routeKey}
                    sx={(theme) => ({
                      width: '100%',
                      minHeight: '2.625rem',
                      px: '0.875rem',
                      py: '0.625rem',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderRadius: '6px',
                      border: `1px solid ${theme.palette.neutral.light}`,
                      backgroundColor: '#ffffff',
                      color: '#111111',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      lineHeight: '1rem',
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        color: theme.palette.primary.dark,
                      },
                      '&::after': {
                        content: '">"',
                        flexShrink: 0,
                        fontSize: '1rem',
                        lineHeight: 1,
                      },
                    })}
                  >
                    <TText
                      ns={UI_BASELINE_NAMESPACE}
                      keyName={category.labelKey}
                    />
                  </AppRouteLink>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </SidebarContentBox>
    </>
  )
}

export default Page
