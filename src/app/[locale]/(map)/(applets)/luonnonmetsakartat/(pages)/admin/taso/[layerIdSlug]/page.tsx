'use client'

import React, {
  useRef,
  useEffect,
  useState,
  ChangeEvent,
  use,
  useMemo,
} from 'react'
import { Box, Button, Typography } from '@mui/material'
import { useParams, useRouter } from 'next/navigation'
import { buffer } from '@turf/turf'
import booleanValid from '@turf/boolean-valid'
import { flattenDeep } from 'lodash-es'
import { T, useTranslate } from '@tolgee/react'
import { Feature, FeatureCollection } from 'geojson'

import { getRoute } from '#/common/utils/routing-client'
import { getGeoJsonArea } from '#/common/utils/gis'
import { generateUUID } from '#/common/utils/general'
import BigMenuButton from '#/components/common/BigMenuButton'
import { Upload } from '#/components/icons'

import {
  FeatureProperties,
  FolayerConfState,
} from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/common/types'
import { routeTree } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/common/routes'
import FolayerImportShp from 'applets/luonnonmetsakartat/components/FolayerImportShp'
import { useAppletStore } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/state/appletStore'
import { adminFolayerPatchMutation } from 'applets/luonnonmetsakartat/common/queries/adminFolayerPatchMutation'
import { useMutation } from '@tanstack/react-query'
import { LoadingSpinner } from '#/components/Loading'
import { SidebarContentBox } from '#/components/Sidebar'
import { set } from 'ol/transform'
import EditableText from '#/components/common/EditableText'
import TextFieldWithHeader from '#/components/common/TextFieldWithHeader'
import CheckBoxWithText from '#/components/common/CheckBoxWithText'
import { SaveOutlined } from '@mui/icons-material'
import { SIDEBAR_PADDING_REM } from '#/common/style/theme/constants'

