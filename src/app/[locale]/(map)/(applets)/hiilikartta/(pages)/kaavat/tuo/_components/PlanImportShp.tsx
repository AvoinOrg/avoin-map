import { useEffect, useRef, useState } from 'react'
import { Feature, FeatureCollection } from 'geojson'

import { roundFeatureCoordinates } from '#/common/utils/map'
import PlanImportCodeRecordSelect from './PlanImportCodeRecordSelect'

type ResolvedImport = {
  importKey: string
  json: FeatureCollection
  zoningColName: string
  nameColName?: string
}

type PlanImportShpProps = {
  fileBuffer: ArrayBuffer
  copy: {
    zoningClassesLabel: string
    zoningClassesPlaceholder: string
    areaNamesLabel: string
    areaNamesPlaceholder: string
  }
  onResolveImport: (resolvedImport: ResolvedImport) => void
}

const PlanImportShp = ({
  fileBuffer,
  copy,
  onResolveImport,
}: PlanImportShpProps) => {
  const [geojson, setGeojson] = useState<FeatureCollection>()
  const [zoningCol, setZoningCol] = useState<string>()
  const [nameCol, setNameCol] = useState<string | undefined>()
  const [columns, setColumns] = useState<string[]>([])
  const lastResolvedImportKeyRef = useRef<string>()

  useEffect(() => {
    setGeojson(undefined)
    setColumns([])
    setZoningCol(undefined)
    setNameCol(undefined)
    lastResolvedImportKeyRef.current = undefined

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
  }, [fileBuffer])

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

    setColumns(Object.keys(featureProperties))
  }, [geojson])

  useEffect(() => {
    if (geojson == null || zoningCol == null) {
      lastResolvedImportKeyRef.current = undefined
      return
    }

    const importKey = `${fileBuffer.byteLength}:${zoningCol}:${nameCol ?? ''}`

    if (lastResolvedImportKeyRef.current === importKey) {
      return
    }

    onResolveImport({
      importKey,
      json: geojson,
      zoningColName: zoningCol,
      nameColName: nameCol,
    })
    lastResolvedImportKeyRef.current = importKey
  }, [fileBuffer.byteLength, geojson, nameCol, onResolveImport, zoningCol])

  return (
    <>
      <PlanImportCodeRecordSelect
        columns={columns}
        selectedColumn={zoningCol}
        onColumnChange={setZoningCol}
        label={copy.zoningClassesLabel}
        placeholder={copy.zoningClassesPlaceholder}
        sx={{ mb: '1.125rem' }}
      />
      <PlanImportCodeRecordSelect
        columns={columns}
        selectedColumn={nameCol}
        onColumnChange={setNameCol}
        allowEmpty
        label={copy.areaNamesLabel}
        placeholder={copy.areaNamesPlaceholder}
      />
    </>
  )
}

export default PlanImportShp
