import { useEffect, useRef, useState } from 'react'
import { Feature, FeatureCollection } from 'geojson'

import { roundFeatureCoordinates } from '#/common/utils/map'
import PlanImportCodeRecordSelect from './PlanImportCodeRecordSelect'
import { PendingPlanImport } from './planImportTypes'

type PlanImportShpProps = {
  fileBuffer: ArrayBuffer
  selectedZoningCol?: string
  selectedNameCol?: string
  copy: {
    zoningClassesLabel: string
    zoningClassesPlaceholder: string
    areaNamesLabel: string
    areaNamesPlaceholder: string
  }
  onSelectedZoningColChange: (column: string | undefined) => void
  onSelectedNameColChange: (column: string | undefined) => void
  onPendingImportChange: (pendingImport: PendingPlanImport | null) => void
}

const PlanImportShp = ({
  fileBuffer,
  selectedZoningCol,
  selectedNameCol,
  copy,
  onSelectedZoningColChange,
  onSelectedNameColChange,
  onPendingImportChange,
}: PlanImportShpProps) => {
  const importFieldSpacing = '1rem'
  const [geojson, setGeojson] = useState<FeatureCollection>()
  const [columns, setColumns] = useState<string[]>([])
  const lastResolvedImportKeyRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    setGeojson(undefined)
    setColumns([])
    lastResolvedImportKeyRef.current = undefined
    onPendingImportChange(null)

    const loadGeojson = async () => {
      const shp = (await import('shpjs')).default
      const json = await shp(fileBuffer)

      let allFeatures: Feature[] = []

      if (Array.isArray(json)) {
        json.forEach((collection) => {
          allFeatures = allFeatures.concat(collection.features)
        })
      } else {
        allFeatures = json.features
      }

      const mergedFeatureCollection: FeatureCollection = {
        type: 'FeatureCollection',
        features: allFeatures.map(roundFeatureCoordinates),
      }

      setGeojson(mergedFeatureCollection)
    }

    loadGeojson().catch((error) => {
      console.error('Failed to load Shapefile zip', error)
    })
  }, [fileBuffer, onPendingImportChange])

  useEffect(() => {
    if (geojson == null) {
      setColumns([])
      return
    }

    const featureProperties = geojson.features[0]?.properties

    if (featureProperties == null) {
      setColumns([])
      return
    }

    const nextColumns = Object.keys(featureProperties)

    setColumns(nextColumns)
    lastResolvedImportKeyRef.current = undefined

    if (
      selectedZoningCol != null &&
      !nextColumns.includes(selectedZoningCol)
    ) {
      onSelectedZoningColChange(undefined)
    }

    if (selectedNameCol != null && !nextColumns.includes(selectedNameCol)) {
      onSelectedNameColChange(undefined)
    }
  }, [
    geojson,
    onSelectedNameColChange,
    onSelectedZoningColChange,
    selectedNameCol,
    selectedZoningCol,
  ])

  useEffect(() => {
    if (geojson == null || selectedZoningCol == null) {
      lastResolvedImportKeyRef.current = undefined
      onPendingImportChange(null)
      return
    }

    const importKey = `${fileBuffer.byteLength}:${selectedZoningCol}:${selectedNameCol ?? ''}`

    if (lastResolvedImportKeyRef.current === importKey) {
      return
    }

    onPendingImportChange({
      importKey,
      json: geojson,
      zoningColName: selectedZoningCol,
      nameColName: selectedNameCol,
    })
    lastResolvedImportKeyRef.current = importKey
  }, [
    fileBuffer.byteLength,
    geojson,
    onPendingImportChange,
    selectedNameCol,
    selectedZoningCol,
  ])

  return (
    <>
      <PlanImportCodeRecordSelect
        columns={columns}
        selectedColumn={selectedZoningCol}
        onColumnChange={onSelectedZoningColChange}
        label={copy.zoningClassesLabel}
        placeholder={copy.zoningClassesPlaceholder}
        sx={{ mb: importFieldSpacing }}
      />
      <PlanImportCodeRecordSelect
        columns={columns}
        selectedColumn={selectedNameCol}
        onColumnChange={onSelectedNameColChange}
        allowEmpty
        label={copy.areaNamesLabel}
        placeholder={copy.areaNamesPlaceholder}
      />
    </>
  )
}

export default PlanImportShp