const Page = () => {
  const [isFolayerReady, setIsFolayerReady] = useState(false)
  const [isAreaCollectionReady, setIsAreaCollectionReady] = useState(false)
  const params = useParams<{ folayerIdSlug: string }>()
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { t } = useTranslate('luonnonmetsakartat')

  const adminFolayerConf = useAppletStore(
    (state) => state.adminFolayerConfs[params.folayerIdSlug]
  )
  const folayerAreaCollection = useAppletStore(
    (state) => state.folayerAreaCollections[params.folayerIdSlug]
  )
  const updateAdminFolayerConf = useAppletStore(
    (state) => state.updateAdminFolayerConf
  )
  const localAdminFolayerPatchMutation = useMutation(adminFolayerPatchMutation())

  useEffect(() => {
    if (adminFolayerConf && adminFolayerConf.state === FolayerConfState.Idle) {
      setIsFolayerReady(true)
    } else {
      setIsFolayerReady(false)
    }
    console.log(adminFolayerConf)
  }, [adminFolayerConf])

  useEffect(() => {
    if (
      folayerAreaCollection &&
      folayerAreaCollection.state === FolayerConfState.Idle
    ) {
      setIsAreaCollectionReady(true)
    } else {
      setIsAreaCollectionReady(false)
    }
    console.log(folayerAreaCollection)
  }, [folayerAreaCollection])

  const isEditingDisabled = useMemo(() => {
    if (adminFolayerConf.state === FolayerConfState.Idle) {
      return false
    }
    return true
  }, [adminFolayerConf?.state])

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    updateAdminFolayerConf(params.folayerIdSlug, {
      name: newName,
      unsyncedChanges: true,
    })
  }

  const handleIsVisibleChange = (
    _e: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    updateAdminFolayerConf(params.folayerIdSlug, {
      isVisible: checked,
      unsyncedChanges: true,
    })
  }

  const handleSaveClick = (event: any) => {
    event.preventDefault()
    event.stopPropagation()
    event.nativeEvent.stopImmediatePropagation()

    if (adminFolayerConf) {
      localAdminFolayerPatchMutation.mutate(adminFolayerConf)
    }
  }

  return (
    <>
      <SidebarContentBox>
        {!isFolayerReady && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <LoadingSpinner></LoadingSpinner>
          </Box>
        )}
        {isFolayerReady && (
          <Box>
            <TextFieldWithHeader
              headerText={t('sidebar.admin.folayer.name.header')}
              value={adminFolayerConf.name}
              onChange={handleNameChange}
              placeholderText={adminFolayerConf.name}
              sx={{ mt: 2.5 }}
              disabled={isEditingDisabled}
            ></TextFieldWithHeader>
            <CheckBoxWithText
              checked={adminFolayerConf.isVisible}
              onChange={handleIsVisibleChange}
              sx={{ mt: 2.5 }}
              disabled={isEditingDisabled}
            >
              <T
                ns={'luonnonmetsakartat'}
                keyName={'sidebar.admin.folayer.is_visible'}
              ></T>
            </CheckBoxWithText>
            <EditableText
              value={adminFolayerConf.name}
              onChange={handleNameChange}
            ></EditableText>
          </Box>
        )}
      </SidebarContentBox>
      {adminFolayerConf.unsyncedChanges && (
        <Box
          sx={(theme) => ({
            display: 'flex',
            flexDirection: 'column',
            pl: SIDEBAR_PADDING_REM + 'rem',
            pr: SIDEBAR_PADDING_REM + 'rem',
            pt: 2,
            pb: 2,
            zIndex: 9999,
            borderTop: 1,
            borderColor: 'primary.lighter',
          })}
        >
          <Box
            onClick={handleSaveClick}
            sx={{
              mt: 1.3,
              display: 'inline-flex',
              flexDirection: 'row',
              '&:hover': { cursor: 'pointer' },
              color: 'neutral.dark',
              flex: '0',
              whiteSpace: 'nowrap',
              alignSelf: 'flex-start',
            }}
          >
            <Box sx={{ mr: 1.7 }}>
              <SaveOutlined></SaveOutlined>
            </Box>
            <Box
              sx={{
                typography: 'h3',
              }}
            >
              <T keyName={'sidebar.plan_settings.delete'} ns={'hiilikartta'} />
            </Box>
            {/* </Box> */}
          </Box>
          {[
            CalculationState.NOT_STARTED,
            CalculationState.ERRORED,
            CalculationState.FINISHED,
          ].includes(planConf.calculationState) && (
            <Box
              sx={{
                display: 'flex',
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'flex-end',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                }}
              >
                <Tooltip
                  title={
                    hasNoFeatures
                      ? t(
                          'sidebar.plan_settings.calculate_carbon_effect.tooltip_no_features'
                        )
                      : t(
                          'sidebar.plan_settings.calculate_carbon_effect.tooltip_invalid'
                        )
                  }
                  disableHoverListener={areSettingsValid && !hasNoFeatures}
                  disableFocusListener={areSettingsValid && !hasNoFeatures}
                  disableTouchListener={areSettingsValid && !hasNoFeatures}
                >
                  <Box
                    sx={{
                      display: 'inline-flex',
                      flexDirection: 'row',
                      '&:hover': {
                        cursor:
                          areSettingsValid && !hasNoFeatures
                            ? 'pointer'
                            : 'default',
                      },
                      mt: 4,
                      flex: '0',
                      color:
                        areSettingsValid && !hasNoFeatures
                          ? 'neutral.darker'
                          : 'neutral.main',
                    }}
                    onClick={
                      areSettingsValid && !hasNoFeatures
                        ? handleSubmit
                        : undefined
                    }
                  >
                    <Box
                      sx={{
                        typography: 'h1',
                        textAlign: 'end',
                        mr: 3,
                        minWidth: '270px',
                      }}
                    >
                      <T
                        keyName={
                          'sidebar.plan_settings.calculate_carbon_effect'
                        }
                        ns={'hiilikartta'}
                      />
                    </Box>
                    <Box sx={{ mt: 0.2 }}>
                      <ArrowNextBig></ArrowNextBig>
                    </Box>
                  </Box>
                </Tooltip>
              </Box>
            </Box>
          )}
        </Box>
      )}
    </>
  )
}

export default Page
