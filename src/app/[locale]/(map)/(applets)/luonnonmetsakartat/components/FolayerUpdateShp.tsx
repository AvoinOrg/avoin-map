import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Feature, FeatureCollection } from 'geojson'
import { useTranslate, T } from '@tolgee/react'
import { SelectChangeEvent, Box, Typography } from '@mui/material'

import DropDownSelect from '#/components/common/DropDownSelect'
import { useUIStore } from '#/common/store'

import FolayerImportCodeRecordSelect from './FolayerImportCodeRecordSelect'
import { IndexingStrategy, AdminFolayerConf, ColOptions } from '../common/types'

export interface FolayerUpdateShpRef {
  getValues: (
    callback: (
      values: {
        colOptions: ColOptions
        rawShapefile: ArrayBuffer
      } | null
    ) => void
  ) => void
}

interface FolayerUpdateShpProps {
  fileBuffers: ArrayBuffer[]
  adminFolayerConf: AdminFolayerConf
}

const FolayerUpdateShp = forwardRef<
  FolayerUpdateShpRef,
  FolayerUpdateShpProps
>(({ fileBuffers, adminFolayerConf }, ref) => {
  const { t } = useTranslate('luonnonmetsakartat')
  const notify = useUIStore((state) => state.notify)
  const triggerConfirmationDialog = useUIStore(
    (state) => state.triggerConfirmationDialog
  )
  const [geojson, setGeojson] = useState<FeatureCollection>()
  const [columns, setColumns] = useState<string[]>([])
  const [idCol, setIdCol] = useState<string | undefined>()
  const [nameCol, setNameCol] = useState<string | undefined>()
  const [descriptionCol, setDescriptionCol] = useState<string | undefined>()
  const [areaCol, setAreaCol] = useState<string | undefined>()
  const [municipalityCol, setMunicipalityCol] = useState<string | undefined>()
  const [regionCol, setRegionCol] = useState<string | undefined>()
  const [indexingStrategy, setIndexingStrategy] = useState<IndexingStrategy>(
    adminFolayerConf.colOptions?.indexingStrategy || 'id'
  )

  useImperativeHandle(ref, () => ({
    getValues: (
      callback: (
        values: {
          colOptions: ColOptions
          rawShapefile: ArrayBuffer
        } | null
      ) => void
    ) => {
      if (geojson) {
        const performFinish = () => {
          if (indexingStrategy === 'name_municipality') {
            const nameMunicipalityCounts: { [key: string]: string[] } = {}
            for (const feature of geojson.features) {
              const name = feature.properties?.[nameCol as string]
              const municipality =
                feature.properties?.[municipalityCol as string]
              if (name && municipality) {
                const pair = `${name}|${municipality}`
                if (!nameMunicipalityCounts[pair]) {
                  nameMunicipalityCounts[pair] = []
                }
                nameMunicipalityCounts[pair].push(`${name} - ${municipality}`)
              }
            }

            const duplicates = Object.values(nameMunicipalityCounts).filter(
              (v) => v.length > 1
            )

            if (duplicates.length > 0) {
              const duplicateList = duplicates
                .map((group) => group[0])
                .join(', ')
              const errorMessage = t(
                'sidebar.admin.create.error_name_municipality_not_unique',
                {
                  duplicates: duplicateList,
                }
              )
              notify({
                variant: 'error',
                message: errorMessage,
                manualDismiss: true,
              })
              console.error(
                'Name and municipality pairs are not unique:',
                duplicateList
              )
              callback(null)
              return
            }
          } else if (indexingStrategy === 'id') {
            const idCounts: { [key: string]: number } = {}
            for (const feature of geojson.features) {
              const id = feature.properties?.[idCol as string]
              if (id) {
                idCounts[id] = (idCounts[id] || 0) + 1
              }
            }

            const duplicates = Object.entries(idCounts)
              .filter(([, count]) => count > 1)
              .map(([id]) => id)

            if (duplicates.length > 0) {
              const duplicateList = duplicates.join(', ')
              const errorMessage = t(
                'sidebar.admin.create.error_id_not_unique',
                {
                  ids: duplicateList,
                }
              )
              notify({
                variant: 'error',
                message: errorMessage,
                manualDismiss: true,
              })
              console.error('IDs are not unique:', duplicateList)
              callback(null)
              return
            }
          }

          callback({
            colOptions: {
              indexingStrategy: indexingStrategy,
              idCol: idCol,
              nameCol: nameCol as string,
              municipalityCol: municipalityCol as string,
              regionCol: regionCol,
              descriptionCol: descriptionCol,
              areaCol: areaCol,
            },
            rawShapefile: fileBuffers[0],
          })
        }

        const invalidCharRegex = /[^a-zA-Z0-9åäöÅÄÖ\s-]/
        const encodingErrorRegex = /Ã/

        const checkColumn = (colName: string | undefined) => {
          if (!colName || !geojson)
            return { invalidChars: [], encodingErrors: [] }
          const invalidChars: string[] = []
          const encodingErrors: string[] = []
          for (const feature of geojson.features) {
            const value = feature.properties?.[colName]
            if (typeof value === 'string') {
              if (invalidCharRegex.test(value)) {
                invalidChars.push(value)
              }
              if (encodingErrorRegex.test(value)) {
                encodingErrors.push(value)
              }
            }
          }
          return {
            invalidChars: [...new Set(invalidChars)],
            encodingErrors: [...new Set(encodingErrors)],
          }
        }

        const nameValidation = checkColumn(nameCol)
        const municipalityValidation = checkColumn(municipalityCol)
        const regionValidation = checkColumn(regionCol)

        const nameHasErrors =
          nameValidation.invalidChars.length > 0 ||
          nameValidation.encodingErrors.length > 0
        const municipalityHasErrors =
          municipalityValidation.invalidChars.length > 0 ||
          municipalityValidation.encodingErrors.length > 0

        if (indexingStrategy === 'name_municipality') {
          if (nameHasErrors || municipalityHasErrors) {
            const invalidStrings = [
              ...nameValidation.invalidChars,
              ...nameValidation.encodingErrors,
              ...municipalityValidation.invalidChars,
              ...municipalityValidation.encodingErrors,
            ]
            console.error(
              'Invalid strings found:',
              [...new Set(invalidStrings)]
            )
            const errorMessage = t(
              'sidebar.admin.create.error_invalid_chars_or_encoding'
            )
            notify({
              variant: 'error',
              message: errorMessage,
              manualDismiss: true,
            })
            callback(null)
            return
          }
        } else {
          const problematicCols: string[] = []
          const allInvalidStrings: string[] = []
          if (nameHasErrors) {
            problematicCols.push(
              t('sidebar.admin.create.select_folayer_name_record')
            )
            allInvalidStrings.push(
              ...nameValidation.invalidChars,
              ...nameValidation.encodingErrors
            )
          }
          if (municipalityHasErrors) {
            problematicCols.push(
              t('sidebar.admin.create.select_folayer_municipality_record')
            )
            allInvalidStrings.push(
              ...municipalityValidation.invalidChars,
              ...municipalityValidation.encodingErrors
            )
          }
          if (
            regionValidation.invalidChars.length > 0 ||
            regionValidation.encodingErrors.length > 0
          ) {
            problematicCols.push(
              t('sidebar.admin.create.select_folayer_region_record')
            )
            allInvalidStrings.push(
              ...regionValidation.invalidChars,
              ...regionValidation.encodingErrors
            )
          }

          if (problematicCols.length > 0) {
            console.error(
              'Invalid strings found:',
              [...new Set(allInvalidStrings)]
            )
            triggerConfirmationDialog({
              content: t('sidebar.admin.create.confirm_invalid_chars', {
                columns: problematicCols.join(', '),
              }),
              onConfirm: performFinish,
              onCancel: () => callback(null),
            })
            return
          }
        }

        performFinish()
      } else {
        callback(null)
      }
    },
  }))

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
      let columns: string[] = []
      if (featureProperties) {
        columns = Object.keys(featureProperties)
      }
      setColumns(columns)

      const findBestColumnMatch = (
        cols: string[],
        candidates: string[],
        allowPartial: boolean = false
      ): string | undefined => {
        const lowerCaseColumns = cols.map((c) => ({
          original: c,
          lower: c.toLowerCase(),
        }))

        for (const candidate of candidates) {
          const found = lowerCaseColumns.find(
            (c) => c.lower === candidate.toLowerCase()
          )
          if (found) return found.original
        }

        if (allowPartial) {
          for (const candidate of candidates) {
            const found = lowerCaseColumns.find((c) =>
              c.lower.includes(candidate.toLowerCase())
            )
            if (found) return found.original
          }
        }
        return undefined
      }

      const colOpts = adminFolayerConf.colOptions

      const idCandidates = ['id', 'fid', 'oid', 'objectid', 'tunnus']
      const nameCandidates = ['name', 'nimi']
      const descriptionCandidates = ['description', 'desc', 'kuvaus']
      const areaCandidates = ['ala', 'area', 'pinta']
      const municipalityCandidates = ['municipality', 'kunta']
      const regionCandidates = ['region', 'maakunta']

      setIdCol(colOpts?.idCol || findBestColumnMatch(columns, idCandidates))
      setNameCol(
        colOpts?.nameCol || findBestColumnMatch(columns, nameCandidates)
      )
      setDescriptionCol(
        colOpts?.descriptionCol ||
          findBestColumnMatch(columns, descriptionCandidates)
      )
      setAreaCol(
        colOpts?.areaCol || findBestColumnMatch(columns, areaCandidates, true)
      )
      setMunicipalityCol(
        colOpts?.municipalityCol ||
          findBestColumnMatch(columns, municipalityCandidates)
      )
      setRegionCol(
        colOpts?.regionCol || findBestColumnMatch(columns, regionCandidates)
      )
    }
  }, [geojson, adminFolayerConf.colOptions])

  const handleNameColChange = (newNameCol: string | undefined) => {
    setNameCol(newNameCol)
  }

  const handleMunicipalityColChange = (
    newMunicipalityCol: string | undefined
  ) => {
    setMunicipalityCol(newMunicipalityCol)
  }

  const handleRegionColChange = (newRegionCol: string | undefined) => {
    setRegionCol(newRegionCol)
  }

  const handleIdColChange = (newIdCol: string | undefined) => {
    setIdCol(newIdCol)
  }

  const handleDescriptionColChange = (
    newDescriptionCol: string | undefined
  ) => {
    setDescriptionCol(newDescriptionCol)
  }

  const handleAreaColChange = (newAreaCol: string | undefined) => {
    setAreaCol(newAreaCol)
  }

  return (
    <>
      {columns.length > 0 && (
        <>
          <Box
            sx={(theme) => ({
              backgroundColor: theme.palette.neutral.light,
              p: 4,
              borderRadius: '0.3125rem',
            })}
          >
            <Typography variant="h4" sx={{ mb: 4 }}>
              {t('sidebar.admin.create.column_selection_header')}
            </Typography>
            <DropDownSelect
              label={t('sidebar.admin.create.indexing_strategy_label')}
              value={indexingStrategy}
              onChange={() => {}}
              disabled={true}
              options={[
                {
                  value: 'id',
                  label: t('sidebar.admin.create.indexing_strategy.id'),
                },
                {
                  value: 'name_municipality',
                  label: t(
                    'sidebar.admin.create.indexing_strategy.name_municipality'
                  ),
                },
              ]}
              sx={{ width: '100%' }}
            />
            <FolayerImportCodeRecordSelect
              columns={columns}
              selectedColumn={idCol}
              onColumnChange={handleIdColChange}
              label={
                indexingStrategy === 'id'
                  ? t('sidebar.admin.create.select_folayer_id_record')
                  : t('sidebar.admin.create.select_folayer_id_record_optional')
              }
              allowEmpty={true}
              sx={{ mt: 4, width: '100%' }}
            />
            <FolayerImportCodeRecordSelect
              columns={columns}
              selectedColumn={nameCol}
              onColumnChange={handleNameColChange}
              label={t('sidebar.admin.create.select_folayer_name_record')}
              allowEmpty={true}
              sx={{ mt: 4, width: '100%' }}
            />
            <FolayerImportCodeRecordSelect
              columns={columns}
              selectedColumn={municipalityCol}
              onColumnChange={handleMunicipalityColChange}
              label={t(
                'sidebar.admin.create.select_folayer_municipality_record'
              )}
              allowEmpty={true}
              sx={{ mt: 4, width: '100%' }}
            />
            <FolayerImportCodeRecordSelect
              columns={columns}
              selectedColumn={regionCol}
              onColumnChange={handleRegionColChange}
              label={t('sidebar.admin.create.select_folayer_region_record')}
              allowEmpty={true}
              sx={{ mt: 4, width: '100%' }}
            />
            <FolayerImportCodeRecordSelect
              columns={columns}
              selectedColumn={descriptionCol}
              onColumnChange={handleDescriptionColChange}
              label={t(
                'sidebar.admin.create.select_folayer_description_record'
              )}
              allowEmpty={true}
              sx={{ mt: 4, width: '100%' }}
            />
            <FolayerImportCodeRecordSelect
              columns={columns}
              selectedColumn={areaCol}
              onColumnChange={handleAreaColChange}
              label={t('sidebar.admin.create.select_folayer_area_record')}
              allowEmpty={true}
              sx={{ mt: 4, width: '100%' }}
            />
          </Box>
        </>
      )}
    </>
  )
})

export default FolayerUpdateShp
