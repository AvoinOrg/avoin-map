'use client'

import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import {
  Box,
  ButtonBase,
  CircularProgress,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { T, useTranslate } from '@tolgee/react'
import { useMutation } from '@tanstack/react-query'
import FolderCopyOutlinedIcon from '@mui/icons-material/FolderCopyOutlined'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'

import { SidebarContentBox } from '#/components/Sidebar'
import SidebarBackgroundContent from '#/components/common/SidebarBackgroundContent'
import FlowNodeContainer from '#/components/common/FlowNodeContainer'
import DropDownSelectWithHeader from '#/components/common/DropDownSelectWithHeader'
import IconTextButton from '#/components/common/IconTextButton'
import NodeFlowAccordion from '#/components/common/NodeFlowAccordion'
import NodeFlowButton, {
  NodeFlowButtonState,
} from '#/components/common/NodeFlowButton'
import { LoadingSpinner } from '#/components/Loading'
import CheckcircleChecked from '#/components/icons/CheckcircleChecked'
import {
  Delete,
  Eco,
  Error as ErrorIcon,
  Login,
  QuestionCircleOutline,
  Upload,
} from '#/components/icons'
import { getRoute } from '#/common/routing/routing-client'
import { openLoginWindow } from '#/common/utils/auth'
import { useUIStore } from '#/common/store'

import {
  DEFAULT_FORESTRY_SCENARIO,
  FORESTRY_SCENARIOS,
} from '#/app/[locale]/(map)/(applets)/hiilikartta/common/constants'
import {
  CalculationState,
  FileType,
  GlobalState,
  NewPlanConf,
  PlanData,
} from '#/app/[locale]/(map)/(applets)/hiilikartta/common/types'
import {
  deleteCreationImportFile,
  getCreationImportFile,
  getCreationImportFileStorageKey,
  putCreationImportFile,
} from '#/app/[locale]/(map)/(applets)/hiilikartta/common/creationImportFileStorage'
import {
  formatImportedGeojson,
  getImportedPlanAreaHa,
} from '#/app/[locale]/(map)/(applets)/hiilikartta/common/planImport'
import { getZoningClasses } from '#/app/[locale]/(map)/(applets)/hiilikartta/common/zoningClasses'
import { routeTree } from '#/common/routing/routes/hiilikartta'
import { planDeleteMutation } from '#/app/[locale]/(map)/(applets)/hiilikartta/common/queries/planDeleteMutation'
import { planPostMutation } from '#/app/[locale]/(map)/(applets)/hiilikartta/common/queries/planPostMutation'
import { useAppletStore } from '#/app/[locale]/(map)/(applets)/hiilikartta/state/appletStore'
import PlanImportGpkg from '../tuo/_components/PlanImportGpkg'
import PlanImportShp from '../tuo/_components/PlanImportShp'
import PlanImportActionsRow from '#/app/[locale]/(map)/(applets)/hiilikartta/(pages)/luo/tuo/_components/PlanImportActionsRow'
import { PendingPlanImport } from '../tuo/_components/planImportTypes'

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

const StatusIndicator = () => (
  <CheckcircleChecked
    fillColor="rgba(44, 142, 116, 0.14)"
    sx={{
      width: 12,
      height: 12,
      color: '#2C8E74',
      flexShrink: 0,
    }}
  />
)

const StatusFieldRow = ({
  children,
  isSuccess = false,
}: {
  children: React.ReactNode
  isSuccess?: boolean
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        width: '100%',
      }}
    >
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
        }}
      >
        {children}
      </Box>
      {isSuccess && <StatusIndicator />}
    </Box>
  )
}

const FieldLabel = ({ children }: { children: React.ReactNode }) => {
  return (
    <Typography
      sx={{
        fontSize: '0.625rem',
        fontWeight: 400,
        lineHeight: '0.8125rem',
        letterSpacing: '0.11em',
        color: '#111111',
        mb: '0.3125rem',
      }}
    >
      {children}
    </Typography>
  )
}

