'use client'

import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Box, Typography } from '@mui/material'
import { FeatureCollection } from 'geojson'
import { useRouter } from 'next/navigation'
import { T, useTranslate } from '@tolgee/react'

import { getRoute } from '#/common/routing/routing-client'
import { SidebarContentBox } from '#/components/Sidebar'
import BigMenuButton from '#/components/common/BigMenuButton'
import SidebarBackgroundContent from '#/components/common/SidebarBackgroundContent'
import FlowNodeContainer from '#/components/common/FlowNodeContainer'
import FlowNode from '#/components/common/FlowNode'
import { Upload, ArrowNextBig } from '#/components/icons'
import { useMapStore } from '#/common/store'
import { useDoesLayerGroupExist } from '#/common/hooks/map/useDoesLayerGroupExist'

import { routeTree } from '#/common/routing/routes/hiilikartta'
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

const Page = () => {
  const { t } = useTranslate('hiilikartta')
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const hasOpenedInitialPickerRef = useRef(false)
  const hasSelectedInitialFileRef = useRef(false)
  const shouldDeleteDraftOnUnmountRef = useRef(true)
  const isCreatingDraftRef = useRef(false)
  const isConfirmingRef = useRef(false)

  const [draftPlanId, setDraftPlanId] = useState<string>()
  const [fileType, setFileType] = useState<FileType>()
  const [fileName, setFileName] = useState<string>()
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer>()
  const [isConfirmed, setIsConfirmed] = useState(false)

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

  const layerGroupId = useMemo(
    () => (draftPlanId ? getPlanLayerGroupId(draftPlanId) : undefined),
    [draftPlanId]
  )
  const doesLayerGroupExist = useDoesLayerGroupExist(layerGroupId ?? '')

  const goBackToKaavat = async () => {
    if (draftPlanId) {
      await deletePlanConf(draftPlanId)
    }
    shouldDeleteDraftOnUnmountRef.current = false
    router.replace(getRoute({ routeNode: routeTree.plans, routeTree }))
  }

  const openFilePicker = ({ trackInitialCancel }: { trackInitialCancel: boolean }) => {
    if (!inputRef.current) {
      return
    }

    if (trackInitialCancel) {
      window.addEventListener(
        'focus',
        () => {
          window.setTimeout(() => {
            if (!hasSelectedInitialFileRef.current && !isConfirmed) {
              goBackToKaavat().catch(console.error)
            }
          }, 320)
        },
        { once: true }
      )
    }

    inputRef.current.click()
  }

  useEffect(() => {
    if (draftPlanId || isCreatingDraftRef.current) {
      return
    }

    isCreatingDraftRef.current = true

    addPlanConf({
      data: EMPTY_PLAN_DATA,
      name: '',
      areaHa: 0,
      draftType: 'import',
    })
      .then(async (planConf) => {
        await updatePlanConf(planConf.id, { isHidden: true, draftType: 'import' })
        setDraftPlanId(planConf.id)
      })
      .finally(() => {
        isCreatingDraftRef.current = false
      })
  }, [addPlanConf, draftPlanId, updatePlanConf])

  useEffect(() => {
    if (!draftPlanId || hasOpenedInitialPickerRef.current) {
      return
    }

    hasOpenedInitialPickerRef.current = true
    window.setTimeout(() => {
      openFilePicker({ trackInitialCancel: true })
    }, 0)
  }, [draftPlanId])

  useEffect(() => {
    return () => {
      if (shouldDeleteDraftOnUnmountRef.current && draftPlanId && !isConfirmed) {
        deletePlanConf(draftPlanId)
      }
    }
  }, [deletePlanConf, draftPlanId, isConfirmed])

  const handleFileInput = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) {
      return
    }

    const selectedFile = event.target.files[0]
    const extension = selectedFile.name.split('.').pop()?.toLowerCase()

    hasSelectedInitialFileRef.current = true

    const reader = new window.FileReader()
    reader.readAsArrayBuffer(selectedFile)

    reader.onloadend = async () => {
      if (reader.result == null || typeof reader.result === 'string') {
        console.error('reader.result is a string, not an ArrayBuffer')
        return
      }

      setFileName(selectedFile.name)
      setArrayBuffer(reader.result)
      setIsConfirmed(false)

      if (extension === 'gpkg') {
        setFileType('gpkg')
      } else if (extension === 'zip') {
        setFileType('shp')
      } else {
        setFileType(undefined)
      }
    }

    event.target.value = ''
  }

  const handleConfirmImport = async (
    json: FeatureCollection,
    zoningColName: string,
    nameColName?: string
  ) => {
    if (!draftPlanId || !fileName || isConfirmingRef.current) {
      return
    }

    isConfirmingRef.current = true

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
      const areaHa = getImportedPlanAreaHa(formattedJson)

      await updatePlanConf(draftPlanId, {
        data: formattedJson as PlanData,
        name: fileName,
        areaHa,
        draftType: undefined,
        isHidden: false,
      })

      const layerConf = await createLayerConf(
        formattedJson,
        draftPlanId,
        ZONING_CODE_COL
      )

      if (layerGroupId) {
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
      }

      shouldDeleteDraftOnUnmountRef.current = false
      setIsConfirmed(true)
    } catch (error) {
      console.error(error)
    } finally {
      isConfirmingRef.current = false
    }
  }

  const handleOpenPlanDetails = () => {
    if (!draftPlanId || !isConfirmed) {
      return
    }

    router.push(
      getRoute({
        routeNode: routeTree.plans.plan,
        routeTree,
        params: {
          routeParams: {
            planId: draftPlanId,
          },
        },
      })
    )
  }

  return (
    <SidebarContentBox
      sxInner={{
        pt: 0,
        gap: { mobile: 2.25, desktop: 2.75 },
        px: { mobile: '1rem', desktop: '1.875rem' },
        pb: { mobile: '1.25rem', desktop: '1.75rem' },
        backgroundColor: '#ffffff',
      }}
    >
      <SidebarBackgroundContent
        imageSrc="/files/img/hiilikartta/zoning.jpg"
        imageAlt="Tuo kaavatiedosto"
        title={<T keyName="sidebar.kaavat.title" ns="hiilikartta" />}
        description={<T keyName="sidebar.kaavat.description" ns="hiilikartta" />}
      >
        <FlowNodeContainer>
          <FlowNode
            state={isConfirmed ? 'complete' : 'active'}
            title={<T keyName="sidebar.create.upload" ns="hiilikartta" />}
            defaultExpanded
          >
            <BigMenuButton
              variant="outlined"
              component="label"
              aria-label="Select plan file to import"
              sx={{
                mb: 1,
                backgroundColor: 'rgba(255,255,255,0.96)',
                borderColor: 'rgba(255,255,255,0.65)',
                color: 'neutral.darker',
              }}
            >
              {fileName ? fileName : t('sidebar.create.select_file')}
              <input
                hidden
                accept=".zip, .gpkg"
                multiple={false}
                type="file"
                onChange={handleFileInput}
                ref={inputRef}
              />
              <Upload />
            </BigMenuButton>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Typography
                component="button"
                type="button"
                aria-label="Choose another import file"
                onClick={() => openFilePicker({ trackInitialCancel: false })}
                sx={{
                  border: 'none',
                  background: 'none',
                  p: 0,
                  color: 'inherit',
                  typography: 'body3',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                }}
              >
                <T keyName="sidebar.import.change_file" ns="hiilikartta" />
              </Typography>
            </Box>

            {fileType === 'gpkg' && arrayBuffer && (
              <PlanImportGpkg
                fileBuffer={arrayBuffer}
                onFinish={handleConfirmImport}
              />
            )}

            {fileType === 'shp' && arrayBuffer && (
              <PlanImportShp
                fileBuffer={arrayBuffer}
                onFinish={handleConfirmImport}
              />
            )}
          </FlowNode>

          <FlowNode
            state={isConfirmed ? 'available' : 'disabled'}
            title={<T keyName="sidebar.import.step_review.title" ns="hiilikartta" />}
            trailing={
              isConfirmed ? (
                <ArrowNextBig sx={{ width: 16, height: 16, color: 'inherit' }} />
              ) : undefined
            }
            onClick={handleOpenPlanDetails}
          />
        </FlowNodeContainer>
      </SidebarBackgroundContent>
    </SidebarContentBox>
  )
}

export default Page
