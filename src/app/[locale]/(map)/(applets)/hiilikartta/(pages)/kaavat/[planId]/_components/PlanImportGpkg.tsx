import { useEffect, useMemo, useRef, useState } from 'react'
import { SelectChangeEvent } from '@mui/material'
import { FeatureCollection } from 'geojson'

import { roundFeatureCoordinates } from '#/common/utils/map'
import DropDownSelectWithHeader from '#/components/common/DropDownSelectWithHeader'
import PlanImportCodeRecordSelect from './PlanImportCodeRecordSelect'
import { PendingPlanImport } from './planImportTypes'

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

const sharedSelectSx = {
  '&.MuiOutlinedInput-root': {
    minHeight: '1.25rem',
    borderRadius: '0.625rem',
    backgroundColor: '#ffffff',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#d6d6d6',
  },
  '& .MuiSelect-select': {
    minHeight: '1.25rem',
    py: '0.1875rem',
    pl: '1rem',
    pr: '2.75rem !important',
    fontSize: '0.6875rem',
    fontWeight: 400,
    lineHeight: 'normal',
    letterSpacing: '0.04em',
    color: '#111111',
  },
  '& .MuiSelect-icon': {
    width: '0.5rem',
    height: '0.25rem',
    mr: '0.75rem',
  },
} as const

const sharedTypographySx = {
  fontSize: '0.6875rem',
  fontWeight: 400,
  lineHeight: 'normal',
  letterSpacing: '0.04em',
} as const

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
  const [gpkgFile, setGpkgFile] = useState<any>()
  const [tables, setTables] = useState<string[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const lastResolvedImportKeyRef = useRef<string>()

  const activeTable = useMemo(() => {
    if (selectedTable != null && tables.includes(selectedTable)) {
      return selectedTable
    }

    return tables[0]
  }, [selectedTable, tables])

  useEffect(() => {
    let isMounted = true

    setGpkgFile(undefined)
    setTables([])
    setColumns([])
    lastResolvedImportKeyRef.current = undefined
    onPendingImportChange(null)

    const loadGpkg = async () => {
      const { GeoPackageAPI, setSqljsWasmLocateFile } =
        await import('@ngageoint/geopackage')

      setSqljsWasmLocateFile((file) => '/lib/' + file)

      const geopackage = await GeoPackageAPI.open(new Uint8Array(fileBuffer))

      if (!isMounted) {
        geopackage.close?.()
        return
      }

      setGpkgFile(geopackage)
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

    setTables(nextTables)

    if (selectedTable !== nextSelectedTable) {
      onSelectedTableChange(nextSelectedTable)
    }
  }, [gpkgFile, onSelectedTableChange, selectedTable])

  useEffect(() => {
    if (activeTable == null || gpkgFile == null) {
      setColumns([])
      lastResolvedImportKeyRef.current = undefined
      onPendingImportChange(null)
      return
    }

    const featureDao = gpkgFile.getFeatureDao(activeTable)
    const nextColumns = featureDao.columns

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
    activeTable,
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

  const handleSelectTable = (event: SelectChangeEvent) => {
    onSelectedTableChange(event.target.value || undefined)
  }

  return (
    <>
      {tables.length > 1 && (
        <DropDownSelectWithHeader
          value={activeTable}
          options={tables.map((tableName) => ({
            value: tableName,
            label: tableName,
          }))}
          onChange={handleSelectTable}
          label={copy.tableLabel}
          placeholder={copy.tablePlaceholder}
          sx={{ width: '100%', mb: '1.125rem' }}
          labelSx={{
            mb: '0.3125rem',
            fontSize: '0.625rem',
            fontWeight: 400,
            lineHeight: '0.8125rem',
            letterSpacing: '0.11em',
            color: '#111111',
          }}
          selectSx={sharedSelectSx}
          typographySx={sharedTypographySx}
          successIndicatorMode="outside"
          iconSx={{ mt: 0 }}
        />
      )}

      <PlanImportCodeRecordSelect
        columns={columns}
        selectedColumn={selectedZoningCol}
        onColumnChange={onSelectedZoningColChange}
        label={copy.zoningClassesLabel}
        placeholder={copy.zoningClassesPlaceholder}
        sx={{ mb: '1.125rem' }}
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

export default PlanImportGpkg
