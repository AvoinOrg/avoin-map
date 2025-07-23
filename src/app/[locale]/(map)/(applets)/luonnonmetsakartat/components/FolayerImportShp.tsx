import { useState, useEffect } from 'react'
import { Feature, FeatureCollection } from 'geojson'
import { useTranslate, T } from '@tolgee/react'
import { SelectChangeEvent, Box, Typography } from '@mui/material'

import TextFieldWithHeader from '#/components/common/TextFieldWithHeader'
import CheckBoxWithText from '#/components/common/CheckBoxWithText'
import DropDownSelect from '#/components/common/DropDownSelect'
import ColorPickerWithPopover from '#/components/common/ColorPickerWithPopover'
import { useUIStore } from '#/common/store'

import FolayerImportActionsRow from './FolayerImportActionsRow'
import FolayerImportCodeRecordSelect from './FolayerImportCodeRecordSelect'
import { IndexingStrategy } from '../common/types'

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

const FolayerImportShp = ({
  fileBuffers,
  onFinish,
  isInitializing,
}: FolayerImportShpProps) => {
  const { t } = useTranslate('luonnonmetsakartat')
  const notify = useUIStore((state) => state.notify)
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

      const findBestColumnMatch = (
        cols: string[],
        candidates: string[],
        allowPartial: boolean = false
      ): string | undefined => {
        const lowerCaseColumns = cols.map((c) => ({
          original: c,
          lower: c.toLowerCase(),
        }))

        // Prioritize exact matches
        for (const candidate of candidates) {
          const found = lowerCaseColumns.find(
            (c) => c.lower === candidate.toLowerCase()
          )
          if (found) {
            return found.original
          }
        }

        // If no exact match, and partial is allowed, try partial
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

      const idCandidates = ['id', 'fid', 'oid', 'objectid', 'tunnus']
      const nameCandidates = ['name', 'nimi']
      const descriptionCandidates = ['description', 'desc', 'kuvaus']
      const areaCandidates = ['ala', 'area', 'pinta'] // Partial matches will catch variations
      const municipalityCandidates = ['municipality', 'kunta']
      const regionCandidates = ['region', 'maakunta']

      setIdCol(findBestColumnMatch(columns, idCandidates))
      setNameCol(findBestColumnMatch(columns, nameCandidates))
      setDescriptionCol(findBestColumnMatch(columns, descriptionCandidates))
      setAreaCol(findBestColumnMatch(columns, areaCandidates, true))
      setMunicipalityCol(findBestColumnMatch(columns, municipalityCandidates))
      setRegionCol(findBestColumnMatch(columns, regionCandidates))
    }
  }, [geojson])

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

  const handleIndexingStrategyChange = (event: SelectChangeEvent) => {
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
    _e: React.SyntheticEvent<Element, Event>,
    checked: boolean
  ) => {
    setIsVisible(checked)
  }

  const handleColorChange = (color: string) => {
    setFolayerColorValue(color)
  }

  const handleFinish = () => {
    if (folayerNameValue != null && geojson != null) {
      if (indexingStrategy === 'name_municipality') {
        const nameMunicipalityPairs = new Set<string>()
        for (const feature of geojson.features) {
          const name = feature.properties?.[nameCol as string]
          const municipality = feature.properties?.[municipalityCol as string]
          if (name && municipality) {
            const pair = `${name}|${municipality}`
            if (nameMunicipalityPairs.has(pair)) {
              const errorMessage = t(
                'sidebar.admin.create.error_name_municipality_not_unique',
                {
                  nameCol: nameCol,
                  municipalityCol: municipalityCol,
                  name: name,
                  municipality: municipality,
                }
              )
              notify({
                variant: 'error',
                message: errorMessage,
                manualDismiss: true,
              })
              console.error('Name and municipality pair is not unique:', pair)

              return
            }
            nameMunicipalityPairs.add(pair)
          }
        }
      } else if (indexingStrategy === 'id') {
        const idSet = new Set<string | number>()
        for (const feature of geojson.features) {
          const id = feature.properties?.[idCol as string]

          if (idSet.has(id)) {
            const errorMessage = t('sidebar.admin.create.error_id_not_unique', {
              id: id,
            })
            notify({
              variant: 'error',
              message: errorMessage,
              manualDismiss: true,
            })
            console.error('ID is not unique:', id)
            return
          }
          idSet.add(id)
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
          <TextFieldWithHeader
            headerText={t('sidebar.admin.create.name.header')}
            value={folayerNameValue}
            onChange={handleFolayerNameChange}
            placeholderText={t('sidebar.admin.create.name.placeholder')}
            disabled={isInitializing}
            sx={{ mt: 7 }}
          ></TextFieldWithHeader>
          <ColorPickerWithPopover
            color={folayerColorValue}
            onChange={handleColorChange}
            sx={{ mt: 5 }}
            labelText={t('sidebar.admin.folayer.settings.color')}
          ></ColorPickerWithPopover>
          <CheckBoxWithText
            checked={isVisible}
            onChange={handleIsVisibleChange}
            sx={{ mt: 4.5 }}
            disabled={isInitializing}
          >
            <T
              ns={'luonnonmetsakartat'}
              keyName={'sidebar.admin.create.is_visible'}
            ></T>
          </CheckBoxWithText>
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
    </>
  )
}

export default FolayerImportShp
