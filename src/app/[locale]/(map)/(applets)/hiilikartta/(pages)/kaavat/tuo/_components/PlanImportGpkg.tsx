import { useEffect, useRef, useState } from 'react'
import { SelectChangeEvent } from '@mui/material'
import { FeatureCollection } from 'geojson'

import { roundFeatureCoordinates } from '#/common/utils/map'
import DropDownSelectWithHeader from '#/components/common/DropDownSelectWithHeader'
import PlanImportCodeRecordSelect from './PlanImportCodeRecordSelect'

type ResolvedImport = {
  importKey: string
  json: FeatureCollection
  zoningColName: string
  nameColName?: string
}

type PlanImportGpkgProps = {
  fileBuffer: ArrayBuffer
  copy: {
    tableLabel: string
    tablePlaceholder: string
    zoningClassesLabel: string
    zoningClassesPlaceholder: string
    areaNamesLabel: string
    areaNamesPlaceholder: string
  }
  onResolveImport: (resolvedImport: ResolvedImport) => void
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
  copy,
  onResolveImport,
}: PlanImportGpkgProps) => {
  const [gpkgFile, setGpkgFile] = useState<any>()
  const [table, setTable] = useState<string>()
  const [tables, setTables] = useState<string[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [zoningCol, setZoningCol] = useState<string>()
  const [nameCol, setNameCol] = useState<string | undefined>()
  const lastResolvedImportKeyRef = useRef<string>()

  useEffect(() => {
    let isMounted = true

    setGpkgFile(undefined)
    setTables([])
    setColumns([])
    setTable(undefined)
    setZoningCol(undefined)
    setNameCol(undefined)
    lastResolvedImportKeyRef.current = undefined

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
      setTables(geopackage.getFeatureTables())
    }

    loadGpkg().catch((error) => {
      console.error('Failed to load GeoPackage', error)
    })

    return () => {
      isMounted = false
    }
  }, [fileBuffer])

  useEffect(() => {
    if (gpkgFile == null) {
      return
    }

    const nextTables = gpkgFile.getFeatureTables()
    setTables(nextTables)
    setTable((currentTable) =>
      currentTable != null ? currentTable : nextTables[0]
    )
  }, [gpkgFile])

  useEffect(() => {
    if (table == null || gpkgFile == null) {
      setColumns([])
      setZoningCol(undefined)
      setNameCol(undefined)
      lastResolvedImportKeyRef.current = undefined
      return
    }

    const featureDao = gpkgFile.getFeatureDao(table)

    setColumns(featureDao.columns)
    setZoningCol(undefined)
    setNameCol(undefined)
    lastResolvedImportKeyRef.current = undefined
  }, [gpkgFile, table])

  useEffect(() => {
    if (gpkgFile == null || table == null || zoningCol == null) {
      lastResolvedImportKeyRef.current = undefined
      return
    }

    const importKey = `${fileBuffer.byteLength}:${table}:${zoningCol}:${nameCol ?? ''}`

    if (lastResolvedImportKeyRef.current === importKey) {
      return
    }

    const extract = async () => {
      const geoJson: FeatureCollection = {
        type: 'FeatureCollection',
        features: [],
      }
      const iterator = gpkgFile.iterateGeoJSONFeatures(table)

      for (const feature of iterator) {
        geoJson.features.push(roundFeatureCoordinates(feature))
      }

      onResolveImport({
        importKey,
        json: geoJson,
        zoningColName: zoningCol,
        nameColName: nameCol,
      })
      lastResolvedImportKeyRef.current = importKey
    }

    extract().catch((error) => {
      console.error('Failed to extract GeoPackage features', error)
    })
  }, [fileBuffer.byteLength, gpkgFile, nameCol, onResolveImport, table, zoningCol])

  const handleSelectTable = (event: SelectChangeEvent) => {
    setTable(event.target.value)
  }

  return (
    <>
      {tables.length > 1 && (
        <DropDownSelectWithHeader
          value={table}
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
          iconSx={{ mt: 0 }}
        />
      )}

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

export default PlanImportGpkg
