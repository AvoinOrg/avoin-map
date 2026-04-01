'use client'

import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import {
  Box,
  ButtonBase,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { FeatureCollection } from 'geojson'
import { T } from '@tolgee/react'
import { useParams } from 'next/navigation'

import { SidebarContentBox } from '#/components/Sidebar'
import SidebarBackgroundContent from '#/components/common/SidebarBackgroundContent'
import FlowNodeContainer from '#/components/common/FlowNodeContainer'
import FlowNode from '#/components/common/FlowNode'
import Upload from '#/components/icons/Upload'
import CheckcircleChecked from '#/components/icons/CheckcircleChecked'
import QuestionCircleOutline from '#/components/icons/QuestionCircleOutline'
import { useMapStore } from '#/common/store'

import {
  FileType,
  PlanData,
  ZONING_CODE_COL,
} from '#/app/[locale]/(map)/(applets)/hiilikartta/common/types'
import { useAppletStore } from '#/app/[locale]/(map)/(applets)/hiilikartta/state/appletStore'
import {
  formatImportedGeojson,
  getImportedPlanAreaHa,
} from '#/app/[locale]/(map)/(applets)/hiilikartta/common/planImport'
import { getZoningClasses } from '#/app/[locale]/(map)/(applets)/hiilikartta/common/zoningClasses'
import {
  createLayerConf,
  getPlanLayerGroupId,
} from '#/app/[locale]/(map)/(applets)/hiilikartta/common/utils'
import PlanImportGpkg from './_components/PlanImportGpkg'
import PlanImportShp from './_components/PlanImportShp'

const EMPTY_PLAN_DATA: PlanData = {
  type: 'FeatureCollection',
  features: [],
}

const IMPORT_COPY = {
  fi: {
    emptyDescription:
      'Voit ladata kaavatiedoston jossa on valmiiksi määritelty koordinaattijärjestelmä ja käyttötarkoitusluokat alueille. Tai voit piirtää alueen kartalle suoraan ja aluetarkoituksen määrityksen mukaan lasketa hiilivaikutukset.',
    uploadedDescription:
      'Voit ladata kaavatiedoston jossa on valmiiksi määritelty koordinaattijärjestelmä ja käyttötarkoitusluokat alueille.',
    uploadLabel: 'Tuo oma kaavatiedosto',
    selectFile: 'Valitse tiedosto',
    planNameLabel: 'Kaavan nimi',
    changeFile: 'vaihda tiedosto',
    zoningClassesLabel: 'Käyttötarkoitusluokat',
    zoningClassesPlaceholder: 'Tietue joka sisältää aluekoodit',
    areaNamesLabel: 'Alue nimitykset',
    areaNamesPlaceholder: 'Tietue joka sisältää alueiden nimet',
    tableLabel: 'Tietokantataulu',
    tablePlaceholder: 'Valitse tietokantataulu',
    reviewZoningClasses: 'Tarkista käyttötarkoitusluokat',
    calculateReport: 'Laske hiiliraportti',
  },
  en: {
    emptyDescription:
      'You can upload a plan file with a defined coordinate system and land-use classes for each area. You can also draw the area directly on the map and calculate the carbon impacts from the selected land-use definitions.',
    uploadedDescription:
      'You can upload a plan file with a defined coordinate system and land-use classes for each area.',
    uploadLabel: 'Import your own plan file',
    selectFile: 'Select file',
    planNameLabel: 'Plan name',
    changeFile: 'change file',
    zoningClassesLabel: 'Land-use classes',
    zoningClassesPlaceholder: 'Record containing area codes',
    areaNamesLabel: 'Area names',
    areaNamesPlaceholder: 'Record containing area names',
    tableLabel: 'Database table',
    tablePlaceholder: 'Select a database table',
    reviewZoningClasses: 'Review land-use classes',
    calculateReport: 'Calculate carbon report',
  },
} as const

type ResolvedImport = {
  importKey: string
  json: FeatureCollection
  zoningColName: string
  nameColName?: string
}

type ImportCopy = {
  emptyDescription: string
  uploadedDescription: string
  uploadLabel: string
  selectFile: string
  planNameLabel: string
  changeFile: string
  zoningClassesLabel: string
  zoningClassesPlaceholder: string
  areaNamesLabel: string
  areaNamesPlaceholder: string
  tableLabel: string
  tablePlaceholder: string
  reviewZoningClasses: string
  calculateReport: string
}

const getFileType = (fileName: string): FileType | undefined => {
  const extension = fileName.split('.').pop()?.toLowerCase()

  if (extension === 'gpkg') {
    return 'gpkg'
  }

  if (extension === 'zip') {
    return 'shp'
  }

  return undefined
}

const getPlanNameFromFileName = (fileName: string) =>
  fileName.replace(/\.[^/.]+$/, '')

const UploadField = ({
  placeholder,
  onClick,
}: {
  placeholder: string
  onClick: () => void
}) => {
  return (
    <ButtonBase
      type="button"
      aria-label="Select plan file to import"
      onClick={onClick}
      sx={{
        width: '100%',
        minHeight: '1.25rem',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '0.75rem',
        px: '1rem',
        py: '0.1875rem',
        borderRadius: '0.625rem',
        border: '0.5px solid #d6d6d6',
        backgroundColor: '#ffffff',
        boxShadow: 'inset 0px 0.5px 1px 0px #d9d9d9',
        textAlign: 'left',
      }}
    >
      <Typography
        sx={{
          fontSize: '0.6875rem',
          fontWeight: 400,
          lineHeight: 'normal',
          letterSpacing: '0.04em',
          color: '#a0a0a0',
        }}
      >
        {placeholder}
      </Typography>

      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.625rem',
          flexShrink: 0,
        }}
      >
        <Upload sx={{ width: 9, height: 10, color: '#474747' }} />
        <CheckcircleChecked
          fillColor="rgba(160, 160, 160, 0.08)"
          sx={{
            width: 12,
            height: 12,
            color: '#b6b6b6',
          }}
        />
      </Box>
    </ButtonBase>
  )
}

