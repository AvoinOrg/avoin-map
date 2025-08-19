import React, { useEffect, useMemo, useState } from 'react'
import { Box, Typography, IconButton } from '@mui/material'
import { T, useTranslate } from '@tolgee/react'
import { useMutation } from '@tanstack/react-query'

import { Cross } from '#/components/icons'
import { PopupProps } from '#/common/types/map'
import TextFieldWithHeader from '#/components/common/TextFieldWithHeader'
import { MapModalWrapper } from '#/components/Map/MapModalWrapper'
import { SaveOutlined } from '@mui/icons-material'
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

interface Props extends PopupProps<FolayerFeatureProperties> {
  folayerId: string
}

const AreaModalAdmin = ({ features, folayerId, onClose }: Props) => {
  const { t } = useTranslate('luonnonmetsakartat')
  const updateArea = useAppletStore((state) => state.updateFolayerArea)
  const folayerAreaConf = useAppletStore(
    (state) => state.folayerAreaConfs[folayerId]
  )

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [municipality, setMunicipality] = useState('')
  const [region, setRegion] = useState('')
  const [unsyncedChanges, setUnsyncedChanges] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const localAdminFolayerAreaPatchMutation = useMutation(
    adminFolayerAreaPatchMutation()
  )

  // Lightbox index state
  const [lightboxIndex, setLightboxIndex] = useState<number>(-1)

  // Supabase object URL -> imgproxy render URL helper
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

  const feature = useMemo(() => {
    if (features && features.length > 0 && folayerAreaConf) {
      const foundFeature = folayerAreaConf.data.features.find(
        (f) => f.id === features[0].id
      )

      if (foundFeature) {
        setName(foundFeature.properties.name || '')
        setDescription(foundFeature.properties.description || '')
        setMunicipality(foundFeature.properties.municipality || '')
        setRegion(foundFeature.properties.region || '')
        // setArea(foundFeature.properties.area_ha)

        return foundFeature
      }
    }
    return null
  }, [features, folayerAreaConf])

  // Pictures
  const pictures: string[] = useMemo(
    () =>
      feature?.properties?.pictures &&
      Array.isArray((feature as any).properties?.pictures)
        ? ((feature as any).properties.pictures as string[])
        : [],
    [feature]
  )

  // Build dynamic thumbnails preserving original aspect ratio.
  // Use imgproxy with fixed width and auto height; then measure to refine ratios.
  const THUMB_TARGET_W = 200
  const [photos, setPhotos] = useState<
    { src: string; width: number; height: number }[]
  >([])
  const slides = useMemo(() => pictures.map((u) => ({ src: u })), [pictures])

  useEffect(() => {
    if (!pictures || pictures.length === 0) {
      setPhotos([])
      return
    }

    // First pass: placeholder sizes and transformed URLs (width only)
    const initial = pictures.map((u) => ({
      src: toImgproxy(u, {
        width: THUMB_TARGET_W,
        quality: 80,
        dpr: 2,
      }),
      width: THUMB_TARGET_W,
      height: Math.round(THUMB_TARGET_W * 0.75), // 4:3 fallback
    }))
    setPhotos(initial)

    // Second pass: measure natural size to get the true aspect ratio
    initial.forEach((p, i) => {
      const img = new Image()
      img.onload = () => {
        const nw = img.naturalWidth || THUMB_TARGET_W
        const nh = img.naturalHeight || Math.round(THUMB_TARGET_W * 0.75)
        const ratio = nh / (nw || 1)
        const finalH = Math.max(1, Math.round(THUMB_TARGET_W * ratio))
        setPhotos((prev) => {
          if (!prev[i]) return prev
          const next = [...prev]
          next[i] = { src: p.src, width: THUMB_TARGET_W, height: finalH }
          return next
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
          setPhotos((prev) => {
            if (!prev[i]) return prev
            const next = [...prev]
            next[i] = {
              src: fallbackSrc,
              width: THUMB_TARGET_W,
              height: finalH,
            }
            return next
          })
        }
        fb.onerror = () => {
          // Keep placeholder ratio on error
        }
        fb.src = fallbackSrc
      }
      img.src = p.src
    })
  }, [pictures])

  useEffect(() => {
    if (!localAdminFolayerAreaPatchMutation.isPending) {
      setIsUpdating(false)
    } else {
      setIsUpdating(true)
    }
  }, [localAdminFolayerAreaPatchMutation.isPending])

  useEffect(() => {
    if (localAdminFolayerAreaPatchMutation.isSuccess) {
      setUnsyncedChanges(false)
    }
  }, [localAdminFolayerAreaPatchMutation.isSuccess])

  const handleClose = () => {
    if (onClose) {
      onClose()
    }
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
    localAdminFolayerAreaPatchMutation.mutate({
      layerId: folayerId,
      featureId: feature?.id as string,
      properties: {
        name: name,
        description: description,
        municipality: municipality,
        region: region,
        // area_ha: area || 0,
      },
    })
    setIsUpdating(true)
  }

  const minWidthBeforeFullScreen = 600

  return (
    <MapModalWrapper minWidthBeforeFullScreen={minWidthBeforeFullScreen}>
      <Box
        sx={{
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
          {/* <Typography id="area-modal-title" variant="h6" component="h2">
                  {title}
                </Typography> */}
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              // Position to top-right if preferred, or remove for default flow if title is on left
              // position: 'absolute',
              // right: (theme) => theme.spacing(1),
              // top: (theme) => theme.spacing(1),
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
              // textSx={{
              //   '& .MuiInputBase-input': {
              //     minHeight: '10rem',
              //     maxHeight: '20rem',
              //   },
              // }}
            ></TextFieldWithHeader>
            {pictures.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography>
                  <T
                    ns="luonnonmetsakartat"
                    keyName={'sidebar.admin.area.pictures.header'}
                  ></T>
                </Typography>
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
          sx={(theme) => ({
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
          })}
        >
          {feature && unsyncedChanges && (
            <Box
              onClick={handleSaveClick}
              sx={{
                display: 'inline-flex',
                flexDirection: 'row',
                '&:hover': { cursor: 'pointer' },
                color: 'neutral.dark',
                flex: '0',
                whiteSpace: 'nowrap',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SaveOutlined></SaveOutlined>
                <Typography
                  sx={{
                    typography: 'h3',
                    ml: 1,
                  }}
                >
                  <T
                    keyName={'sidebar.admin.folayer.settings.save'}
                    ns={'luonnonmetsakartat'}
                  />
                </Typography>
              </Box>
            </Box>
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
            <LoadingSpinner size="5rem" />
          </Box>
        )}
      </Box>
    </MapModalWrapper>
  )
}

export default AreaModalAdmin
