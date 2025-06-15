import React, { useMemo, useState } from 'react'
import {
  Box,
  Typography,
  Modal,
  IconButton,
  SxProps,
  Theme,
} from '@mui/material'
import { T, useTranslate } from '@tolgee/react'
import LoadingHorizontal from '#/components/Loading/LoadingHorizontal'
import { Cross } from '#/components/icons'
import { PopupProps } from '#/common/types/map'
import CustomTextField from '#/components/common/TextFieldWithHeader'
import TextFieldWithHeader from '#/components/common/TextFieldWithHeader'
import { useAppletStore } from '../state/appletStore'
import { MapModalWrapper } from '#/components/Map/MapModalWrapper'
import Popup from '#/components/Map/Layers/Buildings/BuildingEnergyCertificates/Popup'

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
  // const [area, setArea] = useState<number>()

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

  const handleClose = () => {
    if (onClose) {
      onClose()
    }
  }

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value)
    setUnsyncedChanges(true)
  }

  const handleDescriptionChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDescription(event.target.value)
    setUnsyncedChanges(true)
  }

  const handleMunicipalityChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setMunicipality(event.target.value)
    setUnsyncedChanges(true)
  }

  const handleRegionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRegion(event.target.value)
    setUnsyncedChanges(true)
  }

  const handleSaveClick = () => {
    updateArea(folayerId, feature?.id as string, {
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
          p: 5,
          minWidth: minWidthBeforeFullScreen + 'px',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'absolute',
            top: 0,
            left: 0,
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
          <Box sx={{ overflowY: 'auto', flexGrow: 1, top: '2.5rem' }}>
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
        {feature && unsyncedChanges && (
          <Box
            sx={(theme) => ({
              display: 'flex',
              flexDirection: 'column',
              pl: SIDEBAR_PADDING_REM + 'rem',
              pr: SIDEBAR_PADDING_REM + 'rem',
              pt: 2,
              pb: 2,
              zIndex: 9999,
              borderTop: 1,
              borderColor: 'primary.lighter',
            })}
          >
            <Box
              onClick={handleSaveClick}
              sx={{
                mt: 1.3,
                display: 'inline-flex',
                flexDirection: 'row',
                '&:hover': { cursor: 'pointer' },
                color: 'neutral.dark',
                flex: '0',
                whiteSpace: 'nowrap',
                alignSelf: 'flex-start',
                width: '100%',
              }}
            >
              <Box sx={{ mr: 1.7, display: 'flex', alignItems: 'center' }}>
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
          </Box>
        )}
      </Box>
    </MapModalWrapper>
  )
}

export default AreaModalAdmin
