import { useEffect, useMemo, useRef, useState } from 'react'
import { Feature, FeatureCollection } from 'geojson'

import { roundFeatureCoordinates } from '#/common/utils/map'
import PlanImportCodeRecordSelect from './PlanImportCodeRecordSelect'
import { loadShapefileZip } from './planImportShpLoader'
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
  const [geojsonState, setGeojsonState] = useState<{
    fileBuffer: ArrayBuffer
    geojson: FeatureCollection
  }>()
  const lastResolvedImportKeyRef = useRef<string | undefined>(undefined)
  const geojson =
    geojsonState?.fileBuffer === fileBuffer
      ? geojsonState.geojson
      : undefined
  const columns = useMemo(() => {
    const featureProperties = geojson?.features[0]?.properties

    if (featureProperties == null) {
      return []
    }

    return Object.keys(featureProperties)
  }, [geojson])

  useEffect(() => {
    let isMounted = true

    lastResolvedImportKeyRef.current = undefined
    onPendingImportChange(null)

    const loadGeojson = async () => {
      const json = await loadShapefileZip(fileBuffer)

      if (!isMounted) {
        return
      }

      setGeojsonState({
        fileBuffer,
        geojson: {
          type: 'FeatureCollection',
          features: json.features.map((feature) =>
            roundFeatureCoordinates(feature as Feature)
          ),
        },
      })
    }

    loadGeojson().catch((error) => {
      console.error('Failed to load Shapefile zip', error)
    })

    return () => {
      isMounted = false
    }
  }, [fileBuffer, onPendingImportChange])

  useEffect(() => {
    if (geojson == null) {
      return
    }

    lastResolvedImportKeyRef.current = undefined

    if (
      selectedZoningCol != null &&
      !columns.includes(selectedZoningCol)
    ) {
      onSelectedZoningColChange(undefined)
    }

    if (selectedNameCol != null && !columns.includes(selectedNameCol)) {
      onSelectedNameColChange(undefined)
    }
  }, [
    columns,
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
        dataSlot="plan-import-zoning-column"
        columns={columns}
        selectedColumn={selectedZoningCol}
        onColumnChange={onSelectedZoningColChange}
        label={copy.zoningClassesLabel}
        placeholder={copy.zoningClassesPlaceholder}
        sx={{ mb: importFieldSpacing }}
      />
      <PlanImportCodeRecordSelect
        dataSlot="plan-import-name-column"
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
