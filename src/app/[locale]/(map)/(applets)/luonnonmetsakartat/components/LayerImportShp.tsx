import { useState, useEffect } from 'react'
import { Feature, FeatureCollection } from 'geojson'
import { useTranslate } from '@tolgee/react'

import LayerImportActionsRow from './LayerImportActionsRow'
import LayerImportCodeRecordSelect from './LayerImportCodeRecordSelect'

const LayerImportShp = ({
  fileBuffers,
  onFinish,
}: {
  fileBuffers: ArrayBuffer[]
  onFinish: (
    json: FeatureCollection,
    zoningColName: string,
    nameColName?: string
  ) => void
}) => {
  const { t } = useTranslate('luonnonmetsakartat')
  const [geojson, setGeojson] = useState<FeatureCollection>()
  const [zoningCol, setZoningCol] = useState<string>()
  const [nameCol, setNameCol] = useState<string | undefined>() // nameCol can be optional
  const [columns, setColumns] = useState<string[]>([])

  useEffect(() => {
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

  const handleZoningColChange = (newZoningCol: string | undefined) => {
    setZoningCol(newZoningCol)
  }

  const handleNameColChange = (newNameCol: string | undefined) => {
    setNameCol(newNameCol)
  }

  const handleFinish = () => {
    if (zoningCol != null && geojson != null) {
      onFinish(geojson, zoningCol, nameCol)
    }
  }

  return (
    <>
      {columns.length > 0 && (
        <>
          <LayerImportCodeRecordSelect
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
          />
        </>
      )}

      <LayerImportActionsRow
        onClickAccept={handleFinish}
        isAcceptDisabled={zoningCol == null}
      ></LayerImportActionsRow>
    </>
  )
}

export default LayerImportShp
