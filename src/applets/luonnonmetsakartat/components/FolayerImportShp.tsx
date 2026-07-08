import { useState, useEffect, type ChangeEvent } from 'react'
import type { Feature, FeatureCollection } from 'geojson'
import { useTranslate } from '@tolgee/react'

import { Box } from '#/common/style/theme'
import type { DropDownValueChangeEvent } from '#/components/common/DropDownSelect'
import TextFieldWithHeader from '#/components/common/TextFieldWithHeader'
import SwitchWithLabel from '#/components/common/SwitchWithLabel'
import DropDownSelectWithLabel from '#/components/common/DropDownSelectWithLabel'
import ColorPickerWithPopover from '#/components/common/ColorPickerWithPopover'
import { useUIStore } from '#/common/store'
import TText from '#/components/common/TText'

import FolayerImportActionsRow from './FolayerImportActionsRow'
import FolayerImportCodeRecordSelect from './FolayerImportCodeRecordSelect'
import type { IndexingStrategy } from '../common/types'
import {
  folayerDataValidateColumnValues,
  folayerDataFindDuplicateIds,
  folayerDataFindDuplicateNameMunicipalityPairs,
} from '../common/utils'
import { ensureShpjsBrowserGlobals } from '../common/shpjsCompat'

const idCandidates = ['id', 'fid', 'oid', 'objectid', 'tunnus']
const nameCandidates = ['name', 'nimi']
const descriptionCandidates = ['description', 'desc', 'kuvaus']
const areaCandidates = ['ala', 'area', 'pinta']
const municipalityCandidates = ['municipality', 'kunta']
const regionCandidates = ['region', 'maakunta']

const selectorFieldSx = { width: '100%' } as const

interface FolayerImportShpProps {
  fileBuffers: ArrayBuffer[]
  onFinish: (params: {
    indexingStrategy: IndexingStrategy
    nameCol: string
    municipalityCol: string
    idCol?: string
    regionCol?: string
    descriptionCol?: string
    areaCol?: string
    name?: string
    colorCode?: string
    isVisible?: boolean
  }) => void
  isInitializing: boolean
}

const findBestColumnMatch = (
  cols: string[],
  candidates: string[],
  allowPartial: boolean = false
): string | undefined => {
  const lowerCaseColumns = cols.map((c) => ({
    original: c,
    lower: c.toLowerCase(),
  }))

  // Prioritize exact matches.
  for (const candidate of candidates) {
    const found = lowerCaseColumns.find(
      (c) => c.lower === candidate.toLowerCase()
    )
    if (found) {
      return found.original
    }
  }

  if (allowPartial) {
    for (const candidate of candidates) {
      const found = lowerCaseColumns.find((c) =>
        c.lower.includes(candidate.toLowerCase())
      )
      if (found) {
        return found.original
      }
    }
  }

  return undefined
}

const getFeatureColumns = (featureCollection: FeatureCollection): string[] => {
  const featureProperties = featureCollection.features[0].properties

  if (!featureProperties) {
    return []
  }

  return Object.keys(featureProperties)
}

