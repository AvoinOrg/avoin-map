import React, { useEffect, useMemo, useState } from 'react'
import { useTranslate } from '@tolgee/react'
import { useMutation } from '@tanstack/react-query'

import { Box } from '#/components/common/PandaBox'
import TText from '#/components/common/TText'
import { Cross } from '#/components/icons'
import { PopupProps } from '#/common/types/map'
import TextFieldWithHeader from '#/components/common/TextFieldWithHeader'
import { MapModalWrapper } from '#/components/Map/MapModalWrapper'
import { SCROLLBAR_WIDTH_REM } from '#/common/style/theme/constants'
import { LoadingSpinner } from '#/components/Loading'

import { adminFolayerAreaPatchMutation } from '../common/queries/adminFolayerAreaPatchMutation'
import { useAppletStore } from '../state/appletStore'
import { FolayerFeatureProperties } from '../common/types'
// Gallery imports
import { MasonryPhotoAlbum } from 'react-photo-album'
import "react-photo-album/masonry.css";
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import SaveActionButton from './SaveActionButton'

interface Props extends PopupProps<FolayerFeatureProperties> {
  folayerId: string
}

type PhotoItem = { src: string; width: number; height: number }

type AreaFormState = {
  featureId: string | null
  name: string
  description: string
  municipality: string
  region: string
  hasUnsyncedChanges: boolean
}

const emptyFormState: AreaFormState = {
  featureId: null,
  name: '',
  description: '',
  municipality: '',
  region: '',
  hasUnsyncedChanges: false,
}

const THUMB_TARGET_W = 200

