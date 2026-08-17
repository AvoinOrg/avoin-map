import { useEffect, useMemo, useRef, useState } from 'react'
import { Feature, FeatureCollection } from 'geojson'

import { roundFeatureCoordinates } from '#/common/utils/map'
import type { DropDownValueChangeEvent } from '#/components/common/DropDownSelect'
import DropDownSelectWithLabel from '#/components/common/DropDownSelectWithLabel'
import PlanImportCodeRecordSelect from './PlanImportCodeRecordSelect'
import { PendingPlanImport } from './planImportTypes'

type GpkgFeatureDao = {
  columns: string[]
}

type GpkgFile = {
  getFeatureTables: () => string[]
  getFeatureDao: (table: string) => GpkgFeatureDao
  iterateGeoJSONFeatures: (table: string) => Iterable<Feature>
  close?: () => void
}

type PlanImportGpkgProps = {
  fileBuffer: ArrayBuffer
  selectedTable?: string
  selectedZoningCol?: string
  selectedNameCol?: string
  copy: {
    tableLabel: string
    tablePlaceholder: string
    zoningClassesLabel: string
    zoningClassesPlaceholder: string
    areaNamesLabel: string
    areaNamesPlaceholder: string
  }
  onSelectedTableChange: (table: string | undefined) => void
  onSelectedZoningColChange: (column: string | undefined) => void
  onSelectedNameColChange: (column: string | undefined) => void
  onPendingImportChange: (pendingImport: PendingPlanImport | null) => void
}

const PlanImportGpkg = ({
  fileBuffer,
  selectedTable,
  selectedZoningCol,
  selectedNameCol,
  copy,
  onSelectedTableChange,
  onSelectedZoningColChange,
  onSelectedNameColChange,
  onPendingImportChange,
}: PlanImportGpkgProps) => {
  const importFieldSpacing = '1rem'
  const [gpkgFileState, setGpkgFileState] = useState<{
    fileBuffer: ArrayBuffer
    gpkgFile: GpkgFile
  }>()
  const lastResolvedImportKeyRef = useRef<string | undefined>(undefined)
  const gpkgFile =
    gpkgFileState?.fileBuffer === fileBuffer
      ? gpkgFileState.gpkgFile
      : undefined
  const tables = useMemo(() => gpkgFile?.getFeatureTables() ?? [], [gpkgFile])

  const activeTable = useMemo(() => {
    if (selectedTable != null && tables.includes(selectedTable)) {
      return selectedTable
    }

    return tables[0]
  }, [selectedTable, tables])

  const columns = useMemo(() => {
    if (activeTable == null || gpkgFile == null) {
      return []
    }

    return gpkgFile.getFeatureDao(activeTable).columns
  }, [activeTable, gpkgFile])

  useEffect(() => {
    let isMounted = true

    lastResolvedImportKeyRef.current = undefined
    onPendingImportChange(null)

    const loadGpkg = async () => {
      const { GeoPackageAPI, setSqljsWasmLocateFile } =
        await import('@ngageoint/geopackage')

      setSqljsWasmLocateFile((file) => '/lib/' + file)

      const geopackage = (await GeoPackageAPI.open(
        new Uint8Array(fileBuffer)
      )) as GpkgFile

      if (!isMounted) {
        geopackage.close?.()
        return
      }

      setGpkgFileState({ fileBuffer, gpkgFile: geopackage })
    }

    loadGpkg().catch((error) => {
      console.error('Failed to load GeoPackage', error)
    })

    return () => {
      isMounted = false
    }
  }, [fileBuffer, onPendingImportChange])

  useEffect(() => {
    if (gpkgFile == null) {
      return
    }

    const nextTables = gpkgFile.getFeatureTables()
    const nextSelectedTable =
      selectedTable != null && nextTables.includes(selectedTable)
        ? selectedTable
        : nextTables[0]

    if (selectedTable !== nextSelectedTable) {
      onSelectedTableChange(nextSelectedTable)
    }
  }, [gpkgFile, onSelectedTableChange, selectedTable])

  useEffect(() => {
    if (activeTable == null || gpkgFile == null) {
      lastResolvedImportKeyRef.current = undefined
      onPendingImportChange(null)
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
    activeTable,
    columns,
    gpkgFile,
    onPendingImportChange,
    onSelectedNameColChange,
    onSelectedZoningColChange,
    selectedNameCol,
    selectedZoningCol,
  ])

  useEffect(() => {
    if (
      gpkgFile == null ||
      activeTable == null ||
      selectedZoningCol == null
    ) {
      lastResolvedImportKeyRef.current = undefined
      onPendingImportChange(null)
      return
    }

    const importKey = `${fileBuffer.byteLength}:${activeTable}:${selectedZoningCol}:${selectedNameCol ?? ''}`

    if (lastResolvedImportKeyRef.current === importKey) {
      return
    }

    const extract = async () => {
      const geoJson: FeatureCollection = {
        type: 'FeatureCollection',
        features: [],
      }
      const iterator = gpkgFile.iterateGeoJSONFeatures(activeTable)

      for (const feature of iterator) {
        geoJson.features.push(roundFeatureCoordinates(feature))
      }

      onPendingImportChange({
        importKey,
        json: geoJson,
        zoningColName: selectedZoningCol,
        nameColName: selectedNameCol,
      })
      lastResolvedImportKeyRef.current = importKey
    }

    extract().catch((error) => {
      console.error('Failed to extract GeoPackage features', error)
    })
  }, [
    activeTable,
    fileBuffer.byteLength,
    gpkgFile,
    onPendingImportChange,
    selectedNameCol,
    selectedZoningCol,
  ])

  const handleSelectTable = (event: DropDownValueChangeEvent) => {
    onSelectedTableChange(event.target.value || undefined)
  }

  return (
    <>
      {tables.length > 1 && (
        <DropDownSelectWithLabel
          dataSlot="plan-import-table-select"
          value={activeTable}
          options={tables.map((tableName) => ({
            value: tableName,
            label: tableName,
          }))}
          onChange={handleSelectTable}
          label={copy.tableLabel}
          placeholder={copy.tablePlaceholder}
          sx={{ width: '100%', mb: importFieldSpacing }}
          successIndicatorMode="outside"
        />
      )}

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

export default PlanImportGpkg
