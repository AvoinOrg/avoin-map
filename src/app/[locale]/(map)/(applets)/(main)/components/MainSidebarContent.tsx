'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { useTranslate } from '@tolgee/react'
import { Box, IconButton, Typography } from '@mui/material'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import type { EventListeners } from 'overlayscrollbars'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import type { OverlayScrollbarsComponentRef } from 'overlayscrollbars-react'

import MutableLink from '#/components/common/MutableLink'
import { mainRouteTree } from '#/common/routing/routes/main'
import { SCROLLBAR_WIDTH_REM } from '#/common/style/theme/constants'
import { RouteTree } from '#/common/types/routing'

const MAIN_WORDMARK_SRC = '/files/img/main-sidebar/avoin-map-wordmark-v2.svg'
const HIILIKARTTA_HERO_SRC = '/files/img/main-sidebar/hiilikartta-hero.svg'
const FORESTS_HERO_SRC = '/files/img/main-sidebar/forests-hero.jpg'
const BUILDINGS_HERO_SRC = '/files/img/main-sidebar/buildings-hero.jpg'
const DESKTOP_SHADOW_BLEED_REM = 0.8
const DESKTOP_SCROLLBAR_GUTTER_REM = SCROLLBAR_WIDTH_REM + 0.25

type BubbleVariant = 'hiilikartta' | 'imageHeader'

const APPLET_BUBBLES: Array<{
  id: string
  route: RouteTree
  titleKey: string
  descriptionKey: string
  minHeight: string
  bgColor: string
  heroSrc: string
  heroPosition: string
  variant: BubbleVariant
}> = [
  {
    id: 'buildings',
    route: mainRouteTree.energiakartta,
    titleKey: 'sidebar.buildings',
    descriptionKey: 'sidebar.main.bubbles.buildings.description',
    minHeight: '20.375rem',
    bgColor: '#f0f1f4',
    heroSrc: BUILDINGS_HERO_SRC,
    heroPosition: 'center 42%',
    variant: 'imageHeader',
  },
  {
    id: 'hiilikartta',
    route: mainRouteTree.hiilikartta,
    titleKey: 'sidebar.main.bubbles.hiilikartta.title',
    descriptionKey: 'sidebar.main.bubbles.hiilikartta.description',
    minHeight: '13.125rem',
    bgColor: '#02382c',
    heroSrc: HIILIKARTTA_HERO_SRC,
    heroPosition: 'center top',
    variant: 'hiilikartta',
  },
  {
    id: 'forests',
    route: mainRouteTree.forests,
    titleKey: 'sidebar.forests',
    descriptionKey: 'sidebar.main.bubbles.forests.description',
    minHeight: '18.75rem',
    bgColor: '#c9e0dd',
    heroSrc: FORESTS_HERO_SRC,
    heroPosition: 'center 38%',
    variant: 'imageHeader',
  },
]

