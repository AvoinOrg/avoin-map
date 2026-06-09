'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { useTranslate } from '@tolgee/react'
import type { EventListeners } from 'overlayscrollbars'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import type { OverlayScrollbarsComponentRef } from 'overlayscrollbars-react'

import type { PandaStyleProp } from '#/common/style/panda'
import { Box } from '#/components/common/PandaBox'
import MutableLink from '#/components/common/MutableLink'
import { ArrowDown, ArrowUp } from '#/components/icons'
import {
  useSidebarBoundaryContext,
} from '#/components/Sidebar/sidebarBoundaryContext'
import {
  SidebarBottomControlsSlot,
  SidebarTopControlsSlot,
} from '#/components/Sidebar/sidebarSlots'
import { useIsMobile } from '#/common/hooks/ui/useIsMobile'
import { mainRouteTree } from '#/common/routing/routes/main'
import { SCROLLBAR_WIDTH_REM } from '#/common/style/theme/constants'
import { RouteTree } from '#/common/types/routing'

const MAIN_WORDMARK_SRC = '/files/img/main-sidebar/avoin-map-wordmark-v2.svg'
const HIILIKARTTA_HERO_SRC = '/files/img/main-sidebar/hiilikartta-hero.svg'
const FORESTS_HERO_SRC = '/files/img/main-sidebar/forests-hero.jpg'
const BUILDINGS_HERO_SRC = '/files/img/main-sidebar/buildings-hero.jpg'
const CONTACT_ILLUSTRATION_SRC =
  '/files/img/main-sidebar/contact-illustration.png'
const MIN_SHADOW_PADDING_REM = 1
const DESKTOP_SHADOW_BLEED_REM = 0.8
const DESKTOP_SCROLLBAR_GUTTER_REM = SCROLLBAR_WIDTH_REM + 0.25
const DESKTOP_TOP_SPILL_REM = MIN_SHADOW_PADDING_REM
const DESKTOP_LEFT_SPILL_REM =
  MIN_SHADOW_PADDING_REM + DESKTOP_SCROLLBAR_GUTTER_REM + DESKTOP_SHADOW_BLEED_REM
const DESKTOP_RIGHT_SPILL_REM = 6
const DESKTOP_BOTTOM_SPILL_REM = 2
const MOBILE_SPILL_REM = MIN_SHADOW_PADDING_REM
const BUBBLE_GAP_REM = 1
const BOTTOM_CONTROLS_REQUIRED_SPACE_PX = 44
const BOTTOM_CONTROLS_OUTSIDE_GAP_PX = 16
const BOTTOM_CONTROLS_ROW_WIDTH_PX = 64
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

type BottomControlsPlacement =
  | 'under-left'
  | 'under-right'
  | 'outside-right'
  | 'overlay-sidebar'

type ScrollState = {
  hasOverflow: boolean
  canScrollUp: boolean
  canScrollDown: boolean
}

const Text = ({
  children,
  sx,
}: {
  children: React.ReactNode
  sx?: PandaStyleProp
}) => (
  <Box
    component="span"
    sx={[
      {
        display: 'block',
        m: 0,
      },
      ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
    ]}
  >
    {children}
  </Box>
)

