import React, { useEffect, useMemo, useState } from 'react'
import { useTranslate } from '@tolgee/react'
import { useMutation } from '@tanstack/react-query'

import { Box } from '#/common/style/theme/system'
import { Button, IconButton } from '#/components/common/Button'
import TText from '#/components/common/TText'
import { Cross, SaveOutlined } from '#/components/icons'
import type { PopupProps } from '#/common/types/map'
import TextFieldWithHeader from '#/components/common/TextFieldWithHeader'
import { MapModalWrapper } from '#/components/Map/MapModalWrapper'
import { SCROLLBAR_WIDTH_REM } from '#/common/style/theme/constants'
import { LoadingSpinner } from '#/components/Loading'

import { useAdminFolayerAreaPatchMutationOptions } from '../common/queries/adminFolayerAreaPatchMutation'
import { useAppletStore } from '../state/appletStore'
import type { FolayerFeature, FolayerFeatureProperties } from '../common/types'
import { MasonryPhotoAlbum } from 'react-photo-album'
import 'react-photo-album/masonry.css'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

interface Props extends PopupProps<FolayerFeatureProperties> {
  folayerId: string
  fixtureState?: {
    unsyncedChanges?: boolean
    isUpdating?: boolean
    lightboxIndex?: number
  }
}

type ImgproxyOptions = {
  width?: number
  height?: number
  resize?: 'cover' | 'contain' | 'fill'
  quality?: number
  dpr?: number
}

const THUMB_TARGET_W = 200