const MainSidebarContent = () => {
  const { t } = useTranslate('avoin-map')
  const scrollContainerRef = useRef<OverlayScrollbarsComponentRef<'div'> | null>(null)
  const [showScrollHint, setShowScrollHint] = useState(false)

  const scrollOptions = useMemo(
    () => ({
      overflow: { x: 'hidden' as const, y: 'scroll' as const },
      scrollbars: {
        theme: 'os-theme-dark',
        visibility: 'auto' as const,
        autoHide: 'leave' as const,
        autoHideDelay: 160,
      },
    }),
    []
  )

  const updateScrollHint = useCallback(() => {
    const osInstance = scrollContainerRef.current?.osInstance()
    const viewport = osInstance?.elements().viewport

    if (!osInstance || !viewport) {
      setShowScrollHint(false)
      return
    }

    const hasOverflow = osInstance.state().hasOverflow.y
    const canScrollDown =
      viewport.scrollTop + viewport.clientHeight < viewport.scrollHeight - 3

    setShowScrollHint(hasOverflow && canScrollDown)
  }, [])

  const scrollEvents = useMemo<EventListeners>(
    () => ({
      initialized: () => {
        updateScrollHint()
      },
      updated: () => {
        updateScrollHint()
      },
      scroll: () => {
        updateScrollHint()
      },
    }),
    [updateScrollHint]
  )

  useEffect(() => {
    updateScrollHint()
    window.addEventListener('resize', updateScrollHint)

    return () => {
      window.removeEventListener('resize', updateScrollHint)
    }
  }, [updateScrollHint])

  const handleScrollDown = () => {
    const viewport = scrollContainerRef.current?.osInstance()?.elements().viewport
    if (!viewport) {
      return
    }

    viewport.scrollBy({ top: 260, behavior: 'smooth' })
  }

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        px: { mobile: 2, desktop: 0 },
        py: { mobile: 2, desktop: 0 },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          flex: 1,
          height: '100%',
          minHeight: 0,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            minHeight: 0,
            mx: { mobile: 0, desktop: `-${DESKTOP_SHADOW_BLEED_REM}rem` },
            pointerEvents: 'none',
            '& .os-scrollbar-vertical': {
              left: 0,
              right: 'auto',
            },
            '& .os-scrollbar-corner': {
              left: 0,
              right: 'auto',
            },
          }}
        >
          <OverlayScrollbarsComponent
            ref={scrollContainerRef}
            className="osScroll osLeft"
            options={scrollOptions}
            events={scrollEvents}
            style={{
              height: '100%',
              minHeight: 0,
              direction: 'rtl',
              pointerEvents: 'auto',
            }}
          >
            <Box
              sx={{
                direction: 'ltr',
                display: 'grid',
                gridTemplateColumns: {
                  mobile: '1fr',
                  desktop: 'repeat(2, minmax(0, 1fr))',
                },
                gap: 2,
                pr: { mobile: 0, desktop: `${DESKTOP_SHADOW_BLEED_REM}rem` },
                pl: {
                  mobile: 0,
                  desktop: `${DESKTOP_SHADOW_BLEED_REM + DESKTOP_SCROLLBAR_GUTTER_REM}rem`,
                },
                pb: showScrollHint ? 7 : 1,
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '20.375rem',
                  backgroundColor: '#454545',
                  borderRadius: '10px',
                  color: 'common.white',
                  px: 3.25,
                  py: 3,
                  boxShadow: '0 18px 36px rgba(0, 0, 0, 0.2)',
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    width: '6rem',
                    height: '0.85rem',
                  }}
                >
                  <Image
                    src={MAIN_WORDMARK_SRC}
                    alt={t('sidebar.main.intro.wordmark_alt')}
                    fill
                    sizes="96px"
                    style={{ objectFit: 'contain' }}
                  />
                </Box>
                <Typography
                  sx={{
                    mt: 5.75,
                    typography: 'body1',
                    fontWeight: 700,
                    fontSize: '1rem',
                    lineHeight: 1.45,
                    letterSpacing: '0.1rem',
                    color: 'common.white',
                    overflowWrap: 'anywhere',
                    display: '-webkit-box',
                    WebkitLineClamp: 7,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {t('sidebar.main.intro.description')}
                </Typography>
              </Box>

              {APPLET_BUBBLES.map(
                ({
                  id,
                  route,
                  titleKey,
                  descriptionKey,
                  minHeight,
                  bgColor,
                  heroSrc,
                  heroPosition,
                  variant,
                }) => (
                  <MutableLink
                    key={id}
                    route={route}
                    routeTree={mainRouteTree}
                    sx={{
                      display: 'flex',
                      width: '100%',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        minHeight,
                        borderRadius: '10px',
                        color: variant === 'hiilikartta' ? 'common.white' : '#111111',
                        backgroundColor: bgColor,
                        boxShadow: '0 14px 30px rgba(0, 0, 0, 0.16)',
                        overflow: 'hidden',
                        transition: 'transform 160ms ease, box-shadow 160ms ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 18px 34px rgba(0, 0, 0, 0.2)',
                        },
                      }}
                    >
                      {variant === 'hiilikartta' ? (
                        <>
                          <Box
                            sx={{
                              position: 'absolute',
                              left: 0,
                              right: 0,
                              top: '0.5rem',
                              height: '6.625rem',
                              pointerEvents: 'none',
                            }}
                          >
                            <Image
                              src={heroSrc}
                              alt=""
                              fill
                              sizes="(max-width: 600px) 100vw, 50vw"
                              style={{ objectFit: 'cover', objectPosition: heroPosition }}
                            />
                          </Box>
                          <Box
                            sx={{
                              position: 'relative',
                              zIndex: 1,
                              display: 'flex',
                              flexDirection: 'column',
                              height: '100%',
                              px: 3,
                              py: 2.25,
                            }}
                          >
                            <Typography
                              sx={{
                                mt: 0.25,
                                typography: 'h7',
                                fontSize: '0.75rem',
                                lineHeight: 1.5,
                                letterSpacing: '0.075rem',
                                textTransform: 'uppercase',
                                color: 'common.white',
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {t(titleKey)}
                            </Typography>
                            <Typography
                              sx={{
                                mt: 3.25,
                                typography: 'body1',
                                fontSize: '0.875rem',
                                lineHeight: 1.55,
                                letterSpacing: '0.07rem',
                                color: 'common.white',
                                maxWidth: '15rem',
                                overflowWrap: 'anywhere',
                                display: '-webkit-box',
                                WebkitLineClamp: 4,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {t(descriptionKey)}
                            </Typography>
                          </Box>
                        </>
                      ) : (
                        <>
                          <Box
                            sx={{
                              position: 'relative',
                              height: '6.25rem',
                              borderRadius: '10px',
                              border: '0.2px solid rgba(255, 255, 255, 0.9)',
                              overflow: 'hidden',
                              flexShrink: 0,
                            }}
                          >
                            <Image
                              src={heroSrc}
                              alt=""
                              fill
                              sizes="(max-width: 600px) 100vw, 50vw"
                              style={{ objectFit: 'cover', objectPosition: heroPosition }}
                            />
                            <Box
                              sx={{
                                position: 'absolute',
                                inset: 0,
                                background:
                                  'linear-gradient(90deg, rgba(255,255,255,0.82) 17.5%, rgba(255,255,255,0) 100%)',
                              }}
                            />
                            <Typography
                              sx={{
                                position: 'absolute',
                                left: 2,
                                top: 2.25,
                                typography: 'h7',
                                fontSize: '1rem',
                                lineHeight: 1.125,
                                letterSpacing: '0.08rem',
                                textTransform: 'uppercase',
                                color: '#0f0f0f',
                                maxWidth: '85%',
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {t(titleKey)}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              px: 3,
                              pt: 2.25,
                              pb: 2.5,
                            }}
                          >
                            <Typography
                              sx={{
                                typography: 'body1',
                                fontSize: '1rem',
                                lineHeight: 1.55,
                                letterSpacing: '0.07rem',
                                color: '#101010',
                                maxWidth: '15.5rem',
                                overflowWrap: 'anywhere',
                                display: '-webkit-box',
                                WebkitLineClamp: 4,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {t(descriptionKey)}
                            </Typography>
                          </Box>
                        </>
                      )}
                    </Box>
                  </MutableLink>
                )
              )}
            </Box>
          </OverlayScrollbarsComponent>
        </Box>

        {showScrollHint && (
          <IconButton
            onClick={handleScrollDown}
            aria-label={t('sidebar.main.scroll_hint.aria_label')}
            sx={{
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: 'translate(-50%, 0)',
              width: '2.375rem',
              height: '2.375rem',
              backgroundColor: 'rgba(79, 79, 79, 0.95)',
              color: 'common.white',
              boxShadow: '0 10px 24px rgba(0, 0, 0, 0.24)',
              '&:hover': {
                backgroundColor: '#3f3f3f',
              },
            }}
          >
            <KeyboardArrowDownRoundedIcon />
          </IconButton>
        )}
      </Box>
    </Box>
  )
}

export default MainSidebarContent