const InfoButton = ({ tooltip }: { tooltip: string }) => {
  return (
    <Tooltip title={tooltip} arrow placement="top">
      <IconButton
        size="small"
        aria-label="Show import instructions"
        sx={{
          p: 0,
          color: '#7b8670',
        }}
      >
        <QuestionCircleOutline sx={{ width: 16, height: 16 }} />
      </IconButton>
    </Tooltip>
  )
}

const UploadedPlanSummary = ({
  copy,
  fileName,
  planName,
  onPlanNameChange,
  onOpenFilePicker,
}: {
  copy: ImportCopy
  fileName: string
  planName: string
  onPlanNameChange: (value: string) => void
  onOpenFilePicker: () => void
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.625rem',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.3125rem',
        }}
      >
        <Typography
          sx={{
            fontSize: '0.625rem',
            fontWeight: 400,
            lineHeight: '0.8125rem',
            letterSpacing: '0.11em',
            color: '#111111',
          }}
        >
          {copy.planNameLabel}
        </Typography>

        <TextField
          value={planName}
          onChange={(event) => onPlanNameChange(event.target.value)}
          aria-label={copy.planNameLabel}
          variant="outlined"
          size="small"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end" sx={{ mr: 0 }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                  }}
                >
                  <Upload sx={{ width: 9, height: 10, color: '#474747' }} />
                  <CheckcircleChecked
                    fillColor="rgba(44, 142, 116, 0.14)"
                    sx={{
                      width: 12,
                      height: 12,
                      color: '#2C8E74',
                    }}
                  />
                </Box>
              </InputAdornment>
            ),
          }}
          sx={{
            width: '100%',
            '& .MuiOutlinedInput-root': {
              minHeight: '1.25rem',
              borderRadius: '0.625rem',
              backgroundColor: '#ffffff',
              boxShadow: 'inset 0px 0.5px 1px 0px #d9d9d9',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#d6d6d6',
            },
            '& .MuiInputBase-input': {
              py: '0.1875rem',
              px: '1rem',
              fontSize: '0.6875rem',
              fontWeight: 700,
              lineHeight: 'normal',
              letterSpacing: '0.05em',
              color: '#111111',
            },
          }}
        />
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          columnGap: '1rem',
          rowGap: '0.375rem',
        }}
      >
        <Typography
          sx={{
            fontSize: '0.625rem',
            fontWeight: 400,
            lineHeight: 'normal',
            letterSpacing: '0.1em',
            color: '#274AFF',
          }}
        >
          {fileName}
        </Typography>

        <Typography
          component="button"
          type="button"
          aria-label="Choose another import file"
          onClick={onOpenFilePicker}
          sx={{
            border: 'none',
            background: 'none',
            p: 0,
            fontSize: '0.5rem',
            fontWeight: 400,
            lineHeight: 'normal',
            letterSpacing: '0.1em',
            color: '#111111',
            cursor: 'pointer',
          }}
        >
          {copy.changeFile}
        </Typography>
      </Box>
    </Box>
  )
}

