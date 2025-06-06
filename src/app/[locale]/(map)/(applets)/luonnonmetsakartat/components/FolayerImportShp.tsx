import { useState, useEffect } from 'react'
import { Feature, FeatureCollection } from 'geojson'
import { useTranslate, T } from '@tolgee/react'

import TextFieldWithHeader from '#/components/common/TextFieldWithHeader'
import CheckBoxWithText from '#/components/common/CheckBoxWithText'

import FolayerImportActionsRow from './FolayerImportActionsRow'
import ColorPickerWithPopover from '#/components/common/ColorPickerWithPopover'

interface FolayerImportShpProps {
  fileBuffers: ArrayBuffer[]
  onFinish: (params: {
    name: string
    colorCode: string
    isVisible: boolean
  }) => void
  isInitializing: boolean
}

const FolayerImportShp = ({
  fileBuffers,
  onFinish,
  isInitializing,
}: FolayerImportShpProps) => {
  const { t } = useTranslate('luonnonmetsakartat')
  const [geojson, setGeojson] = useState<FeatureCollection>()
  // const [zoningCol, setZoningCol] = useState<string>()
  const [folayerNameValue, setFolayerNameValue] = useState<string>('')
  const [folayerColorValue, setFolayerColorValue] = useState<string>('#06402B')
  const [isVisible, setIsVisible] = useState<boolean>(false)
  // const [folayerDescriptionValue, setFolayerDescriptionValue] = useState<string>('')
  // const [nameCol, setNameCol] = useState<string | undefined>() // nameCol can be optional
  const [columns, setColumns] = useState<string[]>([])

  useEffect(() => {
    // Load shp into geojson to validate it locally
    // TODO: Validate it locally :)
    const loadGeojson = async (fileBuffers: ArrayBuffer[]) => {
      const shp = (await import('shpjs')).default
      const json = await shp(fileBuffers[0])

      let allFeatures: Feature[] = []

      if (Array.isArray(json)) {
        json.forEach((collection) => {
          allFeatures = allFeatures.concat(collection.features)
        })
      } else {
        // If json is a single FeatureCollectionWithFilename
        allFeatures = json.features
      }

      const mergedFeatureCollection: FeatureCollection = {
        type: 'FeatureCollection',
        features: allFeatures,
      }

      setGeojson(mergedFeatureCollection)
    }

    loadGeojson(fileBuffers)
  }, [fileBuffers])

  useEffect(() => {
    if (geojson != null) {
      const featureProperties = geojson.features[0].properties

      // TODO: If columns null, return error to page
      let columns: string[] = []
      if (featureProperties) {
        columns = Object.keys(featureProperties)
      }

      setColumns(columns)
    }
  }, [geojson])

  // const handleZoningColChange = (newZoningCol: string | undefined) => {
  //   setZoningCol(newZoningCol)
  // }

  // const handleNameColChange = (newNameCol: string | undefined) => {
  //   setNameCol(newNameCol)
  // }

  const handleFolayerNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFolayerNameValue(event.target.value)
  }

  const handleIsVisibleChange = (
    _e: React.SyntheticEvent<Element, Event>,
    checked: boolean
  ) => {
    setIsVisible(checked)
  }

  const handleColorChange = (color: string) => {
    setFolayerColorValue(color)
  }

  const handleFinish = () => {
    if (folayerNameValue != null && geojson != null) {
      onFinish({
        name: folayerNameValue,
        colorCode: folayerColorValue,
        isVisible: isVisible,
      })
    }
  }

  return (
    <>
      {columns.length > 0 && (
        <>
          <TextFieldWithHeader
            headerText={t('sidebar.admin.create.name.header')}
            value={folayerNameValue}
            onChange={handleFolayerNameChange}
            placeholderText={t('sidebar.admin.create.name.placeholder')}
            sx={{ mt: 2.5 }}
            disabled={isInitializing}
          ></TextFieldWithHeader>
          <ColorPickerWithPopover
            color={folayerColorValue}
            onChange={handleColorChange}
            sx={{ mt: 6 }}
            labelText={t('sidebar.admin.folayer.settings.color')}
          ></ColorPickerWithPopover>
          <CheckBoxWithText
            checked={isVisible}
            onChange={handleIsVisibleChange}
            sx={{ mt: 2.5 }}
            disabled={isInitializing}
          >
            <T
              ns={'luonnonmetsakartat'}
              keyName={'sidebar.admin.create.is_visible'}
            ></T>
          </CheckBoxWithText>
          {/* <TextFieldWithHeader
            headerText={t('sidebar.admin.create.description.header')}
            value={folayerDescriptionValue}
            onChange={handleFolayerDescriptionChange}
            placeholderText={t('sidebar.admin.create.description.placeholder')}
            sx={{ mt: 2.5 }}
          ></TextFieldWithHeader> */}
          {/* <FolayerImportCodeRecordSelect
            columns={columns}
            selectedColumn={zoningCol}
            onColumnChange={handleZoningColChange}
            label={t('sidebar.create.select_zone_code_record')}
          />
          <FolayerImportCodeRecordSelect
            columns={columns}
            selectedColumn={nameCol}
            onColumnChange={handleNameColChange}
            label={t('sidebar.create.select_zone_name_record')}
            allowEmpty={true}
            sx={{ mt: 5 }}
          /> */}
        </>
      )}
      <FolayerImportActionsRow
        onClickAccept={handleFinish}
        isAcceptDisabled={
          folayerNameValue == null || folayerNameValue.length === 0
        }
        isLoading={isInitializing}
      ></FolayerImportActionsRow>
    </>
  )
}

export default FolayerImportShp