const InfoButton = ({ tooltip }: { tooltip: React.ReactNode }) => {
  return (
    <Tooltip title={tooltip} arrow placement="top">
      <ButtonBase
        aria-label="Show import instructions"
        sx={{
          width: '1rem',
          height: '1rem',
          minWidth: '1rem',
          color: '#7b8670',
          borderRadius: '999px',
        }}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
        }}
        disableRipple
      >
        <QuestionCircleOutline sx={{ width: 16, height: 16 }} />
      </ButtonBase>
    </Tooltip>
  )
}

const UploadField = ({
  label,
  isSelected,
  onClick,
}: {
  label: React.ReactNode
  isSelected: boolean
  onClick: () => void
}) => {
  return (
    <StatusFieldRow isSuccess={isSelected}>
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
            color: isSelected ? '#274AFF' : '#a0a0a0',
            wordBreak: 'break-word',
          }}
        >
          {label}
        </Typography>

        <Upload
          sx={{
            width: 9,
            height: 10,
            color: '#474747',
            flexShrink: 0,
          }}
        />
      </ButtonBase>
    </StatusFieldRow>
  )
}

const FlowStepLeadingIcon = () => (
  <CheckcircleChecked
    fillColor="rgba(44, 142, 116, 0.14)"
    sx={{
      width: 12,
      height: 12,
      color: '#0D6044',
      flexShrink: 0,
    }}
  />
)

const getCalculationStepVisualState = (
  calculationState: CalculationState | undefined,
  hasReportData: boolean
): NodeFlowButtonState => {
  if (hasReportData || calculationState === CalculationState.FINISHED) {
    return 'complete'
  }

  if (
    calculationState === CalculationState.INITIALIZING ||
    calculationState === CalculationState.CALCULATING
  ) {
    return 'active'
  }

  if (calculationState === CalculationState.ERRORED) {
    return 'error'
  }

  return 'disabled'
}

