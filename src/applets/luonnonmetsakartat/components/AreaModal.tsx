import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { Box } from '#/common/style/theme/system'
import { IconButton } from '#/components/common/Button'
import TText from '#/components/common/TText'
import { ArrowLeft, ArrowRight, Cross } from '#/components/icons'
import { PopupProps } from '#/common/types/map'
import { MapModalWrapper } from '#/components/Map/MapModalWrapper'
import { FolayerFeatureProperties } from '../common/types'
import { useLocaleFormatter } from '#/common/hooks/useLocaleFormatter'
import useEmblaCarousel from 'embla-carousel-react'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

const TWO_COLUMN_MEDIA_QUERY = '@media (min-width:900px)'
const PICTURE_MODAL_WIDTH = '50rem'
const TEXT_MODAL_WIDTH = '34rem'
const CLOSE_BUTTON_SIZE = 44
const CAROUSEL_BUTTON_SIZE = 40

type ImgproxyResize = 'cover' | 'contain' | 'fill'

type ImgproxyOptions = {
  width?: number
  height?: number
  resize?: ImgproxyResize
  quality?: number
  dpr?: number
}

// Supabase object URL -> imgproxy render URL helper
const toImgproxy = (
  url: string,
  {
    width = 1600,
    height = 1200,
    resize = 'cover',
    quality = 85,
    dpr = 2,
  }: ImgproxyOptions = {}
) => {
  if (!url) return url
  const renderUrl = url.replace('/object/', '/render/image/')
  const params = new URLSearchParams()
  if (width) params.set('width', String(width))
  if (height) params.set('height', String(height))
  if (resize) params.set('resize', resize)
  if (quality) params.set('quality', String(quality))
  if (dpr) params.set('dpr', String(dpr))
  return `${renderUrl}?${params.toString()}`
}