const MainSidebarContent = () => {
  const { t } = useTranslate('avoin-map')
  const isMobile = useIsMobile('desktop')
  const { boundaryId } = useSidebarBoundaryContext()
  const scrollContainerRef = useRef<OverlayScrollbarsComponentRef<'div'> | null>(null)
  const visibleFrameRef = useRef<HTMLDivElement | null>(null)
  const leftColumnRef = useRef<HTMLDivElement | null>(null)
  const rightColumnRef = useRef<HTMLDivElement | null>(null)
  const [scrollState, setScrollState] = useState<ScrollState>({
    hasOverflow: false,
    canScrollUp: false,
    canScrollDown: false,
  })
  const [controlsSlotLeftPx, setControlsSlotLeftPx] = useState<number>(0)
  const [controlsPlacement, setControlsPlacement] =
    useState<BottomControlsPlacement>('under-left')

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

  const updateBottomControlsPlacement = useCallback(() => {
    if (isMobile) {
      setControlsPlacement('under-left')
      setControlsSlotLeftPx(0)
      return
    }

    const visibleFrameEl = visibleFrameRef.current
    const leftColumnEl = leftColumnRef.current
    const rightColumnEl = rightColumnRef.current

    if (!visibleFrameEl || !leftColumnEl || !rightColumnEl) {
      setControlsPlacement('under-left')
      setControlsSlotLeftPx(0)
      return
    }

    const frameRect = visibleFrameEl.getBoundingClientRect()
    const leftColumnRect = leftColumnEl.getBoundingClientRect()
    const rightColumnRect = rightColumnEl.getBoundingClientRect()
    const visibleFrameBottom = frameRect.bottom

    const leftSpaceBelow = visibleFrameBottom - leftColumnRect.bottom
    const rightSpaceBelow = visibleFrameBottom - rightColumnRect.bottom
    const rightSpaceToViewport =
      window.innerWidth -
      rightColumnRect.right -
      BOTTOM_CONTROLS_OUTSIDE_GAP_PX

    let nextPlacement: BottomControlsPlacement = 'under-left'
    let nextLeftPx = leftColumnRect.left - frameRect.left

    if (leftSpaceBelow >= BOTTOM_CONTROLS_REQUIRED_SPACE_PX) {
      nextPlacement = 'under-left'
      nextLeftPx = leftColumnRect.left - frameRect.left
    } else if (rightSpaceBelow >= BOTTOM_CONTROLS_REQUIRED_SPACE_PX) {
      nextPlacement = 'under-right'
      nextLeftPx = rightColumnRect.left - frameRect.left
    } else if (rightSpaceToViewport >= BOTTOM_CONTROLS_ROW_WIDTH_PX) {
      nextPlacement = 'outside-right'
      nextLeftPx =
        rightColumnRect.right -
        frameRect.left +
        BOTTOM_CONTROLS_OUTSIDE_GAP_PX
    } else {
      nextPlacement = 'overlay-sidebar'
      nextLeftPx = 0
    }

    const minLeftPx = 0
    const maxLeftPx = Math.max(
      minLeftPx,
      window.innerWidth -
        frameRect.left -
        BOTTOM_CONTROLS_ROW_WIDTH_PX -
        BOTTOM_CONTROLS_OUTSIDE_GAP_PX
    )

    setControlsPlacement(nextPlacement)
    setControlsSlotLeftPx(Math.round(Math.min(maxLeftPx, Math.max(minLeftPx, nextLeftPx))))
  }, [isMobile])

  const updateScrollHint = useCallback(() => {
    const osInstance = scrollContainerRef.current?.osInstance()
    const viewport = osInstance?.elements().viewport

    if (!osInstance || !viewport) {
      setScrollState({
        hasOverflow: false,
        canScrollUp: false,
        canScrollDown: false,
      })
      return
    }

    const hasOverflow = osInstance.state().hasOverflow.y
    const canScrollUp = viewport.scrollTop > 3
    const canScrollDown =
      viewport.scrollTop + viewport.clientHeight < viewport.scrollHeight - 3

    setScrollState((prev) => {
      if (
        prev.hasOverflow === hasOverflow &&
        prev.canScrollUp === canScrollUp &&
        prev.canScrollDown === canScrollDown
      ) {
        return prev
      }

      return {
        hasOverflow,
        canScrollUp,
        canScrollDown,
      }
    })
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

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const animationFrameId = window.requestAnimationFrame(
      updateBottomControlsPlacement
    )

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            updateBottomControlsPlacement()
          })
        : null

    const elementsToObserve = [
      visibleFrameRef.current,
      leftColumnRef.current,
      rightColumnRef.current,
    ].filter(Boolean) as HTMLElement[]

    elementsToObserve.forEach((element) => {
      resizeObserver?.observe(element)
    })

    window.addEventListener('resize', updateBottomControlsPlacement)

    return () => {
      window.cancelAnimationFrame(animationFrameId)
      resizeObserver?.disconnect()
      window.removeEventListener('resize', updateBottomControlsPlacement)
    }
  }, [isMobile, updateBottomControlsPlacement])

  const handleScrollDown = () => {
    const viewport = scrollContainerRef.current?.osInstance()?.elements().viewport
    if (!viewport) {
      return
    }

    viewport.scrollBy({ top: 260, behavior: 'smooth' })
  }

  const handleScrollUp = () => {
    const viewport = scrollContainerRef.current?.osInstance()?.elements().viewport
    if (!viewport) {
      return
    }

    viewport.scrollBy({ top: -260, behavior: 'smooth' })
  }

  return (
    <Box
      data-main-sidebar-root="true"
      sx={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        px: isMobile ? 2 : 0,
        py: isMobile ? 2 : 0,
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
            top: `-${isMobile ? MOBILE_SPILL_REM : DESKTOP_TOP_SPILL_REM}rem`,
            left: `-${isMobile ? MOBILE_SPILL_REM : DESKTOP_LEFT_SPILL_REM}rem`,
            right: `-${isMobile ? MOBILE_SPILL_REM : DESKTOP_RIGHT_SPILL_REM}rem`,
            bottom: `-${isMobile ? MOBILE_SPILL_REM : DESKTOP_BOTTOM_SPILL_REM}rem`,
            pointerEvents: 'none',
          }}
        />
        <Box
          ref={visibleFrameRef}
          data-main-sidebar-visible-frame="true"
          sx={{
            position: 'absolute',
            inset: 0,
            minHeight: 0,
            pointerEvents: 'none',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: `-${isMobile ? MOBILE_SPILL_REM : DESKTOP_TOP_SPILL_REM}rem`,
              left: `-${
                isMobile ? MOBILE_SPILL_REM : DESKTOP_LEFT_SPILL_REM
              }rem`,
              right: `-${
                isMobile ? MOBILE_SPILL_REM : DESKTOP_RIGHT_SPILL_REM
              }rem`,
              bottom: `-${
                isMobile ? MOBILE_SPILL_REM : DESKTOP_BOTTOM_SPILL_REM
              }rem`,
              minHeight: 0,
              pointerEvents: isMobile ? 'auto' : 'none',
              backgroundColor: 'transparent',
              '& .os-scrollbar-vertical': {
                left: 0,
                right: 'auto',
                pointerEvents: 'auto',
              },
              '& .os-scrollbar-horizontal': {
                pointerEvents: 'auto',
              },
              '& .os-scrollbar-corner': {
                left: 0,
                right: 'auto',
                pointerEvents: 'auto',
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
                pointerEvents: isMobile ? 'auto' : 'none',
              }}
            >
              <Box
                sx={{
                  direction: 'ltr',
                  minHeight: '100%',
                  pointerEvents: isMobile ? 'auto' : 'none',
                  pt: `${
                    isMobile ? MOBILE_SPILL_REM : DESKTOP_TOP_SPILL_REM
                  }rem`,
                  pr: `${
                    isMobile ? MOBILE_SPILL_REM : DESKTOP_RIGHT_SPILL_REM
                  }rem`,
                  pl: `${
                    isMobile ? MOBILE_SPILL_REM : DESKTOP_LEFT_SPILL_REM
                  }rem`,
                  pb: `${
                    isMobile ? MOBILE_SPILL_REM : DESKTOP_BOTTOM_SPILL_REM
                  }rem`,
                }}
              >
                <Box
                  data-main-sidebar-interactive-surface="true"
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    pointerEvents: isMobile ? 'auto' : 'none',
                  }}
                >
              <Box
                sx={{
                  display: isMobile ? 'none' : 'flex',
                  alignItems: 'flex-start',
                  gap: `${BUBBLE_GAP_REM}rem`,
                  pointerEvents: 'none',
                }}
              >
                <Box
                  ref={leftColumnRef}
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: `${BUBBLE_GAP_REM}rem`,
                    pointerEvents: 'none',
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
                      pt: 4.75,
                      pb: 3.25,
                      boxShadow: '0 18px 36px rgba(0, 0, 0, 0.2)',
                      pointerEvents: 'auto',
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
                    <Text
                      sx={{
                        mt: 10,
                        fontWeight: 700,
                        fontSize: '1rem',
                        lineHeight: '1.375rem',
                        letterSpacing: '0.1rem',
                        color: 'common.white',
                        maxWidth: '15.4375rem',
                        overflowWrap: 'anywhere',
                        whiteSpace: 'normal',
                      }}
                    >
                      {t('sidebar.main.intro.title')}
                    </Text>
                  </Box>

                  <Box
                    sx={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      minHeight: '18.75rem',
                      backgroundColor: '#f0f1f4',
                      borderRadius: '10px',
                      color: '#111111',
                      px: 2.75,
                      pt: 2.5,
                      pb: 2.25,
                      boxShadow: '0 14px 30px rgba(0, 0, 0, 0.16)',
                      pointerEvents: 'auto',
                    }}
                  >
                    <Text
                      sx={{
                        maxWidth: '14.25rem',
                        fontSize: '0.75rem',
                        lineHeight: '1rem',
                        letterSpacing: '0.075rem',
                        color: '#111111',
                        fontWeight: 400,
                      }}
                    >
                      {t('sidebar.main.contact.lead')}
                    </Text>
                    <Text
                      sx={{
                        mt: 3.25,
                        maxWidth: '9.625rem',
                        fontSize: '0.6875rem',
                        lineHeight: '1rem',
                        letterSpacing: '0.06875rem',
                        color: '#111111',
                        fontWeight: 700,
                      }}
                    >
                      {t('sidebar.main.contact.follow_up')}
                    </Text>
                    <Text
                      sx={{
                        mt: 3,
                        maxWidth: '9.125rem',
                        fontSize: '0.6875rem',
                        lineHeight: '1rem',
                        letterSpacing: '0.06875rem',
                        color: '#111111',
                        fontWeight: 700,
                      }}
                    >
                      {t('sidebar.main.contact.tools')}
                    </Text>
                    <Text
                      sx={{
                        mt: 'auto',
                        fontSize: '0.6875rem',
                        lineHeight: '1rem',
                        letterSpacing: '0.06875rem',
                        color: '#02382c',
                        fontWeight: 700,
                        fontStyle: 'italic',
                      }}
                    >
                      {t('sidebar.main.contact.cta')}
                    </Text>
                    <Box
                      sx={{
                        position: 'absolute',
                        right: 2.25,
                        bottom: 1.625,
                        width: '5.125rem',
                        height: '5.1875rem',
                        pointerEvents: 'none',
                      }}
                    >
                      <Image
                        src={CONTACT_ILLUSTRATION_SRC}
                        alt=""
                        fill
                        sizes="82px"
                        style={{ objectFit: 'contain' }}
                      />
                    </Box>
                  </Box>

                  {APPLET_BUBBLES.filter((bubble) => bubble.id === 'hiilikartta').map(
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
                          pointerEvents: 'auto',
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
                            color:
                              variant === 'hiilikartta' ? 'common.white' : '#111111',
                            backgroundColor: bgColor,
                            boxShadow: '0 14px 30px rgba(0, 0, 0, 0.16)',
                            overflow: 'hidden',
                            transition:
                              'transform 160ms ease, box-shadow 160ms ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 18px 34px rgba(0, 0, 0, 0.2)',
                            },
                          }}
                        >
                          <Box
                            sx={{
                              position: 'absolute',
                              left: 0,
                              right: 0,
                              top: '0.5625rem',
                              height: '6.625rem',
                              pointerEvents: 'none',
                            }}
                          >
                            <Image
                              src={heroSrc}
                              alt=""
                              fill
                              sizes="(max-width: 600px) 100vw, 50vw"
                              style={{
                                objectFit: 'cover',
                                objectPosition: heroPosition,
                              }}
                            />
                          </Box>
                          <Box
                            sx={{
                              position: 'relative',
                              zIndex: 1,
                              display: 'flex',
                              flexDirection: 'column',
                              height: '100%',
                              px: 3.75,
                              pt: 4.5,
                              pb: 2.5,
                            }}
                          >
                            <Text
                              sx={{
                                fontSize: '0.75rem',
                                lineHeight: '1.125rem',
                                letterSpacing: '0.075rem',
                                textTransform: 'uppercase',
                                color: 'common.white',
                                fontWeight: 700,
                              }}
                            >
                              {t(titleKey)}
                            </Text>
                            <Text
                              sx={{
                                mt: 4,
                                fontSize: '0.75rem',
                                lineHeight: '1rem',
                                letterSpacing: '0.075rem',
                                color: 'common.white',
                                maxWidth: '14.875rem',
                                overflowWrap: 'anywhere',
                                whiteSpace: 'pre-line',
                                fontWeight: 400,
                              }}
                            >
                              {t(descriptionKey)}
                            </Text>
                          </Box>
                        </Box>
                      </MutableLink>
                    )
                  )}
                </Box>

                <Box
                  ref={rightColumnRef}
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: `${BUBBLE_GAP_REM}rem`,
                    pointerEvents: 'none',
                  }}
                >
                  {APPLET_BUBBLES.filter((bubble) => bubble.variant === 'imageHeader').map(
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
                          pointerEvents: 'auto',
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
                            color:
                              variant === 'hiilikartta' ? 'common.white' : '#111111',
                            backgroundColor: bgColor,
                            boxShadow: '0 14px 30px rgba(0, 0, 0, 0.16)',
                            overflow: 'hidden',
                            transition:
                              'transform 160ms ease, box-shadow 160ms ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 18px 34px rgba(0, 0, 0, 0.2)',
                            },
                          }}
                        >
                          <Box
                            sx={{
                              position: 'relative',
                              height: '6.25rem',
                              overflow: 'hidden',
                              flexShrink: 0,
                            }}
                          >
                            <Image
                              src={heroSrc}
                              alt=""
                              fill
                              sizes="(max-width: 600px) 100vw, 50vw"
                              style={{
                                objectFit: 'cover',
                                objectPosition: heroPosition,
                              }}
                            />
                            <Box
                              sx={{
                                position: 'absolute',
                                inset: 0,
                                background:
                                  'linear-gradient(90deg, rgba(255,255,255,0.9) 17.5%, rgba(255,255,255,0) 100%)',
                              }}
                            />
                            <Text
                              sx={{
                                position: 'absolute',
                                left: '2rem',
                                top: 0,
                                bottom: 0,
                                display: 'flex',
                                alignItems: 'center',
                                fontSize: '0.75rem',
                                lineHeight: '1.125rem',
                                letterSpacing: '0.075rem',
                                textTransform: 'uppercase',
                                color: '#0f0f0f',
                                maxWidth: '12rem',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                fontWeight: 700,
                              }}
                            >
                              {t(titleKey)}
                            </Text>
                          </Box>
                          <Box
                            sx={{
                              px: 4,
                              pt: 4.5,
                              pb: 2.5,
                            }}
                          >
                            <Text
                              sx={{
                                fontSize: '0.75rem',
                                lineHeight: '1rem',
                                letterSpacing: '0.075rem',
                                color: '#101010',
                                maxWidth: '14.1875rem',
                                overflowWrap: 'anywhere',
                                fontWeight: 400,
                              }}
                            >
                              {t(descriptionKey)}
                            </Text>
                          </Box>
                        </Box>
                      </MutableLink>
                    )
                  )}
                </Box>
              </Box>

              <Box
                sx={{
                  display: isMobile ? 'flex' : 'none',
                  flexDirection: 'column',
                  gap: `${BUBBLE_GAP_REM}rem`,
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
                    pt: 4.75,
                    pb: 3.25,
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
                  <Text
                    sx={{
                      mt: 10,
                      fontWeight: 700,
                      fontSize: '1rem',
                      lineHeight: '1.375rem',
                      letterSpacing: '0.1rem',
                      color: 'common.white',
                      maxWidth: '15.4375rem',
                      overflowWrap: 'anywhere',
                      whiteSpace: 'normal',
                    }}
                  >
                    {t('sidebar.main.intro.title')}
                  </Text>
                </Box>

                {APPLET_BUBBLES.filter((bubble) => bubble.id === 'buildings').map(
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
                          color:
                            variant === 'hiilikartta' ? 'common.white' : '#111111',
                          backgroundColor: bgColor,
                          boxShadow: '0 14px 30px rgba(0, 0, 0, 0.16)',
                          overflow: 'hidden',
                          transition:
                            'transform 160ms ease, box-shadow 160ms ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 18px 34px rgba(0, 0, 0, 0.2)',
                          },
                        }}
                      >
                        <Box
                          sx={{
                            position: 'relative',
                            height: '6.25rem',
                            overflow: 'hidden',
                            flexShrink: 0,
                          }}
                        >
                          <Image
                            src={heroSrc}
                            alt=""
                            fill
                            sizes="(max-width: 600px) 100vw, 50vw"
                            style={{
                              objectFit: 'cover',
                              objectPosition: heroPosition,
                            }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              inset: 0,
                              background:
                                'linear-gradient(90deg, rgba(255,255,255,0.9) 17.5%, rgba(255,255,255,0) 100%)',
                            }}
                          />
                          <Text
                            sx={{
                              position: 'absolute',
                              left: '2rem',
                              top: 0,
                              bottom: 0,
                              display: 'flex',
                              alignItems: 'center',
                              fontSize: '0.75rem',
                              lineHeight: '1.125rem',
                              letterSpacing: '0.075rem',
                              textTransform: 'uppercase',
                              color: '#0f0f0f',
                              maxWidth: '12rem',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              fontWeight: 700,
                            }}
                          >
                            {t(titleKey)}
                          </Text>
                        </Box>
                        <Box
                          sx={{
                            px: 4,
                            pt: 4.5,
                            pb: 2.5,
                          }}
                        >
                          <Text
                            sx={{
                              fontSize: '0.75rem',
                              lineHeight: '1rem',
                              letterSpacing: '0.075rem',
                              color: '#101010',
                              maxWidth: '14.1875rem',
                              overflowWrap: 'anywhere',
                              fontWeight: 400,
                            }}
                          >
                            {t(descriptionKey)}
                          </Text>
                        </Box>
                      </Box>
                    </MutableLink>
                  )
                )}

                <Box
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '18.75rem',
                    backgroundColor: '#f0f1f4',
                    borderRadius: '10px',
                    color: '#111111',
                    px: 2.75,
                    pt: 2.5,
                    pb: 2.25,
                    boxShadow: '0 14px 30px rgba(0, 0, 0, 0.16)',
                  }}
                >
                  <Text
                    sx={{
                      maxWidth: '14.25rem',
                      fontSize: '0.75rem',
                      lineHeight: '1rem',
                      letterSpacing: '0.075rem',
                      color: '#111111',
                      fontWeight: 400,
                    }}
                  >
                    {t('sidebar.main.contact.lead')}
                  </Text>
                  <Text
                    sx={{
                      mt: 3.25,
                      maxWidth: '9.625rem',
                      fontSize: '0.6875rem',
                      lineHeight: '1rem',
                      letterSpacing: '0.06875rem',
                      color: '#111111',
                      fontWeight: 700,
                    }}
                  >
                    {t('sidebar.main.contact.follow_up')}
                  </Text>
                  <Text
                    sx={{
                      mt: 3,
                      maxWidth: '9.125rem',
                      fontSize: '0.6875rem',
                      lineHeight: '1rem',
                      letterSpacing: '0.06875rem',
                      color: '#111111',
                      fontWeight: 700,
                    }}
                  >
                    {t('sidebar.main.contact.tools')}
                  </Text>
                  <Text
                    sx={{
                      mt: 'auto',
                      fontSize: '0.6875rem',
                      lineHeight: '1rem',
                      letterSpacing: '0.06875rem',
                      color: '#02382c',
                      fontWeight: 700,
                      fontStyle: 'italic',
                    }}
                  >
                    {t('sidebar.main.contact.cta')}
                  </Text>
                  <Box
                    sx={{
                      position: 'absolute',
                      right: 2.25,
                      bottom: 1.625,
                      width: '5.125rem',
                      height: '5.1875rem',
                      pointerEvents: 'none',
                    }}
                  >
                    <Image
                      src={CONTACT_ILLUSTRATION_SRC}
                      alt=""
                      fill
                      sizes="82px"
                      style={{ objectFit: 'contain' }}
                    />
                  </Box>
                </Box>

                {APPLET_BUBBLES.filter((bubble) => bubble.id === 'forests').map(
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
                          color:
                            variant === 'hiilikartta' ? 'common.white' : '#111111',
                          backgroundColor: bgColor,
                          boxShadow: '0 14px 30px rgba(0, 0, 0, 0.16)',
                          overflow: 'hidden',
                          transition:
                            'transform 160ms ease, box-shadow 160ms ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 18px 34px rgba(0, 0, 0, 0.2)',
                          },
                        }}
                      >
                        <Box
                          sx={{
                            position: 'relative',
                            height: '6.25rem',
                            overflow: 'hidden',
                            flexShrink: 0,
                          }}
                        >
                          <Image
                            src={heroSrc}
                            alt=""
                            fill
                            sizes="(max-width: 600px) 100vw, 50vw"
                            style={{
                              objectFit: 'cover',
                              objectPosition: heroPosition,
                            }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              inset: 0,
                              background:
                                'linear-gradient(90deg, rgba(255,255,255,0.9) 17.5%, rgba(255,255,255,0) 100%)',
                            }}
                          />
                          <Text
                            sx={{
                              position: 'absolute',
                              left: '2rem',
                              top: 0,
                              bottom: 0,
                              display: 'flex',
                              alignItems: 'center',
                              fontSize: '0.75rem',
                              lineHeight: '1.125rem',
                              letterSpacing: '0.075rem',
                              textTransform: 'uppercase',
                              color: '#0f0f0f',
                              maxWidth: '12rem',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              fontWeight: 700,
                            }}
                          >
                            {t(titleKey)}
                          </Text>
                        </Box>
                        <Box
                          sx={{
                            px: 4,
                            pt: 4.5,
                            pb: 2.5,
                          }}
                        >
                          <Text
                            sx={{
                              fontSize: '0.75rem',
                              lineHeight: '1rem',
                              letterSpacing: '0.075rem',
                              color: '#101010',
                              maxWidth: '14.1875rem',
                              overflowWrap: 'anywhere',
                              fontWeight: 400,
                            }}
                          >
                            {t(descriptionKey)}
                          </Text>
                        </Box>
                      </Box>
                    </MutableLink>
                  )
                )}

                {APPLET_BUBBLES.filter((bubble) => bubble.id === 'hiilikartta').map(
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
                          color:
                            variant === 'hiilikartta' ? 'common.white' : '#111111',
                          backgroundColor: bgColor,
                          boxShadow: '0 14px 30px rgba(0, 0, 0, 0.16)',
                          overflow: 'hidden',
                          transition:
                            'transform 160ms ease, box-shadow 160ms ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 18px 34px rgba(0, 0, 0, 0.2)',
                          },
                        }}
                      >
                        <Box
                          sx={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: '0.5625rem',
                            height: '6.625rem',
                            pointerEvents: 'none',
                          }}
                        >
                          <Image
                            src={heroSrc}
                            alt=""
                            fill
                            sizes="(max-width: 600px) 100vw, 50vw"
                            style={{
                              objectFit: 'cover',
                              objectPosition: heroPosition,
                            }}
                          />
                        </Box>
                        <Box
                          sx={{
                            position: 'relative',
                            zIndex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            px: 3.75,
                            pt: 4.5,
                            pb: 2.5,
                          }}
                        >
                          <Text
                            sx={{
                              fontSize: '0.75rem',
                              lineHeight: '1.125rem',
                              letterSpacing: '0.075rem',
                              textTransform: 'uppercase',
                              color: 'common.white',
                              fontWeight: 700,
                            }}
                          >
                            {t(titleKey)}
                          </Text>
                          <Text
                            sx={{
                              mt: 4,
                              fontSize: '0.75rem',
                              lineHeight: '1rem',
                              letterSpacing: '0.075rem',
                              color: 'common.white',
                              maxWidth: '14.875rem',
                              overflowWrap: 'anywhere',
                              whiteSpace: 'pre-line',
                              fontWeight: 400,
                            }}
                          >
                            {t(descriptionKey)}
                          </Text>
                        </Box>
                      </Box>
                    </MutableLink>
                  )
                )}
              </Box>
                </Box>
              </Box>
            </OverlayScrollbarsComponent>
          </Box>

          <Box
            data-main-sidebar-top-control-area="true"
            sx={{
              position: 'absolute',
              top: 'auto',
              left: 0,
              bottom: 0,
              display: isMobile ? 'block' : 'none',
              pointerEvents: 'none',
              zIndex: 3,
            }}
          >
            <Box
              sx={{
                width: 'max-content',
                pointerEvents: 'auto',
              }}
            >
              <SidebarTopControlsSlot boundaryId={boundaryId} />
            </Box>
          </Box>

          <Box
            sx={{
              position: 'absolute',
              left: `${controlsSlotLeftPx}px`,
              bottom: isMobile ? `${BUBBLE_GAP_REM}rem` : 0,
              pointerEvents: 'none',
              zIndex: 3,
              transition: 'left 220ms cubic-bezier(.2,0,.2,1)',
            }}
          >
            <Box
              data-main-sidebar-controls-slot-wrapper={controlsPlacement}
              sx={{
                position: 'relative',
                width: 'max-content',
                pointerEvents: 'none',
              }}
            >
              <SidebarBottomControlsSlot boundaryId={boundaryId} />
            </Box>
          </Box>
        </Box>

        {scrollState.canScrollUp && (
          <Box
            component="button"
            type="button"
            onClick={handleScrollUp}
            aria-label={t('sidebar.main.scroll_up_hint.aria_label')}
            sx={{
              position: 'absolute',
              top: isMobile ? `${BUBBLE_GAP_REM}rem` : 0,
              left: '50%',
              transform: 'translate(-50%, 0)',
              width: '2.375rem',
              height: '2.375rem',
              p: 0,
              border: 0,
              borderRadius: '50%',
              backgroundColor: 'rgba(79, 79, 79, 0.95)',
              color: 'common.white',
              boxShadow: '0 10px 24px rgba(0, 0, 0, 0.24)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              pointerEvents: 'auto',
              zIndex: 4,
              '&:hover': {
                backgroundColor: '#3f3f3f',
              },
              '&:focus-visible': {
                outline: '2px solid #ffffff',
                outlineOffset: '2px',
              },
            }}
          >
            <ArrowUp sx={{ width: '1rem', height: '0.55rem' }} />
          </Box>
        )}

        {scrollState.canScrollDown && (
          <Box
            component="button"
            type="button"
            onClick={handleScrollDown}
            aria-label={t('sidebar.main.scroll_hint.aria_label')}
            sx={{
              position: 'absolute',
              bottom: isMobile ? `${BUBBLE_GAP_REM}rem` : 0,
              left: '50%',
              transform: 'translate(-50%, 0)',
              width: '2.375rem',
              height: '2.375rem',
              p: 0,
              border: 0,
              borderRadius: '50%',
              backgroundColor: 'rgba(79, 79, 79, 0.95)',
              color: 'common.white',
              boxShadow: '0 10px 24px rgba(0, 0, 0, 0.24)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              pointerEvents: 'auto',
              zIndex: 4,
              '&:hover': {
                backgroundColor: '#3f3f3f',
              },
              '&:focus-visible': {
                outline: '2px solid #ffffff',
                outlineOffset: '2px',
              },
            }}
          >
            <ArrowDown sx={{ width: '1rem', height: '0.55rem' }} />
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default MainSidebarContent