const Page = () => {
  const params = useParams<{ locale: string; planId: string }>()
  const planId = params.planId
  const locale = params.locale
  const { t } = useTranslate('hiilikartta')
  const router = useRouter()
  const { status } = useSession()
  const inputRef = useRef<HTMLInputElement>(null)
  const hasAttemptedAutoOpenRef = useRef(false)

  const planConf = useAppletStore((state) => state.planConfs[planId])
  const creationPlaceholderPlanConf = useAppletStore(
    (state) => state.creationPlaceholderPlanConfs[planId]
  )
  const globalState = useAppletStore((state) => state.globalState)
  const placeholderPlanConfs = useAppletStore(
    (state) => state.placeholderPlanConfs
  )
  const addPlanConf = useAppletStore((state) => state.addPlanConf)
  const updatePlanConf = useAppletStore((state) => state.updatePlanConf)
  const updateCreationPlaceholderPlanConf = useAppletStore(
    (state) => state.updateCreationPlaceholderPlanConf
  )
  const deleteCreationPlaceholderPlanConf = useAppletStore(
    (state) => state.deleteCreationPlaceholderPlanConf
  )
  const triggerConfirmationDialog = useUIStore(
    (state) => state.triggerConfirmationDialog
  )
  const notify = useUIStore((state) => state.notify)

  const planDelete = useMutation(planDeleteMutation())
  const planPost = useMutation(planPostMutation())

  const [fileType, setFileType] = useState<FileType>()
  const [fileName, setFileName] = useState<string>()
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer>()
  const [pendingImport, setPendingImport] = useState<PendingPlanImport | null>(
    null
  )

  const isSettingsMode = planConf != null

  const calculationStepState = getCalculationStepVisualState(
    planConf?.calculationState,
    planConf?.reportData != null
  )

  const calculationStepHelper = (() => {
    if (planConf == null) {
      return undefined
    }

    switch (planConf.calculationState) {
      case CalculationState.INITIALIZING:
        return t('sidebar.my_plans.calculations_starting')
      case CalculationState.CALCULATING:
        return t('sidebar.my_plans.calculations_in_progress')
      case CalculationState.ERRORED:
        return t('sidebar.my_plans.calculations_errored')
      default:
        return undefined
    }
  })()

  const calculationStepHelperLeading = (() => {
    if (
      planConf?.calculationState === CalculationState.INITIALIZING ||
      planConf?.calculationState === CalculationState.CALCULATING
    ) {
      return (
        <CircularProgress
          size={12}
          thickness={7}
          sx={{ color: '#274AFF', flexShrink: 0 }}
        />
      )
    }

    if (planConf?.calculationState === CalculationState.ERRORED) {
      return (
        <ErrorIcon
          sx={{
            width: 12,
            height: 12,
            color: '#7A3D2B',
            flexShrink: 0,
          }}
        />
      )
    }

    return undefined
  })()

  useEffect(() => {
    if (planConf != null || creationPlaceholderPlanConf != null) {
      return
    }

    if (
      globalState === GlobalState.FETCHING &&
      !Object.keys(placeholderPlanConfs).includes(planId)
    ) {
      router.push(getRoute({ routeNode: routeTree.plans, routeTree }))
      return
    }

    if (globalState === GlobalState.IDLE) {
      router.push(getRoute({ routeNode: routeTree.plans, routeTree }))
    }
  }, [
    creationPlaceholderPlanConf,
    globalState,
    placeholderPlanConfs,
    planConf,
    planId,
    router,
  ])

  useEffect(() => {
    hasAttemptedAutoOpenRef.current = false
  }, [planId])

  useEffect(() => {
    if (
      creationPlaceholderPlanConf?.status !== 'awaiting-file' ||
      creationPlaceholderPlanConf.file != null ||
      hasAttemptedAutoOpenRef.current
    ) {
      return
    }

    hasAttemptedAutoOpenRef.current = true

    window.requestAnimationFrame(() => {
      inputRef.current?.click()
    })
  }, [creationPlaceholderPlanConf?.file, creationPlaceholderPlanConf?.status])

  useEffect(() => {
    if (creationPlaceholderPlanConf?.file?.storageKey == null) {
      setPendingImport(null)
      setFileName(undefined)
      setArrayBuffer(undefined)
      setFileType(undefined)
      return
    }

    let isMounted = true
    const creationPlaceholderFile = creationPlaceholderPlanConf.file

    const loadCreationImportFile = async () => {
      try {
        const storedFile = await getCreationImportFile(
          creationPlaceholderFile.storageKey
        )

        if (!isMounted) {
          return
        }

        if (storedFile == null) {
          setPendingImport(null)
          setFileName(undefined)
          setArrayBuffer(undefined)
          setFileType(undefined)

          await updateCreationPlaceholderPlanConf(creationPlaceholderPlanConf.id, {
            status: 'awaiting-file',
            file: undefined,
            selectedTable: undefined,
            selectedZoningCol: undefined,
            selectedNameCol: undefined,
          })
          return
        }

        setPendingImport(null)
        setFileName(creationPlaceholderFile.fileName)
        setArrayBuffer(storedFile.buffer)
        setFileType(
          creationPlaceholderFile.fileType ??
            storedFile.fileType ??
            getFileType(storedFile.fileName)
        )
      } catch (error) {
        console.error('Failed to load stored import file', error)
      }
    }

    loadCreationImportFile()

    return () => {
      isMounted = false
    }
  }, [
    creationPlaceholderPlanConf?.file?.fileName,
    creationPlaceholderPlanConf?.file?.fileType,
    creationPlaceholderPlanConf?.file?.storageKey,
    creationPlaceholderPlanConf?.id,
    updateCreationPlaceholderPlanConf,
  ])

  useEffect(() => {
    if (planDelete.isSuccess) {
      router.push(getRoute({ routeNode: routeTree.plans, routeTree }))
    }

    if (planDelete.isError) {
      notify({
        message: t('sidebar.plan_settings.delete_error'),
        variant: 'error',
      })
    }
  }, [notify, planDelete.isError, planDelete.isSuccess, router, t])

  const scenarioOptions = useMemo(
    () =>
      FORESTRY_SCENARIOS.map((scenario) => ({
        value: String(scenario.id),
        label: t(`sidebar.plan_flow.forestry_scenario_options.${scenario.code}`),
      })),
    [t]
  )

  const cloudActionLabel = useMemo(() => {
    if (status !== 'authenticated') {
      return t('sidebar.plan_flow.cloud_login')
    }

    if (planPost.isPending) {
      return t('sidebar.plan_settings.saving_plan')
    }

    return t('sidebar.plan_flow.cloud_save')
  }, [planPost.isPending, status, t])

  const isCloudSaveEnabled = Boolean(
    planConf &&
      status === 'authenticated' &&
      !planPost.isPending &&
      ![
        CalculationState.INITIALIZING,
        CalculationState.CALCULATING,
      ].includes(planConf.calculationState) &&
      planConf.data.features.length > 0
  )

  const handleFileInput = async (event: ChangeEvent<HTMLInputElement>) => {
    if (
      !event.target.files?.length ||
      creationPlaceholderPlanConf == null
    ) {
      return
    }

    const selectedFile = event.target.files[0]
    const selectedFileType = getFileType(selectedFile.name)
    const storageKey =
      creationPlaceholderPlanConf.file?.storageKey ??
      getCreationImportFileStorageKey(creationPlaceholderPlanConf.id)

    setPendingImport(null)
    setFileName(undefined)
    setArrayBuffer(undefined)
    setFileType(undefined)

    try {
      const storedFile = await putCreationImportFile({
        storageKey,
        file: selectedFile,
        fileType: selectedFileType,
      })

      await updateCreationPlaceholderPlanConf(creationPlaceholderPlanConf.id, {
        status: 'awaiting-confirm',
        file: {
          storageKey,
          fileName: storedFile.fileName,
          fileType: storedFile.fileType,
          size: storedFile.size,
        },
        selectedTable: undefined,
        selectedZoningCol: undefined,
        selectedNameCol: undefined,
      })

      setFileName(storedFile.fileName)
      setArrayBuffer(storedFile.buffer)
      setFileType(storedFile.fileType ?? selectedFileType)
    } catch (error) {
      console.error('Failed to persist selected import file', error)
    }

    event.target.value = ''
  }

  const handleConfirmImport = async () => {
    if (
      creationPlaceholderPlanConf == null ||
      pendingImport == null ||
      fileName == null
    ) {
      return
    }

    try {
      const zoningClasses = await getZoningClasses().catch((error) => {
        console.error('Failed to load zoning classes', error)
        return []
      })

      const formattedJson = formatImportedGeojson({
        json: pendingImport.json,
        zoningColName: pendingImport.zoningColName,
        nameColName: pendingImport.nameColName,
        zoningClasses,
      })
      const nextPlanName =
        creationPlaceholderPlanConf.name?.trim() ||
        getPlanNameFromFileName(fileName) ||
        t('sidebar.my_plans.imported_plan_name')
      const areaHa = getImportedPlanAreaHa(formattedJson)
      const newPlanConf: NewPlanConf & { id: string; created: number } = {
        id: creationPlaceholderPlanConf.id,
        created: creationPlaceholderPlanConf.created,
        data: formattedJson as PlanData,
        name: nextPlanName,
        areaHa,
      }

      await addPlanConf(newPlanConf)

      await deleteCreationPlaceholderPlanConf(creationPlaceholderPlanConf.id)

      if (creationPlaceholderPlanConf.file?.storageKey != null) {
        await deleteCreationImportFile(creationPlaceholderPlanConf.file.storageKey)
      }

      setArrayBuffer(undefined)
      setFileName(undefined)
      setFileType(undefined)
      setPendingImport(null)
    } catch (error) {
      console.error('Failed to apply imported plan', error)
    }
  }

  const handleDeleteClick = () => {
    if (planConf == null && creationPlaceholderPlanConf == null) {
      return
    }

    const handleDeleteConfirm = async () => {
      if (creationPlaceholderPlanConf != null) {
        if (creationPlaceholderPlanConf.file?.storageKey != null) {
          await deleteCreationImportFile(
            creationPlaceholderPlanConf.file.storageKey
          )
        }

        await deleteCreationPlaceholderPlanConf(creationPlaceholderPlanConf.id)
        setPendingImport(null)
        setArrayBuffer(undefined)
        setFileName(undefined)
        setFileType(undefined)
        router.push(getRoute({ routeNode: routeTree.plans, routeTree }))
        return
      }

      if (planConf != null) {
        await planDelete.mutate(planConf)
      }
    }

    triggerConfirmationDialog({
      content: t('sidebar.plan_settings.delete_confirmation_message'),
      onConfirm: handleDeleteConfirm,
    })
  }

  const handleCopyClick = async () => {
    if (planConf == null) {
      return
    }

    const copiedPlanConf = await useAppletStore.getState().copyPlanConf(
      planConf.id,
      t('sidebar.plan_settings.copy_suffix')
    )

    router.push(
      getRoute({
        routeNode: routeTree.plans.plan,
        routeTree,
        params: {
          routeParams: { planId: copiedPlanConf.id },
        },
      })
    )
  }

  const handleOpenAreas = () => {
    if (planConf == null) {
      return
    }

    router.push(
      getRoute({
        routeNode: routeTree.plans.plan.areas,
        routeTree,
        params: {
          routeParams: { planId: planConf.id },
        },
      })
    )
  }

  const handleCloudAction = () => {
    if (planConf == null) {
      return
    }

    if (status !== 'authenticated') {
      openLoginWindow(locale)
      return
    }

    if (!isCloudSaveEnabled) {
      return
    }

    planPost.mutate(planConf)
  }

  const handlePlanNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value

    if (creationPlaceholderPlanConf != null) {
      updateCreationPlaceholderPlanConf(creationPlaceholderPlanConf.id, {
        name: nextValue.trim() === '' ? undefined : nextValue,
      }).catch((error) => {
        console.error('Failed to update placeholder plan name', error)
      })
      return
    }

    if (planConf == null) {
      return
    }

    updatePlanConf(planConf.id, {
      name: nextValue,
    }).catch((error) => {
      console.error('Failed to update plan name', error)
    })
  }

  const handleScenarioChange = async (value: string | number) => {
    if (planConf == null) {
      return
    }

    await updatePlanConf(planConf.id, {
      forestryScenario: Number(value) as 1 | 2 | 3,
    })
  }

  if (planConf == null && creationPlaceholderPlanConf == null) {
    return (
      <SidebarContentBox>
        <LoadingSpinner />
      </SidebarContentBox>
    )
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
          <NodeFlowAccordion
            title={
              isSettingsMode ? (
                <T keyName="sidebar.plan_flow.settings_title" ns="hiilikartta" />
              ) : (
                <T keyName="sidebar.plan_flow.import_title" ns="hiilikartta" />
              )
            }
            leading={<Upload sx={{ width: 12, height: 14 }} />}
            trailing={
              !isSettingsMode ? (
                <InfoButton tooltip={t('sidebar.create.upload_info')} />
              ) : undefined
            }
            defaultOpen
            ariaLabel={t('sidebar.plan_flow.import_title')}
            bodySx={{
              gap: '0.875rem',
            }}
          >
            {!isSettingsMode && (
              <>
                <UploadField
                  label={fileName ?? t('sidebar.create.select_file')}
                  isSelected={fileName != null}
                  onClick={() => inputRef.current?.click()}
                />

                {creationPlaceholderPlanConf != null && (
                  <>
                    {creationPlaceholderPlanConf.file != null && (
                      <Box sx={{ width: '100%' }}>
                        <FieldLabel>
                          <T
                            keyName="sidebar.plan_flow.plan_name_label"
                            ns="hiilikartta"
                          />
                        </FieldLabel>
                        <StatusFieldRow
                          isSuccess={
                            creationPlaceholderPlanConf.name?.trim() != null
                          }
                        >
                          <TextField
                            value={creationPlaceholderPlanConf.name ?? ''}
                            onChange={handlePlanNameChange}
                            aria-label={t('sidebar.plan_flow.plan_name_label')}
                            variant="outlined"
                            size="small"
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
                              '& .MuiOutlinedInput-notchedOutline legend': {
                                maxWidth: 0,
                              },
                              '& .MuiInputBase-input': {
                                py: '0.1875rem',
                                px: '1rem',
                                fontSize: '0.6875rem',
                                fontWeight: 400,
                                lineHeight: 'normal',
                                letterSpacing: '0.04em',
                                color: '#111111',
                              },
                            }}
                          />
                        </StatusFieldRow>
                      </Box>
                    )}

                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.625rem',
                        width: '100%',
                      }}
                    >
                      <IconTextButton
                        aria-label={t('sidebar.plan_settings.delete')}
                        icon={<Delete sx={{ width: 14, height: 14 }} />}
                        text={
                          <T
                            keyName="sidebar.plan_settings.delete"
                            ns="hiilikartta"
                          />
                        }
                        onClick={handleDeleteClick}
                      />
                    </Box>
                  </>
                )}

                {fileType === 'gpkg' && arrayBuffer && (
                  <PlanImportGpkg
                    fileBuffer={arrayBuffer}
                    selectedTable={creationPlaceholderPlanConf?.selectedTable}
                    selectedZoningCol={
                      creationPlaceholderPlanConf?.selectedZoningCol
                    }
                    selectedNameCol={creationPlaceholderPlanConf?.selectedNameCol}
                    copy={{
                      tableLabel: t('sidebar.plan_flow.database_table_label'),
                      tablePlaceholder: t(
                        'sidebar.plan_flow.database_table_placeholder'
                      ),
                      zoningClassesLabel: t(
                        'sidebar.create.select_zone_code_record'
                      ),
                      zoningClassesPlaceholder: t(
                        'sidebar.plan_flow.zoning_classes_placeholder'
                      ),
                      areaNamesLabel: t('sidebar.create.select_zone_name_record'),
                      areaNamesPlaceholder: t(
                        'sidebar.plan_flow.area_names_placeholder'
                      ),
                    }}
                    onSelectedTableChange={(selectedTable) => {
                      if (creationPlaceholderPlanConf == null) {
                        return
                      }

                      updateCreationPlaceholderPlanConf(
                        creationPlaceholderPlanConf.id,
                        {
                          selectedTable,
                          selectedZoningCol: undefined,
                          selectedNameCol: undefined,
                        }
                      ).catch((error) => {
                        console.error(
                          'Failed to update placeholder selected table',
                          error
                        )
                      })
                    }}
                    onSelectedZoningColChange={(selectedZoningCol) => {
                      if (creationPlaceholderPlanConf == null) {
                        return
                      }

                      updateCreationPlaceholderPlanConf(
                        creationPlaceholderPlanConf.id,
                        {
                          selectedZoningCol,
                        }
                      ).catch((error) => {
                        console.error(
                          'Failed to update placeholder zoning column',
                          error
                        )
                      })
                    }}
                    onSelectedNameColChange={(selectedNameCol) => {
                      if (creationPlaceholderPlanConf == null) {
                        return
                      }

                      updateCreationPlaceholderPlanConf(
                        creationPlaceholderPlanConf.id,
                        {
                          selectedNameCol,
                        }
                      ).catch((error) => {
                        console.error(
                          'Failed to update placeholder name column',
                          error
                        )
                      })
                    }}
                    onPendingImportChange={setPendingImport}
                  />
                )}

                {fileType === 'shp' && arrayBuffer && (
                  <PlanImportShp
                    fileBuffer={arrayBuffer}
                    selectedZoningCol={
                      creationPlaceholderPlanConf?.selectedZoningCol
                    }
                    selectedNameCol={creationPlaceholderPlanConf?.selectedNameCol}
                    copy={{
                      zoningClassesLabel: t(
                        'sidebar.create.select_zone_code_record'
                      ),
                      zoningClassesPlaceholder: t(
                        'sidebar.plan_flow.zoning_classes_placeholder'
                      ),
                      areaNamesLabel: t('sidebar.create.select_zone_name_record'),
                      areaNamesPlaceholder: t(
                        'sidebar.plan_flow.area_names_placeholder'
                      ),
                    }}
                    onSelectedZoningColChange={(selectedZoningCol) => {
                      if (creationPlaceholderPlanConf == null) {
                        return
                      }

                      updateCreationPlaceholderPlanConf(
                        creationPlaceholderPlanConf.id,
                        {
                          selectedZoningCol,
                        }
                      ).catch((error) => {
                        console.error(
                          'Failed to update placeholder zoning column',
                          error
                        )
                      })
                    }}
                    onSelectedNameColChange={(selectedNameCol) => {
                      if (creationPlaceholderPlanConf == null) {
                        return
                      }

                      updateCreationPlaceholderPlanConf(
                        creationPlaceholderPlanConf.id,
                        {
                          selectedNameCol,
                        }
                      ).catch((error) => {
                        console.error(
                          'Failed to update placeholder name column',
                          error
                        )
                      })
                    }}
                    onPendingImportChange={setPendingImport}
                  />
                )}

                {pendingImport != null && (
                  <PlanImportActionsRow
                    onClickAccept={handleConfirmImport}
                    isAcceptDisabled={false}
                  />
                )}
              </>
            )}

            {isSettingsMode && (
              <>
                <Box sx={{ width: '100%' }}>
                  <FieldLabel>
                    <T
                      keyName="sidebar.plan_flow.plan_name_label"
                      ns="hiilikartta"
                    />
                  </FieldLabel>
                  <StatusFieldRow isSuccess>
                    <TextField
                      value={planConf.name}
                      onChange={handlePlanNameChange}
                      aria-label={t('sidebar.plan_flow.plan_name_label')}
                      variant="outlined"
                      size="small"
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
                        '& .MuiOutlinedInput-notchedOutline legend': {
                          maxWidth: 0,
                        },
                        '& .MuiInputBase-input': {
                          py: '0.1875rem',
                          px: '1rem',
                          fontSize: '0.6875rem',
                          fontWeight: 400,
                          lineHeight: 'normal',
                          letterSpacing: '0.04em',
                          color: '#111111',
                        },
                      }}
                    />
                  </StatusFieldRow>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.625rem',
                    width: '100%',
                  }}
                >
                  <IconTextButton
                    aria-label={t('sidebar.plan_settings.delete')}
                    icon={<Delete sx={{ width: 14, height: 14 }} />}
                    text={<T keyName="sidebar.plan_settings.delete" ns="hiilikartta" />}
                    onClick={handleDeleteClick}
                  />
                  <IconTextButton
                    aria-label={t('sidebar.plan_settings.copy')}
                    icon={<FolderCopyOutlinedIcon sx={{ width: 14, height: 14 }} />}
                    text={<T keyName="sidebar.plan_settings.copy" ns="hiilikartta" />}
                    onClick={handleCopyClick}
                  />
                </Box>

                <DropDownSelectWithHeader
                  value={String(
                    planConf.forestryScenario ?? DEFAULT_FORESTRY_SCENARIO
                  )}
                  options={scenarioOptions}
                  onChange={(event) => handleScenarioChange(event.target.value)}
                  label={t('sidebar.plan_flow.forestry_scenario_label')}
                  placeholder={t('sidebar.plan_flow.forestry_scenario_label')}
                  successIndicatorMode="outside"
                  sx={{ width: '100%', mb: 0 }}
                  labelSx={{
                    mb: '0.3125rem',
                    fontSize: '0.625rem',
                    fontWeight: 400,
                    lineHeight: '0.8125rem',
                    letterSpacing: '0.11em',
                    color: '#111111',
                  }}
                  selectSx={{
                    '&.MuiOutlinedInput-root': {
                      minHeight: '1.25rem',
                      borderRadius: '0.625rem',
                      backgroundColor: '#ffffff',
                      boxShadow: 'inset 0px 0.5px 1px 0px #d9d9d9',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#d6d6d6',
                    },
                    '& .MuiOutlinedInput-notchedOutline legend': {
                      maxWidth: 0,
                    },
                    '& .MuiSelect-select': {
                      minHeight: '1.25rem',
                      py: '0.1875rem',
                      pl: '1rem',
                      pr: '2.5rem !important',
                      fontSize: '0.6875rem',
                      fontWeight: 400,
                      lineHeight: 'normal',
                      letterSpacing: '0.04em',
                      color: '#111111',
                    },
                    '& .MuiSelect-icon': {
                      width: '0.75rem',
                      height: '0.375rem',
                      right: '0.875rem',
                    },
                  }}
                  typographySx={{
                    fontSize: '0.6875rem',
                    fontWeight: 400,
                    lineHeight: 'normal',
                    letterSpacing: '0.04em',
                  }}
                />

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.3125rem',
                    width: '100%',
                  }}
                >
                  <IconTextButton
                    aria-label={cloudActionLabel}
                    disabled={status === 'authenticated' && !isCloudSaveEnabled}
                    icon={
                      status === 'authenticated' ? (
                        <SaveOutlinedIcon sx={{ width: 14, height: 14 }} />
                      ) : (
                        <Login sx={{ width: 17, height: 14 }} />
                      )
                    }
                    text={cloudActionLabel}
                    onClick={handleCloudAction}
                  />

                  {status === 'authenticated' &&
                    planConf.cloudLastSaved != null &&
                    !planPost.isPending && (
                      <Typography
                        sx={{
                          pl: '2.125rem',
                          fontSize: '0.5rem',
                          fontWeight: 400,
                          lineHeight: '0.75rem',
                          letterSpacing: '0.08em',
                          color: '#111111',
                        }}
                      >
                        {t('sidebar.plan_settings.last_saved')}{' '}
                        {new Date(planConf.cloudLastSaved).toLocaleString()}
                      </Typography>
                    )}
                </Box>
              </>
            )}
          </NodeFlowAccordion>

          <NodeFlowButton
            state={isSettingsMode ? 'available' : 'disabled'}
            title={<T keyName="sidebar.plan_flow.areas_step" ns="hiilikartta" />}
            leading={<FlowStepLeadingIcon />}
            onClick={isSettingsMode ? handleOpenAreas : undefined}
            ariaLabel={t('sidebar.plan_flow.areas_step')}
          />

          <NodeFlowButton
            state={calculationStepState}
            title={
              <T
                keyName="sidebar.plan_flow.calculate_report_step"
                ns="hiilikartta"
              />
            }
            leading={
              <Eco
                sx={{
                  width: 12,
                  height: 12,
                  color: calculationStepState === 'error' ? '#7A3D2B' : '#0D6044',
                }}
              />
            }
            helper={calculationStepHelper}
            helperLeading={calculationStepHelperLeading}
            ariaLabel={t('sidebar.plan_flow.calculate_report_step')}
          />
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