const AreaModal = ({
  features,
  onClose,
}: PopupProps<FolayerFeatureProperties>) => {
  const { formatNumber } = useLocaleFormatter()
  const feature = features && features.length > 0 ? features[0] : null
  const properties = feature?.properties
  const rawPictures = properties?.pictures as unknown

  const pictures: string[] = useMemo(() => {
    let arr: unknown = rawPictures
    if (typeof rawPictures === 'string') {
      try {
        arr = JSON.parse(rawPictures)
      } catch {
        return []
      }
    }
    return Array.isArray(arr)
      ? (arr.filter((v) => typeof v === 'string') as string[])
      : []
  }, [rawPictures])

  const hasPictures = pictures.length > 0
  const minWidthBeforeFullScreen = hasPictures ? 800 : 544

  // Lightbox
  const [lightboxIndex, setLightboxIndex] = useState<number>(-1)
  const slides = useMemo(() => pictures.map((u) => ({ src: u })), [pictures])

  const largeSrcs = useMemo(
    () =>
      pictures.map((u) =>
        toImgproxy(u, {
          width: 1600,
          height: 1200,
          resize: 'cover',
          quality: 85,
          dpr: 2,
        })
      ),
    [pictures]
  )
  // Embla for main image
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: false,
    dragFree: false,
    containScroll: false,
  })
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    emblaApi.on('select', onSelect)
    onSelect()
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi])

  return (
    <MapModalWrapper minWidthBeforeFullScreen={minWidthBeforeFullScreen}>
      <Box
        sx={{
          backgroundColor: '#3E3E3E',
          color: '#A9E7CB',
          width: hasPictures ? PICTURE_MODAL_WIDTH : TEXT_MODAL_WIDTH,
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          overflow: 'hidden', // ensure borderRadius clips children
          borderRadius: '0.625rem',
          maxHeight: 'min(80rem, 100%)',
        }}
      >
        {/* Header / close */}
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            height: 0, // <-- zero height = no layout gap
            pointerEvents: 'none', // let content below be interactive
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'flex-start',
              p: 1,
              pointerEvents: 'auto', // re-enable clicks for the button
            }}
          >
            <IconButton
              aria-label="Close area modal"
              onClick={onClose}
              type="button"
              sx={(theme) => ({
                width: CLOSE_BUTTON_SIZE,
                minWidth: CLOSE_BUTTON_SIZE,
                height: CLOSE_BUTTON_SIZE,
                borderRadius: '50%',
                borderColor: 'transparent',
                color: theme.palette.grey[300],
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.08)',
                },
              })}
            >
              <Cross sx={{ width: '1.125rem', height: '1.125rem' }} />
            </IconButton>
          </Box>
        </Box>

        {/* Scroll body — no padding so the right column can bleed to edges */}
        <Box
          sx={(theme) => ({
            overflowY: 'auto', // Changed from 'scroll' to 'auto'
            flexGrow: 1,
            minHeight: 0,
            minWidth: 0,
            // no pt/pr/pb/pl — padding handled per-column
            '@supports selector(::-webkit-scrollbar)': {
              '&::-webkit-scrollbar-thumb': { backgroundColor: '#878787' },
            },
            '@supports not selector(::-webkit-scrollbar)': {
              scrollbarColor: `${theme.palette.neutral.main} transparent`,
            },
          })}
        >
          {properties ? (
            <Box
              sx={{
                display: 'grid',
                width: '100%',
                // Let content define height; right side can fill row height above 900px.
                gridTemplateColumns: '1fr',
                [TWO_COLUMN_MEDIA_QUERY]: {
                  gridTemplateColumns: hasPictures
                    ? 'minmax(0,1fr) minmax(0,1fr)'
                    : '1fr',
                },
                alignItems: 'stretch',
                gap: 0,
                boxSizing: 'border-box',
                minHeight: 0,
              }}
            >
              {/* Left/content — has padding */}
              <Box
                sx={{
                  minWidth: 0,
                  pt: { mobile: 5.25, desktop: 5 },
                  pb: { mobile: hasPictures ? 3.5 : 4, desktop: 4 },
                  pl: { mobile: 2.5, desktop: 6 },
                  pr: { mobile: 2.5, desktop: hasPictures ? 3 : 4 },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'baseline', // align when side-by-side
                    columnGap: 2,
                    rowGap: 0.5,
                    minWidth: 0,
                  }}
                >
                  <Box
                    component="h2"
                    id="map-popup-modal-title"
                    sx={{
                      typography: 'h2',
                      m: 0,
                      textTransform: 'uppercase',
                      overflowWrap: 'anywhere',
                      wordBreak: 'break-word',
                      flex: '1 1 18rem',
                      minWidth: 0, // allow shrinking without overflow
                    }}
                  >
                    {properties.name}
                  </Box>

                  <Box
                    component="h3"
                    sx={{
                      typography: 'h6',
                      m: 0,
                      textTransform: 'uppercase',
                      // On roomy screens: don't wrap -> will drop below instead of breaking words
                      whiteSpace: { mobile: 'normal', desktop: 'nowrap' },
                      overflowWrap: { mobile: 'anywhere', desktop: 'normal' },
                      wordBreak: { mobile: 'break-word', desktop: 'normal' },
                      flex: { mobile: '1 1 100%', desktop: '0 1 auto' },
                      minWidth: 0,
                    }}
                  >
                    {properties.municipality}
                  </Box>
                </Box>

                <Box id="map-popup-modal-description">
                  <Box
                    component="p"
                    sx={{
                      typography: 'h6',
                      textTransform: 'uppercase',
                      mt: 0,
                      mb: 0,
                    }}
                  >
                    {properties.area_ha
                      ? `${formatNumber(properties.area_ha, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })} HEHTAARIA`
                      : ''}
                  </Box>

                  {properties.description && (
                    <Box sx={{ mt: 4 }}>
                      <Box
                        component="p"
                        sx={{
                          typography: 'body1',
                          m: 0,
                          overflowWrap: 'anywhere',
                          wordBreak: 'break-word',
                        }}
                      >
                        {properties.description}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Right / carousel — ZERO padding, flush to top/right/bottom */}
              {hasPictures && (
                <Box
                  className="area-modal-right"
                  sx={{
                    minWidth: 0,
                    minHeight: { mobile: '16rem', desktop: '26rem' },
                    height: { mobile: '17.5rem', desktop: 'auto' },
                    [TWO_COLUMN_MEDIA_QUERY]: {
                      minHeight: '30rem',
                      height: 'auto',
                    },
                  }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      // Keep visible on narrow screens; above 900px fill the row height.
                      height: '100%',
                      overflow: 'hidden',
                      bgcolor: '#2b2b2b',
                    }}
                  >
                    {/* Embla viewport */}
                    <Box
                      ref={emblaRef}
                      sx={{ width: '100%', height: '100%', overflow: 'hidden' }}
                    >
                      {/* Embla container */}
                      <Box sx={{ display: 'flex', height: '100%' }}>
                        {largeSrcs.map((src, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              position: 'relative',
                              flex: '0 0 100%',
                              width: '100%',
                              height: '100%',
                            }}
                          >
                            <Box
                              component="img"
                              {...{
                                src,
                                alt: `picture-${idx}`,
                                onClick: () => setLightboxIndex(idx),
                              }}
                              sx={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                objectPosition: 'center',
                                display: 'block',
                                cursor: 'zoom-in',
                                userSelect: 'none',
                                WebkitUserDrag: 'none',
                              }}
                            />
                          </Box>
                        ))}
                      </Box>
                    </Box>

                    {/* Overlay arrows */}
                    <IconButton
                      onClick={scrollPrev}
                      size="small"
                      type="button"
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: { mobile: 12, desktop: 12 },
                        transform: 'translateY(-50%)',
                        width: CAROUSEL_BUTTON_SIZE,
                        minWidth: CAROUSEL_BUTTON_SIZE,
                        height: CAROUSEL_BUTTON_SIZE,
                        borderRadius: '50%',
                        borderColor: 'transparent',
                        backgroundColor: 'rgba(0,0,0,0.45)',
                        color: '#fff',
                        '&:hover': {
                          backgroundColor: 'rgba(0,0,0,0.6)',
                        },
                      }}
                      aria-label="Previous image"
                    >
                      <ArrowLeft sx={{ width: 18, height: 22 }} />
                    </IconButton>
                    <IconButton
                      onClick={scrollNext}
                      size="small"
                      type="button"
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        right: { mobile: 12, desktop: 12 },
                        transform: 'translateY(-50%)',
                        width: CAROUSEL_BUTTON_SIZE,
                        minWidth: CAROUSEL_BUTTON_SIZE,
                        height: CAROUSEL_BUTTON_SIZE,
                        borderRadius: '50%',
                        borderColor: 'transparent',
                        backgroundColor: 'rgba(0,0,0,0.45)',
                        color: '#fff',
                        '&:hover': {
                          backgroundColor: 'rgba(0,0,0,0.6)',
                        },
                      }}
                      aria-label="Next image"
                    >
                      <ArrowRight sx={{ width: 18, height: 22 }} />
                    </IconButton>

                    {/* Dots */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: { mobile: 12, desktop: 12 },
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: 0.25,
                        px: 0.75,
                        py: 0.5,
                        borderRadius: '999px',
                        bgcolor: 'rgba(0,0,0,0.55)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.28)',
                      }}
                    >
                      {largeSrcs.map((_, i) => {
                        const dotButtonProps = {
                          type: 'button' as const,
                          onClick: () => scrollTo(i),
                          'aria-label': `Go to image ${i + 1}`,
                          'aria-current': i === selectedIndex || undefined,
                        }

                        return (
                          <Box
                            key={i}
                            component="button"
                            {...dotButtonProps}
                            sx={{
                              width: 20,
                              height: 20,
                              p: 0,
                              border: 'none',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              outline: 'none',
                              backgroundColor: 'transparent',
                              '&:focus-visible': {
                                outline: '2px solid #A9E7CB',
                                outlineOffset: 2,
                              },
                            }}
                          >
                            <Box
                              component="span"
                              aria-hidden="true"
                              sx={{
                                width: 9,
                                height: 9,
                                borderRadius: '50%',
                                backgroundColor:
                                  i === selectedIndex
                                    ? '#A9E7CB'
                                    : 'rgba(255,255,255,0.85)',
                                boxShadow: '0 0 0 1px rgba(0,0,0,0.18)',
                                opacity: i === selectedIndex ? 1 : 0.8,
                              }}
                            />
                          </Box>
                        )
                      })}
                    </Box>
                  </Box>
                </Box>
              )}

              <Lightbox
                open={lightboxIndex >= 0}
                close={() => setLightboxIndex(-1)}
                slides={slides}
                index={lightboxIndex}
              />
            </Box>
          ) : (
            <Box
              sx={{
                minWidth: 0,
                pt: { mobile: 5.25, desktop: 5 },
                pb: 4,
                pl: { mobile: 2.5, desktop: 6 },
                pr: { mobile: 2.5, desktop: 4 },
              }}
            >
              <Box
                component="p"
                id="map-popup-modal-description"
                sx={{ typography: 'body1', m: 0 }}
              >
                <TText
                  keyName="no_features_selected"
                  ns="luonnonmetsakartat"
                />
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </MapModalWrapper>
  )
}

export default AreaModal