// Supabase object URL -> imgproxy render URL helper.
const toImgproxy = (
  url: string,
  {
    width = 400,
    height,
    resize = 'cover',
    quality = 80,
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

type AreaModalAdminContentProps = {
  feature: FolayerFeature | null
  folayerId: string
  onClose?: () => void
  fixtureState?: Props['fixtureState']
}

const AreaModalAdminContent = ({
  feature,
  folayerId,
  onClose,
  fixtureState,
}: AreaModalAdminContentProps) => {
  const { t } = useTranslate('luonnonmetsakartat')
  const [name, setName] = useState(feature?.properties.name || '')
  const [description, setDescription] = useState(
    feature?.properties.description || ''
  )
  const [municipality, setMunicipality] = useState(
    feature?.properties.municipality || ''
  )
  const [region, setRegion] = useState(feature?.properties.region || '')
  const [unsyncedChanges, setUnsyncedChanges] = useState(
    fixtureState?.unsyncedChanges ?? false
  )
  const localAdminFolayerAreaPatchMutation = useMutation(
    useAdminFolayerAreaPatchMutationOptions()
  )
  const [lightboxIndex, setLightboxIndex] = useState<number>(
    fixtureState?.lightboxIndex ?? -1
  )

  const pictures: string[] = useMemo(() => {
    const rawPictures = feature?.properties?.pictures as unknown

    return Array.isArray(rawPictures)
      ? rawPictures.filter((picture): picture is string =>
          typeof picture === 'string'
        )
      : []
  }, [feature])

  const initialPhotos = useMemo(
    () =>
      pictures.map((u) => ({
        src: toImgproxy(u, {
          width: THUMB_TARGET_W,
          quality: 80,
          dpr: 2,
        }),
        originalSrc: u,
        width: THUMB_TARGET_W,
        height: Math.round(THUMB_TARGET_W * 0.75),
      })),
    [pictures]
  )
  const [photoHeightsBySrc, setPhotoHeightsBySrc] = useState<
    Record<string, number>
  >({})
  const photos = useMemo(
    () =>
      initialPhotos.map((photo) => ({
        src: photo.src,
        width: photo.width,
        height: photoHeightsBySrc[photo.src] ?? photo.height,
      })),
    [initialPhotos, photoHeightsBySrc]
  )
  const slides = useMemo(() => pictures.map((u) => ({ src: u })), [pictures])

  useEffect(() => {
    if (initialPhotos.length === 0) {
      return
    }

    let cancelled = false

    initialPhotos.forEach((photo) => {
      const updateMeasuredHeight = (src: string, image: HTMLImageElement) => {
        if (cancelled) {
          return
        }

        const naturalWidth = image.naturalWidth || THUMB_TARGET_W
        const naturalHeight =
          image.naturalHeight || Math.round(THUMB_TARGET_W * 0.75)
        const ratio = naturalHeight / (naturalWidth || 1)
        const finalHeight = Math.max(1, Math.round(THUMB_TARGET_W * ratio))

        setPhotoHeightsBySrc((prev) =>
          prev[src] === finalHeight ? prev : { ...prev, [src]: finalHeight }
        )
      }

      const img = new Image()
      img.onload = () => updateMeasuredHeight(photo.src, img)
      img.onerror = () => {
        const fallbackSrc = toImgproxy(photo.originalSrc, {
          width: THUMB_TARGET_W,
          resize: 'cover',
          quality: 80,
          dpr: 2,
        })
        const fallbackImg = new Image()
        fallbackImg.onload = () =>
          updateMeasuredHeight(fallbackSrc, fallbackImg)
        fallbackImg.src = fallbackSrc
      }
      img.src = photo.src
    })

    return () => {
      cancelled = true
    }
  }, [initialPhotos])

  const handleClose = () => {
    onClose?.()
  }

  const handleNameChange = (value: string) => {
    setName(value)
    setUnsyncedChanges(true)
  }

  const handleDescriptionChange = (value: string) => {
    setDescription(value)
    setUnsyncedChanges(true)
  }

  const handleMunicipalityChange = (value: string) => {
    setMunicipality(value)
    setUnsyncedChanges(true)
  }

  const handleRegionChange = (value: string) => {
    setRegion(value)
    setUnsyncedChanges(true)
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
          name: name,
          description: description,
          municipality: municipality,
          region: region,
        },
      },
      {
        onSuccess: () => setUnsyncedChanges(false),
      }
    )
  }

  const minWidthBeforeFullScreen = 600
  const isUpdating =
    fixtureState?.isUpdating ?? localAdminFolayerAreaPatchMutation.isPending

  return (
    <MapModalWrapper minWidthBeforeFullScreen={minWidthBeforeFullScreen}>
      <Box
        data-testid="luonnonmetsakartat-admin-area-modal"
        sx={{
          backgroundColor: '#3E3E3E',
          color: '#A9E7CB',
          minWidth: minWidthBeforeFullScreen + 'px',
          position: 'relative',
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
          sx={{
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
          <IconButton
            aria-label="Close admin area modal"
            onClick={handleClose}
            type="button"
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Cross />
          </IconButton>
        </Box>
        {feature && (
          <Box
            sx={(theme) => ({
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
                scrollbarColor: `${theme.palette.neutral.main} transparent`,
              },
            })}
          >
            <TextFieldWithHeader
              headerText={t('sidebar.admin.area.name.header')}
              placeholderText={t('sidebar.admin.area.name.placeholder')}
              value={name}
              onChange={handleNameChange}
              sx={{ textTransform: 'uppercase' }}
            ></TextFieldWithHeader>

            <TextFieldWithHeader
              headerText={t('sidebar.admin.area.region.header')}
              placeholderText={t('sidebar.admin.area.region.placeholder')}
              value={region}
              onChange={handleRegionChange}
              sx={{}}
            ></TextFieldWithHeader>
            <TextFieldWithHeader
              headerText={t('sidebar.admin.area.municipality.header')}
              placeholderText={t('sidebar.admin.area.municipality.placeholder')}
              value={municipality}
              onChange={handleMunicipalityChange}
              sx={{}}
            ></TextFieldWithHeader>
            <TextFieldWithHeader
              headerText={t('sidebar.admin.area.description.header')}
              placeholderText={t('sidebar.admin.area.description.placeholder')}
              value={description}
              onChange={handleDescriptionChange}
              multiline={true}
              rows={15}
            ></TextFieldWithHeader>
            {pictures.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Box
                  component="p"
                  sx={{
                    m: 0,
                    typography: 'body1',
                  }}
                >
                  <TText
                    ns="luonnonmetsakartat"
                    keyName={'sidebar.admin.area.pictures.header'}
                  />
                </Box>
                <Box
                  sx={{
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
          sx={{
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
          {feature && unsyncedChanges && (
            <Button
              type="button"
              variant="text"
              color="neutral"
              aria-label={t('sidebar.admin.folayer.settings.save')}
              onClick={handleSaveClick}
              startIcon={<SaveOutlined />}
              sx={{
                display: 'inline-flex',
                minWidth: 0,
                minHeight: 'auto',
                p: 0,
                color: 'neutral.dark',
                typography: 'h3',
                gap: 1,
                whiteSpace: 'nowrap',
                justifyContent: 'center',
                '&:hover': {
                  backgroundColor: 'transparent',
                },
              }}
            >
              <TText
                keyName={'sidebar.admin.folayer.settings.save'}
                ns={'luonnonmetsakartat'}
              />
            </Button>
          )}
        </Box>
        {isUpdating && (
          <Box
            sx={{
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
            <LoadingSpinner
              size="5rem"
              variant={fixtureState?.isUpdating ? 'determinate' : 'indeterminate'}
              value={fixtureState?.isUpdating ? 65 : undefined}
            />
          </Box>
        )}
      </Box>
    </MapModalWrapper>
  )
}

const AreaModalAdmin = ({
  features,
  folayerId,
  onClose,
  fixtureState,
}: Props) => {
  const folayerAreaConf = useAppletStore(
    (state) => state.folayerAreaConfs[folayerId]
  )

  const feature = useMemo(() => {
    if (!features?.length || !folayerAreaConf) {
      return null
    }

    return (
      folayerAreaConf.data.features.find((f) => f.id === features[0].id) ?? null
    )
  }, [features, folayerAreaConf])

  return (
    <AreaModalAdminContent
      key={
        feature
          ? `${feature.id}-${feature.properties.updated_ts ?? ''}`
          : 'empty'
      }
      feature={feature}
      folayerId={folayerId}
      onClose={onClose}
      fixtureState={fixtureState}
    />
  )
}

export default AreaModalAdmin
