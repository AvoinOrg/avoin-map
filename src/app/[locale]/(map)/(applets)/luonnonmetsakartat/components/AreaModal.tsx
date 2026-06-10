import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { Box } from '#/components/common/PandaBox'
import TText from '#/components/common/TText'
import { ArrowLeft, ArrowRight, Cross } from '#/components/icons'
import { PopupProps } from '#/common/types/map'
import { MapModalWrapper } from '#/components/Map/MapModalWrapper'
import { FolayerFeatureProperties } from '../common/types'
import { useLocaleFormatter } from '#/common/hooks/useLocaleFormatter'
import useEmblaCarousel from 'embla-carousel-react'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

const AreaModal = ({
  features,
  onClose,
}: PopupProps<FolayerFeatureProperties>) => {
  const { formatNumber } = useLocaleFormatter()
  const feature = features && features.length > 0 ? features[0] : null
  const properties = feature?.properties

  const pictures: string[] = useMemo(() => {
    const raw = properties?.pictures as unknown
    let arr: unknown = raw
    if (typeof raw === 'string') {
      try {
        arr = JSON.parse(raw)
      } catch {
        return []
      }
    }
    return Array.isArray(arr)
      ? (arr.filter((v) => typeof v === 'string') as string[])
      : []
  }, [properties])

  const hasPictures = pictures.length > 0
  const minWidthBeforeFullScreen = hasPictures ? 800 : 500

  // Lightbox
  const [lightboxIndex, setLightboxIndex] = useState<number>(-1)
  const slides = useMemo(() => pictures.map((u) => ({ src: u })), [pictures])

  // Supabase object URL -> imgproxy render URL helper
  const toImgproxy = (
    url: string,
    {
      width = 1600,
      height = 1200,
      resize = 'cover' as 'cover' | 'contain' | 'fill',
      quality = 85,
      dpr = 2,
    } = {}
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
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden', // ensure borderRadius clips children
          borderRadius: '0.625rem',
          maxHeight: '80rem',
          minWidth: minWidthBeforeFullScreen,
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
            <Box
              component="button"
              type="button"
              aria-label="close"
              onClick={onClose}
              sx={{
                width: '2.5rem',
                height: '2.5rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 0,
                border: 0,
                borderRadius: '50%',
                backgroundColor: 'transparent',
                color: 'grey.300',
                cursor: 'pointer',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' },
                '&:focus-visible': {
                  outline: '2px solid',
                  outlineColor: 'secondary.main',
                  outlineOffset: '2px',
                },
              }}
            >
              <Cross sx={{ height: '1rem' }} />
            </Box>
          </Box>
        </Box>

        {/* Scroll body — no padding so the right column can bleed to edges */}
        <Box
          sx={{
            overflowY: 'auto', // Changed from 'scroll' to 'auto'
            flexGrow: 1,
            height: '100%',
            minWidth: 0,
            // no pt/pr/pb/pl — padding handled per-column
            '@supports selector(::-webkit-scrollbar)': {
              '&::-webkit-scrollbar-thumb': { backgroundColor: '#878787' },
            },
            '@supports not selector(::-webkit-scrollbar)': {
              scrollbarColor: '#878787 transparent',
            },
          }}
        >
          {properties ? (
            <Box
              sx={{
                display: 'grid',
                width: '100%',
                // Let content define height; right side can fill row height on md+
                gridTemplateColumns: {
                  mobile: '1fr',
                  desktop: hasPictures
                    ? 'minmax(0,1fr) minmax(0,1fr)'
                    : '1fr',
                },
                alignItems: 'stretch',
                gap: 0,
                boxSizing: 'border-box',
                height: '100%',
              }}
            >
              {/* Left/content — has padding */}
              <Box
                sx={{
                  minWidth: 0,
                  pt: { mobile: 5.5, desktop: 5 }, // Adjusted padding
                  pb: 4,
                  pl: { mobile: 2.6, desktop: 6 },
                  pr: { mobile: 2.6, desktop: 3 }, // creates separation from the right column
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
                    sx={{
                      typography: 'h2',
                      m: 0,
                      textTransform: 'uppercase',
                      overflowWrap: 'anywhere',
                      wordBreak: 'break-word',
                      flex: '1 1 24ch', // grows, but keeps ~24ch minimum before forcing wrap
                      minWidth: 0, // allow shrinking without overflow
                    }}
                  >
                    {properties.name}
                  </Box>

                  <Box
                    component="p"
                    sx={{
                      typography: 'h6',
                      m: 0,
                      textTransform: 'uppercase',
                      // On roomy screens: don't wrap -> will drop below instead of breaking words
                      whiteSpace: { mobile: 'normal', desktop: 'nowrap' },
                      overflowWrap: { mobile: 'anywhere', desktop: 'normal' },
                      wordBreak: { mobile: 'break-word', desktop: 'normal' },
                      flex: '0 0 auto',
                      minWidth: { mobile: 0, desktop: 'max-content' }, // stay on the same line until it truly doesn't fit
                    }}
                  >
                    {properties.municipality}
                  </Box>
                </Box>

                <Box>
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

              {/* Right / carousel — ZERO padding, flush to top/right/bottom */}
              {hasPictures && (
                <Box
                  className="area-modal-right"
                  sx={{ minWidth: 0, minHeight: '30rem' }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      // Keep visible on narrow screens; on md+ fill the row height
                      // minHeight: { xs: 240, sm: 320, md: 0 },
                      // height: { xs: 240, sm: 320, md: '100%' },
                      height: '100%',
                      overflow: 'hidden',
                      backgroundColor: '#2b2b2b',
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
                              src={src}
                              alt={`picture-${idx}`}
                              onClick={() => setLightboxIndex(idx)}
                              sx={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                cursor: 'zoom-in',
                                userSelect: 'none',
                              }}
                            />
                          </Box>
                        ))}
                      </Box>
                    </Box>

                    {/* Overlay arrows */}
                    <Box
                      component="button"
                      type="button"
                      onClick={scrollPrev}
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: 8,
                        transform: 'translateY(-50%)',
                        width: '2rem',
                        height: '2rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 0,
                        border: 0,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0,0,0,0.35)',
                        color: '#fff',
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.5)' },
                        '&:focus-visible': {
                          outline: '2px solid',
                          outlineColor: 'secondary.main',
                          outlineOffset: '2px',
                        },
                      }}
                      aria-label="Previous image"
                    >
                      <ArrowLeft sx={{ width: '0.8rem', height: '1.2rem' }} />
                    </Box>
                    <Box
                      component="button"
                      type="button"
                      onClick={scrollNext}
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        right: 8,
                        transform: 'translateY(-50%)',
                        width: '2rem',
                        height: '2rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 0,
                        border: 0,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0,0,0,0.35)',
                        color: '#fff',
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.5)' },
                        '&:focus-visible': {
                          outline: '2px solid',
                          outlineColor: 'secondary.main',
                          outlineOffset: '2px',
                        },
                      }}
                      aria-label="Next image"
                    >
                      <ArrowRight sx={{ width: '0.8rem', height: '1.2rem' }} />
                    </Box>

                    {/* Dots */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: 1,
                        px: 1,
                        py: 0.5,
                        borderRadius: '999px',
                        backgroundColor: 'rgba(0,0,0,0.25)',
                      }}
                    >
                      {largeSrcs.map((_, i) => (
                        <Box
                          key={i}
                          component="button"
                          onClick={() => scrollTo(i)}
                          aria-label={`Go to image ${i + 1}`}
                          sx={{
                            width: 10,
                            height: 10,
                            p: 0,
                            border: 'none',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            outline: 'none',
                            backgroundColor:
                              i === selectedIndex
                                ? '#A9E7CB'
                                : 'rgba(255,255,255,0.6)',
                            opacity: i === selectedIndex ? 1 : 0.6,
                          }}
                        />
                      ))}
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
            <Box component="p" id="area-modal-description" sx={{ m: 0 }}>
              <TText keyName="no_features_selected" ns="luonnonmetsakartat" />
            </Box>
          )}
        </Box>
      </Box>
    </MapModalWrapper>
  )
}

export default AreaModal
