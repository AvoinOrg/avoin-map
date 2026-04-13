'use client'

import React, {
  ChangeEvent,
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Box,
  ButtonBase,
  Tooltip,
  Typography,
} from '@mui/material'
import { T, useTranslate } from '@tolgee/react'
import { useMutation } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'

import { SidebarContentBox } from '#/components/Sidebar'
import SidebarBackgroundContent from '#/components/common/SidebarBackgroundContent'
import DropDownSelectWithHeader from '#/components/common/DropDownSelectWithHeader'
import TextFieldWithLabel from '#/components/common/TextFieldWithLabel'
import {
  NodeFlowAccordion,
  NodeFlowButton,
  NodeFlowContainer,
  NODE_FLOW_OUTER_OFFSET,
  NODE_FLOW_OUTER_WIDTH,
} from '#/components/common/NodeFlow'
import { LoadingSpinner } from '#/components/Loading'
import CheckcircleCheckedFilled from '#/components/icons/CheckcircleCheckedFilled'
import { QuestionCircleOutline, Upload } from '#/components/icons'
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
  PlanImportValidationError,
} from '#/app/[locale]/(map)/(applets)/hiilikartta/common/planImport'
import { getZoningClasses } from '#/app/[locale]/(map)/(applets)/hiilikartta/common/zoningClasses'
import { routeTree } from '#/common/routing/routes/hiilikartta'
import { calcPostMutation } from '#/app/[locale]/(map)/(applets)/hiilikartta/common/queries/calcPostMutation'
import { planDeleteMutation } from '#/app/[locale]/(map)/(applets)/hiilikartta/common/queries/planDeleteMutation'
import { planPostMutation } from '#/app/[locale]/(map)/(applets)/hiilikartta/common/queries/planPostMutation'
import usePlanReportEligibility from '#/app/[locale]/(map)/(applets)/hiilikartta/common/usePlanReportEligibility'
import useAppletStoreHasHydrated from '#/app/[locale]/(map)/(applets)/hiilikartta/common/useAppletStoreHasHydrated'
import { useAppletStore } from '#/app/[locale]/(map)/(applets)/hiilikartta/state/appletStore'
import PlanReportFlowStep from './_components/PlanReportFlowStep'
import PlanImportActionsRow from './_components/PlanImportActionsRow'
import PlanActionFooter from './_components/PlanActionFooter'
import PlanImportGpkg from './_components/PlanImportGpkg'
import PlanImportShp from './_components/PlanImportShp'
import { PendingPlanImport } from './_components/planImportTypes'

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
  <CheckcircleCheckedFilled
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

