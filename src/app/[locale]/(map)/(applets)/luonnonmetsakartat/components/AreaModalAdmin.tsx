import React, { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Typography,
  Modal,
  IconButton,
  SxProps,
  Theme,
} from '@mui/material'
import { T, useTranslate } from '@tolgee/react'
import { Cross } from '#/components/icons'
import { PopupProps } from '#/common/types/map'
import TextFieldWithHeader from '#/components/common/TextFieldWithHeader'
import { useAppletStore } from '../state/appletStore'
import { MapModalWrapper } from '#/components/Map/MapModalWrapper'
import { SaveOutlined } from '@mui/icons-material'
import { SCROLLBAR_WIDTH_REM } from '#/common/style/theme/constants'
import { adminFolayerAreaPatchMutation } from '../common/queries/adminFolayerAreaPatchMutation'
import { useMutation } from '@tanstack/react-query'
import { LoadingSpinner } from '#/components/Loading'

interface Props extends PopupProps {
  folayerId: string
}

const AreaModalAdmin = ({ features, folayerId, onClose }: Props) => {
  const { t } = useTranslate('luonnonmetsakartat')
  const updateArea = useAppletStore((state) => state.updateFolayerArea)
  const folayerAreaCollection = useAppletStore(
    (state) => state.folayerAreaCollections[folayerId]
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

  const feature = useMemo(() => {
    if (features && features.length > 0 && folayerAreaCollection) {
      const foundFeature = folayerAreaCollection.features.find(
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
  }, [features, folayerAreaCollection])

  useEffect(() => {
    if (!localAdminFolayerAreaPatchMutation.isPending) {
      setIsUpdating(false)
    } else {
      setIsUpdating(true)
    }
  }, [localAdminFolayerAreaPatchMutation.isPending])

  useEffect(() => {
    if (localAdminFolayerAreaPatchMutation.isPending) {
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
          overflow: 'auto',
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
              overflowY: 'scroll',
              flexGrow: 1,
              top: '2.5rem',
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