const FolayerImportShp = ({
  fileBuffers,
  onFinish,
  isInitializing,
}: FolayerImportShpProps) => {
  const { t } = useTranslate('luonnonmetsakartat')
  const notify = useUIStore((state) => state.notify)
  const triggerConfirmationDialog = useUIStore(
    (state) => state.triggerConfirmationDialog
  )
  const [geojson, setGeojson] = useState<FeatureCollection>()
  // const [zoningCol, setZoningCol] = useState<string>()
  const [folayerNameValue, setFolayerNameValue] = useState<string>('')
  const [folayerColorValue, setFolayerColorValue] = useState<string>('#06402B')
  const [isVisible, setIsVisible] = useState<boolean>(false)
  // const [folayerDescriptionValue, setFolayerDescriptionValue] = useState<string>('')
  const [columns, setColumns] = useState<string[]>([])
  const [idCol, setIdCol] = useState<string | undefined>()
  const [nameCol, setNameCol] = useState<string | undefined>()
  const [descriptionCol, setDescriptionCol] = useState<string | undefined>()
  const [areaCol, setAreaCol] = useState<string | undefined>()
  const [municipalityCol, setMunicipalityCol] = useState<string | undefined>()
  const [regionCol, setRegionCol] = useState<string | undefined>()
  const [indexingStrategy, setIndexingStrategy] =
    useState<IndexingStrategy>('id')

  useEffect(() => {
    let isStale = false

    // Load shp into geojson to validate it locally
    // TODO: Validate it locally :)
    const loadGeojson = async (fileBuffers: ArrayBuffer[]) => {
      await ensureShpjsBrowserGlobals()
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

      if (isStale) {
        return
      }

      const columns = getFeatureColumns(mergedFeatureCollection)
      setGeojson(mergedFeatureCollection)
      setColumns(columns)
      setIdCol(findBestColumnMatch(columns, idCandidates))
      setNameCol(findBestColumnMatch(columns, nameCandidates))
      setDescriptionCol(findBestColumnMatch(columns, descriptionCandidates))
      setAreaCol(findBestColumnMatch(columns, areaCandidates, true))
      setMunicipalityCol(findBestColumnMatch(columns, municipalityCandidates))
      setRegionCol(findBestColumnMatch(columns, regionCandidates))
    }

    void loadGeojson(fileBuffers)

    return () => {
      isStale = true
    }
  }, [fileBuffers])

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

  const handleIndexingStrategyChange = (event: DropDownValueChangeEvent) => {
    const value = event.target.value
    if (value === 'id' || value === 'name_municipality') {
      setIndexingStrategy(value as IndexingStrategy)
    } else {
      throw new Error(`Invalid indexing strategy: ${value}`)
    }
  }

  const handleFolayerNameChange = (value: string) => {
    setFolayerNameValue(value)
  }

  const handleIsVisibleChange = (
    _event: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    setIsVisible(checked)
  }

  const handleColorChange = (color: string) => {
    setFolayerColorValue(color)
  }

  const handleFinish = () => {
    if (folayerNameValue != null && geojson != null) {
      const performFinish = () => {
        if (indexingStrategy === 'name_municipality') {
          const duplicates = folayerDataFindDuplicateNameMunicipalityPairs(
            geojson,
            nameCol as string,
            municipalityCol as string
          )

          if (duplicates.length > 0) {
            const duplicateList = duplicates.join(', ')
            const errorMessage = t(
              'sidebar.admin.create.error_name_municipality_not_unique',
              {
                duplicates: duplicateList,
              }
            )
            notify({
              variant: 'error',
              message: errorMessage,
              persist: true,
            })
            console.error(
              'Name and municipality pairs are not unique:',
              duplicateList
            )
            return
          }
        } else if (indexingStrategy === 'id') {
          const duplicates = folayerDataFindDuplicateIds(geojson, idCol as string)

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
              persist: true,
            })
            console.error('IDs are not unique:', duplicateList)
            return
          }
        }

        onFinish({
          name: folayerNameValue,
          colorCode: folayerColorValue,
          isVisible: isVisible,
          indexingStrategy: indexingStrategy,
          idCol: idCol,
          nameCol: nameCol as string,
          municipalityCol: municipalityCol as string,
          regionCol: regionCol,
          descriptionCol: descriptionCol,
          areaCol: areaCol,
        })
      }

      const nameValidation = folayerDataValidateColumnValues(geojson, nameCol)
      const municipalityValidation = folayerDataValidateColumnValues(
        geojson,
        municipalityCol
      )
      const regionValidation = folayerDataValidateColumnValues(geojson, regionCol)

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
          console.error('Invalid strings found:', [...new Set(invalidStrings)])
          const errorMessage = t(
            'sidebar.admin.create.error_invalid_chars_or_encoding'
          )
          notify({
            variant: 'error',
            message: errorMessage,
            persist: true,
          })
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
          })
          return
        }
      }

      performFinish()
    }
  }

  return (
    <Box
      sx={{
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {columns.length > 0 && (
        <>
          <Box
            sx={(theme) => ({
              backgroundColor: theme.palette.neutral.light,
              p: {
                mobile: 2.5,
                desktop: 3,
              },
              borderRadius: '0.3125rem',
              display: 'flex',
              flexDirection: 'column',
              gap: {
                mobile: 2,
                desktop: 2.25,
              },
              minWidth: 0,
            })}
          >
            <DropDownSelectWithLabel
              label={t('sidebar.admin.create.indexing_strategy_label')}
              value={indexingStrategy}
              onChange={handleIndexingStrategyChange}
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
              sx={selectorFieldSx}
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
              sx={selectorFieldSx}
            />
            <FolayerImportCodeRecordSelect
              columns={columns}
              selectedColumn={nameCol}
              onColumnChange={handleNameColChange}
              label={t('sidebar.admin.create.select_folayer_name_record')}
              allowEmpty={true}
              sx={selectorFieldSx}
            />
            <FolayerImportCodeRecordSelect
              columns={columns}
              selectedColumn={municipalityCol}
              onColumnChange={handleMunicipalityColChange}
              label={t(
                'sidebar.admin.create.select_folayer_municipality_record'
              )}
              allowEmpty={true}
              sx={selectorFieldSx}
            />
            <FolayerImportCodeRecordSelect
              columns={columns}
              selectedColumn={regionCol}
              onColumnChange={handleRegionColChange}
              label={t('sidebar.admin.create.select_folayer_region_record')}
              allowEmpty={true}
              sx={selectorFieldSx}
            />
            <FolayerImportCodeRecordSelect
              columns={columns}
              selectedColumn={descriptionCol}
              onColumnChange={handleDescriptionColChange}
              label={t(
                'sidebar.admin.create.select_folayer_description_record'
              )}
              allowEmpty={true}
              sx={selectorFieldSx}
            />
            <FolayerImportCodeRecordSelect
              columns={columns}
              selectedColumn={areaCol}
              onColumnChange={handleAreaColChange}
              label={t('sidebar.admin.create.select_folayer_area_record')}
              allowEmpty={true}
              sx={selectorFieldSx}
            />
          </Box>
          <Box
            sx={{
              mt: {
                mobile: 3,
                desktop: 4,
              },
              display: 'flex',
              flexDirection: 'column',
              gap: {
                mobile: 2.5,
                desktop: 3,
              },
              minWidth: 0,
            }}
          >
            <TextFieldWithHeader
              headerText={t('sidebar.admin.create.name.header')}
              value={folayerNameValue}
              onChange={handleFolayerNameChange}
              placeholderText={t('sidebar.admin.create.name.placeholder')}
              disabled={isInitializing}
            ></TextFieldWithHeader>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: {
                  mobile: 2,
                  desktop: 2.25,
                },
              }}
            >
              <ColorPickerWithPopover
                color={folayerColorValue}
                onChange={handleColorChange}
                sx={{
                  width: 'fit-content',
                  minHeight: '34px',
                  alignItems: 'center',
                }}
                colorBoxSx={{
                  width: 26,
                  height: 26,
                }}
                labelSx={{
                  lineHeight: 1.35,
                }}
                labelText={t('sidebar.admin.folayer.settings.color')}
              ></ColorPickerWithPopover>
              <SwitchWithLabel
                checked={isVisible}
                onChange={handleIsVisibleChange}
                sx={{
                  width: 'fit-content',
                  minHeight: '34px',
                }}
                disabled={isInitializing}
                ariaLabel={t('sidebar.admin.create.is_visible')}
              >
                <TText
                  ns="luonnonmetsakartat"
                  keyName="sidebar.admin.create.is_visible"
                />
              </SwitchWithLabel>
            </Box>
          </Box>
          {/* <TextFieldWithHeader
            headerText={t('sidebar.admin.create.description.header')}
            value={folayerDescriptionValue}
            onChange={handleFolayerDescriptionChange}
            placeholderText={t('sidebar.admin.create.description.placeholder')}
            sx={{ mt: 2.5 }}
          ></TextFieldWithHeader> */}
        </>
      )}
      <FolayerImportActionsRow
        onClickAccept={handleFinish}
        isAcceptDisabled={
          folayerNameValue == null ||
          folayerNameValue.length === 0 ||
          nameCol == null ||
          municipalityCol == null ||
          (indexingStrategy === 'id' && idCol == null) ||
          isInitializing
        }
      ></FolayerImportActionsRow>
    </Box>
  )
}

export default FolayerImportShp
