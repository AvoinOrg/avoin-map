import { useState, useEffect } from 'react'
import { Feature, FeatureCollection } from 'geojson'
import { useTranslate, T } from '@tolgee/react'

import TextFieldWithHeader from '#/components/common/TextFieldWithHeader'
import CheckBoxWithText from '#/components/common/CheckBoxWithText'

import LayerImportActionsRow from './LayerImportActionsRow'

const LayerImportShp = ({
  fileBuffers,
  onFinish,
}: {
  fileBuffers: ArrayBuffer[]
  onFinish: (
    json: FeatureCollection,
    layerName: string,
    isVisible: boolean
  ) => void
}) => {
  const { t } = useTranslate('luonnonmetsakartat')
  const [geojson, setGeojson] = useState<FeatureCollection>()
  // const [zoningCol, setZoningCol] = useState<string>()
  const [layerNameValue, setLayerNameValue] = useState<string>('')
  const [isVisible, setIsVisible] = useState<boolean>(false)
  // const [layerDescriptionValue, setLayerDescriptionValue] = useState<string>('')
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

  const handleLayerNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setLayerNameValue(event.target.value)
  }

  const handleIsVisibleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    setIsVisible(checked)
  }

  // const handleLayerDescriptionChange = (
  //   event: React.ChangeEvent<HTMLInputElement>
  // ) => {
  //   setLayerDescriptionValue(event.target.value)
  // }

  const handleFinish = () => {
    if (layerNameValue != null && geojson != null) {
      console.log("test")
      onFinish(geojson, layerNameValue, isVisible)
    }
  }

  return (
    <>
      {columns.length > 0 && (
        <>
          <TextFieldWithHeader
            headerText={t('sidebar.admin.create.name.header')}
            value={layerNameValue}
            onChange={handleLayerNameChange}
            placeholderText={t('sidebar.admin.create.name.placeholder')}
            sx={{ mt: 2.5 }}
          ></TextFieldWithHeader>
          <CheckBoxWithText
            checked={isVisible}
            onChange={handleIsVisibleChange}
            sx={{ mt: 2.5 }}
          >
            <T
              ns={'luonnonmetsakartat'}
              keyName={'sidebar.admin.create.is_visible'}
            ></T>
          </CheckBoxWithText>
          {/* <TextFieldWithHeader
            headerText={t('sidebar.admin.create.description.header')}
            value={layerDescriptionValue}
            onChange={handleLayerDescriptionChange}
            placeholderText={t('sidebar.admin.create.description.placeholder')}
            sx={{ mt: 2.5 }}
          ></TextFieldWithHeader> */}
          {/* <LayerImportCodeRecordSelect
            columns={columns}
            selectedColumn={zoningCol}
            onColumnChange={handleZoningColChange}
            label={t('sidebar.create.select_zone_code_record')}
          />
          <LayerImportCodeRecordSelect
            columns={columns}
            selectedColumn={nameCol}
            onColumnChange={handleNameColChange}
            label={t('sidebar.create.select_zone_name_record')}
            allowEmpty={true}
            sx={{ mt: 5 }}
          /> */}
        </>
      )}

      <LayerImportActionsRow
        onClickAccept={handleFinish}
        isAcceptDisabled={layerNameValue == null || layerNameValue.length === 0}
      ></LayerImportActionsRow>
    </>
  )
}

export default LayerImportShp