const InfoButton = ({
  ariaLabel = 'Show import instructions',
  tooltip,
}: {
  ariaLabel?: string
  tooltip: React.ReactNode
}) => {
  return (
    <Tooltip title={tooltip} arrow placement="top">
      <ButtonBase
        aria-label={ariaLabel}
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
  <CheckcircleCheckedFilled
    sx={{
      width: 12,
      height: 12,
      color: '#0D6044',
      flexShrink: 0,
    }}
  />
)

const Page = () => {
  const params = useParams<{ locale: string; planId: string }>()
  const planId = params.planId
  const locale = params.locale
  const { t } = useTranslate('hiilikartta')
  const router = useRouter()
  const { status } = useSession()
  const inputRef = useRef<HTMLInputElement>(null)
  const autoOpenFrameRef = useRef<number | null>(null)
  const hasAttemptedAutoOpenRef = useRef(false)
  const hasHydrated = useAppletStoreHasHydrated()

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
  const calcPost = useMutation(calcPostMutation())

  const [fileType, setFileType] = useState<FileType>()
  const [fileName, setFileName] = useState<string>()
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer>()
  const [creationPlaceholderNameDraft, setCreationPlaceholderNameDraft] =
    useState('')
  const [pendingImport, setPendingImport] = useState<PendingPlanImport | null>(
    null
  )
  const [planNameDraft, setPlanNameDraft] = useState('')

  const isImportCreationFlow = creationPlaceholderPlanConf != null
  const isReadyPlan = planConf != null
  const isDrawCreatedFirstVisit = planConf?.draftType === 'draw'
  const {
    isCalculationRunning,
    isReportActionEnabled,
    disabledTooltipKey,
    areZonesValid,
  } = usePlanReportEligibility({
    planConf,
    isCalculationMutationPending: calcPost.isPending,
  })

  const cancelPendingAutoOpen = useCallback(() => {
    if (autoOpenFrameRef.current == null) {
      return
    }

    window.cancelAnimationFrame(autoOpenFrameRef.current)
    autoOpenFrameRef.current = null
  }, [])

  const openFilePicker = useCallback(() => {
    cancelPendingAutoOpen()
    inputRef.current?.click()
  }, [cancelPendingAutoOpen])

  useEffect(() => {
    if (!hasHydrated) {
      return
    }

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
    hasHydrated,
  ])

  useEffect(() => {
    cancelPendingAutoOpen()
    hasAttemptedAutoOpenRef.current = false
  }, [cancelPendingAutoOpen, planId])

  useEffect(() => {
    if (
      creationPlaceholderPlanConf?.status !== 'awaiting-file' ||
      creationPlaceholderPlanConf.file != null ||
      hasAttemptedAutoOpenRef.current
    ) {
      return
    }

    hasAttemptedAutoOpenRef.current = true

    autoOpenFrameRef.current = window.requestAnimationFrame(() => {
      autoOpenFrameRef.current = null
      inputRef.current?.click()
    })

    return () => {
      cancelPendingAutoOpen()
    }
  }, [
    cancelPendingAutoOpen,
    creationPlaceholderPlanConf?.file,
    creationPlaceholderPlanConf?.status,
  ])

  useEffect(() => {
    if (!isDrawCreatedFirstVisit) {
      return
    }

    updatePlanConf(planId, { draftType: undefined }).catch((error) => {
      console.error('Failed to clear draw draft type', error)
    })
  }, [isDrawCreatedFirstVisit, planId, updatePlanConf])

  useEffect(() => {
    if (creationPlaceholderPlanConf?.file?.storageKey == null) {
      setPendingImport(null)
      setFileName(undefined)
      setArrayBuffer(undefined)
      setFileType(undefined)
      setCreationPlaceholderNameDraft(creationPlaceholderPlanConf?.name ?? '')
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
          setCreationPlaceholderNameDraft('')

          await updateCreationPlaceholderPlanConf(
            creationPlaceholderPlanConf.id,
            {
              status: 'awaiting-file',
              file: undefined,
              selectedTable: undefined,
              selectedZoningCol: undefined,
              selectedNameCol: undefined,
            }
          )
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
    if (creationPlaceholderPlanConf == null) {
      setCreationPlaceholderNameDraft('')
      return
    }

    const nextDraft =
      creationPlaceholderPlanConf.name ??
      (creationPlaceholderPlanConf.file?.fileName != null
        ? getPlanNameFromFileName(creationPlaceholderPlanConf.file.fileName)
        : '')

    setCreationPlaceholderNameDraft(nextDraft)
  }, [
    creationPlaceholderPlanConf?.id,
    creationPlaceholderPlanConf?.file?.storageKey,
  ])

  useEffect(() => {
    setPlanNameDraft(planConf?.name ?? '')
  }, [planConf?.id, planConf?.name])

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
        label: t(
          `sidebar.plan_flow.forestry_scenario_options.${scenario.code}`
        ),
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

  const lastSavedLabel = useMemo(() => {
    if (
      status !== 'authenticated' ||
      planConf?.cloudLastSaved == null ||
      planPost.isPending
    ) {
      return undefined
    }

    return `${t('sidebar.plan_settings.last_saved')} ${new Date(
      planConf.cloudLastSaved
    ).toLocaleString()}`
  }, [planConf?.cloudLastSaved, planPost.isPending, status, t])

  const isCloudSaveEnabled = Boolean(
    planConf &&
    status === 'authenticated' &&
    !planPost.isPending &&
    ![CalculationState.INITIALIZING, CalculationState.CALCULATING].includes(
      planConf.calculationState
    ) &&
    planConf.data.features.length > 0
  )

  const handleFileInput = async (event: ChangeEvent<HTMLInputElement>) => {
    cancelPendingAutoOpen()

    if (!event.target.files?.length || creationPlaceholderPlanConf == null) {
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
      const nextPlaceholderName =
        creationPlaceholderPlanConf.name?.trim() != null &&
        creationPlaceholderPlanConf.name.trim() !== ''
          ? creationPlaceholderPlanConf.name
          : getPlanNameFromFileName(storedFile.fileName)

      await updateCreationPlaceholderPlanConf(creationPlaceholderPlanConf.id, {
        name: nextPlaceholderName,
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
      setCreationPlaceholderNameDraft(nextPlaceholderName)
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
        await deleteCreationImportFile(
          creationPlaceholderPlanConf.file.storageKey
        )
      }

      setArrayBuffer(undefined)
      setFileName(undefined)
      setFileType(undefined)
      setPendingImport(null)
    } catch (error) {
      console.error('Failed to apply imported plan', error)

      if (error instanceof PlanImportValidationError) {
        notify({
          message: error.message,
          variant: 'error',
        })
      }
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

    const copiedPlanConf = await useAppletStore
      .getState()
      .copyPlanConf(planConf.id, t('sidebar.plan_settings.copy_suffix'))

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

  const handleCalculateReport = async () => {
    if (planConf == null || !isReportActionEnabled || calcPost.isPending) {
      return
    }

    let nextPlanConf = planConf

    if (planConf.reportData != null) {
      const clearedPlanConf = await updatePlanConf(planConf.id, {
        reportData: undefined,
        calculationState: CalculationState.NOT_STARTED,
      })

      nextPlanConf =
        clearedPlanConf ?? {
          ...planConf,
          reportData: undefined,
          calculationState: CalculationState.NOT_STARTED,
        }
    }

    try {
      await calcPost.mutateAsync(nextPlanConf)
    } catch (_error) {}
  }

  const handleOpenReport = () => {
    if (planConf == null || planConf.reportData == null) {
      return
    }

    router.push(
      getRoute({
        routeNode: routeTree.report,
        routeTree,
        params: {
          queryParams: {
            planIds: planConf.serverId,
            prevPageId: planConf.id,
            prevPageStep: 'plan',
          },
        },
      })
    )
  }

  const handleResetReportAndRecalculate = () => {
    handleCalculateReport().catch(() => {})
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
      startTransition(() => {
        setCreationPlaceholderNameDraft(nextValue)
      })
      return
    }

    if (planConf == null) {
      return
    }

    startTransition(() => {
      setPlanNameDraft(nextValue)
    })
  }

  const commitCreationPlaceholderPlanName = () => {
    if (creationPlaceholderPlanConf == null) {
      return
    }

    const nextName =
      creationPlaceholderNameDraft.trim() === ''
        ? undefined
        : creationPlaceholderNameDraft

    if (nextName === creationPlaceholderPlanConf.name) {
      return
    }

    updateCreationPlaceholderPlanConf(creationPlaceholderPlanConf.id, {
      name: nextName,
    }).catch((error) => {
      console.error('Failed to update placeholder plan name', error)
    })
  }

  const commitPlanName = () => {
    if (planConf == null || planNameDraft === planConf.name) {
      return
    }

    updatePlanConf(planConf.id, {
      name: planNameDraft,
    }).catch((error) => {
      console.error('Failed to update plan name', error)
    })
  }

  const handlePlanNameFieldKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key !== 'Enter') {
      return
    }

    event.preventDefault()
    event.currentTarget.blur()
  }

  const handleScenarioChange = async (value: string | number) => {
    if (planConf == null) {
      return
    }

    await updatePlanConf(planConf.id, {
      forestryScenario: Number(value) as 1 | 2 | 3,
    })
  }

  if (
    !hasHydrated ||
    (planConf == null && creationPlaceholderPlanConf == null)
  ) {
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
        <NodeFlowContainer>
          <NodeFlowAccordion
            title={
              isReadyPlan ? (
                planNameDraft.trim() ||
                planConf?.name ||
                t('sidebar.plan_flow.settings_title')
              ) : (
                <T keyName="sidebar.plan_flow.import_title" ns="hiilikartta" />
              )
            }
            leading={
              isReadyPlan ? (
                <CheckcircleCheckedFilled sx={{ width: 12, height: 12 }} />
              ) : (
                <Upload sx={{ width: 12, height: 14 }} />
              )
            }
            trailing={
              !isReadyPlan ? (
                <InfoButton
                  ariaLabel={t('sidebar.create.upload_info')}
                  tooltip={t('sidebar.create.upload_info')}
                />
              ) : undefined
            }
            defaultOpen={isImportCreationFlow || isDrawCreatedFirstVisit}
            ariaLabel={
              isReadyPlan
                ? planNameDraft.trim() ||
                  planConf?.name ||
                  t('sidebar.plan_flow.settings_title')
                : t('sidebar.plan_flow.import_title')
            }
            bodySx={{
              gap: isReadyPlan ? '1.125rem' : '1rem',
            }}
          >
            {!isReadyPlan && (
              <>
                <UploadField
                  label={fileName ?? t('sidebar.create.select_file')}
                  isSelected={fileName != null}
                  onClick={openFilePicker}
                />

                {creationPlaceholderPlanConf != null && (
                  <>
                    {creationPlaceholderPlanConf.file != null && (
                      <Box sx={{ width: '100%' }}>
                        <TextFieldWithLabel
                          label={
                            <T
                              keyName="sidebar.plan_flow.plan_name_label"
                              ns="hiilikartta"
                            />
                          }
                          value={creationPlaceholderNameDraft}
                          onChange={handlePlanNameChange}
                          onBlur={commitCreationPlaceholderPlanName}
                          onKeyDown={handlePlanNameFieldKeyDown}
                          ariaLabel={t('sidebar.plan_flow.plan_name_label')}
                          trailing={
                            creationPlaceholderNameDraft.trim() !== '' ? (
                              <StatusIndicator />
                            ) : undefined
                          }
                        />
                      </Box>
                    )}
                  </>
                )}

                {fileType === 'gpkg' && arrayBuffer && (
                  <PlanImportGpkg
                    fileBuffer={arrayBuffer}
                    selectedTable={creationPlaceholderPlanConf?.selectedTable}
                    selectedZoningCol={
                      creationPlaceholderPlanConf?.selectedZoningCol
                    }
                    selectedNameCol={
                      creationPlaceholderPlanConf?.selectedNameCol
                    }
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
                      areaNamesLabel: t(
                        'sidebar.create.select_zone_name_record'
                      ),
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
                    selectedNameCol={
                      creationPlaceholderPlanConf?.selectedNameCol
                    }
                    copy={{
                      zoningClassesLabel: t(
                        'sidebar.create.select_zone_code_record'
                      ),
                      zoningClassesPlaceholder: t(
                        'sidebar.plan_flow.zoning_classes_placeholder'
                      ),
                      areaNamesLabel: t(
                        'sidebar.create.select_zone_name_record'
                      ),
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

            {isReadyPlan && (
              <>
                <Box sx={{ width: '100%' }}>
                  <TextFieldWithLabel
                    label={
                      <T
                        keyName="sidebar.plan_flow.plan_name_label"
                        ns="hiilikartta"
                      />
                    }
                    value={planNameDraft}
                    onChange={handlePlanNameChange}
                    onBlur={commitPlanName}
                    onKeyDown={handlePlanNameFieldKeyDown}
                    ariaLabel={t('sidebar.plan_flow.plan_name_label')}
                    trailing={<StatusIndicator />}
                  />
                </Box>

                <DropDownSelectWithHeader
                  value={String(
                    planConf.forestryScenario ?? DEFAULT_FORESTRY_SCENARIO
                  )}
                  options={scenarioOptions}
                  onChange={(event) => handleScenarioChange(event.target.value)}
                  ariaLabel={t('sidebar.plan_flow.forestry_scenario_label')}
                  label={t('sidebar.plan_flow.forestry_scenario_label')}
                  labelAction={
                    <InfoButton
                      ariaLabel={t(
                        'sidebar.plan_flow.forestry_scenario_tooltip'
                      )}
                      tooltip={t('sidebar.plan_flow.forestry_scenario_tooltip')}
                    />
                  }
                  placeholder={t('sidebar.plan_flow.forestry_scenario_label')}
                  successIndicatorMode="outside"
                  sx={{ width: '100%' }}
                />
              </>
            )}
          </NodeFlowAccordion>

          <NodeFlowButton
            state={
              isReadyPlan
                ? areZonesValid
                  ? 'available'
                  : 'error'
                : 'disabled'
            }
            title={
              <T keyName="sidebar.plan_flow.areas_step" ns="hiilikartta" />
            }
            leading={
              isReadyPlan && !areZonesValid ? (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#7A3D2B',
                  }}
                />
              ) : (
                <FlowStepLeadingIcon />
              )
            }
            onClick={isReadyPlan ? handleOpenAreas : undefined}
            ariaLabel={t('sidebar.plan_flow.areas_step')}
          />

          <PlanReportFlowStep
            planConf={planConf}
            locale={locale}
            isCalculationRunning={isCalculationRunning}
            isReportActionEnabled={isReportActionEnabled}
            disabledTooltipKey={disabledTooltipKey}
            onCalculate={handleCalculateReport}
            onOpenReport={handleOpenReport}
            onResetReportAndRecalculate={handleResetReportAndRecalculate}
          />
        </NodeFlowContainer>

        <PlanActionFooter
          showDelete
          showCopy={isReadyPlan}
          showCloudAction={isReadyPlan}
          cloudActionKind={status === 'authenticated' ? 'save' : 'login'}
          cloudActionLabel={isReadyPlan ? cloudActionLabel : undefined}
          isCloudActionDisabled={
            status === 'authenticated' && !isCloudSaveEnabled
          }
          lastSavedLabel={isReadyPlan ? lastSavedLabel : undefined}
          onDelete={handleDeleteClick}
          onCopy={handleCopyClick}
          onCloudAction={handleCloudAction}
          sx={{
            mt: '2.5rem',
            ml: NODE_FLOW_OUTER_OFFSET,
            width: NODE_FLOW_OUTER_WIDTH,
          }}
        />

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