const Page = () => {
  const { locale } = useParams<{ locale: string }>()
  const copy = useMemo<ImportCopy>(
    () => (locale === 'en' ? IMPORT_COPY.en : IMPORT_COPY.fi),
    [locale]
  )

  const inputRef = useRef<HTMLInputElement>(null)
  const shouldDeleteDraftOnUnmountRef = useRef(true)
  const isApplyingImportRef = useRef(false)
  const lastResolvedImportKeyRef = useRef<string>()

  const [draftPlanId, setDraftPlanId] = useState<string>()
  const [fileType, setFileType] = useState<FileType>()
  const [fileName, setFileName] = useState<string>()
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer>()
  const [planName, setPlanName] = useState('')

  const addPlanConf = useAppletStore((state) => state.addPlanConf)
  const updatePlanConf = useAppletStore((state) => state.updatePlanConf)
  const deletePlanConf = useAppletStore((state) => state.deletePlanConf)

  const addSerializableLayerGroup = useMapStore(
    (state) => state.addSerializableLayerGroup
  )
  const enableSerializableLayerGroup = useMapStore(
    (state) => state.enableSerializableLayerGroup
  )
  const updateSourceData = useMapStore((state) => state.updateSourceData)

  const hasSelectedFile = fileName != null && arrayBuffer != null && fileType != null

  useEffect(() => {
    return () => {
      if (shouldDeleteDraftOnUnmountRef.current && draftPlanId) {
        deletePlanConf(draftPlanId)
      }
    }
  }, [deletePlanConf, draftPlanId])

  useEffect(() => {
    if (draftPlanId == null) {
      return
    }

    const nextPlanName = planName.trim()

    if (!nextPlanName) {
      return
    }

    updatePlanConf(draftPlanId, { name: nextPlanName }).catch((error) => {
      console.error('Failed to update imported plan name', error)
    })
  }, [draftPlanId, planName, updatePlanConf])

  const openFilePicker = () => {
    inputRef.current?.click()
  }

  const handleFileInput = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) {
      return
    }

    const selectedFile = event.target.files[0]
    const selectedFileType = getFileType(selectedFile.name)

    if (draftPlanId) {
      await deletePlanConf(draftPlanId)
      setDraftPlanId(undefined)
    }

    shouldDeleteDraftOnUnmountRef.current = true
    lastResolvedImportKeyRef.current = undefined
    setFileName(undefined)
    setArrayBuffer(undefined)
    setFileType(undefined)
    setPlanName('')

    const reader = new window.FileReader()
    reader.readAsArrayBuffer(selectedFile)

    reader.onloadend = () => {
      if (reader.result == null || typeof reader.result === 'string') {
        console.error('reader.result is not an ArrayBuffer')
        return
      }

      setFileName(selectedFile.name)
      setPlanName(getPlanNameFromFileName(selectedFile.name))
      setArrayBuffer(reader.result)
      setFileType(selectedFileType)
    }

    event.target.value = ''
  }

  const ensureDraftPlan = async (nextPlanName: string) => {
    if (draftPlanId) {
      return draftPlanId
    }

    const planConf = await addPlanConf({
      data: EMPTY_PLAN_DATA,
      name: nextPlanName,
      areaHa: 0,
      draftType: 'import',
    })

    await updatePlanConf(planConf.id, {
      isHidden: true,
      draftType: 'import',
    })

    setDraftPlanId(planConf.id)

    return planConf.id
  }

  const handleResolveImport = async ({
    importKey,
    json,
    zoningColName,
    nameColName,
  }: ResolvedImport) => {
    if (
      fileName == null ||
      lastResolvedImportKeyRef.current === importKey ||
      isApplyingImportRef.current
    ) {
      return
    }

    isApplyingImportRef.current = true

    try {
      const zoningClasses = await getZoningClasses().catch((error) => {
        console.error('Failed to load zoning classes', error)
        return []
      })

      const formattedJson = formatImportedGeojson({
        json,
        zoningColName,
        nameColName,
        zoningClasses,
      })
      const nextPlanName = planName.trim() || getPlanNameFromFileName(fileName)
      const areaHa = getImportedPlanAreaHa(formattedJson)
      const nextDraftPlanId = await ensureDraftPlan(nextPlanName)

      await updatePlanConf(nextDraftPlanId, {
        data: formattedJson as PlanData,
        name: nextPlanName,
        areaHa,
        draftType: undefined,
        isHidden: false,
      })

      const layerConf = await createLayerConf(
        formattedJson,
        nextDraftPlanId,
        ZONING_CODE_COL
      )
      const layerGroupId = getPlanLayerGroupId(nextDraftPlanId)
      const doesLayerGroupExist =
        useMapStore.getState()._layerGroups[layerGroupId] != null

      if (doesLayerGroupExist) {
        await enableSerializableLayerGroup(layerGroupId, {
          layerConf,
          persist: false,
          zoomToExtent: true,
        })
        updateSourceData(layerGroupId, formattedJson)
      } else {
        await addSerializableLayerGroup(layerGroupId, {
          layerConf,
          persist: false,
          zoomToExtent: true,
        })
      }

      shouldDeleteDraftOnUnmountRef.current = false
      lastResolvedImportKeyRef.current = importKey
    } catch (error) {
      console.error('Failed to apply imported plan', error)
    } finally {
      isApplyingImportRef.current = false
    }
  }

  return (
    <SidebarContentBox
      scrollFadeColor="#ffffff"
      sxInner={{
        pt: 0,
        gap: { mobile: '1.5rem', desktop: '1.5rem' },
        px: { mobile: '1rem', desktop: '1.875rem' },
        pb: { mobile: '1.25rem', desktop: '1.5rem' },
        backgroundColor: '#ffffff',
      }}
    >
      <SidebarBackgroundContent
        imageSrc="/files/img/hiilikartta/sidebar/kaavat-hero.png"
        imageAlt="Hiilikartta kaavat"
        title={<T keyName="sidebar.kaavat.title" ns="hiilikartta" />}
        sx={{
          width: '100%',
          maxWidth: '20rem',
        }}
        imageSx={{
          height: '5.625rem',
          objectPosition: 'center 35%',
        }}
        contentSx={{
          px: { mobile: '1.75rem', desktop: '2.125rem' },
          pt: { mobile: '2rem', desktop: '2.25rem' },
          pb: { mobile: '1.75rem', desktop: '2rem' },
          gap: '1.25rem',
        }}
      >
        <FlowNodeContainer>
          <Typography
            sx={{
              maxWidth: '23ch',
              fontSize: '0.625rem',
              fontWeight: 400,
              lineHeight: '1.125rem',
              letterSpacing: '0.05em',
              color: '#111111',
            }}
          >
            {hasSelectedFile ? copy.uploadedDescription : copy.emptyDescription}
          </Typography>

          <FlowNode
            state="active"
            title={copy.uploadLabel}
            leading={<Upload sx={{ width: 12, height: 14 }} />}
            trailing={<InfoButton tooltip={copy.emptyDescription} />}
            bodySx={{
              gap: '1.125rem',
            }}
          >
            {!hasSelectedFile && (
              <UploadField
                placeholder={copy.selectFile}
                onClick={openFilePicker}
              />
            )}

            {hasSelectedFile && fileName && (
              <UploadedPlanSummary
                copy={copy}
                fileName={fileName}
                planName={planName}
                onPlanNameChange={setPlanName}
                onOpenFilePicker={openFilePicker}
              />
            )}

            {fileType === 'gpkg' && arrayBuffer && (
              <PlanImportGpkg
                fileBuffer={arrayBuffer}
                copy={copy}
                onResolveImport={handleResolveImport}
              />
            )}

            {fileType === 'shp' && arrayBuffer && (
              <PlanImportShp
                fileBuffer={arrayBuffer}
                copy={copy}
                onResolveImport={handleResolveImport}
              />
            )}
          </FlowNode>

          <FlowNode state="disabled" title={copy.reviewZoningClasses} />
          <FlowNode state="disabled" title={copy.calculateReport} />
        </FlowNodeContainer>

        <input
          hidden
          ref={inputRef}
          accept=".zip,.gpkg"
          multiple={false}
          type="file"
          onChange={handleFileInput}
        />
      </SidebarBackgroundContent>
    </SidebarContentBox>
  )
}

export default Page