const toImgproxy = (
  url: string,
  {
    width = 400,
    height,
    resize = 'cover',
    quality = 80,
    dpr = 2,
  }: {
    width?: number
    height?: number
    resize?: 'cover' | 'contain' | 'fill'
    quality?: number
    dpr?: number
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

const AreaModalAdmin = ({ features, folayerId, onClose }: Props) => {
  const { t } = useTranslate('luonnonmetsakartat')
  const folayerAreaConf = useAppletStore(
    (state) => state.folayerAreaConfs[folayerId]
  )

  const [formState, setFormState] = useState<AreaFormState>(emptyFormState)
  const localAdminFolayerAreaPatchMutation = useMutation(
    adminFolayerAreaPatchMutation()
  )

  // Lightbox index state
  const [lightboxIndex, setLightboxIndex] = useState<number>(-1)

  const feature = useMemo(() => {
    if (features && features.length > 0 && folayerAreaConf) {
      return folayerAreaConf.data.features.find(
        (f) => f.id === features[0].id
      ) ?? null
    }
    return null
  }, [features, folayerAreaConf])

  const featureFormState = useMemo<AreaFormState>(() => {
    if (!feature) {
      return emptyFormState
    }

    return {
      featureId: String(feature.id),
      name: feature.properties.name || '',
      description: feature.properties.description || '',
      municipality: feature.properties.municipality || '',
      region: feature.properties.region || '',
      hasUnsyncedChanges: false,
    }
  }, [feature])

  const currentFormState =
    formState.featureId === featureFormState.featureId
      ? formState
      : featureFormState

  const updateFormField = (
    field: keyof Pick<
      AreaFormState,
      'name' | 'description' | 'municipality' | 'region'
    >,
    value: string
  ) => {
    setFormState({
      ...currentFormState,
      [field]: value,
      hasUnsyncedChanges: true,
    })
  }

  // Pictures
  const pictures: string[] = useMemo(() => {
    const rawPictures = feature?.properties?.pictures as unknown
    return Array.isArray(rawPictures)
      ? rawPictures.filter((picture): picture is string => {
          return typeof picture === 'string'
        })
      : []
  }, [feature])

  // Build dynamic thumbnails preserving original aspect ratio.
  // Use imgproxy with fixed width and auto height; then measure to refine ratios.
  const picturesKey = pictures.join('\0')
  const placeholderPhotos = useMemo(
    () =>
      pictures.map((u) => ({
        src: toImgproxy(u, {
          width: THUMB_TARGET_W,
          quality: 80,
          dpr: 2,
        }),
        width: THUMB_TARGET_W,
        height: Math.round(THUMB_TARGET_W * 0.75),
      })),
    [pictures]
  )
  const [measuredPhotos, setMeasuredPhotos] = useState<{
    key: string
    photos: PhotoItem[]
  }>({ key: '', photos: [] })
  const photos =
    measuredPhotos.key === picturesKey ? measuredPhotos.photos : placeholderPhotos
  const slides = useMemo(() => pictures.map((u) => ({ src: u })), [pictures])

  useEffect(() => {
    if (!pictures || pictures.length === 0) {
      return
    }

    placeholderPhotos.forEach((p, i) => {
      const img = new Image()
      img.onload = () => {
        const nw = img.naturalWidth || THUMB_TARGET_W
        const nh = img.naturalHeight || Math.round(THUMB_TARGET_W * 0.75)
        const ratio = nh / (nw || 1)
        const finalH = Math.max(1, Math.round(THUMB_TARGET_W * ratio))
        setMeasuredPhotos((prev) => {
          const next =
            prev.key === picturesKey ? [...prev.photos] : [...placeholderPhotos]
          if (!next[i]) return prev
          next[i] = { src: p.src, width: THUMB_TARGET_W, height: finalH }
          return { key: picturesKey, photos: next }
        })
      }
      img.onerror = () => {
        // Fallback: try with resize=fit if auto fails
        const fallbackSrc = toImgproxy(pictures[i], {
          width: THUMB_TARGET_W,
          resize: 'cover',
          quality: 80,
          dpr: 2,
        })
        const fb = new Image()
        fb.onload = () => {
          const nw = fb.naturalWidth || THUMB_TARGET_W
          const nh = fb.naturalHeight || Math.round(THUMB_TARGET_W * 0.75)
          const ratio = nh / (nw || 1)
          const finalH = Math.max(1, Math.round(THUMB_TARGET_W * ratio))
          setMeasuredPhotos((prev) => {
            const next =
              prev.key === picturesKey
                ? [...prev.photos]
                : [...placeholderPhotos]
            if (!next[i]) return prev
            next[i] = {
              src: fallbackSrc,
              width: THUMB_TARGET_W,
              height: finalH,
            }
            return { key: picturesKey, photos: next }
          })
        }
        fb.onerror = () => {
          // Keep placeholder ratio on error
        }
        fb.src = fallbackSrc
      }
      img.src = p.src
    })
  }, [placeholderPhotos, pictures, picturesKey])

  const handleClose = () => {
    if (onClose) {
      onClose()
    }
  }

  const handleNameChange = (value: string) => {
    updateFormField('name', value)
  }

  const handleDescriptionChange = (value: string) => {
    updateFormField('description', value)
  }

  const handleMunicipalityChange = (value: string) => {
    updateFormField('municipality', value)
  }

  const handleRegionChange = (value: string) => {
    updateFormField('region', value)
  }

  const handleSaveClick = () => {
    if (!feature) {
      return
    }

    localAdminFolayerAreaPatchMutation.mutate(
      {
        layerId: folayerId,
        featureId: feature.id as string,
        properties: {
          name: currentFormState.name,
          description: currentFormState.description,
          municipality: currentFormState.municipality,
          region: currentFormState.region,
        },
      },
      {
        onSuccess: () =>
          setFormState({
            ...currentFormState,
            hasUnsyncedChanges: false,
          }),
      }
    )
  }

  const minWidthBeforeFullScreen = 600

  return (
    <MapModalWrapper minWidthBeforeFullScreen={minWidthBeforeFullScreen}>
      <Box
        styleProps={{
          backgroundColor: '#3E3E3E',
          color: '#A9E7CB',
          minWidth: minWidthBeforeFullScreen + 'px',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          // Keep outer container from creating an extra scrollbar; let content area scroll
          overflow: 'hidden',
          borderRadius: '0.625rem',
          maxHeight: '80rem',
        }}
      >
        <Box
          styleProps={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '4.0rem',
            borderBottom: '1px solid',
            borderColor: 'neutral.dark',
            pl: 1.2,
            // Header should not shrink
            flex: '0 0 auto',
          }}
        >
          {/* <Typography id="area-modal-title" variant="h6" component="h2">
                  {title}
                </Typography> */}
          <Box
            component="button"
            type="button"
            aria-label="close"
            onClick={handleClose}
            styleProps={{
              // Position to top-right if preferred, or remove for default flow if title is on left
              // position: 'absolute',
              // right: (theme) => theme.spacing(1),
              // top: (theme) => theme.spacing(1),
              width: '2.5rem',
              height: '2.5rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 0,
              border: 0,
              borderRadius: '50%',
              backgroundColor: 'transparent',
              color: 'grey.500',
              cursor: 'pointer',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' },
              '&:focus-visible': {
                outline: '2px solid',
                outlineColor: 'secondary.main',
                outlineOffset: '2px',
              },
            }}
          >
            <Cross />
          </Box>
        </Box>
        {feature && (
          <Box
            styleProps={{
              // Let this section handle scrolling
              overflowY: 'auto',
              // Critical: allow flex child to shrink below content size to avoid squeezing footer
              minHeight: 0,
              // Grow to fill available space but don't force siblings to shrink
              flex: '1 1 auto',
              pt: 3,
              pb: 3,
              pr: 2,
              pl: 1 + SCROLLBAR_WIDTH_REM + 'rem',
              '@supports selector(::-webkit-scrollbar)': {
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#878787',
                },
              },
              '@supports not selector(::-webkit-scrollbar)': {
                scrollbarColor: 'var(--colors-neutral-main) transparent',
              },
            }}
          >
            <TextFieldWithHeader
              headerText={t('sidebar.admin.area.name.header')}
              placeholderText={t('sidebar.admin.area.name.placeholder')}
              value={currentFormState.name}
              onChange={handleNameChange}
              styleProps={{ textTransform: 'uppercase' }}
            ></TextFieldWithHeader>

            <TextFieldWithHeader
              headerText={t('sidebar.admin.area.region.header')}
              placeholderText={t('sidebar.admin.area.region.placeholder')}
              value={currentFormState.region}
              onChange={handleRegionChange}
              styleProps={{}}
            ></TextFieldWithHeader>
            <TextFieldWithHeader
              headerText={t('sidebar.admin.area.municipality.header')}
              placeholderText={t('sidebar.admin.area.municipality.placeholder')}
              value={currentFormState.municipality}
              onChange={handleMunicipalityChange}
              styleProps={{}}
            ></TextFieldWithHeader>
            <TextFieldWithHeader
              headerText={t('sidebar.admin.area.description.header')}
              placeholderText={t('sidebar.admin.area.description.placeholder')}
              value={currentFormState.description}
              onChange={handleDescriptionChange}
              multiline={true}
              rows={15}
              // textSx={{
              //     minHeight: '10rem',
              //     maxHeight: '20rem',
              //   },
              // }}
            ></TextFieldWithHeader>
            {pictures.length > 0 && (
              <Box styleProps={{ mt: 2 }}>
                <Box component="p" styleProps={{ m: 0 }}>
                  <TText
                    ns="luonnonmetsakartat"
                    keyName={'sidebar.admin.area.pictures.header'}
                  ></TText>
                </Box>
                <Box
                  styleProps={{
                    mt: 1,
                    '& img': {
                      display: 'block',
                      width: '100%',
                      height: 'auto',
                      backgroundColor: 'transparent',
                    },
                  }}
                >
                  <MasonryPhotoAlbum
                    photos={photos}
                    onClick={({ index }) => setLightboxIndex(index)}
                  />
                  <Lightbox
                    open={lightboxIndex >= 0}
                    close={() => setLightboxIndex(-1)}
                    slides={slides}
                    index={lightboxIndex}
                  />
                </Box>
              </Box>
            )}
          </Box>
        )}
        <Box
          styleProps={{
            display: 'flex',
            flexDirection: 'row',
            height: '5.5rem',
            justifyContent: 'flex-end',
            alignItems: 'center',
            pr: 3.5,
            borderTop: `1px solid`,
            borderColor: 'neutral.dark',
            // Footer should stay at fixed height and not shrink
            flex: '0 0 auto',
          }}
        >
          {feature && currentFormState.hasUnsyncedChanges && (
            <SaveActionButton
              keyName="sidebar.admin.folayer.settings.save"
              ariaLabel={t('sidebar.admin.folayer.settings.save')}
              onClick={handleSaveClick}
              styleProps={{
                flex: '0',
                justifyContent: 'center',
              }}
            />
          )}
        </Box>
        {localAdminFolayerAreaPatchMutation.isPending && (
          <Box
            styleProps={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10, // Ensure it's on top
              borderRadius: 'inherit', // Inherit border radius from parent if needed
            }}
          >
            <LoadingSpinner size="5rem" />
          </Box>
        )}
      </Box>
    </MapModalWrapper>
  )
}

export default AreaModalAdmin
